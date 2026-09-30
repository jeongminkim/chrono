// Obsidian vault 디렉터리 → 테마 동기화. 설계: documents/SETTINGS_OBSIDIAN_PLAN.md
// vault는 읽기 전용이다. 이 모듈은 vault 파일을 읽기만 한다.
import { createHash } from "node:crypto";
import { existsSync, realpathSync, statSync, watch } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { basename, extname, join, posix, sep } from "node:path";
import { isSynced, readTimeline, StoreError, transaction, writeItem } from "./store.mjs";

const displayableImages = new Set([".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif", ".svg"]);
const knownKeys = new Set(["title", "date", "created", "updated", "allday", "tags", "url", "description", "summary", "aliases", "cssclasses"]);
const datePrefix = /^(\d{4}(?:-\d{2}(?:-\d{2})?)?)(?=\s|$)/;
const sha1 = (text) => createHash("sha1").update(text).digest("hex");

// 서버 제공 경로. API 기준 상대 경로라 브라우저에서는 /api/vault/…가 된다.
export const vaultUrl = (vaultPath) => `vault/${vaultPath.split("/").map(encodeURIComponent).join("/")}`;

// 예제 노트의 frontmatter는 모두 "key: value" 한 줄 형식이다. 목록(tags:\n  - a)도 받는다.
export function parseFrontmatter(text) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(text);
  if (!match) return { data: {}, content: text };
  const data = {};
  let listKey;
  for (const line of match[1].split(/\r?\n/)) {
    const item = /^\s+-\s+(.*)$/.exec(line);
    if (item && listKey) {
      data[listKey] = [...(Array.isArray(data[listKey]) ? data[listKey] : []), unquote(item[1])];
      continue;
    }
    const pair = /^([A-Za-z_][\w-]*):\s*(.*)$/.exec(line);
    if (!pair) continue;
    listKey = pair[1];
    const value = pair[2].trim();
    data[pair[1]] = value.startsWith("[") && value.endsWith("]")
      ? value.slice(1, -1).split(",").map((v) => unquote(v.trim())).filter(Boolean)
      : unquote(value);
  }
  return { data, content: text.slice(match[0].length) };
}

