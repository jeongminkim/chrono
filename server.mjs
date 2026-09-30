import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { basename, extname, join, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { handleInternal } from "./internal-api.mjs";
import { createSyncer } from "./obsidian.mjs";
import { addMedia, deleteItem, importDir, resetStore, setCover, deleteTheme, mediaNamePattern, openStore, readTimeline, removeMedia, revision, StoreError, updateItem } from "./store.mjs";

const projectDir = fileURLToPath(new URL(".", import.meta.url));
const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".avif": "image/avif",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".pdf": "application/pdf",
  ".mp4": "video/mp4",
  ".mov": "video/quicktime",
  ".webm": "video/webm",
};
// vault 첨부 중 브라우저에서 바로 열어도 되는 형식. 나머지(html 등)는 실행되지 않도록 다운로드로만 준다.
const inlineVaultTypes = new Set([".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif", ".svg", ".pdf", ".mp4", ".mov", ".webm"]);

function safePath(root, relativePath) {
  const path = resolve(root, relativePath);
  return path === root || path.startsWith(`${root}${sep}`) ? path : null;
}

const securityHeaders = {
  "content-security-policy": "default-src 'self'; img-src 'self' https: data:; media-src 'self' https:; frame-src https://www.youtube-nocookie.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self'; connect-src 'self'; base-uri 'self'; frame-ancestors 'none'",
  "referrer-policy": "strict-origin-when-cross-origin",
  "x-content-type-options": "nosniff",
};

async function sendFile(request, response, filePath, cacheControl, { download = false } = {}) {
  try {
    const fileStat = await stat(filePath);
    if (!fileStat.isFile()) throw new Error();
    const etag = `"${fileStat.size.toString(16)}-${Math.trunc(fileStat.mtimeMs).toString(16)}"`;
    const type = download ? "application/octet-stream" : mimeTypes[extname(filePath).toLowerCase()] || "application/octet-stream";
    const headers = {
      ...securityHeaders,
      // 가져온 SVG 안의 스크립트가 실행되지 않도록 격리한다.
      ...(type === "image/svg+xml" && { "content-security-policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox" }),
      "cache-control": cacheControl,
      "content-length": fileStat.size,
      "content-type": type,
      ...(download && { "content-disposition": `attachment; filename*=UTF-8''${encodeURIComponent(basename(filePath))}` }),
      etag,
    };
    if (request.headers["if-none-match"] === etag) {
      response.writeHead(304, headers).end();
      return;
    }
    response.writeHead(200, headers);
    if (request.method === "HEAD") response.end();
    else {
      const stream = createReadStream(filePath);
      stream.on("error", () => response.destroy());
      stream.pipe(response);
    }
  } catch {
    response.writeHead(404).end();
  }
}

function sendTimeline(request, response, store) {
  const etag = `"rev-${revision(store)}"`;
  const headers = { ...securityHeaders, "cache-control": "no-cache", "content-type": mimeTypes[".json"], etag };
  if (request.headers["if-none-match"] === etag) {
    response.writeHead(304, headers).end();
    return;
  }
  const body = JSON.stringify(readTimeline(store));
  response.writeHead(200, { ...headers, "content-length": Buffer.byteLength(body) });
  response.end(request.method === "HEAD" ? undefined : body);
}

function sendJson(response, status, value) {
  const body = JSON.stringify(value);
  response.writeHead(status, { ...securityHeaders, "cache-control": "no-store", "content-type": mimeTypes[".json"], "content-length": Buffer.byteLength(body) });
  response.end(body);
}

async function readBody(request, limit) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > limit) throw new StoreError(413, "요청 본문이 너무 큽니다.");
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

const writeRoute = /^\/api\/themes\/([^/]+)(?:\/items\/([^/]+)(?:\/media(?:\/(\d+))?)?)?$/;

// 인증은 앞단 Nginx가 맡는다. 여기서는 다른 사이트가 인증된 브라우저로 보내는 요청(CSRF)만 막는다.
function allowWrite(request, response) {
  const site = request.headers["sec-fetch-site"];
  if (request.headers["x-chrono-edit"] === "1" && (!site || site === "same-origin")) return true;
  sendJson(response, 403, { error: "허용되지 않은 요청입니다." });
  return false;
}

