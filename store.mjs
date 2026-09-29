import { mkdirSync, readdirSync, rmSync, statSync } from "node:fs";
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
const schemaVersion = "2";

// 로컬 미디어는 DB에 API 기준 상대 경로 "media/<sha256>.<ext>"로 저장한다. 그 외(https URL)는 그대로 둔다.
const isLocal = (src) => !/^[a-z][a-z0-9+.-]*:/i.test(src) && !src.startsWith("//");
const mediaPaths = (media = []) => media.flatMap((m) => [m.type === "image" && m.src, m.poster]).filter((src) => src && isLocal(src));

// HTTP 응답 코드로 옮길 수 있는 저장소 오류
export class StoreError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export function openStore(dir = defaultStoreDir, { mediaGraceMs = 10 * 60_000 } = {}) {
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
  const version = () => db.prepare("SELECT value FROM meta WHERE key = 'schema_version'").get().value;
  if (version() === "1") {
    // v2: media를 객체 하나에서 배열로 바꾼다.
    db.exec(`BEGIN IMMEDIATE;
      UPDATE items SET media = json_array(json(media)) WHERE media IS NOT NULL AND json_type(media) = 'object';
      UPDATE meta SET value = '2' WHERE key = 'schema_version';
      COMMIT;`);
  }
  if (version() !== schemaVersion) throw new Error(`지원하지 않는 DB 스키마 버전입니다: ${version()}`);
  return { db, dir, mediaDir, mediaGraceMs };
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
 * 기본은 추가 전용: 새 테마와 새 항목만 넣고, 이미 있는 항목과 테마 이름은 건드리지 않는다(화면 편집 내용 보호).
 * overwrite면 이미 있는 항목도 덮어쓰고, replace면 overwrite에 더해 파일에 있는 테마에서 파일에 없는 항목을 지운다.
 * 성공하면 data.json과 파일이 참조한 이미지를 삭제한다(dryRun이면 아무것도 바꾸지 않는다).
 */
export async function importDir(store, dir, { dryRun = false, overwrite = false, replace = false } = {}) {
  overwrite ||= replace;
  const { parseTimelineData } = await import("./src/data.ts");
  const root = await realpath(dir);
  const dataPath = join(root, "data.json");
  const data = parseTimelineData(await readFile(dataPath, "utf8").catch(() => {
    throw new Error(`${dataPath} 파일이 없습니다.`);
  }));

  // 건너뛸 항목의 이미지도 검증한다. 깨진 참조가 있는 파일은 통째로 거부한다.
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
  const skipped = overwrite ? [] : incoming.filter((key) => existing.has(key));
  const written = new Set(incoming.filter((key) => !skipped.includes(key)));
  const summary = {
    added: incoming.filter((key) => !existing.has(key)).length,
    updated: overwrite ? incoming.filter((key) => existing.has(key)).length : 0,
    skipped: skipped.length,
    ...(skipped.length > 0 && { skippedIds: skipped }),
    removed: removed.length,
    images: new Set(data.themes.flatMap((theme) => theme.items.filter((item) => written.has(`${theme.id}/${item.id}`))
      .flatMap((item) => mediaPaths(item.media).map((src) => files.get(src).name)))).size,
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
    ON CONFLICT (id) DO ${overwrite ? "UPDATE SET name = excluded.name" : "NOTHING"}`);
  const removeMissing = db.prepare("DELETE FROM items WHERE theme_id = ? AND id NOT IN (SELECT value FROM json_each(?))");

  transaction(store, () => {
    for (const theme of data.themes) {
      upsertTheme.run(theme.id, theme.name);
      for (const item of theme.items) {
        if (!written.has(`${theme.id}/${item.id}`)) continue;
        writeItem(store, theme.id, {
          ...item,
          ...(item.media && { media: item.media.map((m) => ({ ...m, src: toStored(m.src), ...(m.type === "video" && m.poster && { poster: toStored(m.poster) }) })) }),
        });
      }
      if (replace) removeMissing.run(theme.id, JSON.stringify(theme.items.map((item) => item.id)));
    }
  });
  summary.revision = revision(store);

  await removeSource(root, [dataPath, ...[...files.values()].map((file) => file.path)]);
  return summary;
}

function writeItem({ db }, themeId, item) {
  db.prepare(`
    INSERT INTO items (theme_id, id, date, title, description, body, tags, media, source_url, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT (theme_id, id) DO UPDATE SET date = excluded.date, title = excluded.title, description = excluded.description,
      body = excluded.body, tags = excluded.tags, media = excluded.media, source_url = excluded.source_url, updated_at = excluded.updated_at`)
    .run(themeId, item.id, item.date, item.title, item.description, item.body ?? null,
      JSON.stringify(item.tags), item.media ? JSON.stringify(item.media) : null, item.sourceUrl ?? null);
}

// 한 트랜잭션으로 쓰고 revision을 올린다. 커밋 후 어디서도 참조하지 않는 미디어 파일을 정리한다.
function transaction(store, write) {
  const { db } = store;
  db.exec("BEGIN IMMEDIATE");
  try {
    const result = write();
    db.prepare("UPDATE meta SET value = CAST(value AS INTEGER) + 1 WHERE key = 'revision'").run();
    db.exec("COMMIT");
    removeUnusedMedia(store);
    return result;
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

// ---- 화면 편집 ----

function findItem(store, themeId, itemId) {
  const row = store.db.prepare("SELECT t.name AS theme_name FROM items i JOIN themes t ON t.id = i.theme_id WHERE i.theme_id = ? AND i.id = ?").get(themeId, itemId);
  const item = row && readTimeline(store).themes.find((t) => t.id === themeId)?.items.find((i) => i.id === itemId);
  if (!item) throw new StoreError(404, "사건을 찾을 수 없습니다.");
  return { themeName: row.theme_name, item };
}

// 바뀐 사건 전체를 data.json 규칙으로 다시 검증해 저장한다.
async function saveItem(store, themeId, themeName, item) {
  const { parseTimelineData } = await import("./src/data.ts");
  let valid;
  try {
    valid = parseTimelineData(JSON.stringify({ version: 1, themes: [{ id: themeId, name: themeName, items: [item] }] })).themes[0].items[0];
  } catch (error) {
    throw new StoreError(400, error instanceof Error ? error.message.replace(/^themes\[0\]\.items\[0\]\./, "") : String(error));
  }
  transaction(store, () => writeItem(store, themeId, valid));
  return valid;
}

export function deleteTheme(store, themeId) {
  if (!store.db.prepare("SELECT 1 FROM themes WHERE id = ?").get(themeId)) throw new StoreError(404, "테마를 찾을 수 없습니다.");
  transaction(store, () => store.db.prepare("DELETE FROM themes WHERE id = ?").run(themeId));
}

export function deleteItem(store, themeId, itemId) {
  findItem(store, themeId, itemId);
  transaction(store, () => {
    store.db.prepare("DELETE FROM items WHERE theme_id = ? AND id = ?").run(themeId, itemId);
    // 마지막 사건을 지워 빈 테마가 되면 테마도 지운다(빈 테마는 규격상 표시할 수 없다).
    store.db.prepare("DELETE FROM themes WHERE id = ? AND NOT EXISTS (SELECT 1 FROM items WHERE theme_id = ?)").run(themeId, themeId);
  });
}

// patch: { date?, title?, description?, body?, tags? }
export async function updateItem(store, themeId, itemId, patch) {
  const { themeName, item } = findItem(store, themeId, itemId);
  const { cleanTags } = await import("./src/data.ts");
  const next = { ...item };
  for (const key of ["date", "title", "description", "body"]) if (patch[key] !== undefined) next[key] = typeof patch[key] === "string" ? patch[key].trim() : patch[key];
  // 내용을 비우면 body를 지워 요약(description)이 대신 보이게 한다.
  if (next.body === "") delete next.body;
  if (patch.tags !== undefined) next.tags = Array.isArray(patch.tags) ? cleanTags(patch.tags.map(String)) : patch.tags;
  return saveItem(store, themeId, themeName, next);
}

const imageSignatures = [
  [".png", (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))],
  [".jpg", (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff],
  [".gif", (b) => b.subarray(0, 4).toString("latin1") === "GIF8"],
  [".webp", (b) => b.subarray(0, 4).toString("latin1") === "RIFF" && b.subarray(8, 12).toString("latin1") === "WEBP"],
  [".avif", (b) => b.subarray(4, 8).toString("latin1") === "ftyp" && ["avif", "avis"].includes(b.subarray(8, 12).toString("latin1"))],
  [".svg", (b) => /^\s*(<\?xml[^>]*>\s*)?(<!--[\s\S]*?-->\s*)*<svg[\s>]/i.test(b.subarray(0, 4096).toString("utf8"))],
];

// 업로드한 이미지를 파일 시그니처로 확인해 저장하고, 사건의 미디어 끝에 붙인다.
export async function addMedia(store, themeId, itemId, bytes, { contentType = "", alt = "" } = {}) {
  const { themeName, item } = findItem(store, themeId, itemId);
  const { maxMediaCount } = await import("./src/data.ts");
  const media = item.media ?? [];
  if (media.length >= maxMediaCount) throw new StoreError(409, `미디어는 최대 ${maxMediaCount}개까지 등록할 수 있습니다.`);
  const ext = contentType.startsWith("image/") ? imageSignatures.find(([, test]) => test(bytes))?.[0] : undefined;
  if (!ext) throw new StoreError(415, "지원하지 않는 이미지 형식입니다. (webp, avif, png, jpg, gif, svg)");
  if (bytes.length > maxImageBytes) throw new StoreError(413, "이미지가 10MB를 넘습니다.");
  const name = `${createHash("sha256").update(bytes).digest("hex")}${ext}`;
  const target = join(store.mediaDir, name);
  if (!(await stat(target).catch(() => null))) await writeAtomic(target, bytes);
  const entry = { type: "image", src: `media/${name}`, alt: alt.trim() || `${item.title} 사진 ${media.length + 1}` };
  return saveItem(store, themeId, themeName, { ...item, media: [...media, entry] });
}

export async function removeMedia(store, themeId, itemId, index) {
  const { themeName, item } = findItem(store, themeId, itemId);
  const media = item.media ?? [];
  if (!(index >= 0 && index < media.length)) throw new StoreError(404, "미디어를 찾을 수 없습니다.");
  const rest = media.filter((_, i) => i !== index);
  return saveItem(store, themeId, themeName, { ...item, media: rest.length > 0 ? rest : undefined });
}

// 다른 프로세스(import CLI)가 복사만 하고 아직 커밋하지 않은 파일을 지우지 않도록 최근 파일은 남긴다.
// ponytail: 시간 기준 유예. 파일 잠금이 필요할 만큼 동시 작업이 잦아지면 바꾼다.
function removeUnusedMedia({ db, mediaDir, mediaGraceMs }) {
  const used = new Set(db.prepare("SELECT media FROM items WHERE media IS NOT NULL").all()
    .flatMap((row) => mediaPaths(JSON.parse(row.media))).map((src) => src.slice("media/".length)));
  for (const name of readdirSync(mediaDir)) {
    const path = join(mediaDir, name);
    if (!used.has(name) && Date.now() - (statSync(path, { throwIfNoEntry: false })?.ctimeMs ?? 0) >= mediaGraceMs) rmSync(path, { force: true });
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
  for (const media of data.themes.flatMap((theme) => theme.items.flatMap((item) => item.media ?? []))) {
    media.src = await toExported(media.src);
    if (media.poster) media.poster = await toExported(media.poster);
  }
  await writeAtomic(join(dir, "data.json"), `${JSON.stringify(data, null, 2)}\n`);
  return { themes: data.themes.length, items: data.themes.reduce((count, theme) => count + theme.items.length, 0) };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [command, dir, ...flags] = process.argv.slice(2);
  const usage = "사용법: node store.mjs import <디렉터리> [--dry-run] [--overwrite] [--replace]\n       node store.mjs export <디렉터리>";
  if (!dir || !["import", "export"].includes(command)) {
    console.error(usage);
    process.exit(2);
  }
  try {
    const store = openStore();
    const result = command === "import"
      ? await importDir(store, dir, { dryRun: flags.includes("--dry-run"), overwrite: flags.includes("--overwrite"), replace: flags.includes("--replace") })
      : await exportDir(store, resolve(dir));
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error(`실패: ${error instanceof Error ? error.message : error}`);
    process.exit(1);
  }
}