const unquote = (value) => value.replace(/^(["'])(.*)\1$/, "$2");

// 표시용 일반 텍스트: Markdown 기호를 걷어 낸다.
const plainText = (markdown) => markdown
  .replace(/^\s*(?:[-*+]|\d+\.)\s+(?:\[[ xX]\]\s+)?/gm, "")
  .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
  .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
  .replace(/[*_~`]+/g, "")
  .replace(/\s+/g, " ")
  .trim();

// 제목·표·이미지만 있는 줄·태그만 있는 줄·구분선을 뺀 첫 문단
// 첫 문단이 날짜처럼 짧으면(40자 미만) 다음 문단까지 " · "로 잇는다. 최대 140자.
function firstParagraph(markdown) {
  const parts = [];
  for (const block of markdown.split(/\n\s*\n/)) {
    const lines = block.split("\n").map((l) => l.trim()).filter(Boolean)
      .filter((l) => !/^(#{1,6}\s|\||-{3,}$|\*{3,}$|>\s*$)/.test(l) && !/^(\s*#[^\s#]+)+\s*$/.test(l));
    const text = plainText(lines.join("\n"));
    if (!text) continue;
    parts.push(text);
    if (parts.join(" · ").length >= 40 || parts.length === 2) break;
  }
  const text = parts.join(" · ");
  return text.length > 140 ? `${text.slice(0, 139)}…` : text;
}

// 파일 이름은 macOS에서 온 NFD(자모 분리)일 수 있고, 노트 내용은 보통 NFC다.
// 화면에 보이는 글자와 id는 NFC로 맞추고, 파일은 실제 이름으로 찾는다.
const nfc = (text) => text.normalize("NFC");

/**
 * 노트 하나를 사건으로 바꾼다.
 * notePath: vault 기준 상대 경로(posix). resolveFile(vaultPath)는 첨부 파일의 실제 vault 경로(없으면 null).
 * 결과: { item, files, rawTags } 또는 { error }. files는 이 노트가 참조하는 vault 첨부 파일 목록.
 */
export function convertNote(text, notePath, { ignoreTags = [], resolveFile = (path) => path } = {}) {
  const { data, content } = parseFrontmatter(nfc(text.replace(/^\uFEFF/, "")));
  const fileTitle = nfc(basename(notePath, ".md"));
  const date = (typeof data.date === "string" && /^(\d{4}-\d{2}-\d{2}|\d{4}-\d{2}|\d{4})(?!\d)/.exec(data.date)?.[1]) || datePrefix.exec(fileTitle)?.[1];
  if (!date) return { error: "날짜 없음 (frontmatter date 또는 파일 이름 앞의 YYYY[-MM[-DD]]가 필요)" };
  const title = String(data.title || fileTitle).replace(/^\d{4}(-\d{2}(-\d{2})?)?\s+/, "").trim() || fileTitle;

  const ignore = new Set(ignoreTags);
  const files = new Set();
  let firstImage;
  const noteDir = posix.dirname(notePath);
  // 노트 기준 상대 경로 → vault 기준 경로. vault 밖을 가리키면 null.
  const resolveLocal = (url) => {
    let path;
    try {
      path = decodeURIComponent(url.replace(/^<|>$/g, ""));
    } catch {
      return null;
    }
    if (/^[a-z][a-z0-9+.-]*:|^\/\//i.test(path)) return null;
    const resolved = posix.normalize(posix.join(noteDir, path.split("#")[0]));
    return resolved.startsWith("../") || resolved === ".." || posix.isAbsolute(resolved) ? null : resolved;
  };

  // 이미지 임베드와 링크를 한 번에 바꾼다(두 번 돌리면 바꾼 링크를 다시 건드린다).
  // 표시 가능한 로컬 이미지 → 서버 경로 이미지, 그 밖의 로컬 첨부 → 파일 이름 링크, 외부 URL → 그대로.
  let body = content
    .replace(/(!?)\[([^\]]*)\]\(([^)\s]+)\)/g, (whole, bang, label, url) => {
      if (/^[a-z][a-z0-9+.-]*:/i.test(url) || url.startsWith("#")) {
        if (bang && /^https:\/\//i.test(url)) firstImage ??= { src: url, alt: label };
        return whole;
      }
      const found = resolveLocal(url);
      const path = found && resolveFile(found);
      if (!path) return label ? (bang ? `(${label})` : label) : "";
      files.add(path);
      if (bang && displayableImages.has(posix.extname(path).toLowerCase())) {
        firstImage ??= { src: vaultUrl(path), alt: label };
        return `![${label}](${vaultUrl(path)})`;
      }
      return `[${bang ? `📎 ${label || nfc(posix.basename(path))}` : label || nfc(posix.basename(path))}](${vaultUrl(path)})`;
    })
    // Obsidian 내부 링크·임베드는 일반 텍스트로
    .replace(/!?\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, target, alias) => alias ?? target);

  // 인라인 태그(#태그). 코드·URL 안의 #은 앞이 공백·줄 시작이 아니라 걸리지 않는다.
  const inlineTags = [...body.matchAll(/(^|\s)#([^\s#.,;:!?()[\]{}"'`]+)/g)].map((m) => m[2]).filter((t) => !/^\d+$/.test(t));
  const frontTags = (Array.isArray(data.tags) ? data.tags : typeof data.tags === "string" && data.tags ? data.tags.split(",") : [])
    .map((t) => String(t).replace(/^#/, "").trim());
  const rawTags = [...new Set([...frontTags, ...inlineTags].filter(Boolean))];
  const allTags = rawTags.filter((t) => !ignore.has(t));
  // 무시할 태그는 본문에서도 지운다(예: 노트 맨 위의 "#e775").
  for (const tag of ignore) body = body.replace(new RegExp(`(^|\\s)#${tag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?=\\s|$)`, "gm"), "$1");

  // 알려지지 않은 frontmatter 키(price 등)는 본문 맨 위에 속성 표로 보여 준다.
  const extra = Object.entries(data).filter(([key, value]) => !knownKeys.has(key.toLowerCase()) && value !== "" && !Array.isArray(value));
  if (extra.length > 0) {
    const cell = (v) => String(v).replace(/\|/g, "\\|");
    body = `| 항목 | 값 |\n| --- | --- |\n${extra.map(([k, v]) => `| ${cell(k)} | ${cell(v)} |`).join("\n")}\n\n${body}`;
  }
  body = body.replace(/\n{3,}/g, "\n\n").trim();

  const summary = typeof data.description === "string" && data.description ? data.description
    : typeof data.summary === "string" && data.summary ? data.summary : "";
  const item = {
    id: `obs-${sha1(nfc(notePath)).slice(0, 12)}`,
    date,
    title,
    description: plainText(summary) || firstParagraph(content.replace(/!?\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, t, a) => a ?? t)) || title,
    ...(body && { body, bodyFormat: "markdown" }),
    tags: allTags,
    ...(firstImage && { media: [{ type: "image", src: firstImage.src, alt: firstImage.alt || title }] }),
    ...(typeof data.url === "string" && /^https:\/\//i.test(data.url) && { sourceUrl: data.url }),
  };
  return { item, files: [...files], rawTags };
}

async function listNotes(dir, prefix = "") {
  const notes = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) notes.push(...await listNotes(join(dir, entry.name), rel));
    else if (entry.isFile() && extname(entry.name).toLowerCase() === ".md") notes.push(rel);
  }
  return notes.sort();
}