// 화면의 import 버튼. ?dryRun=1이면 검증과 예상 결과만 돌려준다.
async function handleImport(request, response, store, importPath) {
  if (!allowWrite(request, response)) return;
  const dryRun = new URL(request.url || "/", "http://localhost").searchParams.get("dryRun") === "1";
  try {
    if (!(await stat(join(importPath, "data.json")).catch(() => null))) throw new StoreError(404, "import 디렉터리에 data.json이 없습니다.");
    sendJson(response, 200, await importDir(store, importPath, { dryRun }));
  } catch (error) {
    // 검증 오류 메시지(필드 위치 등)를 그대로 보여 준다.
    sendJson(response, error instanceof StoreError ? error.status : 400, { error: error instanceof Error ? error.message : String(error) });
  }
}

async function handleWrite(request, response, store, pathname) {
  if (!allowWrite(request, response)) return;
  const match = writeRoute.exec(pathname);
  const isMedia = pathname.includes("/media");
  const cover = /^\/api\/themes\/([^/]+)\/items\/([^/]+)\/cover$/.exec(pathname);
  try {
    if (cover && request.method === "POST") {
      let body;
      try {
        body = JSON.parse((await readBody(request, 64 * 1024)).toString("utf8"));
      } catch (error) {
        throw error instanceof StoreError ? error : new StoreError(400, "JSON 본문이 올바르지 않습니다.");
      }
      const [themeId, itemId] = cover.slice(1).map(decodeURIComponent);
      const item = await setCover(store, themeId, itemId, body?.src);
      sendJson(response, 200, { revision: revision(store), item });
      return;
    }
    let themeId, itemId, index;
    try {
      [themeId, itemId, index] = match ? match.slice(1).map((part) => part && decodeURIComponent(part)) : [];
    } catch {
      throw new StoreError(400, "경로가 올바르지 않습니다.");
    }
    let item;
    if (request.method === "DELETE" && match && !itemId) deleteTheme(store, themeId);
    else if (request.method === "DELETE" && itemId && !isMedia) deleteItem(store, themeId, itemId);
    else if (request.method === "DELETE" && index !== undefined) item = await removeMedia(store, themeId, itemId, Number(index));
    else if (request.method === "PATCH" && itemId && !isMedia) {
      let patch;
      try {
        patch = JSON.parse((await readBody(request, 64 * 1024)).toString("utf8"));
      } catch (error) {
        throw error instanceof StoreError ? error : new StoreError(400, "JSON 본문이 올바르지 않습니다.");
      }
      item = await updateItem(store, themeId, itemId, patch ?? {});
    } else if (request.method === "POST" && isMedia && index === undefined) {
      const url = new URL(request.url || "/", "http://localhost");
      item = await addMedia(store, themeId, itemId, await readBody(request, 10 * 1024 * 1024),
        { contentType: request.headers["content-type"], alt: url.searchParams.get("alt") ?? "" });
    } else {
      sendJson(response, 404, { error: "없는 경로입니다." });
      return;
    }
    sendJson(response, 200, { revision: revision(store), ...(item && { item }) });
  } catch (error) {
    if (!(error instanceof StoreError)) console.error(error);
    sendJson(response, error instanceof StoreError ? error.status : 500, { error: error instanceof StoreError ? error.message : "저장하지 못했습니다." });
  }
}

// 설정 화면의 Obsidian 동기화 API. 쓰기는 다른 편집 API와 같은 CSRF 방지 확인을 거친다.
const sourceRoute = /^\/api\/settings\/sources(?:\/([^/]+)(?:\/(sync))?)?$/;
async function handleSettings(request, response, store, syncer, url) {
  const { pathname } = url;
  const method = request.method;
  try {
    if (pathname === "/api/settings/vault" && method === "GET") {
      sendJson(response, 200, syncer.mounted ? { mounted: true, dirs: await syncer.tree() } : { mounted: false, dirs: [] });
      return;
    }
    const match = sourceRoute.exec(pathname);
    if (!match) {
      sendJson(response, 404, { error: "없는 경로입니다." });
      return;
    }
    const [, themeId, action] = match;
    if (method === "GET" && !themeId) {
      sendJson(response, 200, { mounted: syncer.mounted, sources: syncer.list() });
      return;
    }
    if (!allowWrite(request, response)) return;
    const body = method === "GET" || method === "DELETE" ? {} : JSON.parse((await readBody(request, 64 * 1024)).toString("utf8") || "{}");
    if (method === "POST" && !themeId) sendJson(response, 201, await syncer.add(body));
    else if (method === "POST" && action) sendJson(response, 200, await syncer.sync(themeId));
    else if (method === "PATCH" && themeId && !action) sendJson(response, 200, await syncer.update(themeId, body));
    else if (method === "DELETE" && themeId && !action) {
      syncer.remove(themeId);
      sendJson(response, 200, { revision: revision(store) });
    } else sendJson(response, 404, { error: "없는 경로입니다." });
  } catch (error) {
    if (error instanceof SyntaxError) return sendJson(response, 400, { error: "JSON 본문이 올바르지 않습니다." });
    if (!(error instanceof StoreError)) console.error(error);
    sendJson(response, error instanceof StoreError ? error.status : 500, { error: error instanceof StoreError ? error.message : "처리하지 못했습니다." });
  }
}

