import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { addMedia, deleteItem, deleteTheme, exportDir, importDir, openStore, readTimeline, removeMedia, revision, updateItem } from "../store.mjs";

const item = (id, extra = {}) => ({ id, date: "2020-01-01", title: id, description: `${id} 설명`, tags: ["태그"], ...extra });
const image = (...srcs) => ({ media: srcs.map((src) => ({ type: "image", src, alt: "대체 텍스트" })) });
const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1, 2, 3]);
const newStore = () => openStore(mkdtempSync(join(tmpdir(), "chrono-store-")), { mediaGraceMs: 0 });
const items = (store) => readTimeline(store).themes.map((t) => [t.name, t.items.map((i) => i.id)]);

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
  const store = newStore();
  assert.deepEqual(readTimeline(store).themes, []);

  const dir = importFolder([{ id: "a", name: "A", items: [item("one", image("images/one.png", "images/two.png")), item("two")] }],
    { "images/one.png": "png-1", "images/two.png": "png-2", "images/unused.png": "keep" });
  const dry = await importDir(store, dir, { dryRun: true });
  assert.deepEqual([dry.added, dry.images, revision(store)], [2, 2, 0]);
  assert.ok(existsSync(join(dir, "data.json")));

  const result = await importDir(store, dir);
  assert.deepEqual([result.added, result.skipped, result.revision], [2, 0, 1]);
  const [one] = readTimeline(store).themes[0].items;
  assert.equal(one.media.length, 2);
  assert.match(one.media[0].src, /^media\/[0-9a-f]{64}\.png$/);
  assert.equal(readFileSync(join(store.mediaDir, one.media[1].src.slice(6)), "utf8"), "png-2");
  // data.json과 import한 이미지만 지우고, 참조되지 않은 파일과 안내 문서는 남긴다.
  assert.deepEqual(readdirSync(dir).sort(), ["HOWTO_MAKE_DATA.md", "images"]);
  assert.deepEqual(readdirSync(join(dir, "images")), ["unused.png"]);
});

test("기본 import는 추가 전용이고, overwrite·replace로 덮어쓴다", async () => {
  const store = newStore();
  await importDir(store, importFolder([{ id: "a", name: "A", items: [item("one", image("one.png")), item("two")] }], { "one.png": "old" }));

  // 같은 테마에 새 항목은 추가하고, 이미 있는 항목과 테마 이름은 그대로 둔다.
  const appended = await importDir(store, importFolder([{ id: "a", name: "A2", items: [item("one", { title: "덮어쓰기 안 됨" }), item("three")] }, { id: "b", name: "B", items: [item("x")] }]));
  assert.deepEqual([appended.added, appended.updated, appended.skipped, appended.skippedIds], [2, 0, 1, ["a/one"]]);
  assert.deepEqual(items(store), [["A", ["one", "three", "two"]], ["B", ["x"]]]);
  assert.equal(readTimeline(store).themes[0].items[0].title, "one");

  const overwritten = await importDir(store, importFolder([{ id: "a", name: "A2", items: [item("one", { title: "덮어씀" })] }]), { overwrite: true });
  assert.deepEqual([overwritten.updated, overwritten.removed], [1, 0]);
  assert.deepEqual(readTimeline(store).themes.map((t) => [t.name, t.items[0].title]), [["A2", "덮어씀"], ["B", "x"]]);

  const replaced = await importDir(store, importFolder([{ id: "a", name: "A3", items: [item("two", { title: "수정" })] }]), { replace: true });
  assert.deepEqual([replaced.updated, replaced.removed], [1, 2]);
  assert.deepEqual(readTimeline(store).themes.map((t) => [t.name, t.items.map((i) => i.title)]), [["A3", ["수정"]], ["B", ["x"]]]);
  assert.deepEqual(readdirSync(store.mediaDir), []);
});