/**
 * 동기화 엔진. 서버 프로세스 안에서 동작한다.
 * - start(): 모든 소스를 동기화하고 fs.watch(recursive)로 감시, 5분마다 전체 재검사
 * - 소스마다 한 번에 하나만 동기화하고, 진행 중에 들어온 요청은 끝난 뒤 한 번 더 실행한다.
 */
export function createSyncer(store, vaultDir, { debounceMs = 2000, rescanMs = 5 * 60_000, maxDepth = 3 } = {}) {
  const root = vaultDir && existsSync(vaultDir) ? realpathSync(vaultDir) : null;
  const running = new Map();
  const watchers = new Map();
  const timers = new Map();
  let rescan;

  const sources = () => store.db.prepare("SELECT s.*, t.name FROM sync_sources s JOIN themes t ON t.id = s.theme_id ORDER BY s.created_at").all()
    .map((row) => ({ themeId: row.theme_id, name: row.name, path: row.vault_path, ignoreTags: JSON.parse(row.ignore_tags), createdAt: row.created_at, syncedAt: row.synced_at, report: row.report && JSON.parse(row.report) }));
  const source = (themeId) => {
    const found = sources().find((s) => s.themeId === themeId);
    if (!found) throw new StoreError(404, "동기화 소스를 찾을 수 없습니다.");
    return found;
  };
  // vault 안의 디렉터리인지 확인하고 실제 경로를 돌려준다.
  const dirPath = (path) => {
    if (!root) throw new StoreError(409, "Obsidian vault가 마운트되지 않았습니다(VAULT_DIR).", "vault_unavailable");
    const clean = posix.normalize(String(path ?? "").replace(/^\/+|\/+$/g, "") || ".");
    // "."(최상위)만 허용하고, ".."이나 숨김 폴더(.obsidian 등)는 거부한다.
    if (clean !== "." && clean.split("/").some((part) => part.startsWith("."))) throw new StoreError(400, "vault 안의 디렉터리여야 합니다.");
    let real;
    try {
      real = realpathSync(join(root, clean));
    } catch {
      throw new StoreError(404, "디렉터리를 찾을 수 없습니다.");
    }
    if (real !== root && !real.startsWith(`${root}${sep}`)) throw new StoreError(400, "vault 안의 디렉터리여야 합니다.");
    if (!statSync(real).isDirectory()) throw new StoreError(400, "디렉터리가 아닙니다.");
    return { clean: clean === "." ? "" : clean, real };
  };
  // 노트에 적힌 경로(NFC)와 실제 파일 이름(NFD일 수 있음)이 달라도 찾는다. 실제 vault 경로를 돌려준다.
  const resolveFile = (vaultPath) => {
    for (const candidate of new Set([vaultPath, vaultPath.normalize("NFC"), vaultPath.normalize("NFD")])) {
      try {
        const real = realpathSync(join(root, candidate));
        if (real.startsWith(`${root}${sep}`) && statSync(real).isFile()) return candidate;
      } catch {}
    }
    return null;
  };

  async function syncNow(themeId) {
    const { path, ignoreTags } = source(themeId);
    const { real } = dirPath(path);
    const { parseTimelineData } = await import("./src/data.ts");
    const themeName = store.db.prepare("SELECT name FROM themes WHERE id = ?").get(themeId).name;
    const notes = await listNotes(real);
    const skipped = [];
    const items = [];
    const files = new Set();
    const tagCounts = new Map();
    for (const rel of notes) {
      const notePath = path ? `${path}/${rel}` : rel;
      const result = convertNote(await readFile(join(real, rel), "utf8"), notePath, { ignoreTags, resolveFile });
      if (result.error) {
        skipped.push({ path: nfc(notePath), reason: result.error });
        continue;
      }
      // 태그 후보(무시한 태그 포함): 설정 화면에서 "무시할 태그"를 고를 때 보여 준다.
      for (const tag of result.rawTags) tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
      try {
        const valid = parseTimelineData(JSON.stringify({ version: 1, themes: [{ id: themeId, name: themeName, items: [result.item] }] })).themes[0].items[0];
        items.push(valid);
        result.files.forEach((f) => files.add(f));
      } catch (error) {
        skipped.push({ path: nfc(notePath), reason: String(error instanceof Error ? error.message : error).replace(/^themes\[0\]\.items\[0\]\./, "") });
      }
    }

    // 미러: 바뀐 것이 있을 때만 한 트랜잭션으로 반영하고 revision을 올린다.
    const current = new Map(readTimeline(store).themes.find((t) => t.id === themeId)?.items.map((i) => [i.id, canonical(i)]) ?? []);
    const next = new Map(items.map((i) => [i.id, i]));
    const changed = items.filter((i) => current.get(i.id) !== canonical(i));
    const removed = [...current.keys()].filter((id) => !next.has(id));
    const knownFiles = new Set(store.db.prepare("SELECT vault_path FROM sync_files WHERE theme_id = ?").all(themeId).map((r) => r.vault_path));
    const filesChanged = knownFiles.size !== files.size || [...files].some((f) => !knownFiles.has(f));
    if (changed.length > 0 || removed.length > 0 || filesChanged) {
      transaction(store, () => {
        for (const item of changed) writeItem(store, themeId, item);
        const remove = store.db.prepare("DELETE FROM items WHERE theme_id = ? AND id = ?");
        for (const id of removed) remove.run(themeId, id);
        store.db.prepare("DELETE FROM sync_files WHERE theme_id = ?").run(themeId);
        const add = store.db.prepare("INSERT INTO sync_files (theme_id, vault_path) VALUES (?, ?)");
        for (const file of files) add.run(themeId, file);
      });
    }
    const report = {
      notes: notes.length, synced: items.length, added: changed.filter((i) => !current.has(i.id)).length,
      updated: changed.filter((i) => current.has(i.id)).length, removed: removed.length, skipped,
      tags: [...tagCounts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "ko")),
    };
    store.db.prepare("UPDATE sync_sources SET synced_at = ?, report = ? WHERE theme_id = ?").run(new Date().toISOString(), JSON.stringify(report), themeId);
    return report;
  }

  // 한 소스는 한 번에 하나만. 진행 중이면 끝난 뒤 한 번 더 돌린다.
  function sync(themeId) {
    const state = running.get(themeId);
    if (state) {
      state.again = true;
      return state.promise;
    }
    const entry = { again: false };
    entry.promise = (async () => {
      try {
        let report;
        do {
          entry.again = false;
          report = await syncNow(themeId);
        } while (entry.again);
        return report;
      } catch (error) {
        // 디렉터리가 잠시 없어지는 경우(마운트 해제 등) 데이터를 지우지 않고 오류만 남긴다.
        const message = error instanceof Error ? error.message : String(error);
        if (isSynced(store, themeId)) {
          store.db.prepare("UPDATE sync_sources SET report = json_set(COALESCE(report, '{}'), '$.error', ?) WHERE theme_id = ?").run(message, themeId);
        }
        throw error;
      } finally {
        running.delete(themeId);
      }
    })();
    running.set(themeId, entry);
    return entry.promise;
  }

  function watchSource(themeId, path) {
    if (watchers.has(themeId) || !root) return;
    try {
      const watcher = watch(join(root, path), { recursive: true }, (_event, file) => {
        if (file && !String(file).toLowerCase().endsWith(".md")) return;
        clearTimeout(timers.get(themeId));
        timers.set(themeId, setTimeout(() => sync(themeId).catch(() => {}), debounceMs));
      });
      watcher.on("error", () => unwatch(themeId));
      watchers.set(themeId, watcher);
    } catch {
      // 감시를 못 해도 주기 재검사로 따라잡는다.
    }
  }
  function unwatch(themeId) {
    watchers.get(themeId)?.close();
    watchers.delete(themeId);
    clearTimeout(timers.get(themeId));
    timers.delete(themeId);
  }

  return {
    mounted: Boolean(root),
    list: sources,
    // vault 디렉터리 구조(최대 maxDepth단계)를 트리 순서의 평면 목록으로 돌려준다. 숨김 폴더와 _attachments는 뺀다.
    async tree() {
      dirPath("");
      const dirs = [];
      const walk = async (real, prefix, depth) => {
        const entries = (await readdir(real, { withFileTypes: true }))
          .filter((e) => e.isDirectory() && !e.name.startsWith(".") && e.name !== "_attachments")
          .sort((a, b) => nfc(a.name).localeCompare(nfc(b.name), "ko"));
        for (const e of entries) {
          const path = prefix ? `${prefix}/${e.name}` : e.name;
          dirs.push({ name: nfc(e.name), path, depth });
          if (depth < maxDepth) await walk(join(real, e.name), path, depth + 1);
        }
      };
      await walk(root, "", 1);
      return dirs;
    },
    async add({ path, name, ignoreTags = [] } = {}) {
      const { clean } = dirPath(path);
      if (!clean) throw new StoreError(400, "vault 최상위는 추가할 수 없습니다. 하위 디렉터리를 고르세요.");
      if (clean.split("/").length > maxDepth) throw new StoreError(400, `vault 아래 ${maxDepth}단계까지의 디렉터리만 동기화할 수 있습니다.`);
      // 같은 노트가 두 테마에 들어가지 않도록, 이미 동기화 중인 디렉터리와 같거나 상위·하위 관계면 거부한다.
      const clash = sources().find((s) => overlaps(s.path, clean));
      if (clash) {
        throw new StoreError(409, nfc(clash.path) === nfc(clean) ? "이미 동기화 중인 디렉터리입니다."
          : `이미 동기화 중인 "${nfc(clash.path)}"와 상위·하위 디렉터리 관계라 추가할 수 없습니다.`);
      }
      const themeName = nfc(String(name ?? "").trim() || posix.basename(clean));
      const themeId = `obsidian-${sha1(nfc(clean)).slice(0, 8)}`;
      if (store.db.prepare("SELECT 1 FROM themes WHERE id = ?").get(themeId)) throw new StoreError(409, `테마 id "${themeId}"이(가) 이미 있습니다.`);
      transaction(store, () => {
        store.db.prepare("INSERT INTO themes (id, name, sort_order) VALUES (?, ?, (SELECT COALESCE(MAX(sort_order), -1) + 1 FROM themes))").run(themeId, themeName);
        store.db.prepare("INSERT INTO sync_sources (theme_id, vault_path, ignore_tags, created_at) VALUES (?, ?, ?, ?)")
          .run(themeId, clean, JSON.stringify(cleanList(ignoreTags)), new Date().toISOString());
      });
      await sync(themeId).catch(() => {});
      watchSource(themeId, clean);
      return source(themeId);
    },
    async update(themeId, { name, ignoreTags } = {}) {
      source(themeId);
      transaction(store, () => {
        if (typeof name === "string" && name.trim()) store.db.prepare("UPDATE themes SET name = ? WHERE id = ?").run(name.trim(), themeId);
        if (ignoreTags !== undefined) store.db.prepare("UPDATE sync_sources SET ignore_tags = ? WHERE theme_id = ?").run(JSON.stringify(cleanList(ignoreTags)), themeId);
      });
      await sync(themeId).catch(() => {});
      return source(themeId);
    },
    async sync(themeId) {
      source(themeId);
      await sync(themeId).catch(() => {});
      return source(themeId);
    },
    remove(themeId) {
      source(themeId);
      unwatch(themeId);
      // 테마를 지우면 사건·sync_sources·sync_files가 함께 지워진다(FK cascade). vault는 건드리지 않는다.
      transaction(store, () => store.db.prepare("DELETE FROM themes WHERE id = ?").run(themeId));
    },
    // 동기화한 노트가 참조하는 파일만 제공한다. 그 밖의 vault 파일은 없는 것으로 본다.
    filePath(vaultPath) {
      if (!root || !store.db.prepare("SELECT 1 FROM sync_files WHERE vault_path = ?").get(vaultPath)) return null;
      try {
        const real = realpathSync(join(root, vaultPath));
        return real.startsWith(`${root}${sep}`) ? real : null;
      } catch {
        return null;
      }
    },
    async start() {
      if (!root) return;
      for (const { themeId, path } of sources()) {
        await sync(themeId).catch(() => {});
        watchSource(themeId, path);
      }
      rescan = setInterval(() => sources().forEach(({ themeId }) => sync(themeId).catch(() => {})), rescanMs);
      rescan.unref();
    },
    stop() {
      clearInterval(rescan);
      for (const themeId of [...watchers.keys()]) unwatch(themeId);
    },
  };
}

// 두 vault 경로가 같거나 한쪽이 다른 쪽의 상위 디렉터리인지(NFC/NFD 차이는 무시)
export function overlaps(a, b) {
  const [x, y] = [nfc(a), nfc(b)];
  return x === y || x.startsWith(`${y}/`) || y.startsWith(`${x}/`);
}

// 키 순서와 무관하게 비교하기 위한 직렬화
const canonical = (value) => JSON.stringify(value, (_, v) => (v && typeof v === "object" && !Array.isArray(v) ? Object.fromEntries(Object.entries(v).sort(([a], [b]) => a.localeCompare(b))) : v));

const cleanList = (values) => [...new Set((Array.isArray(values) ? values : String(values ?? "").split(","))
  .map((v) => String(v).replace(/^#/, "").trim()).filter(Boolean))];
