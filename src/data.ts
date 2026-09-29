export type TimelineMedia =
  | { type: "image"; src: string; alt: string; caption?: string }
  | { type: "video"; src: string; youtubeId?: string; poster?: string; caption?: string };

export interface TimelineItem {
  id: string;
  date: string;
  title: string;
  description: string;
  body?: string;
  tags: string[];
  media?: TimelineMedia;
  sourceUrl?: string;
}

export interface TimelineTheme {
  id: string;
  name: string;
  items: TimelineItem[];
}

export interface TimelineData {
  version: 1;
  themes: TimelineTheme[];
}

export function mergeTimelineItems(themes: TimelineTheme[]) {
  return themes
    .flatMap((theme) => theme.items.map((item) => ({ theme, item })))
    .sort((a, b) => a.item.date.localeCompare(b.item.date));
}

export function findTimelineItem(themes: TimelineTheme[], query: string) {
  const needle = query.trim().toLocaleLowerCase("ko-KR");
  if (!needle) return;

  for (const theme of themes) {
    const item = theme.items.find(({ date, title, description, body, tags }) =>
      `${date} ${title} ${description} ${body ?? ""} ${tags.join(" ")}`.toLocaleLowerCase("ko-KR").includes(needle));
    if (item) return { theme, item };
  }
}

const idPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function isValidDate(value: string): boolean {
  if (/^\d{4}$/.test(value)) return true;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().startsWith(value);
}

// 상대 경로는 data.json이 있는 디렉터리 기준이며 그 밖으로 나갈 수 없다. 절대 URL은 https만 허용한다.
function mediaSource(value: unknown, field: string, allowLocal: boolean): string {
  const src = requiredString(value, field).trim();
  if (/^[a-z][a-z0-9+.-]*:/i.test(src) || src.startsWith("//")) {
    try {
      if (new URL(src).protocol === "https:") return src;
    } catch {}
    throw new Error(`${field}은(는) https URL${allowLocal ? " 또는 data.json 기준 상대 경로" : ""}여야 합니다.`);
  }
  if (!allowLocal) throw new Error(`${field}은(는) https URL이어야 합니다.`);
  if (src.startsWith("/") || src.includes("\\") || src.split("/").includes("..")) {
    throw new Error(`${field}은(는) data.json이 있는 디렉터리 안의 상대 경로여야 합니다.`);
  }
  return src;
}

export function youtubeId(url: string): string | undefined {
  const { hostname, pathname, searchParams } = new URL(url);
  const host = hostname.replace(/^(www|m)\./, "");
  const id = host === "youtu.be" ? pathname.slice(1)
    : ["youtube.com", "youtube-nocookie.com"].includes(host)
      ? searchParams.get("v") ?? pathname.match(/^\/(?:embed|shorts|live)\/([^/]+)/)?.[1]
      : undefined;
  return id && /^[\w-]{11}$/.test(id) ? id : undefined;
}

