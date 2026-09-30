import assert from "node:assert/strict";
import { once } from "node:events";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { convertNote, createSyncer } from "../obsidian.mjs";
import { createApp } from "../server.mjs";
import { deleteItem, deleteTheme, exportDir, importDir, openStore, readTimeline, resetStore, revision, updateItem } from "../store.mjs";

// 예제 vault(여행·구매이력)와 같은 구조의 가짜 vault
function fakeVault() {
  const root = mkdtempSync(join(tmpdir(), "chrono-vault-"));
  const files = {
    "여행/2002/2002-02 일본 도쿄.md": `---\ntitle: "2002-02 일본 도쿄"\ncreated: 2021-03-22 23:04:15\n---\n\n#e775\n\n2002.02.09 - 2002.02.13\n\n아우세 친구와 다녀온 도쿄\n\n- 디즈니씨\n\n![사진.png](../../_attachments/image/tokyo.png)![DSC.JPG](../../_attachments/image/dsc.jpg)\n\n#일본 여행`,
    "여행/2024/2024-05 일본 오사카.md": `---\ntitle: "2024-05 일본 오사카"\n---\n\n# 2024-05 일본 오사카\n\n| 항목 | 내용 |\n| --- | --- |\n| 인원 | 3명 |\n\n## 개요\n\n가족 여행.\n\n![](../../_attachments/pdf/ticket.pdf)\n![밖](../../../outside.png)\n[[다른 노트|별칭]]`,
    "여행/기타.md": `---\ntitle: 기타\n---\n\n날짜 없는 노트`,
    "여행/.hidden.md": "---\ntitle: x\n---\n",
    "구매이력/2018/2018-06-05 Apple iPhone 8.md": `---\ntitle: "Apple iPhone 8"\ndate: 2018-06-05\nallDay: true\nprice: 900000\nurl: https://example.com/iphone\n---\n\n![iphone.jpg](https://example.com/iphone.jpg)\n\n실버 64GB #apple`,
    "구매이력/2013/2013-13 잘못된 달.md": "---\ntitle: x\n---\n본문",
    "기록/비밀.md": "---\ntitle: 비밀\n---\n동기화하지 않는 노트",
    "기록/a/b/c/깊은 노트.md": "---\ntitle: 깊음\n---\n4단계",
    "_attachments/image/tokyo.png": "png",
    "_attachments/image/dsc.jpg": "jpg",
    "_attachments/image/unused.png": "unused",
    "_attachments/pdf/ticket.pdf": "%PDF",
    "_attachments/etc/page.html": "<script>alert(1)</script>",
  };
  for (const [path, body] of Object.entries(files)) {
    mkdirSync(join(root, path, ".."), { recursive: true });
    writeFileSync(join(root, path), body);
  }
  return root;
}

