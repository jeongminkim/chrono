import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { exportDir, importDir, openStore, readTimeline, revision } from "../store.mjs";

const item = (id, extra = {}) => ({ id, date: "2020-01-01", title: id, description: `${id} 설명`, tags: ["태그"], ...extra });
const image = (src) => ({ media: { type: "image", src, alt: "대체 텍스트" } });

function importFolder(themes, files = {}) {
  const dir = mkdtempSync(join(tmpdir(), "chrono-import-"));
  writeFileSync(join(dir, "HOWTO_MAKE_DATA.md"), "안내");
  writeFileSync(join(dir, "data.json"), JSON.stringify({ version: 1, themes }));
  for (const [path, body] of Object.entries(files)) {
    mkdirSync(join(dir, path, ".."), { recursive: true });
    writeFileSync(join(dir, path), body);
  }
  return dir;
}

test("import는 데이터와 이미지를 저장하고 원본을 삭제한다", async () => {
  const store = openStore(mkdtempSync(join(tmpdir(), "chrono-store-")));
  assert.deepEqual(readTimeline(store).themes, []);

  const dir = importFolder([{ id: "a", name: "A", items: [item("one", image("images/one.png")), item("two")] }],
    { "images/one.png": "png-1", "images/unused.png": "keep" });
  const dry = await importDir(store, dir, { dryRun: true });
  assert.deepEqual([dry.added, dry.images, revision(store)], [2, 1, 0]);
  assert.ok(existsSync(join(dir, "data.json")));

  const result = await importDir(store, dir);
  assert.deepEqual([result.added, result.updated, result.revision], [2, 0, 1]);
  const [one] = readTimeline(store).themes[0].items;
  assert.match(one.media.src, /^media\/[0-9a-f]{64}\.png$/);
  assert.equal(readFileSync(join(store.mediaDir, one.media.src.slice(6)), "utf8"), "png-1");
  // data.json과 import한 이미지만 지우고, 참조되지 않은 파일과 안내 문서는 남긴다.
  assert.deepEqual(readdirSync(dir).sort(), ["HOWTO_MAKE_DATA.md", "images"]);
  assert.deepEqual(readdirSync(join(dir, "images")), ["unused.png"]);
});

test("upsert와 replace, 사용하지 않는 미디어 정리", async () => {
  const store = openStore(mkdtempSync(join(tmpdir(), "chrono-store-")));
  await importDir(store, importFolder([{ id: "a", name: "A", items: [item("one", image("one.png")), item("two")] }], { "one.png": "old" }));
  await importDir(store, importFolder([{ id: "a", name: "A2", items: [item("three")] }, { id: "b", name: "B", items: [item("x")] }]));
  assert.deepEqual(readTimeline(store).themes.map((t) => [t.name, t.items.map((i) => i.id)]), [["A2", ["one", "three", "two"]], ["B", ["x"]]]);

  const replaced = await importDir(store, importFolder([{ id: "a", name: "A2", items: [item("two", { title: "수정" })] }]), { replace: true });
  assert.deepEqual([replaced.updated, replaced.removed], [1, 2]);
  assert.deepEqual(readTimeline(store).themes.map((t) => t.items.map((i) => i.title)), [["수정"], ["x"]]);
  assert.deepEqual(readdirSync(store.mediaDir), []);
});

test("잘못된 import는 DB와 원본을 바꾸지 않는다", async () => {
  const store = openStore(mkdtempSync(join(tmpdir(), "chrono-store-")));
  const cases = [
    [[{ id: "a", name: "A", items: [item("one", image("missing.png"))] }], {}, /찾을 수 없습니다/],
    [[{ id: "a", name: "A", items: [item("one", image("notes.txt"))] }], { "notes.txt": "x" }, /허용하지 않는 이미지 형식/],
    [[{ id: "a", name: "A", items: [item("one", image("../x.png"))] }], {}, /상대 경로/],
    [[{ id: "a", name: "A", items: [] }], {}, /items가 필요/],
  ];
  for (const [themes, files, error] of cases) {
    const dir = importFolder(themes, files);
    await assert.rejects(importDir(store, dir), error);
    assert.ok(existsSync(join(dir, "data.json")));
  }
  assert.equal(revision(store), 0);
});

test("export 결과를 다시 import하면 같은 데이터가 된다", async () => {
  const store = openStore(mkdtempSync(join(tmpdir(), "chrono-store-")));
  const video = { media: { type: "video", src: "https://youtu.be/FlpstXNjImY", poster: "p.webp", caption: "c" } };
  await importDir(store, importFolder([{ id: "a", name: "A", items: [item("one", image("one.png")), item("two", video)] }], { "one.png": "1", "p.webp": "2" }));

  const out = mkdtempSync(join(tmpdir(), "chrono-export-"));
  assert.deepEqual(await exportDir(store, out), { themes: 1, items: 2 });
  const copy = openStore(mkdtempSync(join(tmpdir(), "chrono-store-")));
  await importDir(copy, out);
  assert.deepEqual(readTimeline(copy), readTimeline(store));
});
