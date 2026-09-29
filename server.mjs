import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { mediaNamePattern, openStore, readTimeline, revision } from "./store.mjs";

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
};

function safePath(root, relativePath) {
  const path = resolve(root, relativePath);
  return path === root || path.startsWith(`${root}${sep}`) ? path : null;
}

const securityHeaders = {
  "content-security-policy": "default-src 'self'; img-src 'self' https: data:; media-src 'self' https:; frame-src https://www.youtube-nocookie.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self'; connect-src 'self'; base-uri 'self'; frame-ancestors 'none'",
  "referrer-policy": "strict-origin-when-cross-origin",
  "x-content-type-options": "nosniff",
};

async function sendFile(request, response, filePath, cacheControl) {
  try {
    const fileStat = await stat(filePath);
    if (!fileStat.isFile()) throw new Error();
    const etag = `"${fileStat.size.toString(16)}-${Math.trunc(fileStat.mtimeMs).toString(16)}"`;
    const type = mimeTypes[extname(filePath).toLowerCase()] || "application/octet-stream";
    const headers = {
      ...securityHeaders,
      // 가져온 SVG 안의 스크립트가 실행되지 않도록 격리한다.
      ...(type === "image/svg+xml" && { "content-security-policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox" }),
      "cache-control": cacheControl,
      "content-length": fileStat.size,
      "content-type": type,
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

export function createApp({
  distDir = process.env.DIST_DIR || resolve(projectDir, "dist"),
  store = openStore(),
} = {}) {
  return createServer(async (request, response) => {
    const pathname = new URL(request.url || "/", "http://localhost").pathname;

    if (pathname === "/healthz") {
      response.writeHead(200, { "content-type": "text/plain; charset=utf-8" });
      response.end("ok");
      return;
    }
    if (pathname === "/chrono") {
      response.writeHead(308, { location: "/chrono/" });
      response.end();
      return;
    }
    if (!pathname.startsWith("/chrono/") || !["GET", "HEAD"].includes(request.method || "")) {
      response.writeHead(404).end();
      return;
    }

    if (pathname === "/chrono/api/timeline") {
      sendTimeline(request, response, store);
      return;
    }
    if (pathname.startsWith("/chrono/api/")) {
      const name = pathname.slice("/chrono/api/media/".length);
      if (pathname.startsWith("/chrono/api/media/") && mediaNamePattern.test(name)) {
        await sendFile(request, response, join(store.mediaDir, name), "public, max-age=31536000, immutable");
      } else response.writeHead(404).end();
      return;
    }

    let filePath;
    try {
      filePath = safePath(distDir, decodeURIComponent(pathname.slice("/chrono/".length)) || "index.html");
    } catch {
      response.writeHead(400).end();
      return;
    }
    if (!filePath) {
      response.writeHead(404).end();
      return;
    }
    await sendFile(request, response, filePath, pathname.startsWith("/chrono/assets/") ? "public, max-age=31536000, immutable" : "no-cache");
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const server = createApp();
  const port = Number(process.env.PORT || 3000);
  server.listen(port, "0.0.0.0", () => console.log(`Chrono listening on ${port}`));
  process.on("SIGTERM", () => server.close());
}