test("노트 → 사건 변환 규칙", () => {
  const vault = fakeVault();
  const exists = (path) => path;
  const tokyo = convertNote(`---\ntitle: "2002-02 일본 도쿄"\n---\n\n#e775\n\n2002.02.09 - 2002.02.13\n\n아우세 친구와 다녀온 도쿄\n\n![사진.png](../../_attachments/image/tokyo.png)\n\n#일본`, "여행/2002/2002-02 일본 도쿄.md", { ignoreTags: ["e775"], resolveFile: exists });
  assert.equal(tokyo.item.date, "2002-02");
  assert.equal(tokyo.item.title, "일본 도쿄");
  assert.equal(tokyo.item.description, "2002.02.09 - 2002.02.13 · 아우세 친구와 다녀온 도쿄");
  assert.deepEqual(tokyo.item.tags, ["일본"]);
  assert.deepEqual(tokyo.rawTags, ["e775", "일본"]);
  assert.match(tokyo.item.id, /^obs-[0-9a-f]{12}$/);
  assert.deepEqual(tokyo.item.media, [{ type: "image", src: "vault/_attachments/image/tokyo.png", alt: "사진.png" }]);
  assert.equal(tokyo.item.bodyFormat, "markdown");
  assert.doesNotMatch(tokyo.item.body, /#e775/);
  assert.match(tokyo.item.body, /!\[사진\.png\]\(vault\/_attachments\/image\/tokyo\.png\)/);
  assert.deepEqual(tokyo.files, ["_attachments/image/tokyo.png"]);

  const osaka = convertNote(`---\ntitle: x\nprice: 1000\n---\n\n![](../../_attachments/pdf/ticket.pdf)\n![밖](../../../outside.png)\n[[노트|별칭]] [[노트2]]`, "여행/2024/2024-05 오사카.md", { resolveFile: exists });
  assert.match(osaka.item.body, /^\| 항목 \| 값 \|\n\| --- \| --- \|\n\| price \| 1000 \|/);
  assert.match(osaka.item.body, /\[📎 ticket\.pdf\]\(vault\/_attachments\/pdf\/ticket\.pdf\)/);
  assert.match(osaka.item.body, /\(밖\)/);
  assert.match(osaka.item.body, /별칭 노트2/);
  assert.equal(osaka.item.media, undefined);
  assert.deepEqual(osaka.files, ["_attachments/pdf/ticket.pdf"]);

  const phone = convertNote(`---\ntitle: "Apple iPhone 8"\ndate: 2018-06-05\nurl: https://example.com/p\n---\n\n![a](https://example.com/p.jpg)\n\n- 실버 64GB`, "구매이력/2018/x.md", { resolveFile: exists });
  assert.deepEqual([phone.item.date, phone.item.title, phone.item.description, phone.item.sourceUrl], ["2018-06-05", "Apple iPhone 8", "실버 64GB", "https://example.com/p"]);
  assert.equal(phone.item.media[0].src, "https://example.com/p.jpg");

  assert.match(convertNote("---\ntitle: 기타\n---\n본문", "여행/기타.md").error, /날짜 없음/);
  // macOS 파일 이름(NFD)도 제목·id는 NFC로 맞춘다.
  const nfd = convertNote("본문", "여행/2020-01 일본 도쿄.md".normalize("NFD"));
  const nfcNote = convertNote("본문", "여행/2020-01 일본 도쿄.md");
  assert.deepEqual([nfd.item.title, nfd.item.id], [nfcNote.item.title, nfcNote.item.id]);
  assert.equal(nfd.item.title, "일본 도쿄");
  rmSync(vault, { recursive: true });
});

test("동기화: 미러 반영, 읽기 전용, 내부 API 숨김, vault 파일 제공", async () => {
  const vault = fakeVault();
  const dist = mkdtempSync(join(tmpdir(), "chrono-dist-"));
  writeFileSync(join(dist, "index.html"), "<!doctype html>app");
  const store = openStore(mkdtempSync(join(tmpdir(), "chrono-store-")), { mediaGraceMs: 0 });
  const syncer = createSyncer(store, vault, { debounceMs: 50 });
  const server = createApp({ store, syncer, distDir: dist, importPath: mkdtempSync(join(tmpdir(), "chrono-import-")) });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const base = `http://127.0.0.1:${server.address().port}`;
  const write = (method, path, body) => fetch(`${base}${path}`, { method, headers: { "x-chrono-edit": "1", "content-type": "application/json" }, body: body && JSON.stringify(body) });

  try {
    // 폴더 트리: 3단계까지, 숨김 폴더와 _attachments는 보이지 않는다.
    assert.deepEqual((await (await fetch(`${base}/api/settings/vault`)).json()).dirs.map((d) => `${d.depth}:${d.path}`), [
      "1:구매이력", "2:구매이력/2013", "2:구매이력/2018", "1:기록", "2:기록/a", "3:기록/a/b", "1:여행", "2:여행/2002", "2:여행/2024",
    ]);
    assert.equal((await write("POST", "/api/settings/sources", { path: "기록/a/b/c" })).status, 400);
    assert.equal((await write("POST", "/api/settings/sources", { path: "../x" })).status, 400);
    assert.equal((await write("POST", "/api/settings/sources", { path: "" })).status, 400);
    assert.equal((await fetch(`${base}/api/settings/sources`, { method: "POST", body: "{}" })).status, 403);

    const added = await (await write("POST", "/api/settings/sources", { path: "여행", ignoreTags: ["e775"] })).json();
    assert.equal(added.name, "여행");
    assert.deepEqual([added.report.notes, added.report.synced, added.report.skipped.map((s) => s.path)], [2 + 1, 2, ["여행/기타.md"]]);
    assert.equal((await write("POST", "/api/settings/sources", { path: "여행" })).status, 409);
    // 이미 동기화 중인 디렉터리의 하위·상위 디렉터리는 겹쳐서 추가할 수 없다.
    const nested = await write("POST", "/api/settings/sources", { path: "여행/2002" });
    assert.deepEqual([nested.status, (await nested.json()).error], [409, '이미 동기화 중인 "여행"와 상위·하위 디렉터리 관계라 추가할 수 없습니다.']);
    const sub = await (await write("POST", "/api/settings/sources", { path: "기록/a" })).json();
    assert.equal((await write("POST", "/api/settings/sources", { path: "기록" })).status, 409);
    assert.equal((await write("POST", "/api/settings/sources", { path: "기록".normalize("NFD") + "/a" })).status, 409);
    assert.equal((await write("DELETE", `/api/settings/sources/${sub.themeId}`)).status, 200);
    const purchase = await (await write("POST", "/api/settings/sources", { path: "구매이력" })).json();
    assert.deepEqual(purchase.report.skipped.map((s) => s.path), ["구매이력/2013/2013-13 잘못된 달.md"]);

    const timeline = await (await fetch(`${base}/api/timeline`)).json();
    const travel = timeline.themes.find((t) => t.id === added.themeId);
    assert.equal(travel.source, "obsidian");
    assert.deepEqual(travel.items.map((i) => i.date), ["2002-02", "2024-05"]);
    assert.equal(travel.items[0].bodyFormat, "markdown");

    // 읽기 전용: 브라우저 편집 API와 저장소 함수 모두 거부
    const item = travel.items[0];
    assert.equal((await write("PATCH", `/api/themes/${added.themeId}/items/${item.id}`, { title: "x" })).status, 403);
    assert.equal((await write("DELETE", `/api/themes/${added.themeId}/items/${item.id}`)).status, 403);
    assert.equal((await write("DELETE", `/api/themes/${added.themeId}`)).status, 403);
    await assert.rejects(updateItem(store, added.themeId, item.id, { title: "x" }), (e) => e.code === "read_only");
    assert.throws(() => deleteItem(store, added.themeId, item.id), (e) => e.code === "read_only");
    assert.throws(() => deleteTheme(store, added.themeId), (e) => e.code === "read_only");

    // 내부 API: Obsidian 테마는 없는 것처럼 동작
    const internal = (method, path, body) => fetch(`${base}/internal/v1${path}`, { method, headers: { "content-type": "application/json" }, body: body && JSON.stringify(body) });
    assert.deepEqual((await (await internal("GET", "/themes")).json()).themes, []);
    for (const [method, path, body] of [
      ["GET", `/themes/${added.themeId}`], ["GET", `/themes/${added.themeId}/items`], ["GET", `/themes/${added.themeId}/items/${item.id}`],
      ["POST", `/themes/${added.themeId}/items`, { date: "2024", title: "x", description: "d" }], ["PATCH", `/themes/${added.themeId}/items/${item.id}`, { title: "x" }],
    ]) assert.equal((await internal(method, path, body)).status, 404, `${method} ${path}`);
    assert.equal((await internal("POST", "/themes", { id: added.themeId, name: "x" })).status, 409);

    // vault 파일: 동기화한 노트가 참조하는 파일만, html 등은 다운로드로
    assert.equal((await fetch(`${base}/api/${item.media[0].src}`)).status, 200);
    assert.equal((await fetch(`${base}/api/vault/_attachments/image/unused.png`)).status, 404);
    assert.equal((await fetch(`${base}/api/vault/%EA%B8%B0%EB%A1%9D/%EB%B9%84%EB%B0%80.md`)).status, 404);
    assert.equal((await fetch(`${base}/api/vault/..%2F..%2Fetc%2Fpasswd`)).status, 404);
    const pdf = await fetch(`${base}/api/vault/_attachments/pdf/ticket.pdf`);
    assert.deepEqual([pdf.status, pdf.headers.get("content-type")], [200, "application/pdf"]);

    // reset·export·import는 Obsidian 테마를 건드리지 않는다.
    resetStore(store);
    assert.equal(readTimeline(store).themes.length, 2);
    const out = mkdtempSync(join(tmpdir(), "chrono-export-"));
    await assert.rejects(exportDir(store, out), /내보낼 데이터가 없습니다/);
    const imp = mkdtempSync(join(tmpdir(), "chrono-imp-"));
    writeFileSync(join(imp, "data.json"), JSON.stringify({ version: 1, themes: [{ id: added.themeId, name: "x", items: [{ id: "a", date: "2020", title: "t", description: "d" }] }] }));
    await assert.rejects(importDir(store, imp), /Obsidian에서 동기화하는 테마와 id가 겹칩니다/);

    // 노트를 고치면 감시가 반영하고, 바뀐 게 없으면 revision이 그대로다.
    const before = revision(store);
    await syncer.sync(added.themeId);
    assert.equal(revision(store), before);
    writeFileSync(join(vault, "여행/2002/2002-02 일본 도쿄.md"), "---\ntitle: 2002-02 일본 도쿄 (수정)\n---\n\n고친 본문");
    for (let i = 0; i < 60 && readTimeline(store).themes[0].items[0].title !== "일본 도쿄 (수정)"; i++) await new Promise((r) => setTimeout(r, 50));
    assert.equal(readTimeline(store).themes[0].items[0].title, "일본 도쿄 (수정)");
    rmSync(join(vault, "여행/2024"), { recursive: true });
    await syncer.sync(added.themeId);
    assert.deepEqual(readTimeline(store).themes[0].items.map((i) => i.date), ["2002-02"]);
    // 첨부를 더 참조하지 않으면 제공도 멈춘다.
    assert.equal((await fetch(`${base}/api/vault/_attachments/pdf/ticket.pdf`)).status, 404);

    // 무시할 태그 변경 후 재동기화, 소스 해제
    const updated = await (await write("PATCH", `/api/settings/sources/${purchase.themeId}`, { ignoreTags: ["#apple"] })).json();
    assert.deepEqual(updated.ignoreTags, ["apple"]);
    assert.deepEqual(readTimeline(store).themes[1].items[0].tags, []);
    assert.equal((await write("DELETE", `/api/settings/sources/${purchase.themeId}`)).status, 200);
    assert.deepEqual((await (await fetch(`${base}/api/settings/sources`)).json()).sources.map((s) => s.path), ["여행"]);

    // /settings는 화면 경로라 index.html을 준다.
    assert.equal(await (await fetch(`${base}/settings`)).text(), "<!doctype html>app");
  } finally {
    server.close();
    await once(server, "close");
  }
});
