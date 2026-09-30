import assert from "node:assert/strict";
import { once } from "node:events";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { createApp } from "../server.mjs";
import { openStore } from "../store.mjs";

const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 7]);

test("내부 API: 조회·등록·수정·업로드와 외부 차단", async () => {
  const store = openStore(mkdtempSync(join(tmpdir(), "chrono-store-")), { mediaGraceMs: 0 });
  const server = createApp({ store, importPath: mkdtempSync(join(tmpdir(), "chrono-import-")) });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const base = `http://127.0.0.1:${server.address().port}/internal/v1`;
  const call = async (method, path, body, headers = {}) => {
    const response = await fetch(`${base}${path}`, {
      method,
      headers: { ...(body !== undefined && !Buffer.isBuffer(body) && { "content-type": "application/json" }), ...headers },
      body: body === undefined || Buffer.isBuffer(body) ? body : JSON.stringify(body),
    });
    return { status: response.status, body: await response.json() };
  };

  try {
    // Nginx를 거친 요청(프록시 헤더)은 거부한다.
    assert.equal((await call("GET", "/themes", undefined, { "x-forwarded-for": "1.2.3.4" })).status, 404);
    assert.equal((await call("GET", "/themes", undefined, { "x-real-ip": "1.2.3.4" })).status, 404);

    assert.deepEqual((await call("GET", "/themes")).body, { themes: [] });
    assert.deepEqual(await call("POST", "/themes", { id: "books", name: " 읽은 책 " }), { status: 201, body: { id: "books", name: "읽은 책", itemCount: 0 } });
    assert.equal((await call("POST", "/themes", { id: "books", name: "중복" })).body.error.code, "already_exists");
    assert.equal((await call("POST", "/themes", { id: "Bad Id", name: "x" })).body.error.code, "validation_failed");
    assert.equal((await call("POST", "/themes", null)).status, 400);
    assert.equal((await call("GET", "/themes/nope")).body.error.code, "not_found");

    // 사건 등록
    const created = await call("POST", "/themes/books/items", { id: "b1", date: "2024-05-01", title: "책 1", description: "요약", tags: [" 소설 ", "소설", ""] });
    assert.equal(created.status, 201);
    assert.deepEqual(created.body.tags, ["소설"]);
    assert.equal((await call("POST", "/themes/books/items", { id: "b1", date: "2024", title: "x", description: "d" })).body.error.code, "already_exists");
    const generated = await call("POST", "/themes/books/items", { date: "2023-01-02", title: "책 0", description: "요약", media: [{ type: "video", src: "https://youtu.be/FlpstXNjImY" }] });
    assert.match(generated.body.id, /^20230102-[a-z0-9]{6}$/);
    assert.equal(generated.body.media[0].youtubeId, "FlpstXNjImY");
    assert.equal((await call("POST", "/themes/nope/items", { date: "2024", title: "x", description: "d" })).status, 404);
    assert.match((await call("POST", "/themes/books/items", { date: "2024-02-30", title: "x", description: "d" })).body.error.message, /유효한 YYYY/);
    assert.match((await call("POST", "/themes/books/items", { date: "2024", title: "x", description: "d", media: [{ type: "image", src: "images/a.png", alt: "a" }] })).body.error.message, /https URL만/);

    // 형식 오류
    const raw = await fetch(`${base}/themes/books/items`, { method: "POST", headers: { "content-type": "application/json" }, body: "{bad" });
    assert.equal((await raw.json()).error.code, "invalid_json");
    const noType = await fetch(`${base}/themes/books/items`, { method: "POST", body: "{}" });
    assert.equal(noType.status, 415);

    // 목록·필터·페이지
    await call("POST", "/themes/books/items", { id: "b2", date: "2025", title: "책 2", description: "요약", tags: ["에세이"] });
    const list = (query) => call("GET", `/themes/books/items${query}`).then((r) => r.body);
    assert.deepEqual((await list("")).items.map((i) => i.id), [generated.body.id, "b1", "b2"]);
    assert.deepEqual((await list("?from=2024&to=2024")).items.map((i) => i.id), ["b1"]);
    assert.deepEqual((await list("?tag=%EC%97%90%EC%84%B8%EC%9D%B4")).items.map((i) => i.id), ["b2"]);
    assert.deepEqual((await list("?q=%EC%B1%85%201")).items.map((i) => i.id), ["b1"]);
    const page = await list("?limit=1&offset=1");
    assert.deepEqual([page.total, page.limit, page.offset, page.items.map((i) => i.id)], [3, 1, 1, ["b1"]]);
    assert.equal((await call("GET", "/themes/books/items?limit=0")).status, 400);
    assert.equal((await call("GET", "/themes/books")).body.itemCount, 3);

    // 수정
    const patched = await call("PATCH", "/themes/books/items/b1", { title: "책 1 (개정)", body: "상세" });
    assert.deepEqual([patched.status, patched.body.title, patched.body.body], [200, "책 1 (개정)", "상세"]);
    assert.equal((await call("PATCH", "/themes/books/items/b1", { media: [] })).status, 400);
    assert.equal((await call("PATCH", "/themes/books/items/none", { title: "x" })).status, 404);

    // 이미지 업로드: 로컬 이미지 src는 /api/media 경로로 내보낸다.
    const uploaded = await call("POST", "/themes/books/items/b1/media?alt=%ED%91%9C%EC%A7%80", png, { "content-type": "image/png" });
    assert.equal(uploaded.status, 201);
    assert.match(uploaded.body.media[0].src, /^\/api\/media\/[0-9a-f]{64}\.png$/);
    assert.equal(uploaded.body.media[0].alt, "표지");
    const file = await fetch(`http://127.0.0.1:${server.address().port}${uploaded.body.media[0].src}`);
    assert.equal(file.status, 200);
    assert.equal((await call("POST", "/themes/books/items/b1/media", png, { "content-type": "image/png" })).body.error.code, "validation_failed");
    assert.equal((await call("POST", "/themes/books/items/b1/media", Buffer.from("x"), { "content-type": "image/png" })).body.error.code, "unsupported_media_type");
    assert.equal((await call("GET", "/themes/books/items/b1")).body.media[0].src, uploaded.body.media[0].src);

    // 브라우저 화면 API에도 반영된다.
    const timeline = await (await fetch(`http://127.0.0.1:${server.address().port}/api/timeline`)).json();
    assert.equal(timeline.themes[0].items.length, 3);

    // 제공하지 않는 메서드
    assert.equal((await call("DELETE", "/themes/books/items/b1")).status, 404);
  } finally {
    server.close();
    await once(server, "close");
  }
});