test("잘못된 import는 DB와 원본을 바꾸지 않는다", async () => {
  const store = newStore();
  const cases = [
    [[{ id: "a", name: "A", items: [item("one", image("missing.png"))] }], {}, /찾을 수 없습니다/],
    [[{ id: "a", name: "A", items: [item("one", image("notes.txt"))] }], { "notes.txt": "x" }, /허용하지 않는 이미지 형식/],
    [[{ id: "a", name: "A", items: [item("one", image("../x.png"))] }], {}, /상대 경로/],
    [[{ id: "a", name: "A", items: [item("one", image("1.png", "2.png", "3.png", "4.png", "5.png", "6.png"))] }], {}, /최대 5개/],
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
  const store = newStore();
  const video = { type: "video", src: "https://youtu.be/FlpstXNjImY", poster: "p.webp", caption: "c" };
  await importDir(store, importFolder([{ id: "a", name: "A", items: [
    item("one", image("one.png", "two.png")),
    item("two", { media: video }),
  ] }], { "one.png": "1", "two.png": "2", "p.webp": "3" }));

  const out = mkdtempSync(join(tmpdir(), "chrono-export-"));
  assert.deepEqual(await exportDir(store, out), { themes: 1, items: 2 });
  assert.ok(Array.isArray(JSON.parse(readFileSync(join(out, "data.json"), "utf8")).themes[0].items[1].media));
  const copy = newStore();
  await importDir(copy, out);
  assert.deepEqual(readTimeline(copy), readTimeline(store));
});

test("v1 DB의 media 객체를 배열로 옮긴다", () => {
  const dir = mkdtempSync(join(tmpdir(), "chrono-store-"));
  const v1 = openStore(dir);
  v1.db.exec(`INSERT INTO themes VALUES ('a', 'A', 0);
    INSERT INTO items (theme_id, id, date, title, description, media, updated_at)
      VALUES ('a', 'one', '2020', 't', 'd', '{"type":"image","src":"media/x.png","alt":"a"}', 'now');
    UPDATE meta SET value = '1' WHERE key = 'schema_version';`);
  v1.db.close();
  const v2 = openStore(dir);
  assert.deepEqual(readTimeline(v2).themes[0].items[0].media, [{ type: "image", src: "media/x.png", alt: "a" }]);
});

test("화면 편집: 수정, 이미지 추가·삭제, 사건·테마 삭제", async () => {
  const store = newStore();
  await importDir(store, importFolder([
    { id: "a", name: "A", items: [item("one", image("shared.png")), item("two", image("shared.png"))] },
    { id: "b", name: "B", items: [item("x")] },
  ], { "shared.png": "same" }));

  const edited = await updateItem(store, "a", "one", { title: "  새 제목 ", date: "1999", body: "본문", tags: [" 가 ", "나", "가", ""] });
  assert.deepEqual([edited.title, edited.date, edited.body, edited.tags], ["새 제목", "1999", "본문", ["가", "나"]]);
  assert.equal((await updateItem(store, "a", "one", { body: "" })).body, undefined);
  assert.equal((await updateItem(store, "a", "one", { description: " 새 요약 " })).description, "새 요약");
  await assert.rejects(updateItem(store, "a", "one", { description: "" }), (e) => e.status === 400);
  await assert.rejects(updateItem(store, "a", "one", { date: "2023-02-30" }), (e) => e.status === 400 && /유효한 YYYY/.test(e.message));
  await assert.rejects(updateItem(store, "a", "one", { title: " " }), (e) => e.status === 400);
  await assert.rejects(updateItem(store, "a", "nope", { title: "x" }), (e) => e.status === 404);

  const withImage = await addMedia(store, "a", "one", png, { contentType: "image/png" });
  assert.deepEqual(withImage.media.map((m) => m.alt), ["대체 텍스트", "새 제목 사진 2"]);
  await assert.rejects(addMedia(store, "a", "one", Buffer.from("not an image"), { contentType: "image/png" }), (e) => e.status === 415);
  await assert.rejects(addMedia(store, "a", "one", png, { contentType: "text/plain" }), (e) => e.status === 415);
  for (let n = 3; n <= 5; n++) await addMedia(store, "a", "one", Buffer.concat([png, Buffer.from([n])]), { contentType: "image/png", alt: `사진${n}` });
  await assert.rejects(addMedia(store, "a", "one", png, { contentType: "image/png" }), (e) => e.status === 409);
  assert.equal((await removeMedia(store, "a", "one", 4)).media.length, 4);
  await assert.rejects(removeMedia(store, "a", "one", 9), (e) => e.status === 404);

  // 같은 이미지를 쓰는 사건이 남아 있으면 파일을 지우지 않는다.
  const shared = readTimeline(store).themes[0].items.find((i) => i.id === "two").media[0].src.slice(6);
  deleteItem(store, "a", "one");
  assert.ok(existsSync(join(store.mediaDir, shared)));
  deleteItem(store, "a", "two");
  assert.ok(!existsSync(join(store.mediaDir, shared)));
  // 마지막 사건을 지우면 빈 테마도 사라진다.
  assert.deepEqual(items(store), [["B", ["x"]]]);

  const before = revision(store);
  deleteTheme(store, "b");
  assert.deepEqual([readTimeline(store).themes, revision(store)], [[], before + 1]);
  assert.throws(() => deleteTheme(store, "b"), (e) => e.status === 404);
  assert.deepEqual(readdirSync(store.mediaDir), []);
});
