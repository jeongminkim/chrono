// 같은 서버의 다른 컨테이너용 REST API (/internal/v1). 규격: import/API_SPEC.md
// 인증은 없고, Nginx가 /internal/을 막는다. Nginx를 거친 요청(프록시 헤더가 붙은 요청)은 여기서도 한 번 더 거부한다.
import {
  addMedia, createItem, createTheme, getItem, getTheme, isSynced, listItems, listThemes, StoreError, updateItem,
} from "./store.mjs";

const maxJsonBytes = 256 * 1024;
const maxImageBytes = 10 * 1024 * 1024;
const route = /^\/internal\/v1\/themes(?:\/([^/]+)(?:\/items(?:\/([^/]+)(?:\/(media))?)?)?)?\/?$/;

// 로컬 미디어는 브라우저 API 경로로 바꿔 내보낸다. 호출하는 쪽은 http://chrono:3000 + src로 받는다.
const toApiPath = (src) => (src?.startsWith("media/") ? `/api/${src}` : src);
const publicItem = (item) => item.media
  ? { ...item, media: item.media.map((m) => ({ ...m, src: toApiPath(m.src), ...(m.poster && { poster: toApiPath(m.poster) }) })) }
  : item;

function send(response, status, value) {
  const body = value === undefined ? "" : JSON.stringify(value);
  response.writeHead(status, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "content-length": Buffer.byteLength(body) });
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

async function readJson(request) {
  if (!String(request.headers["content-type"] ?? "").startsWith("application/json")) {
    throw new StoreError(415, "Content-Type은 application/json이어야 합니다.");
  }
  try {
    return JSON.parse((await readBody(request, maxJsonBytes)).toString("utf8"));
  } catch (error) {
    if (error instanceof StoreError) throw error;
    throw new StoreError(400, "본문이 올바른 JSON이 아닙니다.", "invalid_json");
  }
}

function intParam(params, name, fallback, max) {
  const raw = params.get(name);
  if (raw === null) return fallback;
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 0 || (max !== undefined && (value < 1 || value > max))) {
    throw new StoreError(400, `${name}은(는) ${max ? `1~${max}` : "0 이상의"} 정수여야 합니다.`);
  }
  return value;
}

async function dispatch(request, store, url) {
  const match = route.exec(url.pathname);
  if (!match) throw new StoreError(404, "없는 경로입니다.");
  let themeId, itemId;
  try {
    [themeId, itemId] = match.slice(1, 3).map((part) => part && decodeURIComponent(part));
  } catch {
    throw new StoreError(400, "경로가 올바르지 않습니다.");
  }
  // vault에서 동기화한 테마는 이 API에 없는 것처럼 동작한다(조회·등록·수정 모두 404).
  if (themeId && isSynced(store, themeId)) throw new StoreError(404, "테마를 찾을 수 없습니다.");
  const isMedia = match[3] === "media";
  const isItems = url.pathname.includes("/items");
  const method = request.method;

  if (!themeId && method === "GET") return [200, { themes: listThemes(store) }];
  if (!themeId && method === "POST") return [201, await createTheme(store, await readJson(request))];
  if (themeId && !isItems && method === "GET") return [200, getTheme(store, themeId)];
  if (themeId && isItems && !itemId && method === "GET") {
    const p = url.searchParams;
    const result = listItems(store, themeId, {
      from: p.get("from") ?? undefined, to: p.get("to") ?? undefined, tag: p.get("tag") ?? undefined, q: p.get("q") ?? undefined,
      limit: intParam(p, "limit", 100, 500), offset: intParam(p, "offset", 0),
    });
    return [200, { ...result, items: result.items.map(publicItem) }];
  }
  if (themeId && isItems && !itemId && method === "POST") return [201, publicItem(await createItem(store, themeId, await readJson(request)))];
  if (itemId && !isMedia && method === "GET") return [200, publicItem(getItem(store, themeId, itemId))];
  if (itemId && !isMedia && method === "PATCH") {
    const patch = await readJson(request);
    if (typeof patch !== "object" || patch === null || Array.isArray(patch)) throw new StoreError(400, "본문은 객체여야 합니다.");
    const allowed = ["date", "title", "description", "body", "tags"];
    const unknown = Object.keys(patch).filter((key) => !allowed.includes(key));
    if (unknown.length > 0) throw new StoreError(400, `수정할 수 없는 필드입니다: ${unknown.join(", ")}`);
    return [200, publicItem(await updateItem(store, themeId, itemId, patch))];
  }
  if (isMedia && method === "POST") {
    getItem(store, themeId, itemId);
    const bytes = await readBody(request, maxImageBytes);
    return [201, publicItem(await addMedia(store, themeId, itemId, bytes, { contentType: request.headers["content-type"] ?? "", alt: url.searchParams.get("alt") ?? "" }))];
  }
  throw new StoreError(404, "없는 경로입니다.");
}

export async function handleInternal(request, response, store) {
  const url = new URL(request.url || "/", "http://localhost");
  // 프록시(Nginx)를 거친 요청은 외부에서 온 것으로 보고 경로가 없는 것처럼 응답한다.
  if (["x-forwarded-for", "x-real-ip", "forwarded"].some((name) => name in request.headers)) {
    send(response, 404, { error: { code: "not_found", message: "없는 경로입니다." } });
    return;
  }
  let status;
  try {
    const [code, value] = await dispatch(request, store, url);
    status = code;
    send(response, code, value);
  } catch (error) {
    if (!(error instanceof StoreError)) console.error(error);
    status = error instanceof StoreError ? error.status : 500;
    send(response, status, { error: { code: error instanceof StoreError ? error.code : "internal_error", message: error instanceof StoreError ? error.message : "서버 오류가 발생했습니다." } });
  } finally {
    // 인증이 없으므로 쓰기 요청은 누가 호출했는지 추적할 수 있게 남긴다.
    if (request.method !== "GET") {
      console.log(`${new Date().toISOString()} internal ${request.method} ${url.pathname} ${status} ${request.socket.remoteAddress ?? "-"} ${request.headers["user-agent"] ?? "-"}`);
    }
  }
}
