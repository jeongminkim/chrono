import { mkdirSync, readdirSync, rmSync, statSync } from "node:fs";
import { copyFile, mkdir, readdir, readFile, realpath, rename, rm, rmdir, stat, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { DatabaseSync } from "node:sqlite";
import { dirname, extname, join, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createThumbnailer, mediaThumbKey } from "./thumbs.mjs";

const projectDir = fileURLToPath(new URL(".", import.meta.url));
export const defaultStoreDir = process.env.STORE_DIR || resolve(projectDir, ".store");
export const mediaNamePattern = /^[0-9a-f]{64}\.(webp|avif|png|jpg|jpeg|gif|svg)$/;
const imageExtensions = new Set([".webp", ".avif", ".png", ".jpg", ".jpeg", ".gif", ".svg"]);
const maxImageBytes = 10 * 1024 * 1024;
const schemaVersion = "3";

// 로컬 미디어는 DB에 API 기준 상대 경로 "media/<sha256>.<ext>"로 저장한다. 그 외(https URL)는 그대로 둔다.
const isLocal = (src) => !/^[a-z][a-z0-9+.-]*:/i.test(src) && !src.startsWith("//");
const mediaPaths = (media = []) => media.flatMap((m) => [m.type === "image" && m.src, m.poster]).filter((src) => src && isLocal(src));

// 파일 이름을 내용 해시로 바꾸면 서로 다른 경로(예: "a.jpg"와 "./a.jpg", 내용이 같은 두 파일)가 같은 src가 된다.
// 지금은 import가 이를 오류로 거부하지만, 이전 버전이 DB에 남긴 중복은 열 때 처음 것만 남겨 고친다.
const uniqueMedia = (media) => media.filter((m, i) => media.findIndex((x) => x.src === m.src) === i);

// HTTP 응답 코드로 옮길 수 있는 저장소 오류
const errorCodes = { 400: "validation_failed", 404: "not_found", 409: "already_exists", 413: "too_large", 415: "unsupported_media_type" };
export class StoreError extends Error {
  constructor(status, message, code = errorCodes[status] ?? "internal_error") {
    super(message);
    this.status = status;
    this.code = code;
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
      body_format TEXT NOT NULL DEFAULT 'text',
      PRIMARY KEY (theme_id, id)
    );
    -- Obsidian vault에서 동기화하는 테마(읽기 전용)와, /api/vault가 제공해도 되는 첨부 파일
    CREATE TABLE IF NOT EXISTS sync_sources (
      theme_id TEXT PRIMARY KEY REFERENCES themes(id) ON DELETE CASCADE,
      vault_path TEXT NOT NULL UNIQUE,
      ignore_tags TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL,
      synced_at TEXT,
      report TEXT
    );
    CREATE TABLE IF NOT EXISTS sync_files (
      theme_id TEXT NOT NULL REFERENCES themes(id) ON DELETE CASCADE,
      vault_path TEXT NOT NULL,
      PRIMARY KEY (theme_id, vault_path)
    );
    CREATE INDEX IF NOT EXISTS sync_files_path ON sync_files (vault_path);
    -- Obsidian 사건의 대표 이미지 선택(노트는 읽기 전용이라 따로 저장하고 동기화 때 다시 적용한다)
    CREATE TABLE IF NOT EXISTS sync_covers (
      theme_id TEXT NOT NULL REFERENCES themes(id) ON DELETE CASCADE,
      item_id TEXT NOT NULL,
      src TEXT NOT NULL,
      PRIMARY KEY (theme_id, item_id)
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
  if (version() === "2") {
    // v3: 본문 형식(text | markdown). 새 DB는 위 CREATE TABLE에 이미 있다.
    const hasColumn = db.prepare("SELECT 1 FROM pragma_table_info('items') WHERE name = 'body_format'").get();
    db.exec(`BEGIN IMMEDIATE;
      ${hasColumn ? "" : "ALTER TABLE items ADD COLUMN body_format TEXT NOT NULL DEFAULT 'text';"}
      UPDATE meta SET value = '3' WHERE key = 'schema_version';
      COMMIT;`);
  }
  if (version() !== schemaVersion) throw new Error(`지원하지 않는 DB 스키마 버전입니다: ${version()}`);
  // 이전 버전 import가 남긴 중복 미디어를 고친다(멱등).
  const fixMedia = db.prepare("UPDATE items SET media = ? WHERE theme_id = ? AND id = ?");
  for (const row of db.prepare("SELECT theme_id, id, media FROM items WHERE media IS NOT NULL").all()) {
    const media = JSON.parse(row.media);
    const unique = uniqueMedia(media);
    if (unique.length !== media.length) fixMedia.run(JSON.stringify(unique), row.theme_id, row.id);
  }
  const store = { db, dir, mediaDir, mediaGraceMs, thumbs: createThumbnailer(join(dir, "thumbs")) };
  // 저장된 미디어 중 썸네일이 없는 것을 백그라운드에서 만든다(이전 버전에서 올린 이미지 포함).
  for (const name of readdirSync(mediaDir)) {
    if (mediaNamePattern.test(name)) store.thumbs.add(mediaThumbKey(name), join(mediaDir, name));
  }
  return store;
}

export const revision = ({ db }) => Number(db.prepare("SELECT value FROM meta WHERE key = 'revision'").get().value);

// data.json version 1 구조로 읽는다. 항목이 없는 테마는 규격상 허용되지 않으므로 뺀다.
const rowToItem = (row) => ({
  id: row.id,
  date: row.date,
  title: row.title,
  description: row.description,
  ...(row.body !== null && { body: row.body }),
  tags: JSON.parse(row.tags),
  ...(row.media !== null && { media: JSON.parse(row.media) }),
  ...(row.source_url !== null && { sourceUrl: row.source_url }),
  ...(row.body_format === "markdown" && { bodyFormat: "markdown" }),
});

export const isSynced = ({ db }, themeId) => Boolean(db.prepare("SELECT 1 FROM sync_sources WHERE theme_id = ?").get(themeId));

// Obsidian 테마는 vault가 원본이라 화면·API에서 바꿀 수 없다.
function assertWritable(store, themeId) {
  if (isSynced(store, themeId)) throw new StoreError(403, "Obsidian에서 동기화한 테마는 수정하거나 삭제할 수 없습니다.", "read_only");
}

// includeSynced: false면 Obsidian 테마를 뺀다(export용).
export function readTimeline({ db }, { includeSynced = true } = {}) {
  const items = db.prepare("SELECT * FROM items ORDER BY date, id").all();
  const themes = db.prepare(`SELECT t.id, t.name, s.theme_id IS NOT NULL AS synced FROM themes t LEFT JOIN sync_sources s ON s.theme_id = t.id
    ORDER BY t.sort_order, t.id`).all()
    .filter((theme) => includeSynced || !theme.synced)
    .map((theme) => ({
      id: theme.id,
      name: theme.name,
      ...(theme.synced && { source: "obsidian" }),
      items: items.filter((row) => row.theme_id === theme.id).map(rowToItem),
    }));
  return { version: 1, themes: themes.filter((theme) => theme.items.length > 0) };
}

// 화면용 타임라인: 규격에 맞지 않는 사건은 빼고 보낸다. 사건 하나 때문에 화면 전체가 데이터를 못 읽는 일을 막는다.
// 뺀 사건은 서버 로그에 남긴다(같은 사건·같은 이유는 프로세스당 한 번만).
const reportedInvalid = new Set();
export async function readValidTimeline(store) {
  const { parseTimelineData } = await import("./src/data.ts");
  const themes = readTimeline(store).themes.map((theme) => ({
    ...theme,
    items: theme.items.filter((item) => {
      try {
        parseTimelineData(JSON.stringify({ version: 1, themes: [{ ...theme, items: [item] }] }));
        return true;
      } catch (error) {
        const reason = String(error instanceof Error ? error.message : error).replace(/^themes\[0\]\.items\[0\]\./, "");
        const key = `${theme.id}/${item.id}: ${reason}`;
        if (!reportedInvalid.has(key)) {
          reportedInvalid.add(key);
          console.warn(`${new Date().toISOString()} timeline 규격에 맞지 않아 화면에서 뺀 사건 ${theme.id}/${item.id} "${item.title}": ${reason}`);
        }
        return false;
      }
    }),
  }));
  return { version: 1, themes: themes.filter((theme) => theme.items.length > 0) };
}

// ---- 내부 API 조회 (빈 테마 포함) ----

// 내부 API는 Obsidian 테마를 보여 주지 않는다(없는 것처럼 동작).
export function listThemes({ db }) {
  return db.prepare(`SELECT t.id, t.name, COUNT(i.id) AS itemCount FROM themes t LEFT JOIN items i ON i.theme_id = t.id
    WHERE t.id NOT IN (SELECT theme_id FROM sync_sources)
    GROUP BY t.id ORDER BY t.sort_order, t.id`).all().map((row) => ({ ...row }));
}

export function getTheme(store, themeId) {
  const theme = listThemes(store).find((t) => t.id === themeId);
  if (!theme) throw new StoreError(404, "테마를 찾을 수 없습니다.");
  return theme;
}

// filter: { from?, to?, tag?, q?, limit, offset }. 날짜는 앞자리 비교라 "2020"은 2020년 전체와 맞는다.
export function listItems(store, themeId, { from, to, tag, q, limit, offset }) {
  getTheme(store, themeId);
  const needle = q?.trim().toLocaleLowerCase("ko-KR");
  const items = store.db.prepare("SELECT * FROM items WHERE theme_id = ? ORDER BY date, id").all(themeId).map(rowToItem)
    .filter((item) => (!from || item.date.slice(0, from.length) >= from) && (!to || item.date.slice(0, to.length) <= to)
      && (!tag || item.tags.includes(tag))
      && (!needle || [item.title, item.description, item.body ?? "", item.date, ...item.tags].some((t) => t.toLocaleLowerCase("ko-KR").includes(needle))));
  return { total: items.length, limit, offset, items: items.slice(offset, offset + limit) };
}

export function getItem(store, themeId, itemId) {
  return findItem(store, themeId, itemId).item;
}

export async function createTheme(store, input) {
  const { id, name } = typeof input === "object" && input !== null ? input : {};
  const { idPattern } = await import("./src/data.ts");
  if (typeof id !== "string" || !idPattern.test(id)) throw new StoreError(400, "id는 영문 소문자, 숫자, 하이픈이어야 합니다.");
  if (typeof name !== "string" || !name.trim()) throw new StoreError(400, "name은 비어 있지 않은 문자열이어야 합니다.");
  transaction(store, () => {
    if (store.db.prepare("SELECT 1 FROM themes WHERE id = ?").get(id)) throw new StoreError(409, `테마 "${id}"이(가) 이미 있습니다.`);
    store.db.prepare("INSERT INTO themes (id, name, sort_order) VALUES (?, ?, (SELECT COALESCE(MAX(sort_order), -1) + 1 FROM themes))").run(id, name.trim());
  });
  return getTheme(store, id);
}

// 새 사건만 등록한다(같은 id가 있으면 409). id를 생략하면 "YYYYMMDD-<랜덤 6자>"를 만든다.
export async function createItem(store, themeId, input) {
  const { name } = getTheme(store, themeId);
  if (typeof input !== "object" || input === null || Array.isArray(input)) throw new StoreError(400, "본문은 사건 객체여야 합니다.");
  const media = input.media === undefined ? [] : Array.isArray(input.media) ? input.media : [input.media];
  if (media.some((m) => [m?.src, m?.poster].some((src) => typeof src === "string" && isLocal(src)))) {
    throw new StoreError(400, "media의 src·poster는 https URL만 쓸 수 있습니다. 로컬 이미지는 업로드 API를 쓰세요.");
  }
  const random = Array.from(crypto.getRandomValues(new Uint8Array(6)), (b) => "abcdefghijklmnopqrstuvwxyz0123456789"[b % 36]).join("");
  const datePrefix = typeof input.date === "string" ? input.date.replace(/\D/g, "") : "";
  const id = input.id ?? (datePrefix ? `${datePrefix}-${random}` : random);
  return saveItem(store, themeId, name, { ...input, id, tags: Array.isArray(input.tags) ? (await import("./src/data.ts")).cleanTags(input.tags.map(String)) : input.tags }, { mustBeNew: true });
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
  const synced = data.themes.filter((theme) => isSynced(store, theme.id)).map((theme) => theme.id);
  if (synced.length > 0) throw new Error(`Obsidian에서 동기화하는 테마와 id가 겹칩니다: ${synced.join(", ")}`);

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

  // 저장될 모습(파일 이름을 내용 해시로 바꾼 뒤) 그대로 사건마다 검사한다. 오류는 모두 모아 한 번에 알려 준다.
  const errors = [];
  const rows = [];
  for (const theme of data.themes) {
    for (const item of theme.items) {
      if (!written.has(`${theme.id}/${item.id}`)) continue;
      const media = item.media?.map((m) => ({ ...m, src: toStored(m.src), ...(m.type === "video" && m.poster && { poster: toStored(m.poster) }) }));
      media?.forEach((m, i) => {
        const first = media.findIndex((x) => x.src === m.src);
        if (first !== i) {
          errors.push(`${theme.id}/${item.id}: media[${i}] "${item.media[i].src}"는 media[${first}] "${item.media[first].src}"와 같은 이미지입니다(파일 내용이 같음).`);
        }
      });
      rows.push({ themeId: theme.id, item: { ...item, ...(media && { media }) } });
    }
  }
  if (errors.length > 0) {
    throw new Error(`data.json 검증 실패 (${errors.length}건)\n${errors.slice(0, 20).join("\n")}${errors.length > 20 ? `\n… 외 ${errors.length - 20}건` : ""}`);
  }

  const upsertTheme = db.prepare(`
    INSERT INTO themes (id, name, sort_order) VALUES (?, ?, (SELECT COALESCE(MAX(sort_order), -1) + 1 FROM themes))
    ON CONFLICT (id) DO ${overwrite ? "UPDATE SET name = excluded.name" : "NOTHING"}`);
  const removeMissing = db.prepare("DELETE FROM items WHERE theme_id = ? AND id NOT IN (SELECT value FROM json_each(?))");
  const write = () => {
    for (const theme of data.themes) upsertTheme.run(theme.id, theme.name);
    for (const { themeId, item } of rows) writeItem(store, themeId, item);
    if (replace) for (const theme of data.themes) removeMissing.run(theme.id, JSON.stringify(theme.items.map((item) => item.id)));
    // 최종 안전장치: 기존 데이터와 합친 결과를 화면과 같은 규칙으로 읽을 수 있어야 커밋한다.
    try {
      parseTimelineData(JSON.stringify(readTimeline(store)), { allowEmpty: true });
    } catch (error) {
      throw new Error(`import 후 데이터가 올바르지 않아 취소했습니다: ${error instanceof Error ? error.message : error}`);
    }
  };

  if (dryRun) {
    // 실제 import와 같은 검사를 거친 뒤 항상 되돌린다.
    db.exec("BEGIN IMMEDIATE");
    try {
      write();
    } finally {
      db.exec("ROLLBACK");
    }
    return summary;
  }

  for (const { path, name } of files.values()) {
    const target = join(mediaDir, name);
    if (!(await stat(target).catch(() => null))) {
      await copyFile(path, `${target}.tmp`);
      await rename(`${target}.tmp`, target);
    }
    store.thumbs.add(mediaThumbKey(name), target);
  }
  transaction(store, write);
  summary.revision = revision(store);

  await removeSource(root, [dataPath, ...[...files.values()].map((file) => file.path)]);
  return summary;
}

export function writeItem({ db }, themeId, item) {
  db.prepare(`
    INSERT INTO items (theme_id, id, date, title, description, body, tags, media, source_url, body_format, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT (theme_id, id) DO UPDATE SET date = excluded.date, title = excluded.title, description = excluded.description,
      body = excluded.body, tags = excluded.tags, media = excluded.media, source_url = excluded.source_url,
      body_format = excluded.body_format, updated_at = excluded.updated_at`)
    .run(themeId, item.id, item.date, item.title, item.description, item.body ?? null,
      JSON.stringify(item.tags), item.media ? JSON.stringify(item.media) : null, item.sourceUrl ?? null,
      item.bodyFormat === "markdown" ? "markdown" : "text");
}

// 한 트랜잭션으로 쓰고 revision을 올린다. 커밋 후 어디서도 참조하지 않는 미디어 파일을 정리한다.
export function transaction(store, write) {
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
  const row = store.db.prepare("SELECT i.*, t.name AS theme_name FROM items i JOIN themes t ON t.id = i.theme_id WHERE i.theme_id = ? AND i.id = ?").get(themeId, itemId);
  if (!row) throw new StoreError(404, "사건을 찾을 수 없습니다.");
  return { themeName: row.theme_name, item: rowToItem(row) };
}

// 바뀐 사건 전체를 data.json 규칙으로 다시 검증해 저장한다.
async function saveItem(store, themeId, themeName, item, { mustBeNew = false } = {}) {
  const { parseTimelineData } = await import("./src/data.ts");
  let valid;
  try {
    valid = parseTimelineData(JSON.stringify({ version: 1, themes: [{ id: themeId, name: themeName, items: [item] }] })).themes[0].items[0];
  } catch (error) {
    throw new StoreError(400, error instanceof Error ? error.message.replace(/^themes\[0\]\.items\[0\]\./, "") : String(error));
  }
  transaction(store, () => {
    if (mustBeNew && store.db.prepare("SELECT 1 FROM items WHERE theme_id = ? AND id = ?").get(themeId, valid.id)) {
      throw new StoreError(409, `사건 "${valid.id}"이(가) 이미 있습니다.`);
    }
    writeItem(store, themeId, valid);
  });
  return valid;
}

// 화면의 reset 버튼: Obsidian 테마를 뺀 모든 테마·사건과 미디어 파일을 지운다(Obsidian 테마는 지워도 다시 동기화된다).
// revision은 계속 올려 열린 화면이 갱신되게 한다.
export function resetStore(store) {
  transaction(store, () => store.db.prepare("DELETE FROM themes WHERE id NOT IN (SELECT theme_id FROM sync_sources)").run());
  for (const name of readdirSync(store.mediaDir)) rmSync(join(store.mediaDir, name), { force: true });
}

export function deleteTheme(store, themeId) {
  if (!store.db.prepare("SELECT 1 FROM themes WHERE id = ?").get(themeId)) throw new StoreError(404, "테마를 찾을 수 없습니다.");
  assertWritable(store, themeId);
  transaction(store, () => store.db.prepare("DELETE FROM themes WHERE id = ?").run(themeId));
}

export function deleteItem(store, themeId, itemId) {
  findItem(store, themeId, itemId);
  assertWritable(store, themeId);
  transaction(store, () => {
    store.db.prepare("DELETE FROM items WHERE theme_id = ? AND id = ?").run(themeId, itemId);
    // 마지막 사건을 지워 빈 테마가 되면 테마도 지운다(빈 테마는 규격상 표시할 수 없다).
    store.db.prepare("DELETE FROM themes WHERE id = ? AND NOT EXISTS (SELECT 1 FROM items WHERE theme_id = ?)").run(themeId, themeId);
  });
}

// patch: { date?, title?, description?, body?, tags? }
export async function updateItem(store, themeId, itemId, patch) {
  const { themeName, item } = findItem(store, themeId, itemId);
  assertWritable(store, themeId);
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
  assertWritable(store, themeId);
  const { maxMediaCount } = await import("./src/data.ts");
  const media = item.media ?? [];
  if (media.length >= maxMediaCount) throw new StoreError(409, `미디어는 최대 ${maxMediaCount}개까지 등록할 수 있습니다.`, "media_limit");
  const ext = contentType.startsWith("image/") ? imageSignatures.find(([, test]) => test(bytes))?.[0] : undefined;
  if (!ext) throw new StoreError(415, "지원하지 않는 이미지 형식입니다. (webp, avif, png, jpg, gif, svg)");
  if (bytes.length > maxImageBytes) throw new StoreError(413, "이미지가 10MB를 넘습니다.");
  const name = `${createHash("sha256").update(bytes).digest("hex")}${ext}`;
  const target = join(store.mediaDir, name);
  if (!(await stat(target).catch(() => null))) await writeAtomic(target, bytes);
  store.thumbs.add(mediaThumbKey(name), target);
  const entry = { type: "image", src: `media/${name}`, alt: alt.trim() || `${item.title} 사진 ${media.length + 1}` };
  return saveItem(store, themeId, themeName, { ...item, media: [...media, entry] });
}

export const coverCandidate = (src) => /^vault\/[^/]/.test(src) || /^https:\/\//i.test(src);

// Markdown 본문의 이미지 임베드 목록(Obsidian 사건의 대표 이미지 후보)
export const markdownImages = (markdown = "") => [...markdown.matchAll(/!\[([^\]]*)\]\(([^)\s]+)\)/g)].map((m) => ({ alt: m[1], src: m[2] }));