export function createApp({
  distDir = process.env.DIST_DIR || resolve(projectDir, "dist"),
  store = openStore(),
  importPath = process.env.IMPORT_DIR || resolve(projectDir, "import"),
  vaultDir = process.env.VAULT_DIR,
  syncer = createSyncer(store, vaultDir),
} = {}) {
  // 시작하면 모든 Obsidian 소스를 동기화하고 감시한다. 서버를 닫으면 감시도 멈춘다.
  void syncer.start();
  const server = createServer(async (request, response) => {
    const pathname = new URL(request.url || "/", "http://localhost").pathname;

    if (pathname === "/healthz") {
      response.writeHead(200, { "content-type": "text/plain; charset=utf-8" });
      response.end("ok");
      return;
    }
    if (pathname.startsWith("/internal/")) {
      await handleInternal(request, response, store);
      return;
    }
    if (pathname === "/api/reset" && request.method === "POST") {
      if (allowWrite(request, response)) {
        resetStore(store);
        sendJson(response, 200, { revision: revision(store) });
      }
      return;
    }
    if (pathname === "/api/import" && request.method === "POST") {
      await handleImport(request, response, store, importPath);
      return;
    }
    if (pathname.startsWith("/api/settings/")) {
      await handleSettings(request, response, store, syncer, new URL(request.url || "/", "http://localhost"));
      return;
    }
    if (pathname.startsWith("/api/themes/") && ["DELETE", "PATCH", "POST"].includes(request.method || "")) {
      await handleWrite(request, response, store, pathname);
      return;
    }
    if (!["GET", "HEAD"].includes(request.method || "")) {
      response.writeHead(404).end();
      return;
    }

    if (pathname === "/api/timeline") {
      sendTimeline(request, response, store);
      return;
    }
    if (pathname.startsWith("/api/vault/")) {
      // 동기화한 노트가 참조하는 vault 파일만 제공한다(그 밖의 vault 파일은 404).
      let vaultPath;
      try {
        vaultPath = pathname.slice("/api/vault/".length).split("/").map(decodeURIComponent).join("/");
      } catch {
        response.writeHead(400).end();
        return;
      }
      const filePath = syncer.filePath(vaultPath);
      if (filePath) await sendFile(request, response, filePath, "no-cache", { download: !inlineVaultTypes.has(extname(filePath).toLowerCase()) });
      else response.writeHead(404).end();
      return;
    }
    if (pathname.startsWith("/api/")) {
      const name = pathname.slice("/api/media/".length);
      if (pathname.startsWith("/api/media/") && mediaNamePattern.test(name)) {
        await sendFile(request, response, join(store.mediaDir, name), "public, max-age=31536000, immutable");
      } else response.writeHead(404).end();
      return;
    }

    let filePath;
    try {
      // /settings는 화면 안의 경로라 index.html을 준다.
      filePath = safePath(distDir, pathname === "/settings" ? "index.html" : decodeURIComponent(pathname.slice(1)) || "index.html");
    } catch {
      response.writeHead(400).end();
      return;
    }
    if (!filePath) {
      response.writeHead(404).end();
      return;
    }
    await sendFile(request, response, filePath, pathname.startsWith("/assets/") ? "public, max-age=31536000, immutable" : "no-cache");
  });
  server.on("close", () => syncer.stop());
  return server;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const server = createApp();
  const port = Number(process.env.PORT || 3000);
  server.listen(port, "0.0.0.0", () => console.log(`Chrono listening on ${port}`));
  process.on("SIGTERM", () => server.close());
}
