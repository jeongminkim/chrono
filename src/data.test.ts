import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { findTimelineItem, mergeTimelineItems, parseTimelineData, youtubeId } from "./data.ts";

const fixture = (items: unknown[]) => JSON.stringify({ version: 1, themes: [{ id: "test-theme", name: "테스트", items }] });

describe("parseTimelineData", () => {
  it("검증한 항목을 날짜순으로 정렬하고 잘못된 데이터는 거부한다", () => {
    const valid = fixture([
      { id: "later", date: "2025-01-01", title: "나중", description: "두 번째", tags: ["검증"] },
      { id: "earlier", date: "2020-01-01", title: "먼저", description: "첫 번째" },
    ]);
    const data = parseTimelineData(valid);

    assert.deepEqual(mergeTimelineItems(data.themes).map(({ item }) => item.id), ["earlier", "later"]);
    assert.equal(findTimelineItem(data.themes, "검증")?.item.id, "later");
    assert.equal(findTimelineItem(data.themes, "없는 사건"), undefined);
    assert.throws(() => parseTimelineData('{"version":1,"themes":[]}'), /한 개 이상의 themes/);
    assert.deepEqual(parseTimelineData('{"version":1,"themes":[]}', { allowEmpty: true }).themes, []);
    assert.throws(() => parseTimelineData(valid.replace("2025-01-01", "2025-02-30")), /유효한 YYYY/);
  });

  it("이미지와 동영상 media를 검증한다", () => {
    const withMedia = (media: unknown) => parseTimelineData(fixture([{ id: "a", date: "2020", title: "t", description: "d", media }])).themes[0].items[0].media;

    assert.deepEqual(withMedia({ type: "image", src: "images/a.webp", alt: "설명" }), [{ type: "image", src: "images/a.webp", alt: "설명" }]);
    assert.equal(withMedia({ type: "image", src: "https://example.com/a.jpg", alt: "설명" })?.[0].src, "https://example.com/a.jpg");
    assert.deepEqual(withMedia({ type: "video", src: "https://youtu.be/FlpstXNjImY", caption: "c" }),
      [{ type: "video", src: "https://youtu.be/FlpstXNjImY", youtubeId: "FlpstXNjImY", caption: "c" }]);
    assert.equal(withMedia({ type: "video", src: "https://example.com/a.mp4", poster: "images/p.jpg" })?.[0].type, "video");

    assert.throws(() => withMedia({ type: "image", src: "../server.mjs", alt: "x" }), /상대 경로/);
    assert.throws(() => withMedia({ type: "image", src: "/etc/a.png", alt: "x" }), /상대 경로/);
    assert.throws(() => withMedia({ type: "image", src: "http://example.com/a.jpg", alt: "x" }), /https/);
    assert.throws(() => withMedia({ type: "image", src: "images/a.webp" }), /alt/);
    assert.throws(() => withMedia({ type: "video", src: "videos/a.mp4" }), /https URL이어야/);
    assert.throws(() => withMedia({ type: "video", src: "https://www.youtube.com/channel/abc" }), /YouTube 동영상 ID/);
    assert.throws(() => withMedia({ type: "audio", src: "a.mp3" }), /"image" 또는 "video"/);
  });

  it("media는 객체 하나 또는 최대 5개 배열이다", () => {
    const withMedia = (media: unknown) => parseTimelineData(fixture([{ id: "a", date: "2020", title: "t", description: "d", media }])).themes[0].items[0].media;
    const image = (n: number) => ({ type: "image", src: `images/${n}.jpg`, alt: `사진 ${n}` });

    assert.deepEqual(withMedia([image(1)]), withMedia(image(1)));
    assert.deepEqual(withMedia([1, 2, 3, 4, 5].map(image))?.map((m) => m.src), [1, 2, 3, 4, 5].map((n) => `images/${n}.jpg`));
    assert.equal(withMedia([]), undefined);
    assert.throws(() => withMedia([1, 2, 3, 4, 5, 6].map(image)), /최대 5개/);
    assert.throws(() => withMedia("images/1.jpg"), /최대 5개/);
    assert.throws(() => withMedia([image(1), image(1)]), /media\[1\]\.src가 같은 사건에서 중복/);
    assert.throws(() => withMedia([image(1), { type: "image", src: "images/2.jpg" }]), /media\[1\]\.alt/);
  });

  it("YYYY-MM 날짜와 Obsidian 필드(source, bodyFormat)를 받는다", () => {
    const parse = (item: object, theme: object = {}) => parseTimelineData(JSON.stringify({ version: 1, themes: [{ id: "t", name: "T", ...theme, items: [{ id: "a", date: "2020", title: "t", description: "d", ...item }] }] })).themes[0];
    assert.equal(parse({ date: "2024-05" }).items[0].date, "2024-05");
    assert.throws(() => parse({ date: "2024-13" }), /YYYY-MM/);
    assert.throws(() => parse({ date: "2024-5" }), /YYYY-MM/);
    assert.equal(parse({ bodyFormat: "markdown", body: "# x" }).items[0].bodyFormat, "markdown");
    assert.equal(parse({ bodyFormat: "html" }).items[0].bodyFormat, undefined);
    assert.equal(parse({}, { source: "obsidian" }).source, "obsidian");
    assert.equal(parse({}, { source: "other" }).source, undefined);
    assert.deepEqual(mergeTimelineItems([{ id: "t", name: "T", items: [
      { id: "b", date: "2024-05-01", title: "", description: "", tags: [] }, { id: "a", date: "2024-05", title: "", description: "", tags: [] },
    ] }]).map(({ item }) => item.id), ["a", "b"]);
  });

  it("YouTube URL에서 동영상 ID를 찾는다", () => {
    for (const url of [
      "https://www.youtube.com/watch?v=FlpstXNjImY&t=10",
      "https://m.youtube.com/watch?v=FlpstXNjImY",
      "https://youtu.be/FlpstXNjImY?si=x",
      "https://www.youtube.com/embed/FlpstXNjImY",
      "https://www.youtube.com/shorts/FlpstXNjImY",
    ]) assert.equal(youtubeId(url), "FlpstXNjImY", url);
    assert.equal(youtubeId("https://example.com/watch?v=FlpstXNjImY"), undefined);
  });
});
