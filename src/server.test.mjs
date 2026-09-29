import assert from "node:assert/strict";
import { once } from "node:events";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { createApp } from "../server.mjs";
import { importDir, openStore } from "../store.mjs";

test("앱 서버가 상태, 타임라인 API와 미디어를 제공한다", async () => {
  const store = openStore(mkdtempSync(join(tmpdir(), "chrono-store-")));
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
    const { media } = (await timeline.json()).themes[0].items[0];
    assert.equal((await fetch(`${base}/chrono/api/timeline`, { headers: { "if-none-match": etag } })).status, 304);

    const file = await fetch(new URL(media.src, `${base}/chrono/api/timeline`));
    assert.equal(file.status, 200);
    assert.match(file.headers.get("cache-control"), /immutable/);
    assert.match(file.headers.get("content-security-policy"), /sandbox/);

    assert.equal((await fetch(`${base}/chrono/api/media/..%2fchrono.db`)).status, 404);
    assert.equal((await fetch(`${base}/chrono/data/data.json`)).status, 404);
  } finally {
    server.close();
    await once(server, "close");
  }
});
