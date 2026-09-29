import assert from "node:assert/strict";
import { once } from "node:events";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { createApp } from "../server.mjs";
import { importDir, openStore } from "../store.mjs";

test("앱 서버가 상태, 타임라인 API와 미디어를 제공한다", async () => {
  const store = openStore(mkdtempSync(join(tmpdir(), "chrono-store-")), { mediaGraceMs: 0 });
  const server = createApp({ store });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const base = `http://127.0.0.1:${server.address().port}`;

  try {
    assert.equal((await fetch(`${base}/healthz`)).status, 200);
    const empty = await fetch(`${base}/chrono/api/timeline`);
    assert.equal(empty.headers.get("cache-control"), "no-cache");
    assert.deepEqual(await empty.json(), { version: 1, themes: [] });

    const dir = mkdtempSync(join(tmpdir(), "chrono-import-"));
    writeFileSync(join(dir, "a.svg"), "<svg xmlns='http://www.w3.org/2000/svg'/>");
    writeFileSync(join(dir, "data.json"), JSON.stringify({ version: 1, themes: [{ id: "t", name: "T", items: [
      { id: "one", date: "2020", title: "하나", description: "d", media: { type: "image", src: "a.svg", alt: "a" } },
    ] }] }));
    await importDir(store, dir);

    const timeline = await fetch(`${base}/chrono/api/timeline`);
    const etag = timeline.headers.get("etag");
    const [media] = (await timeline.json()).themes[0].items[0].media;
    assert.equal((await fetch(`${base}/chrono/api/timeline`, { headers: { "if-none-match": etag } })).status, 304);

    const file = await fetch(new URL(media.src, `${base}/chrono/api/timeline`));
    assert.equal(file.status, 200);
    assert.match(file.headers.get("cache-control"), /immutable/);
    assert.match(file.headers.get("content-security-policy"), /sandbox/);

    assert.equal((await fetch(`${base}/chrono/api/media/..%2fchrono.db`)).status, 404);
    assert.equal((await fetch(`${base}/chrono/data/data.json`)).status, 404);

    // 쓰기 API: X-Chrono-Edit 헤더가 없거나 다른 출처에서 온 요청은 거부한다.
    const write = (method, path, body, headers = {}) => fetch(`${base}/chrono/api/themes/${path}`, {
      method, body, headers: { "x-chrono-edit": "1", "content-type": "application/json", ...headers },
    });
    assert.equal((await fetch(`${base}/chrono/api/themes/t`, { method: "DELETE" })).status, 403);
    assert.equal((await write("DELETE", "t", undefined, { "sec-fetch-site": "cross-site" })).status, 403);
    assert.equal((await write("PATCH", "t/items/one", "{bad")).status, 400);
    assert.equal((await write("PATCH", "t/items/one", JSON.stringify({ date: "2020-13-01" }))).status, 400);
    assert.equal((await write("PATCH", "t/items/%E0%A4", JSON.stringify({}))).status, 400);
    assert.equal((await write("PATCH", "t/items/nope", JSON.stringify({ title: "x" }))).status, 404);
    assert.equal((await write("PUT", "t", undefined)).status, 404);

    const patched = await write("PATCH", "t/items/one", JSON.stringify({ title: "둘", tags: ["a, b"] }), { "sec-fetch-site": "same-origin" });
    assert.equal(patched.status, 200);
    assert.deepEqual((await patched.json()).item.title, "둘");
    assert.notEqual((await fetch(`${base}/chrono/api/timeline`)).headers.get("etag"), etag);

    const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0]);
    const uploaded = await write("POST", "t/items/one/media?alt=%EC%82%AC%EC%A7%84", png, { "content-type": "image/png" });
    assert.deepEqual((await uploaded.json()).item.media.map((m) => m.alt), ["a", "사진"]);
    assert.equal((await write("POST", "t/items/one/media", Buffer.from("x"), { "content-type": "image/png" })).status, 415);
    assert.equal((await write("POST", "t/items/one/media", Buffer.alloc(10 * 1024 * 1024 + 1), { "content-type": "image/png" })).status, 413);
    assert.equal((await write("DELETE", "t/items/one/media/0")).status, 200);
    assert.equal((await write("DELETE", "t/items/one")).status, 200);
    assert.deepEqual((await (await fetch(`${base}/chrono/api/timeline`)).json()).themes, []);
  } finally {
    server.close();
    await once(server, "close");
  }
});
