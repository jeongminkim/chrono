import assert from "node:assert/strict";
import { once } from "node:events";
import { mkdirSync, mkdtempSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import sharp from "sharp";
import { createSyncer } from "../obsidian.mjs";
import { createApp } from "../server.mjs";
import { deleteItem, importDir, openStore, readTimeline } from "../store.mjs";

const image = (width, height, format = "png") => sharp({ create: { width, height, channels: 3, background: "#c87" } })[format]().toBuffer();
const widthOf = async (response) => (await sharp(Buffer.from(await response.arrayBuffer())).metadata()).width;

test("가로 500px을 넘는 이미지는 썸네일을 만들고 ?thumb=1로 제공한다", async () => {
  const store = openStore(mkdtempSync(join(tmpdir(), "chrono-store-")), { mediaGraceMs: 0 });
  const vault = mkdtempSync(join(tmpdir(), "chrono-vault-"));
  mkdirSync(join(vault, "여행"), { recursive: true });
  mkdirSync(join(vault, "_attachments"), { recursive: true });
  writeFileSync(join(vault, "_attachments/big.jpg"), await image(1600, 900, "jpeg"));
  writeFileSync(join(vault, "여행/2024-05 오사카.md"), "---\ntitle: 오사카\n---\n\n본문\n\n![큰](../_attachments/big.jpg)");
  const syncer = createSyncer(store, vault);
  const server = createApp({ store, syncer, importPath: mkdtempSync(join(tmpdir(), "chrono-import-")) });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const base = `http://127.0.0.1:${server.address().port}`;

  try {
    // import: 큰 이미지만 썸네일을 만든다.
    const dir = mkdtempSync(join(tmpdir(), "chrono-import-"));
    writeFileSync(join(dir, "big.png"), await image(1200, 800));
    writeFileSync(join(dir, "small.png"), await image(300, 200));
    // WebP 한계(16383px)를 넘는 세로로 아주 긴 이미지도 비율을 지킨 썸네일을 만든다.
    writeFileSync(join(dir, "tall.png"), await image(600, 40000));
    writeFileSync(join(dir, "data.json"), JSON.stringify({ version: 1, themes: [{ id: "t", name: "T", items: [
      { id: "a", date: "2020", title: "a", description: "d", media: [{ type: "image", src: "big.png", alt: "큰" }, { type: "image", src: "small.png", alt: "작은" }, { type: "image", src: "tall.png", alt: "긴" }] },
    ] }] }));
    await importDir(store, dir);
    await store.thumbs.idle();
    const [big, small, tall] = readTimeline(store).themes[0].items[0].media;
    const tallThumb = await sharp(Buffer.from(await (await fetch(`${base}/api/${tall.src}?thumb=1`)).arrayBuffer())).metadata();
    assert.deepEqual([tallThumb.format, tallThumb.height <= 16383, tallThumb.width < 500], ["webp", true, true]);

    const thumb = await fetch(`${base}/api/${big.src}?thumb=1`);
    assert.equal(thumb.headers.get("content-type"), "image/webp");
    assert.equal(await widthOf(thumb), 500);
    assert.equal(await widthOf(await fetch(`${base}/api/${big.src}`)), 1200);
    const smallThumb = await fetch(`${base}/api/${small.src}?thumb=1`);
    assert.deepEqual([smallThumb.headers.get("content-type"), await widthOf(smallThumb)], ["image/png", 300]);
    assert.equal(readdirSync(join(store.dir, "thumbs")).length, 2);

    // 원본이 지워지면 썸네일도 지운다.
    deleteItem(store, "t", "a");
    assert.deepEqual(readdirSync(join(store.dir, "thumbs")), []);

    // Obsidian: 동기화할 때 첨부 이미지 썸네일을 만든다(설정의 "지금 동기화"도 같은 경로).
    const source = await syncer.add({ path: "여행" });
    await store.thumbs.idle();
    const note = readTimeline(store).themes.find((t) => t.id === source.themeId).items[0];
    const vaultThumb = await fetch(`${base}/api/${note.media[0].src}?thumb=1`);
    assert.deepEqual([vaultThumb.headers.get("content-type"), vaultThumb.headers.get("cache-control"), await widthOf(vaultThumb)], ["image/webp", "no-cache", 500]);
    assert.equal(await widthOf(await fetch(`${base}/api/${note.media[0].src}`)), 1600);
    assert.equal((await (await fetch(`${base}/api/settings/sources`)).json()).thumbsPending, 0);

    // 동기화를 해제하면 vault 썸네일도 지운다.
    syncer.remove(source.themeId);
    assert.deepEqual(readdirSync(join(store.dir, "thumbs")), []);
  } finally {
    server.close();
    await once(server, "close");
  }
});
