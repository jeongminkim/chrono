import { mkdirSync } from "node:fs";
import { copyFile, mkdir, readdir, readFile, realpath, rename, rm, rmdir, stat, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { DatabaseSync } from "node:sqlite";
import { dirname, extname, join, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const projectDir = fileURLToPath(new URL(".", import.meta.url));
export const defaultStoreDir = process.env.STORE_DIR || resolve(projectDir, ".store");
export const mediaNamePattern = /^[0-9a-f]{64}\.(webp|avif|png|jpg|jpeg|gif|svg)$/;
const imageExtensions = new Set([".webp", ".avif", ".png", ".jpg", ".jpeg", ".gif", ".svg"]);
const maxImageBytes = 10 * 1024 * 1024;
const schemaVersion = "1";

// 로컬 미디어는 DB에 API 기준 상대 경로 "media/<sha256>.<ext>"로 저장한다. 그 외(https URL)는 그대로 둔다.
const isLocal = (src) => !/^[a-z][a-z0-9+.-]*:/i.test(src) && !src.startsWith("//");
const mediaPaths = (media) => [media?.type === "image" && media.src, media?.poster].filter((src) => src && isLocal(src));

export function openStore(dir = defaultStoreDir) {
  const mediaDir = join(dir, "media");
  mkdirSync(mediaDir, { recursive: true });
  const db = new DatabaseSync(join(dir, "chrono.db"));
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA busy_timeout = 5000;
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS themes (id TEXT PRIMARY KEY, name TEXT NOT NULL, sort_order INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS items (
      theme_id TEXT NOT NULL REFERENCES themes(id) ON DELETE CASCADE,
      id TEXT NOT NULL,
      date TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      body TEXT,
      tags TEXT NOT NULL DEFAULT '[]',
      media TEXT,
      source_url TEXT,
      updated_at TEXT NOT NULL,
      PRIMARY KEY (theme_id, id)
    );
    INSERT OR IGNORE INTO meta VALUES ('schema_version', '${schemaVersion}'), ('revision', '0');
  `);
  const version = db.prepare("SELECT value FROM meta WHERE key = 'schema_version'").get().value;
  // ponytail: 스키마 버전 확인만 한다. 스키마를 바꿀 때 여기에 순차 마이그레이션을 추가한다.
  if (version !== schemaVersion) throw new Error(`지원하지 않는 DB 스키마 버전입니다: ${version}`);
  return { db, dir, mediaDir };
}

export const revision = ({ db }) => Number(db.prepare("SELECT value FROM meta WHERE key = 'revision'").get().value);

// data.json version 1 구조로 읽는다. 항목이 없는 테마는 규격상 허용되지 않으므로 뺀다.
export function readTimeline({ db }) {
  const items = db.prepare("SELECT * FROM items ORDER BY date, id").all();
  const themes = db.prepare("SELECT id, name FROM themes ORDER BY sort_order, id").all().map((theme) => ({
    id: theme.id,
    name: theme.name,
    items: items.filter((row) => row.theme_id === theme.id).map((row) => ({
      id: row.id,
      date: row.date,
      title: row.title,
      description: row.description,
      ...(row.body !== null && { body: row.body }),
      tags: JSON.parse(row.tags),
      ...(row.media !== null && { media: JSON.parse(row.media) }),
      ...(row.source_url !== null && { sourceUrl: row.source_url }),
    })),
  }));
  return { version: 1, themes: themes.filter((theme) => theme.items.length > 0) };
}

async function writeAtomic(path, data) {
  const temp = `${path}.${process.pid}.tmp`;
  await writeFile(temp, data);
  await rename(temp, path);
}

async function checkImportFile(root, src) {
  let path;
  try {
    path = await realpath(resolve(root, src));
  } catch {
    throw new Error(`미디어 파일을 찾을 수 없습니다: ${src}`);
  }
  if (!path.startsWith(`${root}${sep}`)) throw new Error(`import 디렉터리 밖을 가리키는 경로입니다: ${src}`);
  const ext = extname(path).toLowerCase();
  if (!imageExtensions.has(ext)) throw new Error(`허용하지 않는 이미지 형식입니다: ${src}`);
  const info = await stat(path);
  if (!info.isFile()) throw new Error(`파일이 아닙니다: ${src}`);
  if (info.size > maxImageBytes) throw new Error(`이미지가 10MB를 넘습니다: ${src}`);
  const hash = createHash("sha256").update(await readFile(path)).digest("hex");
  return { path, name: `${hash}${ext === ".jpeg" ? ".jpg" : ext}` };
}

/**
 * import 디렉터리의 data.json과 이미지를 DB와 미디어 디렉터리로 옮긴다.
 * 기본은 항목 upsert, replace면 파일에 있는 테마에서 파일에 없는 항목을 지운다.
 * 성공하면 data.json과 import한 이미지를 삭제한다(dryRun이면 아무것도 바꾸지 않는다).
 */
export async function importDir(store, dir, { dryRun = false, replace = false } = {}) {
  const { parseTimelineData } = await import("./src/data.ts");
  const root = await realpath(dir);
  const dataPath = join(root, "data.json");
  const data = parseTimelineData(await readFile(dataPath, "utf8").catch(() => {
    throw new Error(`${dataPath} 파일이 없습니다.`);
  }));

  const files = new Map();
  for (const { items } of data.themes) {
    for (const src of items.flatMap((item) => mediaPaths(item.media))) {
      if (!files.has(src)) files.set(src, await checkImportFile(root, src));
    }
  }
  const toStored = (src) => (src && files.has(src) ? `media/${files.get(src).name}` : src);

  const { db, mediaDir } = store;
  const existing = new Set(db.prepare("SELECT theme_id || '/' || id AS key FROM items").all().map((row) => row.key));
  const incoming = data.themes.flatMap((theme) => theme.items.map((item) => `${theme.id}/${item.id}`));
  const removed = replace ? [...existing].filter((key) => data.themes.some((t) => key.startsWith(`${t.id}/`)) && !incoming.includes(key)) : [];
  const summary = {
    added: incoming.filter((key) => !existing.has(key)).length,
    updated: incoming.filter((key) => existing.has(key)).length,
    removed: removed.length,
    images: new Set([...files.values()].map((file) => file.name)).size,
    revision: revision(store),
    dryRun,
  };
  if (dryRun) return summary;

  for (const { path, name } of files.values()) {
    const target = join(mediaDir, name);
    if (!(await stat(target).catch(() => null))) {
      await copyFile(path, `${target}.tmp`);
      await rename(`${target}.tmp`, target);
    }
  }

  const upsertTheme = db.prepare(`
    INSERT INTO themes (id, name, sort_order) VALUES (?, ?, (SELECT COALESCE(MAX(sort_order), -1) + 1 FROM themes))
    ON CONFLICT (id) DO UPDATE SET name = excluded.name`);
  const upsertItem = db.prepare(`
    INSERT INTO items (theme_id, id, date, title, description, body, tags, media, source_url, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT (theme_id, id) DO UPDATE SET date = excluded.date, title = excluded.title, description = excluded.description,
      body = excluded.body, tags = excluded.tags, media = excluded.media, source_url = excluded.source_url, updated_at = excluded.updated_at`);
  const removeMissing = db.prepare("DELETE FROM items WHERE theme_id = ? AND id NOT IN (SELECT value FROM json_each(?))");

  db.exec("BEGIN IMMEDIATE");
  try {
    for (const theme of data.themes) {
      upsertTheme.run(theme.id, theme.name);
      for (const item of theme.items) {
        const media = item.media && {
          ...item.media,
          src: toStored(item.media.src),
          ...(item.media.type === "video" && item.media.poster && { poster: toStored(item.media.poster) }),
        };
        upsertItem.run(theme.id, item.id, item.date, item.title, item.description, item.body ?? null,
          JSON.stringify(item.tags), media ? JSON.stringify(media) : null, item.sourceUrl ?? null);
      }
      if (replace) removeMissing.run(theme.id, JSON.stringify(theme.items.map((item) => item.id)));
    }
    db.prepare("UPDATE meta SET value = CAST(value AS INTEGER) + 1 WHERE key = 'revision'").run();
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
  summary.revision = revision(store);

  await removeUnusedMedia(store);
  await removeSource(root, [dataPath, ...[...files.values()].map((file) => file.path)]);
  return summary;
}

async function removeUnusedMedia({ db, mediaDir }) {
  const used = new Set(db.prepare("SELECT media FROM items WHERE media IS NOT NULL").all()
    .flatMap((row) => mediaPaths(JSON.parse(row.media))).map((src) => src.slice("media/".length)));
  for (const name of await readdir(mediaDir)) {
    if (!used.has(name)) await rm(join(mediaDir, name), { force: true });
  }
}

// import한 파일을 지우고, 비게 된 하위 디렉터리도 정리한다. import 디렉터리 자체와 다른 파일(HOWTO 등)은 남긴다.
async function removeSource(root, paths) {
  for (const path of paths) await rm(path, { force: true });
  const dirs = [...new Set(paths.map(dirname))].filter((dir) => dir !== root).sort((a, b) => b.length - a.length);
  for (let dir of dirs) {
    while (dir !== root && dir.startsWith(`${root}${sep}`)) {
      if ((await readdir(dir).catch(() => ["?"])).length > 0) break;
      await rmdir(dir);
      dir = dirname(dir);
    }
  }
}

// DB 전체를 import 가능한 data.json + images/로 내보낸다.
export async function exportDir(store, dir) {
  const data = readTimeline(store);
  if (data.themes.length === 0) throw new Error("내보낼 데이터가 없습니다.");
  await mkdir(join(dir, "images"), { recursive: true });
  const toExported = async (src) => {
    if (!src || !isLocal(src)) return src;
    const name = src.slice("media/".length);
    await copyFile(join(store.mediaDir, name), join(dir, "images", name));
    return `images/${name}`;
  };
  for (const { items } of data.themes) {
    for (const item of items) {
      if (!item.media) continue;
      item.media.src = await toExported(item.media.src);
      if (item.media.poster) item.media.poster = await toExported(item.media.poster);
    }
  }
  await writeAtomic(join(dir, "data.json"), `${JSON.stringify(data, null, 2)}\n`);
  return { themes: data.themes.length, items: data.themes.reduce((count, theme) => count + theme.items.length, 0) };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [command, dir, ...flags] = process.argv.slice(2);
  const usage = "사용법: node store.mjs import <디렉터리> [--dry-run] [--replace]\n       node store.mjs export <디렉터리>";
  if (!dir || !["import", "export"].includes(command)) {
    console.error(usage);
    process.exit(2);
  }
  try {
    const store = openStore();
    const result = command === "import"
      ? await importDir(store, dir, { dryRun: flags.includes("--dry-run"), replace: flags.includes("--replace") })
      : await exportDir(store, resolve(dir));
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error(`실패: ${error instanceof Error ? error.message : error}`);
    process.exit(1);
  }
}