function parseMedia(raw: unknown, path: string): TimelineMedia {
  if (!isRecord(raw)) throw new Error(`${path}는 객체여야 합니다.`);
  const caption = raw.caption === undefined ? undefined : requiredString(raw.caption, `${path}.caption`);
  if (raw.type === "image") {
    return {
      type: "image",
      src: mediaSource(raw.src, `${path}.src`, true),
      alt: requiredString(raw.alt, `${path}.alt`),
      ...(caption && { caption }),
    };
  }
  if (raw.type === "video") {
    const src = mediaSource(raw.src, `${path}.src`, false);
    const id = youtubeId(src);
    if (!id && /(^|\.)(youtube\.com|youtu\.be|youtube-nocookie\.com)$/.test(new URL(src).hostname)) {
      throw new Error(`${path}.src에서 YouTube 동영상 ID를 찾을 수 없습니다.`);
    }
    return {
      type: "video",
      src,
      ...(id && { youtubeId: id }),
      ...(raw.poster !== undefined && { poster: mediaSource(raw.poster, `${path}.poster`, true) }),
      ...(caption && { caption }),
    };
  }
  throw new Error(`${path}.type은 "image" 또는 "video"여야 합니다.`);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requiredString(value: unknown, field: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${field}은(는) 비어 있지 않은 문자열이어야 합니다.`);
  }
  return value;
}

// allowEmpty: 아직 import하지 않은 빈 저장소의 API 응답(themes: [])을 허용한다.
export function parseTimelineData(text: string, { allowEmpty = false } = {}): TimelineData {
  let input: unknown;
  try {
    input = JSON.parse(text);
  } catch {
    throw new Error("data.json의 JSON 문법이 올바르지 않습니다.");
  }

  if (!isRecord(input) || input.version !== 1 || !Array.isArray(input.themes) || (input.themes.length === 0 && !allowEmpty)) {
    throw new Error("data.json은 version 1과 한 개 이상의 themes를 포함해야 합니다.");
  }

  const themeIds = new Set<string>();
  const themes = input.themes.map((rawTheme, themeIndex): TimelineTheme => {
    if (!isRecord(rawTheme) || !Array.isArray(rawTheme.items) || rawTheme.items.length === 0) {
      throw new Error(`themes[${themeIndex}]에는 한 개 이상의 items가 필요합니다.`);
    }

    const id = requiredString(rawTheme.id, `themes[${themeIndex}].id`);
    if (!idPattern.test(id) || themeIds.has(id)) {
      throw new Error(`테마 id "${id}"이(가) 잘못됐거나 중복됐습니다.`);
    }
    themeIds.add(id);

    const itemIds = new Set<string>();
    const items = rawTheme.items.map((rawItem, itemIndex): TimelineItem => {
      const path = `themes[${themeIndex}].items[${itemIndex}]`;
      if (!isRecord(rawItem)) throw new Error(`${path}은(는) 객체여야 합니다.`);

      const itemId = requiredString(rawItem.id, `${path}.id`);
      const date = requiredString(rawItem.date, `${path}.date`);
      if (!idPattern.test(itemId) || itemIds.has(itemId)) {
        throw new Error(`항목 id "${itemId}"이(가) 잘못됐거나 중복됐습니다.`);
      }
      if (!isValidDate(date)) throw new Error(`${path}.date는 유효한 YYYY 또는 YYYY-MM-DD 날짜여야 합니다.`);
      itemIds.add(itemId);

      const media = rawItem.media === undefined ? undefined : parseMedia(rawItem.media, `${path}.media`);

      const tags = rawItem.tags === undefined ? [] : rawItem.tags;
      if (!Array.isArray(tags) || tags.some((tag) => typeof tag !== "string" || !tag.trim())) {
        throw new Error(`${path}.tags는 비어 있지 않은 문자열 배열이어야 합니다.`);
      }

      let sourceUrl: string | undefined;
      if (rawItem.sourceUrl !== undefined) {
        sourceUrl = requiredString(rawItem.sourceUrl, `${path}.sourceUrl`);
        try {
          if (new URL(sourceUrl).protocol !== "https:") throw new Error();
        } catch {
          throw new Error(`${path}.sourceUrl은 https URL이어야 합니다.`);
        }
      }

      return {
        id: itemId,
        date,
        title: requiredString(rawItem.title, `${path}.title`),
        description: requiredString(rawItem.description, `${path}.description`),
        ...(rawItem.body !== undefined && { body: requiredString(rawItem.body, `${path}.body`) }),
        tags: [...new Set(tags)],
        ...(media && { media }),
        ...(sourceUrl && { sourceUrl }),
      };
    });

    return {
      id,
      name: requiredString(rawTheme.name, `themes[${themeIndex}].name`),
      items: items.sort((a, b) => a.date.localeCompare(b.date)),
    };
  });

  return { version: 1, themes };
}
