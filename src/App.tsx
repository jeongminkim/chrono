import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { Badge, Button, IconButton, Input, Tag } from "./ds/components.js";
import { mergeTimelineItems, parseTimelineData, type TimelineData, type TimelineMedia } from "./data";

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

function MediaDetail({ m, title }: { m: TimelineMedia; title: string }) {
  return (
    <>
      <div className="pm">
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

export default function App() {
  const [data, setData] = useState<TimelineData>();
  const [message, setMessage] = useState("");
  const [theme, setTheme] = useState("all");
  const [q, setQ] = useState("");
  const [tag, setTag] = useState<string | null>(null);
  const [selKey, setSelKey] = useState<string | null>(null);
  const [dark, setDark] = useState(() => localStorage.getItem("chrono-theme") === "dark");
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
  useEffect(() => {
    let active = true;
    let lastText = "";
    const refresh = async () => {
      try {
        const response = await fetch(dataUrl, { cache: "no-cache" });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const text = await response.text();
        if (text === lastText) return;
        const next = parseTimelineData(text, { allowEmpty: true });
        if (!active) return;
        lastText = text;
        setData(next);
        setMessage("");
      } catch (error) {
        if (active) setMessage(`데이터를 불러오지 못했습니다: ${error instanceof Error ? error.message : "알 수 없는 오류"}`);
      }
    };
    void refresh();
    const timer = window.setInterval(refresh, 5_000);
    return () => { active = false; window.clearInterval(timer); };
  }, []);

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
              <button key={t.id} className={`th${theme === t.id ? " on" : ""}`} onClick={() => pick(t.id)}>
                <span className="sw" /><span className="t">{t.name}</span><span className="n">{t.items.length}</span>
              </button>
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
                  <button className="card" onClick={() => setSelKey(e.key === selKey ? null : e.key)}>
                    {e.media && <Media m={e.media} title={e.title} />}
                    <div className="txt">
                      {theme === "all" && <div><Badge tone="wash">{e.themeName}</Badge></div>}
                      <h3>{e.title}</h3>
                      <p>{e.description}</p>
                      <div className="chips">{e.tags.slice(0, 3).map((t) => <span key={t} className="hash">#{t}</span>)}</div>
                    </div>
                  </button>
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
          <h2>{sel.title}</h2>
          <div className="date">{sel.date.slice(0, 4)}년 {monthDay(sel.date)}</div>
          {sel.media ? <MediaDetail m={sel.media} title={sel.title} /> : <div style={{ height: 28 }} />}
          <p className="body">{sel.body ?? sel.description}</p>
          {sel.sourceUrl && <Button variant="secondary" size="sm" iconEnd={<Glyph name="arrow-right" />} onClick={() => window.open(sel.sourceUrl, "_blank", "noopener,noreferrer")}>출처 보기</Button>}
          {sel.tags.length > 0 && <div className="sec">
            <div className="lbl" style={{ paddingLeft: 0 }}>태그</div>
            <div className="cloud">{sel.tags.map((t) => <Tag key={t} selected={tag === t} onClick={() => { setTag(t); setSelKey(null); }}>#{t}</Tag>)}</div>
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
