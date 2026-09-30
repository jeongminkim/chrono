import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { micromark } from "micromark";
import { gfm, gfmHtml } from "micromark-extension-gfm";
import { Badge, Button, IconButton, Input, Switch, Tag } from "./ds/components.js";
import { cleanTags, maxMediaCount, mergeTimelineItems, parseTimelineData, type TimelineData, type TimelineItem, type TimelineMedia } from "./data";

const dataUrl = `${import.meta.env.BASE_URL}api/timeline`;
const defaultSidebarWidth = 300;

function Glyph({ name, size = 16 }: { name: string; size?: number }) {
  const mask = `center/${size}px no-repeat url(${import.meta.env.BASE_URL}icons/${name}.svg)`;
  return <span aria-hidden="true" style={{ display: "inline-block", width: size, height: size, flex: "none", background: "currentColor", WebkitMask: mask, mask }} />;
}

function monthDay(date: string) {
  const [, month, day] = date.split("-");
  return month && day ? `${Number(month)}월 ${Number(day)}일` : month ? `${Number(month)}월` : "";
}

// Obsidian에서 동기화한 Markdown 본문. micromark는 원시 HTML을 이스케이프하고 위험한 링크(javascript: 등)를 걸러낸다.
const apiBase = `${import.meta.env.BASE_URL}api/`;
function renderMarkdown(markdown: string) {
  // 서버가 만든 첨부 경로(vault/…)는 API 기준 상대 경로라 앞에 API 경로를 붙인다.
  const html = micromark(markdown.replace(/\]\(vault\//g, `](${apiBase}vault/`), { extensions: [gfm()], htmlExtensions: [gfmHtml()] });
  return html.replace(/<img /g, '<img loading="lazy" ').replace(/<a href=/g, '<a target="_blank" rel="noopener noreferrer" href=');
}

function MarkdownBody({ markdown }: { markdown: string }) {
  const html = useMemo(() => renderMarkdown(markdown), [markdown]);
  return <div className="md-body" dangerouslySetInnerHTML={{ __html: html }} />;
}

// data.json의 상대 경로는 data.json 위치를 기준으로 해석한다.
const mediaUrl = (src: string) => new URL(src, new URL(dataUrl, document.baseURI)).href;

// 쓰기 요청. 인증은 Nginx가 맡고, X-Chrono-Edit 헤더는 서버의 CSRF 방지 확인용이다.
async function api(method: string, path: string, body?: BodyInit, contentType = "application/json") {
  const response = await fetch(`${import.meta.env.BASE_URL}api/${path}`, {
    method,
    headers: { "x-chrono-edit": "1", ...(body !== undefined && { "content-type": contentType }) },
    body,
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error ?? `HTTP ${response.status}`);
  return result;
}
// key는 "<테마 id>/<사건 id>". id는 영문 소문자·숫자·하이픈이라 그대로 경로에 쓸 수 있다.
const itemPath = (key: string) => { const [themeId, itemId] = key.split("/"); return `themes/${themeId}/items/${itemId}`; };
const patchItem = (key: string, patch: Partial<Pick<TimelineItem, "date" | "title" | "description" | "body" | "tags">>) =>
  api("PATCH", itemPath(key), JSON.stringify(patch));

type Mutate = (action: () => Promise<unknown>) => Promise<boolean>;

function Media({ m, title }: { m: TimelineMedia; title: string }) {
  const [failed, setFailed] = useState(false);
  const thumb = m.type === "image" ? m.src : m.youtubeId ? `https://img.youtube.com/vi/${m.youtubeId}/hqdefault.jpg` : m.poster;
  return (
    <div className="media">
      {thumb && !failed && <img src={mediaUrl(thumb)} alt={m.type === "image" ? m.alt : title} loading="lazy" onError={() => setFailed(true)} />}
      {!thumb && <video src={m.src} preload="metadata" muted playsInline aria-label={title} />}
      {thumb && failed && <div className="fb"><Glyph name="image" size={28} /></div>}
      {m.type === "video" && <><div className="scrim" /><div className="play"><b />{m.youtubeId ? "YouTube" : "동영상"}</div></>}
    </div>
  );
}

function MediaDetail({ m, title, onRemove }: { m: TimelineMedia; title: string; onRemove?: () => void }) {
  return (
    <>
      <div className="pm">
        {onRemove && <IconButton label="미디어 삭제" size="sm" variant="overlay" className="pm-x" icon={<Glyph name="x" />} onClick={onRemove} />}
        {m.type === "image" && <img src={mediaUrl(m.src)} alt={m.alt} />}
        {m.type === "video" && (m.youtubeId
          ? <iframe src={`https://www.youtube-nocookie.com/embed/${m.youtubeId}`} title={title} allow="accelerometer; encrypted-media; picture-in-picture" allowFullScreen />
          : <video src={m.src} poster={m.poster && mediaUrl(m.poster)} controls preload="metadata" aria-label={title} />)}
      </div>
      {m.caption && <div className="cap">{m.caption}</div>}
    </>
  );
}

function Resizer({ width, setWidth }: { width: number; setWidth: (value: number | ((current: number) => number)) => void }) {
  const [drag, setDrag] = useState(false);
  const clamp = (value: number) => Math.max(240, Math.min(520, value));
  const down = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDrag(true);
    const x0 = event.clientX;
    const move = (ev: PointerEvent) => setWidth(clamp(width + ev.clientX - x0));
    const up = () => {
      setDrag(false);
      document.body.style.cursor = "";
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    document.body.style.cursor = "col-resize";
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };
  const key = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft") setWidth((w) => clamp(w - 16));
    if (event.key === "ArrowRight") setWidth((w) => clamp(w + 16));
  };
  return (
    <div className={`resizer${drag ? " drag" : ""}`} role="separator" aria-orientation="vertical" aria-label="사이드바 크기 조절" tabIndex={0} onPointerDown={down} onKeyDown={key} onDoubleClick={() => setWidth(defaultSidebarWidth)}>
      <div className="grip"><i /><i /><i /></div>
    </div>
  );
}

const cloudMaxHeight = 300;

// 태그는 많이 쓰인 순으로 정렬돼 있어, 접힌 상태에서는 상위 태그가 먼저 보인다.
function TagCloud({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [clip, setClip] = useState<number>();
  // 300px을 넘으면 그 안에 온전히 들어가는 마지막 줄까지만 보이도록 높이를 잡는다.
  const measure = () => {
    const el = ref.current;
    if (!el || el.scrollHeight <= cloudMaxHeight) return setClip(undefined);
    const bottoms = [...el.children].map((c) => (c as HTMLElement).offsetTop - el.offsetTop + (c as HTMLElement).offsetHeight);
    setClip(Math.max(0, ...bottoms.filter((b) => b <= cloudMaxHeight)));
  };
  const overflow = clip !== undefined;
  useLayoutEffect(measure);
  useEffect(() => {
    const observer = new ResizeObserver(measure);
    observer.observe(ref.current!);
    return () => observer.disconnect();
  }, []);
  return (
    <>
      <div ref={ref} className="cloud" style={overflow && !open ? { maxHeight: clip, overflow: "hidden" } : undefined}>{children}</div>
      {overflow && <Button variant="ghost" size="sm" aria-expanded={open} style={{ marginTop: 8 }} onClick={() => setOpen(!open)}>{open ? "접기" : "더보기"}</Button>}
    </>
  );
}

// 한글 입력 조합 중의 Enter는 무시한다(조합 확정 Enter로 두 번 저장되는 것 방지).
const isEnter = (event: KeyboardEvent) => event.key === "Enter" && !event.nativeEvent.isComposing;

function EditableText({ value, edit, multiline, label, onSave, children }: {
  value: string; edit: boolean; multiline?: boolean; label: string; onSave: (value: string) => Promise<boolean>; children: ReactNode;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  useEffect(() => { if (!edit) setDraft(null); }, [edit]);
  const save = async () => { if (draft !== null && (draft === value || await onSave(draft))) setDraft(null); };
  const cancel = (event: KeyboardEvent) => { if (event.key === "Escape") { event.stopPropagation(); setDraft(null); } };
  if (draft === null) {
    return (
      <div className="editable">
        {children}
        {edit && <IconButton label={`${label} 편집`} size="sm" variant="ghost" icon={<Glyph name="pencil" />} onClick={() => setDraft(value)} />}
      </div>
    );
  }
  return multiline ? (
    <div className="edit-box">
      <textarea className="field" aria-label={label} value={draft} autoFocus rows={8} onChange={(e) => setDraft(e.target.value)} onKeyDown={cancel} />
      <div className="edit-actions">
        <Button variant="ghost" size="sm" onClick={() => setDraft(null)}>취소</Button>
        <Button size="sm" onClick={save}>확인</Button>
      </div>
    </div>
  ) : (
    <input className="field title-field" aria-label={label} value={draft} autoFocus onChange={(e) => setDraft(e.target.value)}
      onKeyDown={(e) => { if (isEnter(e)) void save(); cancel(e); }} />
  );
}

const pad = (n: number) => String(n).padStart(2, "0");

// 연도만(YYYY), 월까지(YYYY-MM) 아는 날짜도 표현할 수 있게 연도 입력과 월·일 선택으로 나눈다.
function DateEditor({ date, onSave }: { date: string; onSave: (date: string) => Promise<boolean> }) {
  const [y, m = "", d = ""] = date.split("-");
  const [year, setYear] = useState(y);
  const [month, setMonth] = useState(m);
  const [day, setDay] = useState(d);
  const [hint, setHint] = useState("");
  useEffect(() => { setYear(y); setMonth(m); setDay(d); }, [date]);
  const days = month ? new Date(Number(year) || 2000, Number(month), 0).getDate() : 31;
  const commit = (next: { year?: string; month?: string; day?: string }) => {
    const v = { year, month, day, ...next };
    if (!/^\d{4}$/.test(v.year)) return setHint("연도는 네 자리 숫자로 입력해 주세요.");
    if (v.day && !v.month) return setHint("일을 고르려면 월도 선택해 주세요.");
    setHint("");
    const value = v.month ? (v.day ? `${v.year}-${v.month}-${v.day}` : `${v.year}-${v.month}`) : v.year;
    if (value !== date) void onSave(value);
  };
  const select = (value: string, set: (v: string) => void, key: "month" | "day", count: number, unit: string) => (
    <select className="field" aria-label={unit} value={value} onChange={(e) => { set(e.target.value); commit({ [key]: e.target.value }); }}>
      <option value="">{unit} 선택 안 함</option>
      {Array.from({ length: count }, (_, i) => <option key={i} value={pad(i + 1)}>{i + 1}{unit}</option>)}
    </select>
  );
  return (
    <div className="date-edit">
      <input className="field year-field" type="number" aria-label="연도" min={1} max={9999} value={year} onChange={(e) => setYear(e.target.value)}
        onBlur={() => commit({})} onKeyDown={(e) => { if (isEnter(e)) commit({}); }} />
      <span>년</span>
      {select(month, setMonth, "month", 12, "월")}
      {select(day, setDay, "day", days, "일")}
      {hint && <div className="hint" role="alert">{hint}</div>}
    </div>
  );
}

function TagAdder({ onAdd }: { onAdd: (tags: string[]) => Promise<boolean> }) {
  const [draft, setDraft] = useState("");
  return (
    <Input placeholder="태그 추가 (쉼표로 구분 후 Enter)" aria-label="태그 추가" value={draft} fullWidth style={{ marginTop: 12 }}
      onChange={(event: { target: { value: string } }) => setDraft(event.target.value)}
      onKeyDown={async (event: KeyboardEvent) => {
        const tags = cleanTags(draft.split(","));
        if (isEnter(event) && tags.length > 0 && await onAdd(tags)) setDraft("");
      }} />
  );
}

function MediaAdder({ onAdd }: { onAdd: (file: File) => void }) {
  const input = useRef<HTMLInputElement>(null);
  return (
    <>
      <Button variant="secondary" size="sm" iconStart={<Glyph name="plus" />} onClick={() => input.current?.click()}>이미지 추가</Button>
      <input ref={input} type="file" accept="image/webp,image/avif,image/png,image/jpeg,image/gif,image/svg+xml" hidden
        onChange={(e) => { const file = e.target.files?.[0]; e.target.value = ""; if (file) onAdd(file); }} />
    </>
  );
}

// ---- 모바일 (760px 이하) — Claude Design "Timeline Mobile.html". 편집 기능은 제공하지 않는다. ----

const mobileQuery = "(max-width: 760px)";
function useMobile() {
  const [mobile, setMobile] = useState(() => window.matchMedia(mobileQuery).matches);
  useEffect(() => {
    const query = window.matchMedia(mobileQuery);
    const onChange = () => setMobile(query.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);
  return mobile;
}

// 가로 스크롤 목록. 마우스는 끌어서 스크롤하고, 끝이 잘린 쪽은 흐리게 표시한다.
function DragScroll({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [edge, setEdge] = useState({ l: false, r: false });
  const [dragging, setDragging] = useState(false);
  const moved = useRef(false);
  const edgeRef = useRef({ l: false, r: false });
  const update = () => {
    const el = ref.current;
    if (!el) return;
    const l = el.scrollLeft > 2, r = el.scrollLeft + el.clientWidth < el.scrollWidth - 2;
    if (edgeRef.current.l === l && edgeRef.current.r === r) return;
    edgeRef.current = { l, r };
    setEdge({ l, r });
  };
  useEffect(() => {
    const observer = new ResizeObserver(update);
    observer.observe(ref.current!);
    return () => observer.disconnect();
  }, []);
  useEffect(update);
  const down = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse") return;
    const el = ref.current!, x0 = event.clientX, s0 = el.scrollLeft;
    moved.current = false;
    const move = (ev: PointerEvent) => {
      const dx = ev.clientX - x0;
      if (Math.abs(dx) > 4) { moved.current = true; setDragging(true); }
      el.scrollLeft = s0 - dx;
    };
    const up = () => { setDragging(false); window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };
  return (
    <div ref={ref} className={`m-scroller${dragging ? " dragging" : ""}${edge.l ? " fl" : ""}${edge.r ? " fr" : ""}`}
      onPointerDown={down} onScroll={update}
      onClickCapture={(e) => { if (moved.current) { e.stopPropagation(); e.preventDefault(); moved.current = false; } }}
      onWheel={(e) => { if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) ref.current!.scrollLeft += e.deltaY; }}>
      {children}
    </div>
  );
}

type Entry = TimelineItem & { key: string; themeName: string; readOnly: boolean };

function MobileView({ data, message, themes, theme, pick, total, q, setQ, tag, setTag, cloud, list, sel, idx, setSelKey, dark, setDark, heading }: {
  data?: TimelineData; message: string; themes: TimelineData["themes"]; theme: string; pick: (id: string) => void; total: number;
  q: string; setQ: (q: string) => void; tag: string | null; setTag: (tag: string | null) => void; cloud: [string, number][];
  list: Entry[]; sel: Entry | null; idx: number; setSelKey: (key: string | null) => void; dark: boolean; setDark: (dark: boolean) => void; heading: string;
}) {
  const [searchOpen, setSearchOpen] = useState(false);
  return (
    <>
      <div className="m">
        <div className="m-head">
          <div className="m-word">Timeline</div>
          <IconButton label="검색" size="md" variant={searchOpen ? "circle" : "ghost"} icon={<Glyph name="search" size={20} />} onClick={() => setSearchOpen(!searchOpen)} />
          <IconButton label={dark ? "라이트 모드" : "다크 모드"} size="md" variant="circle" icon={<Glyph name={dark ? "sun" : "moon"} size={20} />} onClick={() => setDark(!dark)} />
        </div>
        {searchOpen && <div className="m-search"><Input placeholder="제목, 내용, 날짜" aria-label="타임라인 검색" value={q} onChange={(event: { target: { value: string } }) => setQ(event.target.value)} iconStart={<Glyph name="search" />} fullWidth autoFocus /></div>}
        <DragScroll>
          <button className={`m-seg all${theme === "all" ? " on" : ""}`} onClick={() => pick("all")}>
            <span className="ico"><Glyph name="grid-2x2" size={14} /></span>전체<span className="n">{total}</span>
          </button>
          {themes.map((t) => (
            <button key={t.id} className={`m-seg${theme === t.id ? " on" : ""}`} onClick={() => pick(t.id)}>{t.name}<span className="n">{t.items.length}</span></button>
          ))}
        </DragScroll>
        <div className="m-tags">
          <div className="m-lbl">태그</div>
          <DragScroll>
            {cloud.map(([t, n]) => <Tag key={t} selected={tag === t} onClick={() => setTag(tag === t ? null : t)}>#{t}{n > 1 ? ` ${n}` : ""}</Tag>)}
          </DragScroll>
        </div>
        <div className="m-title">
          {message && <p className={`notice ${data ? "warning" : "error"}`} role="alert">{message}</p>}
          {!data && !message && <p className="notice" role="status">타임라인을 불러오는 중입니다.</p>}
          <p className="m-eyebrow">{list.length}개 이벤트{tag && ` · #${tag}`}{q && ` · “${q}”`}</p>
          <h1 className="m-h-title">{heading}</h1>
        </div>
        <div className="m-tl">
          {data && list.length === 0 && <div className="m-empty">{themes.length === 0 ? "아직 데이터가 없습니다" : "다른 검색어를 입력해 보세요"}</div>}
          {list.map((e) => (
            <div key={e.key} className={`m-it${e.key === sel?.key ? " sel" : ""}`}>
              <span className="m-dot" />
              <div className="m-when"><span className="m-year">{e.date.slice(0, 4)}</span><span className="m-md">{monthDay(e.date)}</span></div>
              <button className="m-card" onClick={() => setSelKey(e.key)}>
                {e.media && <Media m={e.media[0]} title={e.title} />}
                <div className="txt">
                  {theme === "all" && <div><Badge tone="wash">{e.themeName}</Badge></div>}
                  <h3>{e.title}</h3>
                  <p>{e.description}</p>
                  <div className="m-chips">{e.tags.slice(0, 3).map((t) => <span key={t} className="hash">#{t}</span>)}</div>
                </div>
              </button>
            </div>
          ))}
        </div>
      </div>
      <div className={`m-scrimbg${sel ? " open" : ""}`} onClick={() => setSelKey(null)} />
      <div className={`m-sheet${sel ? " open" : ""}`} aria-hidden={!sel} role="dialog" aria-label={sel?.title}>
        <div className="m-grab" />
        <div className="m-sheet-top"><IconButton label="닫기" size="md" icon={<Glyph name="x" size={20} />} onClick={() => setSelKey(null)} /></div>
        {sel && <div className="m-sheet-in" key={sel.key}>
          <div className="badges"><Badge tone="accent" style={{ color: "var(--base-color-white)" }}>{sel.themeName}</Badge>{sel.readOnly && <Badge tone="wash">Obsidian</Badge>}</div>
          <h2>{sel.title}</h2>
          <div className="date">{sel.date.slice(0, 4)}년 {monthDay(sel.date)}</div>
          {sel.bodyFormat === "markdown" && sel.body
            ? <><div style={{ height: 24 }} /><MarkdownBody markdown={sel.body} /></>
            : <>
              {sel.media ? sel.media.map((m) => <MediaDetail key={m.src} m={m} title={sel.title} />) : <div style={{ height: 24 }} />}
              <p className="body">{sel.body ?? sel.description}</p>
            </>}
          {sel.sourceUrl && <Button variant="secondary" size="md" fullWidth iconEnd={<Glyph name="arrow-right" />} onClick={() => window.open(sel.sourceUrl, "_blank", "noopener,noreferrer")}>출처 보기</Button>}
          {sel.tags.length > 0 && <div className="m-sec">
            <div className="m-lbl">태그</div>
            <div className="m-chips">{sel.tags.map((t) => <Tag key={t} selected={tag === t} onClick={() => { setTag(t); setSelKey(null); }}>#{t}</Tag>)}</div>
          </div>}
          <div className="m-sec m-nav">
            <Button variant="secondary" size="md" fullWidth disabled={idx <= 0} onClick={() => setSelKey(list[idx - 1].key)}>이전</Button>
            <Button variant="secondary" size="md" fullWidth disabled={idx >= list.length - 1} onClick={() => setSelKey(list[idx + 1].key)}>다음</Button>
          </div>
        </div>}
      </div>
    </>
  );
}

// ---- 설정 화면 (/settings) ----

type SyncReport = { notes: number; synced: number; skipped: { path: string; reason: string }[]; tags: [string, number][]; error?: string };
type SyncSource = { themeId: string; name: string; path: string; ignoreTags: string[]; syncedAt?: string; report?: SyncReport };

const getJson = async (path: string) => {
  const response = await fetch(`${apiBase}${path}`, { cache: "no-cache" });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error ?? `HTTP ${response.status}`);
  return result;
};
const formatTime = (iso?: string) => (iso ? new Date(iso).toLocaleString("ko-KR", { dateStyle: "medium", timeStyle: "short" }) : "아직 없음");

function SourceRow({ source, disabled, onAction }: { source: SyncSource; disabled: boolean; onAction: (action: () => Promise<unknown>) => Promise<boolean> }) {
  const [ignore, setIgnore] = useState(source.ignoreTags.join(", "));
  useEffect(() => setIgnore(source.ignoreTags.join(", ")), [source.ignoreTags.join(",")]);
  const report = source.report;
  const path = `settings/sources/${source.themeId}`;
  const addIgnore = (tag: string) => setIgnore((current) => cleanTags([...current.split(","), tag]).join(", "));
  return (
    <div className="src">
      <div className="src-head">
        <div className="src-title"><strong>{source.name}</strong><span className="src-path">vault/{source.path.normalize("NFC")}</span></div>
        <Button variant="secondary" size="sm" disabled={disabled} onClick={() => onAction(() => api("POST", `${path}/sync`))}>지금 동기화</Button>
        <Button variant="ghost" size="sm" disabled={disabled} onClick={() => {
          if (window.confirm(`"${source.name}" 동기화를 해제할까요?\n가져온 사건 ${report?.synced ?? 0}개가 타임라인에서 사라집니다. Obsidian vault는 바뀌지 않습니다.`)) void onAction(() => api("DELETE", path));
        }}>삭제</Button>
      </div>
      <p className="src-meta">
        노트 {report?.notes ?? 0}개 중 {report?.synced ?? 0}개 동기화 · 마지막 동기화 {formatTime(source.syncedAt)}
      </p>
      {report?.error && <p className="notice error" role="alert">동기화 오류: {report.error}</p>}
      {(report?.skipped.length ?? 0) > 0 && (
        <details className="src-skipped">
          <summary>건너뛴 노트 {report!.skipped.length}개</summary>
          <ul>{report!.skipped.map((s) => <li key={s.path}><code>{s.path}</code> — {s.reason}</li>)}</ul>
        </details>
      )}
      <div className="src-ignore">
        <Input placeholder="무시할 태그 (쉼표로 구분)" aria-label="무시할 태그" value={ignore} fullWidth
          onChange={(event: { target: { value: string } }) => setIgnore(event.target.value)} />
        <Button variant="secondary" size="sm" disabled={disabled || ignore === source.ignoreTags.join(", ")}
          onClick={() => onAction(() => api("PATCH", path, JSON.stringify({ ignoreTags: cleanTags(ignore.split(",")) })))}>저장</Button>
      </div>
      {(report?.tags.length ?? 0) > 0 && (
        <div className="src-tags">
          <span className="src-hint">발견된 태그 (눌러서 무시 목록에 추가)</span>
          {report!.tags.slice(0, 40).map(([t, n]) => (
            <Tag key={t} selected={source.ignoreTags.includes(t)} onClick={() => addIgnore(t)}>#{t} {n}</Tag>
          ))}
        </div>
      )}
    </div>
  );
}

function SettingsView({ importing, runImport, resetAll, onChanged }: {
  importing: boolean; runImport: () => void; resetAll: () => void; onChanged: () => Promise<void>;
}) {
  const [sources, setSources] = useState<SyncSource[]>([]);
  const [mounted, setMounted] = useState<boolean>();
  const [dirs, setDirs] = useState<{ name: string; path: string; depth: number }[]>([]);
  const [picked, setPicked] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    try {
      const result = await getJson("settings/sources");
      setMounted(result.mounted);
      setSources(result.sources);
    } catch (e) {
      setError(`설정을 불러오지 못했습니다: ${e instanceof Error ? e.message : e}`);
    }
  }, []);
  const loadDirs = useCallback(async () => {
    try {
      setDirs((await getJson("settings/vault")).dirs);
    } catch (e) {
      setError(`vault 디렉터리를 읽지 못했습니다: ${e instanceof Error ? e.message : e}`);
    }
  }, []);
  useEffect(() => {
    void load();
    void loadDirs();
    const timer = window.setInterval(load, 5_000);
    return () => window.clearInterval(timer);
  }, [load, loadDirs]);
  // 쓰기 작업 공통: 실패하면 메시지를 보여 주고, 끝나면 목록과 타임라인을 다시 읽는다.
  const onAction = async (action: () => Promise<unknown>) => {
    setBusy(true);
    setError("");
    try {
      await action();
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      return false;
    } finally {
      await load();
      await onChanged();
      setBusy(false);
    }
  };
  // 경로는 서버의 실제 파일 이름(macOS에서 온 NFD일 수 있음) 그대로 주고받고, 비교와 표시는 NFC로 한다.
  const nfc = (path: string) => path.normalize("NFC");
  const blockedBy = (path: string) => sources.find((s) => {
    const [a, b] = [nfc(s.path), nfc(path)];
    return a === b || a.startsWith(`${b}/`) || b.startsWith(`${a}/`);
  });
  const pick = (path: string) => {
    setPicked(path);
    setName(nfc(path.split("/").at(-1) ?? ""));
  };

  return (
    <div className="settings">
      <p className="eyebrow">설정</p>
      <h1 className="h-title">설정</h1>
      {error && <p className="notice error" role="alert">{error}</p>}

      <section className="set-sec">
        <h2>데이터 가져오기</h2>
        <p className="set-desc">서버 import 디렉터리의 <code>data.json</code>과 이미지를 가져옵니다. 먼저 검증 결과를 보여 주고, 확인하면 가져온 뒤 원본을 삭제합니다.</p>
        <div className="set-actions">
          <Button variant="secondary" size="sm" disabled={importing} onClick={runImport}>{importing ? "import 중…" : "import"}</Button>
        </div>
      </section>

      <section className="set-sec">
        <h2>데이터 초기화</h2>
        <p className="set-desc">저장된 모든 테마·사건과 첨부 이미지를 삭제합니다. 되돌릴 수 없으니 필요하면 먼저 export로 백업하세요. Obsidian에서 동기화하는 테마는 삭제되지 않습니다.</p>
        <div className="set-actions">
          <Button variant="secondary" size="sm" disabled={importing} onClick={resetAll}>reset</Button>
        </div>
      </section>

      <section className="set-sec">
        <h2>Obsidian 동기화</h2>
        <p className="set-desc">vault의 디렉터리를 테마로 등록하면 노트가 사건으로 들어오고, 노트를 고치면 자동으로 반영됩니다. 동기화한 테마와 사건은 여기서 동기화를 해제하는 것 말고는 수정하거나 삭제할 수 없습니다.</p>
        {mounted === false && <p className="notice warning">Obsidian vault가 마운트되지 않았습니다. 서버의 <code>VAULT_DIR</code>과 docker compose 볼륨을 확인하세요.</p>}
        {sources.length === 0 && mounted && <p className="set-desc">동기화 중인 디렉터리가 없습니다.</p>}
        {sources.map((source) => <SourceRow key={source.themeId} source={source} disabled={busy} onAction={onAction} />)}

        {mounted && (
          <div className="src add">
            <strong>디렉터리 추가</strong>
            <span className="src-hint">vault 아래 3단계까지 표시합니다. 이미 동기화 중인 디렉터리와 그 상위·하위 디렉터리는 고를 수 없습니다.</span>
            <div className="tree" role="listbox" aria-label="vault 디렉터리">
              {dirs.length === 0 && <span className="src-hint">디렉터리가 없습니다.</span>}
              {dirs.map((d) => {
                const clash = blockedBy(d.path);
                const reason = clash && (nfc(clash.path) === nfc(d.path) ? "동기화 중" : `"${nfc(clash.path)}" 동기화와 겹침`);
                return (
                  <button key={d.path} role="option" aria-selected={picked === d.path} disabled={Boolean(clash)}
                    className={`tree-row${picked === d.path ? " on" : ""}`} style={{ paddingLeft: 12 + (d.depth - 1) * 20 }} onClick={() => pick(d.path)}>
                    <span className="tree-name">{d.name}</span>
                    {reason && <span className="tree-note">{reason}</span>}
                  </button>
                );
              })}
            </div>
            <div className="src-ignore">
              <Input placeholder={picked ? "테마 이름" : "위 목록에서 디렉터리를 고르세요"} aria-label="테마 이름" value={name} fullWidth disabled={!picked}
                onChange={(event: { target: { value: string } }) => setName(event.target.value)} />
              <Button size="sm" disabled={busy || !picked || Boolean(blockedBy(picked))}
                onClick={() => onAction(() => api("POST", "settings/sources", JSON.stringify({ path: picked, name }))).then((ok) => { if (ok) setPicked(""); })}>
                {busy ? "동기화 중…" : "동기화"}
              </Button>
            </div>
            {picked && <span className="src-hint">선택: vault/{nfc(picked)}</span>}
          </div>
        )}
      </section>
    </div>
  );
}

export default function App() {
  const [data, setData] = useState<TimelineData>();
  const [message, setMessage] = useState("");
  const [theme, setTheme] = useState("all");
  const [q, setQ] = useState("");
  const [tag, setTag] = useState<string | null>(null);
  const [selKey, setSelKey] = useState<string | null>(null);
  const [dark, setDark] = useState(() => localStorage.getItem("chrono-theme") === "dark");
  const [edit, setEdit] = useState(false);
  const [importing, setImporting] = useState(false);
  const mobile = useMobile();
  // 화면 경로: 타임라인(/)과 설정(/settings). 라이브러리 없이 history API로 전환한다.
  const settingsPath = `${import.meta.env.BASE_URL}settings`;
  const [route, setRoute] = useState<"timeline" | "settings">(() => (location.pathname === settingsPath ? "settings" : "timeline"));
  useEffect(() => {
    const onPop = () => setRoute(location.pathname === settingsPath ? "settings" : "timeline");
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);
  const go = (next: "timeline" | "settings") => {
    setSelKey(null);
    if (next === route) return;
    history.pushState(null, "", next === "settings" ? settingsPath : import.meta.env.BASE_URL);
    setRoute(next);
  };
  const [lnbW, setLnbW] = useState(() => Number(localStorage.getItem("chrono-lnb")) || defaultSidebarWidth);

  useEffect(() => localStorage.setItem("chrono-lnb", String(lnbW)), [lnbW]);
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    localStorage.setItem("chrono-theme", dark ? "dark" : "light");
  }, [dark]);
  useEffect(() => {
    const onKey = (event: globalThis.KeyboardEvent) => event.key === "Escape" && setSelKey(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  const lastText = useRef("");
  const refresh = useCallback(async () => {
    try {
      const response = await fetch(dataUrl, { cache: "no-cache" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const text = await response.text();
      if (text === lastText.current) return;
      const next = parseTimelineData(text, { allowEmpty: true });
      lastText.current = text;
      setData(next);
      setMessage("");
    } catch (error) {
      setMessage(`데이터를 불러오지 못했습니다: ${error instanceof Error ? error.message : "알 수 없는 오류"}`);
    }
  }, []);
  useEffect(() => {
    void refresh();
    const timer = window.setInterval(refresh, 5_000);
    return () => window.clearInterval(timer);
  }, [refresh]);
  // 저장 후 즉시 데이터를 다시 받아 LNB와 타임라인에 반영한다. 실패하면 이전 값이 그대로 남는다.
  const mutate: Mutate = async (action) => {
    try {
      await action();
      setMessage("");
      return true;
    } catch (error) {
      setMessage(`저장하지 못했습니다: ${error instanceof Error ? error.message : "알 수 없는 오류"}`);
      return false;
    } finally {
      await refresh();
    }
  };

  const themes = data?.themes ?? [];
  const inTheme = mergeTimelineItems(themes.filter((t) => theme === "all" || t.id === theme))
    .map(({ theme: t, item }) => ({ key: `${t.id}/${item.id}`, themeName: t.name, readOnly: t.source === "obsidian", ...item }));
  const cloud = useMemo(() => {
    const counts = new Map<string, number>();
    inTheme.forEach((e) => e.tags.forEach((t) => counts.set(t, (counts.get(t) ?? 0) + 1)));
    return [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "ko"));
  }, [data, theme]);
  const needle = q.trim().toLocaleLowerCase("ko-KR");
  const list = inTheme.filter((e) => (!tag || e.tags.includes(tag))
    && (!needle || [e.title, e.description, e.body ?? "", e.date, ...e.tags].some((t) => t.toLocaleLowerCase("ko-KR").includes(needle))));
  const idx = list.findIndex((e) => e.key === selKey);
  const sel = idx >= 0 ? list[idx] : null;
  const pick = (value: string) => { setTheme(value); setSelKey(null); setTag(null); go("timeline"); };
  const heading = theme === "all" ? "전체 타임라인" : themes.find((t) => t.id === theme)?.name ?? "타임라인";
  const total = themes.reduce((count, t) => count + t.items.length, 0);
  const removeTheme = (t: { id: string; name: string; items: unknown[] }) => {
    if (!window.confirm(`"${t.name}" 테마와 사건 ${t.items.length}개를 삭제할까요? 되돌릴 수 없습니다.`)) return;
    void mutate(() => api("DELETE", `themes/${t.id}`)).then((ok) => {
      if (!ok) return;
      if (theme === t.id) pick("all");
      if (selKey?.startsWith(`${t.id}/`)) setSelKey(null);
    });
  };
  const removeItem = (e: { key: string; title: string }) => {
    if (!window.confirm(`"${e.title}" 사건을 삭제할까요? 되돌릴 수 없습니다.`)) return;
    void mutate(() => api("DELETE", itemPath(e.key))).then((ok) => { if (ok && selKey === e.key) setSelKey(null); });
  };
  // import 디렉터리를 먼저 검증(dry-run)해 결과를 보여 주고, 확인하면 실제로 가져온다.
  const runImport = async () => {
    setImporting(true);
    try {
      const plan = await api("POST", "import?dryRun=1");
      const skipped = plan.skipped > 0 ? `\n건너뛸 항목(이미 있음): ${plan.skippedIds.slice(0, 5).join(", ")}${plan.skipped > 5 ? ` 외 ${plan.skipped - 5}건` : ""}` : "";
      if (!window.confirm(`import 디렉터리의 data.json을 가져옵니다.\n\n추가 ${plan.added}건 · 건너뜀 ${plan.skipped}건 · 이미지 ${plan.images}개${skipped}\n\n진행하면 data.json과 가져온 이미지 원본은 삭제됩니다. 진행할까요?`)) return;
      const result = await api("POST", "import");
      await refresh();
      window.alert(`import 완료: 추가 ${result.added}건 · 건너뜀 ${result.skipped}건 · 이미지 ${result.images}개`);
    } catch (error) {
      window.alert(`import 실패: ${error instanceof Error ? error.message : "알 수 없는 오류"}`);
    } finally {
      setImporting(false);
    }
  };
  const resetAll = () => {
    if (!window.confirm(`저장된 모든 테마와 사건 ${total}개, 첨부 이미지를 삭제할까요?\n되돌릴 수 없습니다. 필요하면 먼저 export로 백업하세요.`)) return;
    void mutate(() => api("POST", "reset")).then((ok) => { if (ok) { pick("all"); setSelKey(null); } });
  };
  const addMedia = (key: string, file: File) => {
    if (file.size > 10 * 1024 * 1024) return setMessage("저장하지 못했습니다: 이미지가 10MB를 넘습니다.");
    void mutate(() => api("POST", `${itemPath(key)}/media`, file, file.type || "application/octet-stream"));
  };

  // Obsidian 사건은 편집 허용이어도 고칠 수 없다. Markdown 본문은 이미지가 본문 안에 있어 미디어 블록을 따로 그리지 않는다.
  const ed = edit && !sel?.readOnly;
  const markdown = sel?.bodyFormat === "markdown" && Boolean(sel.body);

  if (mobile && route === "settings") {
    return (
      <div className="m">
        <div className="m-head"><div className="m-word">Timeline</div></div>
        <div className="m-title">
          <p className="m-empty">설정은 데스크톱에서 사용할 수 있습니다.</p>
          <Button variant="secondary" size="md" onClick={() => go("timeline")}>타임라인으로</Button>
        </div>
      </div>
    );
  }
  if (mobile) {
    return <MobileView data={data} message={message} themes={themes} theme={theme} pick={pick} total={total} q={q} setQ={setQ}
      tag={tag} setTag={(t) => { setTag(t); setSelKey(null); }} cloud={cloud} list={list} sel={sel} idx={idx} setSelKey={setSelKey}
      dark={dark} setDark={setDark} heading={heading} />;
  }

  return (
    <div className="app">
      <nav className="lnb" style={{ width: lnbW }} aria-label="타임라인 탐색">
        <div className="lnb-head">
          <div className="wordmark">Timeline</div>
          <div className="head-btns">
            <IconButton label={dark ? "라이트 모드" : "다크 모드"} size="sm" variant="circle" icon={<Glyph name={dark ? "sun" : "moon"} size={18} />} onClick={() => setDark(!dark)} />
            <IconButton label="설정" size="sm" variant={route === "settings" ? "accent" : "circle"} aria-pressed={route === "settings"}
              icon={<Glyph name="settings" size={18} />} onClick={() => go(route === "settings" ? "timeline" : "settings")} />
          </div>
        </div>
        <button className={`all${theme === "all" && route === "timeline" ? " on" : ""}`} onClick={() => pick("all")}>
          <span className="ico"><Glyph name="grid-2x2" size={16} /></span>
          <span className="t">전체</span><span className="n">{total}</span>
        </button>
        <div>
          <div className="lbl">테마</div>
          <div className="themes">
            {themes.map((t) => (
              <div key={t.id} className="th-row">
                <button className={`th${theme === t.id && route === "timeline" ? " on" : ""}`} onClick={() => pick(t.id)} title={t.source === "obsidian" ? "Obsidian에서 동기화하는 테마(읽기 전용)" : undefined}>
                  <span className="sw" /><span className="t">{t.name}</span><span className="n">{t.items.length}</span>
                </button>
                {edit && t.source !== "obsidian" && <IconButton label={`${t.name} 테마 삭제`} size="sm" variant="ghost" icon={<Glyph name="trash-2" />} onClick={() => removeTheme(t)} />}
              </div>
            ))}
          </div>
        </div>
        <div className="bottom">
          <div>
            <div className="lbl">태그</div>
            <TagCloud>
              {cloud.map(([t, n]) => <Tag key={t} selected={tag === t} onClick={() => { setTag(tag === t ? null : t); setSelKey(null); }}>#{t}{n > 1 ? ` ${n}` : ""}</Tag>)}
            </TagCloud>
          </div>
          <div className="edit-row">
            <Switch checked={edit} onChange={setEdit} label="편집 허용" />
          </div>
          <Input placeholder="제목, 내용, 날짜" aria-label="타임라인 검색" value={q} onChange={(event: { target: { value: string } }) => setQ(event.target.value)} iconStart={<Glyph name="search" />} fullWidth />
        </div>
      </nav>
      <Resizer width={lnbW} setWidth={setLnbW} />
      <main className={`main${sel ? " open" : ""}`}>
        <div className="wrap">
          {message && <p className={`notice ${data ? "warning" : "error"}`} role="alert">{message}</p>}
          {route === "settings" ? <SettingsView importing={importing} runImport={runImport} resetAll={resetAll} onChanged={refresh} /> : !data ? !message && <p className="notice" role="status">타임라인을 불러오는 중입니다.</p> : <>
            <p className="eyebrow">{list.length}개 이벤트{tag && ` · #${tag}`}{q && ` · “${q}” 검색 결과`}</p>
            <h1 className="h-title">{heading}</h1>
            <div className="tl">
              {list.length === 0 && <div className="empty">{themes.length === 0 ? "아직 데이터가 없습니다" : "다른 검색어를 입력해 보세요"}</div>}
              {list.map((e, i) => (
                <div key={e.key} className={`row ${i % 2 ? "r" : "l"}${e.key === selKey ? " sel" : ""}`}>
                  <div className="when">{(i === 0 || list[i - 1].date.slice(0, 4) !== e.date.slice(0, 4) || !monthDay(e.date)) && <div className="year">{e.date.slice(0, 4)}</div>}<div className="md">{monthDay(e.date)}</div></div>
                  <span className="dot" />
                  <div className="cardbox">
                  <button className="card" onClick={() => setSelKey(e.key === selKey ? null : e.key)}>
                    {e.media && <Media m={e.media[0]} title={e.title} />}
                    <div className="txt">
                      {theme === "all" && <div><Badge tone="wash">{e.themeName}</Badge></div>}
                      <h3>{e.title}</h3>
                      <p>{e.description}</p>
                      <div className="chips">{e.tags.slice(0, 3).map((t) => <span key={t} className="hash">#{t}</span>)}</div>
                    </div>
                  </button>
                  {edit && !e.readOnly && <IconButton label={`${e.title} 사건 삭제`} size="sm" variant="overlay" className="card-x" icon={<Glyph name="trash-2" />} onClick={() => removeItem(e)} />}
                  </div>
                </div>
              ))}
            </div>
          </>}
        </div>
      </main>
      <aside className={`panel${sel ? " open" : ""}`} aria-hidden={!sel}>
        {sel && <div className="panel-in" key={sel.key}>
          <div className="panel-top"><IconButton label="닫기" size="sm" icon={<Glyph name="x" size={18} />} onClick={() => setSelKey(null)} /></div>
          <div className="badges"><Badge tone="accent" style={{ color: "var(--base-color-white)" }}>{sel.themeName}</Badge>{sel.readOnly && <Badge tone="wash">Obsidian</Badge>}</div>
          <EditableText value={sel.title} edit={ed} label="제목" onSave={(title) => mutate(() => patchItem(sel.key, { title }))}>
            <h2>{sel.title}</h2>
          </EditableText>
          {ed
            ? <DateEditor date={sel.date} onSave={(date) => mutate(() => patchItem(sel.key, { date }))} />
            : <div className="date">{sel.date.slice(0, 4)}년 {monthDay(sel.date)}</div>}
          {!markdown && sel.media?.map((m, i) => (
            <MediaDetail key={m.src} m={m} title={sel.title}
              onRemove={ed ? () => { if (window.confirm("이 미디어를 삭제할까요?")) void mutate(() => api("DELETE", `${itemPath(sel.key)}/media/${i}`)); } : undefined} />
          ))}
          {ed && (sel.media?.length ?? 0) < maxMediaCount && <div className="media-add"><MediaAdder onAdd={(file) => addMedia(sel.key, file)} /></div>}
          {(markdown || !sel.media) && !ed && <div style={{ height: 28 }} />}
          {ed && <div className="summary-edit">
            <div className="lbl" style={{ paddingLeft: 0 }}>카드 요약</div>
            <EditableText value={sel.description} edit={ed} multiline label="카드 요약" onSave={(description) => mutate(() => patchItem(sel.key, { description }))}>
              <p className="summary">{sel.description}</p>
            </EditableText>
            <div className="lbl" style={{ paddingLeft: 0 }}>상세 내용</div>
          </div>}
          {markdown ? <MarkdownBody markdown={sel.body!} /> : (
            <EditableText value={sel.body ?? sel.description} edit={ed} multiline label="내용" onSave={(body) => mutate(() => patchItem(sel.key, { body }))}>
              <p className="body">{sel.body ?? sel.description}</p>
            </EditableText>
          )}
          {sel.sourceUrl && <Button variant="secondary" size="sm" iconEnd={<Glyph name="arrow-right" />} onClick={() => window.open(sel.sourceUrl, "_blank", "noopener,noreferrer")}>출처 보기</Button>}
          {(sel.tags.length > 0 || ed) && <div className="sec">
            <div className="lbl" style={{ paddingLeft: 0 }}>태그</div>
            <div className="cloud">{sel.tags.map((t) => ed
              ? <Tag key={t} onRemove={() => mutate(() => patchItem(sel.key, { tags: sel.tags.filter((x) => x !== t) }))}>#{t}</Tag>
              : <Tag key={t} selected={tag === t} onClick={() => { setTag(t); setSelKey(null); }}>#{t}</Tag>)}</div>
            {ed && <TagAdder onAdd={(tags) => mutate(() => patchItem(sel.key, { tags: [...sel.tags, ...tags] }))} />}
          </div>}
          <div className="sec nav">
            <Button variant="ghost" size="sm" disabled={idx <= 0} onClick={() => setSelKey(list[idx - 1].key)}>이전</Button>
            <Button variant="ghost" size="sm" disabled={idx >= list.length - 1} onClick={() => setSelKey(list[idx + 1].key)}>다음</Button>
          </div>
        </div>}
      </aside>
    </div>
  );
}