/**
 * 대표 이미지(타임라인 카드에 보이는 첫 미디어)를 바꾼다. 화면 표시 선택이라 편집 허용·읽기 전용과 무관하다.
 * - 일반 사건: media 안에서 해당 항목을 맨 앞으로 옮긴다.
 * - Obsidian 사건: 노트 본문에 있는 이미지 중에서 고르고, 선택을 sync_covers에 저장해 다음 동기화에도 유지한다.
 */
export async function setCover(store, themeId, itemId, src) {
  const { themeName, item } = findItem(store, themeId, itemId);
  if (typeof src !== "string" || !src) throw new StoreError(400, "src가 필요합니다.");
  if (isSynced(store, themeId)) {
    // 사건 규격상 미디어는 vault 안 이미지나 https URL만 된다. 본문의 http:// 이미지 등은 대표 이미지가 될 수 없다.
    if (!coverCandidate(src)) throw new StoreError(400, "대표 이미지는 vault 안의 이미지나 https 이미지만 고를 수 있습니다.");
    const image = markdownImages(item.body).find((i) => i.src === src);
    if (!image) throw new StoreError(404, "노트 본문에 없는 이미지입니다.");
    transaction(store, () => {
      store.db.prepare("INSERT INTO sync_covers (theme_id, item_id, src) VALUES (?, ?, ?) ON CONFLICT (theme_id, item_id) DO UPDATE SET src = excluded.src")
        .run(themeId, itemId, src);
      store.db.prepare("UPDATE items SET media = ? WHERE theme_id = ? AND id = ?")
        .run(JSON.stringify([{ type: "image", src, alt: image.alt || item.title }]), themeId, itemId);
    });
    return findItem(store, themeId, itemId).item;
  }
  const media = item.media ?? [];
  const index = media.findIndex((m) => m.src === src);
  if (index < 0) throw new StoreError(404, "사건에 없는 미디어입니다.");
  if (index === 0) return item;
  return saveItem(store, themeId, themeName, { ...item, media: [media[index], ...media.filter((_, i) => i !== index)] });
}

