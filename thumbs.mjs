// 썸네일: 가로 500px을 넘는 이미지는 가로 500px WebP로 줄여 저장하고, 화면(카드·상세 패널)은 이것을 쓴다.
// 이미지 뷰어만 원본을 쓴다. 썸네일이 아직 없으면 서버는 원본을 대신 준다.
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, rmSync, statSync } from "node:fs";
import { rename } from "node:fs/promises";
import { extname, join } from "node:path";
import sharp from "sharp";

export const thumbWidth = 500;
// 애니메이션 GIF와 벡터 SVG는 줄이지 않는다.
const resizable = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);

// 미디어 저장소 파일은 이름이 내용 해시라 그대로 키로 쓴다. vault 파일은 경로·크기·수정 시각으로 키를 만든다.
export const mediaThumbKey = (name) => `m-${name.replace(/\.[^.]+$/, "")}`;
export function vaultThumbKey(vaultPath, realPath) {
  const { size, mtimeMs } = statSync(realPath);
  return `v-${createHash("sha1").update(`${vaultPath}\n${size}\n${Math.trunc(mtimeMs)}`).digest("hex")}`;
}

export function createThumbnailer(dir, { concurrency = 2 } = {}) {
  mkdirSync(dir, { recursive: true });
  const checked = new Set(); // 이미 확인한 키(작은 이미지 포함). 매 동기화마다 다시 읽지 않는다.
  const queue = [];
  const queued = new Set();
  let active = 0;
  let idle = [];

  const path = (key) => join(dir, `${key}.webp`);
  async function make(key, source) {
    const target = path(key);
    if (existsSync(target)) return;
    const image = sharp(source, { failOn: "none" });
    const { width } = await image.metadata();
    if (!width || width <= thumbWidth) return;
    const temp = `${target}.${process.pid}.tmp`;
    await image.rotate().resize({ width: thumbWidth }).webp({ quality: 80 }).toFile(temp);
    await rename(temp, target);
  }
  function pump() {
    while (active < concurrency && queue.length > 0) {
      const { key, source } = queue.shift();
      active++;
      make(key, source)
        .catch((error) => console.error(`썸네일을 만들지 못했습니다: ${source} (${error.message})`))
        .finally(() => {
          active--;
          queued.delete(key);
          checked.add(key);
          pump();
          if (active === 0 && queue.length === 0) idle.splice(0).forEach((resolve) => resolve());
        });
    }
  }

  return {
    // 썸네일이 있으면 그 경로, 없으면 null(원본을 쓴다)
    find(key) {
      const target = path(key);
      return existsSync(target) ? target : null;
    },
    // 줄일 필요가 있는지 백그라운드에서 확인하고 만든다. 이미 확인했거나 대기 중이면 건너뛴다.
    add(key, source) {
      if (!resizable.has(extname(source).toLowerCase()) || checked.has(key) || queued.has(key) || existsSync(path(key))) return;
      queued.add(key);
      queue.push({ key, source });
      pump();
    },
    pending: () => queue.length + active,
    // 대기 중인 작업이 모두 끝나면 풀린다(테스트·CLI용).
    idle: () => (active === 0 && queue.length === 0 ? Promise.resolve() : new Promise((resolve) => idle.push(resolve))),
    // keep(key)가 false인 썸네일을 지운다. prefix로 대상(m-/v-)을 고른다.
    prune(prefix, keep) {
      for (const file of readdirSync(dir)) {
        const key = file.replace(/\.webp$/, "");
        if (file.startsWith(prefix) && file.endsWith(".webp") && !keep(key)) {
          rmSync(join(dir, file), { force: true });
          checked.delete(key);
        }
      }
    },
  };
}
