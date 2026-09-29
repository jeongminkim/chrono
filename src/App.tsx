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
  return month && day ? `${Number(month)}월 ${Number(day)}일` : "";
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

// 연도만 있는 날짜(YYYY)도 표현할 수 있게 연도 입력과 월·일 선택으로 나눈다.
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
    if (!v.month !== !v.day) return setHint("월과 일을 모두 선택하거나 모두 비워 주세요.");
    setHint("");
    const value = v.month ? `${v.year}-${v.month}-${v.day}` : v.year;
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

export default function App() {
  const [data, setData] = useState<TimelineData>();
  const [message, setMessage] = useState("");
  const [theme, setTheme] = useState("all");
  const [q, setQ] = useState("");
  const [tag, setTag] = useState<string | null>(null);
  const [selKey, setSelKey] = useState<string | null>(null);
  const [dark, setDark] = useState(() => localStorage.getItem("chrono-theme") === "dark");
  const [edit, setEdit] = useState(false);
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
    .map(({ theme: t, item }) => ({ key: `${t.id}/${item.id}`, themeName: t.name, ...item }));
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
  const pick = (value: string) => { setTheme(value); setSelKey(null); setTag(null); };
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
  const addMedia = (key: string, file: File) => {
    if (file.size > 10 * 1024 * 1024) return setMessage("저장하지 못했습니다: 이미지가 10MB를 넘습니다.");
    void mutate(() => api("POST", `${itemPath(key)}/media`, file, file.type || "application/octet-stream"));
  };

  return (
    <div className="app">
      <nav className="lnb" style={{ width: lnbW }} aria-label="타임라인 탐색">
        <div className="lnb-head">
          <div className="wordmark">Timeline</div>
          <IconButton label={dark ? "라이트 모드" : "다크 모드"} size="sm" variant="circle" icon={<Glyph name={dark ? "sun" : "moon"} size={18} />} onClick={() => setDark(!dark)} />
        </div>
        <button className={`all${theme === "all" ? " on" : ""}`} onClick={() => pick("all")}>
          <span className="ico"><Glyph name="grid-2x2" size={16} /></span>
          <span className="t">전체</span><span className="n">{total}</span>
        </button>
        <div>
          <div className="lbl">테마</div>
          <div className="themes">
            {themes.map((t) => (
              <div key={t.id} className="th-row">
                <button className={`th${theme === t.id ? " on" : ""}`} onClick={() => pick(t.id)}>
                  <span className="sw" /><span className="t">{t.name}</span><span className="n">{t.items.length}</span>
                </button>
                {edit && <IconButton label={`${t.name} 테마 삭제`} size="sm" variant="ghost" icon={<Glyph name="trash-2" />} onClick={() => removeTheme(t)} />}
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
          <Switch checked={edit} onChange={setEdit} label="편집 허용" />
          <Input placeholder="제목, 내용, 날짜" aria-label="타임라인 검색" value={q} onChange={(event: { target: { value: string } }) => setQ(event.target.value)} iconStart={<Glyph name="search" />} fullWidth />
        </div>
      </nav>
      <Resizer width={lnbW} setWidth={setLnbW} />
      <main className={`main${sel ? " open" : ""}`}>
        <div className="wrap">
          {message && <p className={`notice ${data ? "warning" : "error"}`} role="alert">{message}</p>}
          {!data ? !message && <p className="notice" role="status">타임라인을 불러오는 중입니다.</p> : <>
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
                  {edit && <IconButton label={`${e.title} 사건 삭제`} size="sm" variant="overlay" className="card-x" icon={<Glyph name="trash-2" />} onClick={() => removeItem(e)} />}
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
          <Badge tone="accent" style={{ color: "var(--base-color-white)" }}>{sel.themeName}</Badge>
          <EditableText value={sel.title} edit={edit} label="제목" onSave={(title) => mutate(() => patchItem(sel.key, { title }))}>
            <h2>{sel.title}</h2>
          </EditableText>
          {edit
            ? <DateEditor date={sel.date} onSave={(date) => mutate(() => patchItem(sel.key, { date }))} />
            : <div className="date">{sel.date.slice(0, 4)}년 {monthDay(sel.date)}</div>}
          {sel.media?.map((m, i) => (
            <MediaDetail key={m.src} m={m} title={sel.title}
              onRemove={edit ? () => { if (window.confirm("이 미디어를 삭제할까요?")) void mutate(() => api("DELETE", `${itemPath(sel.key)}/media/${i}`)); } : undefined} />
          ))}
          {edit && (sel.media?.length ?? 0) < maxMediaCount && <div className="media-add"><MediaAdder onAdd={(file) => addMedia(sel.key, file)} /></div>}
          {!sel.media && !edit && <div style={{ height: 28 }} />}
          {edit && <div className="summary-edit">
            <div className="lbl" style={{ paddingLeft: 0 }}>카드 요약</div>
            <EditableText value={sel.description} edit={edit} multiline label="카드 요약" onSave={(description) => mutate(() => patchItem(sel.key, { description }))}>
              <p className="summary">{sel.description}</p>
            </EditableText>
            <div className="lbl" style={{ paddingLeft: 0 }}>상세 내용</div>
          </div>}
          <EditableText value={sel.body ?? sel.description} edit={edit} multiline label="내용" onSave={(body) => mutate(() => patchItem(sel.key, { body }))}>
            <p className="body">{sel.body ?? sel.description}</p>
          </EditableText>
          {sel.sourceUrl && <Button variant="secondary" size="sm" iconEnd={<Glyph name="arrow-right" />} onClick={() => window.open(sel.sourceUrl, "_blank", "noopener,noreferrer")}>출처 보기</Button>}
          {(sel.tags.length > 0 || edit) && <div className="sec">
            <div className="lbl" style={{ paddingLeft: 0 }}>태그</div>
            <div className="cloud">{sel.tags.map((t) => edit
              ? <Tag key={t} onRemove={() => mutate(() => patchItem(sel.key, { tags: sel.tags.filter((x) => x !== t) }))}>#{t}</Tag>
              : <Tag key={t} selected={tag === t} onClick={() => { setTag(t); setSelKey(null); }}>#{t}</Tag>)}</div>
            {edit && <TagAdder onAdd={(tags) => mutate(() => patchItem(sel.key, { tags: [...sel.tags, ...tags] }))} />}
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