export async function removeMedia(store, themeId, itemId, index) {
  const { themeName, item } = findItem(store, themeId, itemId);
  assertWritable(store, themeId);
  const media = item.media ?? [];
  if (!(index >= 0 && index < media.length)) throw new StoreError(404, "미디어를 찾을 수 없습니다.");
  const rest = media.filter((_, i) => i !== index);
  return saveItem(store, themeId, themeName, { ...item, media: rest.length > 0 ? rest : undefined });
}

// 다른 프로세스(import CLI)가 복사만 하고 아직 커밋하지 않은 파일을 지우지 않도록 최근 파일은 남긴다.
// ponytail: 시간 기준 유예. 파일 잠금이 필요할 만큼 동시 작업이 잦아지면 바꾼다.
function removeUnusedMedia({ db, mediaDir, mediaGraceMs, thumbs }) {
  const used = new Set(db.prepare("SELECT media FROM items WHERE media IS NOT NULL").all()
    .flatMap((row) => mediaPaths(JSON.parse(row.media))).map((src) => src.slice("media/".length)));
  for (const name of readdirSync(mediaDir)) {
    const path = join(mediaDir, name);
    if (!used.has(name) && Date.now() - (statSync(path, { throwIfNoEntry: false })?.ctimeMs ?? 0) >= mediaGraceMs) rmSync(path, { force: true });
  }
  // 원본이 지워진 미디어의 썸네일도 지운다.
  const remaining = new Set(readdirSync(mediaDir).map(mediaThumbKey));
  thumbs.prune("m-", (key) => remaining.has(key));
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
// Obsidian 테마는 원본이 vault에 있고, 다시 import하면 id가 겹쳐 거부되므로 내보내지 않는다.
export async function exportDir(store, dir) {
  const data = readTimeline(store, { includeSynced: false });
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
    await store.thumbs.idle();
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error(`실패: ${error instanceof Error ? error.message : error}`);
    process.exit(1);
  }
}
