# 설정 페이지와 Obsidian 동기화 개발 계획

> 작성일: 2026-09-30  
> 상태: 구현 완료 (2026-09-30). 계획 대비 변경점은 8장 참고  
> 참고한 예제: 서버 `/home/kyo/syncthing/obsidian/personal/{여행,구매이력}`. 로컬 Mac에서 같은 vault가 Syncthing으로 동기화된 `/Users/kyo/syncthing/obsidian/personal`을 읽기만 해서 분석했다.

## 1. 요구사항

### 설정 페이지

- 다크 모드 버튼 옆에 설정 아이콘을 둔다.
- 설정 아이콘을 누르면 LNB는 그대로 두고, 콘텐츠 영역(타임라인 자리)이 설정 화면으로 바뀐다. 주소는 `/settings`.
- LNB에 있던 import·reset 버튼을 설정 화면으로 옮긴다.

### Obsidian 디렉터리 동기화

- 설정 화면에서 동기화할 디렉터리를 목록으로 보여 주고, 추가·삭제할 수 있다.
- vault 안의 특정 디렉터리를 추가하면 테마로 등록되고, 이후 실시간으로 동기화된다.
- 편집 허용 상태여도 Obsidian에서 가져온 테마와 그 사건은 삭제할 수 없다.
- vault는 docker compose에 읽기 전용 볼륨으로 마운트한다.

## 2. 예제 디렉터리 분석

| 항목 | `여행` (노트 31개) | `구매이력` (노트 188개) |
|---|---|---|
| 구조 | `여행/<연도>/<YYYY-MM 제목>.md` + 최상위에 날짜 없는 노트 2개 | `구매이력/<연도>/<YYYY-MM-DD 제목>.md` + 최상위에 날짜 없는 노트 2개 |
| frontmatter | `title`, `created`, `updated` | `title`, `created`, `updated`, `date`(173), `allDay`(173), `price`(12), `url`(1) |
| 날짜 | 파일 이름 앞부분만. 대부분 `YYYY-MM`(월까지) | frontmatter `date`(`YYYY-MM-DD`)와 파일 이름 |
| 날짜 없는 노트 | `기타.md`, `중국 하이난.md` | `Fujifilm S5Pro.md`, `HP 2311F LED Monitor.md` |
| 제목 | frontmatter `title`에 날짜가 붙어 있음(`"2002-02 일본 도쿄"`) | frontmatter `title`에 날짜 없음(`"Apple iPhone 8"`) |
| 본문 | 짧은 글부터 표·제목(`##`)·목록·굵게가 있는 14KB 문서까지 다양 | 짧은 글·목록, 외부 이미지 URL, PDF 첨부 |
| 민감 정보 | 예약번호·PIN, 주소, 전화번호, 결제 금액이 본문에 있음 | 구입처, 가격 |
| 이미지 참조 | 표준 Markdown `![alt](../../_attachments/image/…)`. Obsidian 위키 임베드(`![[…]]`)는 없음 | 같음. 외부 URL(`https://images-na.ssl-images-amazon.com/…` 등)도 있음 |
| 이미지 수 | 노트당 최대 76장(2008-05 오사카) | 대부분 1~5장 |
| 첨부 위치 | vault 루트의 `_attachments/`(4.9GB, 공용). **테마 디렉터리 밖에 있음** | 같음 |
| 첨부 형식 | jpg·png·jpeg·gif·webp·avif 외에 heic(1), mov(19), mp4(4), pdf(154), xls·xlsx·html 등 | 같음 |
| 인라인 태그 | `#e775`, `#f707` 등 의미 없는 16진수 태그(이전 도구에서 남은 것으로 보임) | `#당근`, `#apple`, `#구매이력` 등 |
| 내부 링크 | `[[…]]` 2개 | — |

## 3. 노트 → 사건 변환 규칙

한 디렉터리가 테마 하나이고, 그 아래(하위 폴더 포함) `.md` 파일 하나가 사건 하나다.

| 사건 필드 | 규칙 |
|---|---|
| `id` | `obs-<vault 기준 상대 경로 SHA-1 앞 12자>`. 노트 이름에 한글이 있어 id 규칙(`[a-z0-9-]`)으로 바로 쓸 수 없고, 경로가 같으면 항상 같은 id가 나와야 한다. 파일 이름을 바꾸면 다른 사건이 되지만(삭제 후 추가), 읽기 전용 미러라 문제없다 |
| `date` | ① frontmatter `date` → ② 파일 이름 앞의 `YYYY-MM-DD` / `YYYY-MM` / `YYYY` → ③ 없으면 **동기화하지 않고 보고**(이슈 2). `created`는 노트를 만든 날이라 사건 날짜로 쓰지 않는다 |
| `title` | frontmatter `title` → 없으면 파일 이름. 두 경우 모두 앞의 날짜 표기를 뗀다(`"2002-02 일본 도쿄"` → `"일본 도쿄"`) |
| `description` | frontmatter `description` 또는 `summary` → 없으면 본문에서 제목·표·이미지·태그만 있는 줄·구분선을 뺀 첫 문단의 일반 텍스트(최대 140자) → 그래도 없으면 제목 |
| `body` | frontmatter를 뺀 Markdown 원문. 이미지·첨부 경로는 서버 제공 경로로 바꾼다. `bodyFormat: "markdown"`으로 표시해 화면이 Markdown으로 렌더링한다(이슈 3) |
| `tags` | frontmatter `tags` + 본문 인라인 `#태그`. 소스별 "무시할 태그" 목록에 있는 태그는 제외한다(이슈 6). 앞뒤 공백·중복 정리는 기존 규칙과 같다 |
| `media` | 본문에서 처음 나오는 이미지 1개만. 카드 대표 이미지용이다. 나머지 이미지는 본문에 인라인으로 보인다(이슈 4) |
| `sourceUrl` | frontmatter `url`이 `https`면 사용 |
| 기타 frontmatter | `price` 등 알려지지 않은 키는 본문 맨 위에 작은 속성 표로 보여 준다. `created`, `updated`, `allDay`, `title`, `date`, `tags`, `url`은 제외 |
| 제외 | 이름이 `.`으로 시작하는 파일·폴더, `.md`가 아닌 파일 |

변환한 사건은 기존 규격 검증(`parseTimelineData`)을 통과해야 한다. 통과하지 못한 노트는 건너뛰고, 설정 화면의 동기화 보고에 경로와 이유를 보여 준다.

### 첨부 파일 경로

- 노트의 상대 경로(`../../_attachments/image/a.png`)를 노트 위치 기준으로 풀어 vault 기준 경로(`_attachments/image/a.png`)로 만든다. vault 밖으로 나가면 무시한다.
- 서버 제공 경로는 `vault/<URL 인코딩한 vault 기준 경로>`이며, API 기준 상대 경로라 브라우저에서는 `/api/vault/…`가 된다. 기존 `media/<hash>`와 같은 방식이다.
- 형식별 처리:
  - 브라우저가 표시할 수 있는 이미지(jpg·jpeg·png·gif·webp·avif·svg): 이미지로 보여 준다.
  - heic·pdf·mov·mp4·xls 등: 이미지 대신 파일 이름 링크로 바꾼다(이슈 9).
  - 외부 `https` 이미지: 그대로 둔다.

## 4. 설계

### 4.1 구성

```text
compose.yaml
  volumes:
    - /home/kyo/syncthing/obsidian/personal:/vault:ro     # 신규, 읽기 전용
  environment:
    VAULT_DIR: /vault

chrono 컨테이너
  ├─ 동기화 엔진 (server 프로세스 안)
  │    ├─ 시작 시 모든 소스를 전체 동기화
  │    ├─ 소스 디렉터리 fs.watch(recursive) → 2초 debounce 후 해당 소스 재동기화
  │    └─ 5분마다 전체 재검사 (감시 이벤트 누락 대비)
  ├─ SQLite: sync_sources 테이블, themes·items 확장
  └─ GET /api/vault/<path>  ← 동기화된 노트가 참조하는 파일만 제공
```

- **감시 대상:** Node 22는 Linux에서 `fs.watch(dir, { recursive: true })`를 지원한다. bind mount도 같은 커널의 inotify 이벤트를 받는다. Syncthing은 임시 파일(`.syncthing.*.tmp`)을 쓴 뒤 rename하므로 `.md`가 아닌 이벤트는 무시하고 debounce한다.
- **동기화 방식:** 소스마다 "원하는 상태(노트에서 만든 사건 목록)"와 DB의 해당 테마 사건을 비교해, 추가·변경·삭제를 한 트랜잭션으로 반영한다(미러). 바뀐 것이 있을 때만 `revision`을 올려, 열린 화면이 5초 안에 갱신된다.
- **첨부 파일:** 4.9GB를 복사하지 않고 vault에서 바로 제공한다. 그래서 첨부 파일만 바뀌어도(같은 경로) 재동기화가 필요 없다.

### 4.2 데이터 모델 변경 (스키마 v3)

```sql
CREATE TABLE sync_sources (
  theme_id    TEXT PRIMARY KEY REFERENCES themes(id) ON DELETE CASCADE,
  vault_path  TEXT NOT NULL UNIQUE,   -- vault 기준 디렉터리, 예: "여행"
  created_at  TEXT NOT NULL,
  synced_at   TEXT,                   -- 마지막 동기화 완료 시각
  ignore_tags TEXT NOT NULL DEFAULT '[]', -- JSON: 이 소스에서 무시할 태그
  report      TEXT                    -- JSON: { notes, synced, skipped: [{ path, reason }] }
);
CREATE TABLE sync_files (             -- /api/vault가 제공해도 되는 파일 목록
  theme_id    TEXT NOT NULL REFERENCES themes(id) ON DELETE CASCADE,
  vault_path  TEXT NOT NULL,
  PRIMARY KEY (theme_id, vault_path)
);
ALTER TABLE items ADD COLUMN body_format TEXT NOT NULL DEFAULT 'text';  -- 'text' | 'markdown'
```

- `sync_sources`에 행이 있는 테마가 "Obsidian 테마"이며 읽기 전용이다.
- 화면 API(`/api/timeline`)의 테마에는 `source: "obsidian"`, 사건에는 `bodyFormat: "markdown"`을 추가한다. `parseTimelineData`는 두 필드를 선택 필드로 받는다.

### 4.3 날짜 규격 확장: `YYYY-MM`

- 여행 노트 대부분이 월까지만 있다. 지금 규격(`YYYY`, `YYYY-MM-DD`)으로는 `YYYY`로 줄여 월 정보를 잃는다.
- **권장:** 규격 전체에 `YYYY-MM`을 추가한다.
  - `isValidDate` 확장
  - 화면 표시: "2월"
  - 날짜 편집 폼: 일만 비우는 것도 허용
  - 정렬은 문자열 비교 그대로(`"2024-05"` < `"2024-05-01"`)
- 영향 범위:
  - `src/data.ts`, `App.tsx`의 `monthDay`와 `DateEditor`
  - HOWTO, `API_SPEC.md`
  - 내부 API 날짜 필터 설명(이미 앞부분 비교라 동작은 맞음)

### 4.4 설정 페이지

- **라우팅:** 라이브러리 없이 `history.pushState`와 `popstate`로 `/`와 `/settings`를 전환한다.
  - 운영 서버는 `/settings`에 파일이 없어 지금은 404이므로, `index.html`을 돌려주도록 서버에 경로를 추가한다.
  - Vite 개발 서버는 이미 이렇게 동작한다.
- **진입과 복귀:**
  - LNB 상단 다크 모드 버튼 옆의 설정 아이콘(lucide `settings`)으로 들어간다. 설정 화면에서는 아이콘이 선택 상태로 보인다.
  - LNB의 테마나 "전체"를 누르면 타임라인(`/`)으로 돌아간다. 설정으로 들어갈 때 상세 패널은 닫는다.
- **화면 구성** (디자인 시스템 컴포넌트와 토큰 사용):
  1. **데이터 가져오기:** import(기존과 같은 dry-run → 확인 흐름), reset
  2. **Obsidian 동기화**
     - vault 연결 상태를 보여 준다. `VAULT_DIR`이 없으면 "vault가 마운트되지 않았습니다"를 표시한다.
     - 소스 목록은 테마 이름, vault 경로, 사건 수, 마지막 동기화 시각, 건너뛴 노트 수로 구성한다. 건너뛴 노트는 펼쳐서 경로와 이유를 본다.
     - 목록의 각 행에서 "지금 동기화", "무시할 태그" 편집, "삭제"를 할 수 있다.
     - **추가:** vault 디렉터리 선택기(폴더만 탐색, `.`으로 시작하는 폴더와 `_attachments` 제외)와 테마 이름(기본값은 폴더 이름)으로 구성한다. 추가하면 즉시 첫 동기화를 하고 결과를 보여 준다.
- **모바일:** 설정 아이콘을 두지 않는다. 모바일에서 `/settings`로 직접 들어오면 "설정은 데스크톱에서 사용할 수 있습니다"를 보여 준다. 편집 기능을 모바일에서 제공하지 않는 방침과 같다.

### 4.5 API (브라우저용, 쓰기는 기존과 같은 `X-Chrono-Edit` 확인)

| 메서드 | 경로 | 설명 |
|---|---|---|
| GET | `/api/settings/vault` | `{ mounted, dirs }`. `?path=`로 하위 폴더 목록 |
| GET | `/api/settings/sources` | 소스 목록과 동기화 보고 |
| POST | `/api/settings/sources` | `{ path, name, ignoreTags? }` → 테마 생성과 첫 동기화 |
| PATCH | `/api/settings/sources/{themeId}` | `{ name?, ignoreTags? }` → 저장 후 재동기화 |
| POST | `/api/settings/sources/{themeId}/sync` | 즉시 재동기화 |
| DELETE | `/api/settings/sources/{themeId}` | 소스 해제. 테마와 사건을 DB에서 삭제한다(vault는 건드리지 않음) |
| GET | `/api/vault/{path}` | 동기화된 노트가 참조하는 파일만 제공 |
| POST | `/api/import`, `/api/reset` | 기존 그대로(호출 위치만 설정 화면으로 이동) |

## 5. 이슈와 대응

### 이슈 1 (높음) — vault 전체 노출 위험

첨부가 테마 디렉터리 밖(`_attachments`)에 있어 vault 전체를 마운트해야 한다. vault에는 `기록`, `AS이력` 등 동기화하지 않을 개인 노트도 있다.

- `/api/vault/`는 `sync_files`에 등록된 파일만 제공한다. 동기화한 노트가 실제로 참조하는 파일만 여기에 들어간다.
- 요청 경로는 `realpath`로 vault 안인지 다시 확인한다. 심볼릭 링크로 vault 밖을 가리키는 경우를 막기 위해서다.
- 폴더 선택기는 폴더 이름만 보여 주고 파일 내용은 읽지 않는다.
- 파일은 `no-cache` + ETag로 제공한다. vault 파일은 같은 경로에서 내용이 바뀔 수 있어 영구 캐시를 쓰지 않는다. SVG에는 기존과 같이 `sandbox` CSP를 붙인다.

### 이슈 2 (높음) — 날짜가 없는 노트

예제에서 4개(`기타`, `중국 하이난`, `Fujifilm S5Pro`, `HP 2311F LED Monitor`)가 파일 이름과 frontmatter 어디에도 날짜가 없다.

- **권장:** 동기화하지 않고, 설정 화면에 "날짜 없음"으로 보고한다. 사용자가 Obsidian에서 frontmatter `date`를 추가하면 자동으로 들어온다.
- **대안:** 상위 폴더 이름이 연도면 그 연도를 쓴다. 예제의 날짜 없는 노트는 모두 최상위에 있어 도움이 되지 않으므로 기본값으로 두지 않는다.

### 이슈 3 (높음) — Markdown 본문 렌더링

본문에 표·제목·목록·굵게가 많아, 지금처럼 일반 텍스트(줄바꿈만 반영)로 보여 주면 읽기 어렵다.

- **권장:** `bodyFormat: "markdown"`인 사건만 Markdown으로 렌더링한다.
  - 라이브러리는 `micromark` + `micromark-extension-gfm`(표, 취소선, 작업 목록)을 쓴다. 약 30KB(gzip)이다.
  - micromark는 원시 HTML을 기본적으로 이스케이프하고, `javascript:` 같은 위험한 링크를 걸러낸다. 그래서 노트에 HTML이 있어도 실행되지 않는다.
  - `[[내부 링크]]`는 일반 텍스트로 바꾼다.
  - 기존 사건(`bodyFormat: "text"`)은 지금처럼 일반 텍스트로 둔다.
- 새 의존성이 생긴다. 직접 파서를 만드는 것보다 안전하고 작다.

### 이슈 4 (높음) — 노트당 이미지 수와 미디어 5개 제한

노트당 이미지가 최대 76장이다. 사건 미디어는 최대 5개다.

- **권장:**
  - `media`에는 첫 이미지 1개만 넣는다(카드 대표 이미지).
  - 모든 이미지는 Markdown 본문 안에서 원래 위치에 인라인으로 보인다.
  - 상세 패널은 Markdown 사건일 때 별도 미디어 블록을 그리지 않는다. 대표 이미지가 본문에도 있어 두 번 보이는 것을 막기 위해서다.
  - 5개 제한 규칙은 바꾸지 않는다.
- 본문 이미지는 `loading="lazy"`로 불러온다.

### 이슈 5 (높음) — 기존 `travel` 테마와 중복

현재 DB의 `travel` 테마(사건 29개)는 이 `여행` 노트들로 만든 `data.json`을 import한 것이다. `여행`을 동기화하면 같은 여행이 두 번 보인다.

- **권장:** `여행` 소스를 추가하고 확인한 뒤, 브라우저 편집 모드에서 기존 `travel` 테마를 삭제한다.
  - 기존 데이터에서 손으로 다듬은 요약(`description`)은 옮겨지지 않는다. 옮기려면 Obsidian 노트 frontmatter에 `description`을 추가해야 한다.
  - 이 절차를 운영 가이드에 적는다.

### 이슈 6 (중간) — 의미 없는 인라인 태그

`#e775`(1개 노트), `#f707`(8개 노트) 같은 의미 없는 태그가 있다. 그런데 "16진수로만 된 태그 제외" 규칙을 쓰면, 같은 모양의 **실제 태그 `#d200`, `#d600`(니콘 D200·D600 카메라)도 함께 사라진다**(예제에서 확인).

- **권장:** 규칙으로 추측하지 않는다. 소스마다 **무시할 태그 목록**을 설정 화면에서 입력받는다. `여행`을 추가할 때는 발견된 태그 목록을 보여 주고, 사용자가 `e775`, `f707`을 골라 넣는다.

### 이슈 7 (결정됨) — 민감 정보

여행 노트 본문에 예약번호·PIN, 주소, 전화번호, 결제 금액이 있다. 동기화하면 이 정보가 화면(Nginx 인증 뒤)에 나온다.

- **결정(2026-09-30):** 가리지 않고 노트 내용을 그대로 보여 준다. 화면은 Nginx 로그인 뒤에서만 볼 수 있기 때문이다. 노트 제외 기능(`chrono: false`)도 두지 않는다.
- 내부 API는 로그인 없이 호출할 수 있으므로 Obsidian 데이터를 아예 제공하지 않는다(이슈 13). export도 Obsidian 테마를 포함하지 않는다. 원본은 vault에 있고, 다시 import하면 id가 겹쳐 거부되기 때문이다.

### 이슈 8 (결정됨) — 읽기 전용의 범위

Obsidian 사건을 화면에서 수정해도 다음 동기화 때 노트 내용으로 되돌아간다.

- **결정(2026-09-30):** Obsidian 테마와 사건은 **수정과 삭제 모두** 막는다(완전 읽기 전용).
  - **화면:** 편집 허용 상태여도 해당 테마와 사건에는 휴지통과 편집 아이콘을 보여 주지 않는다. 대신 "Obsidian" 배지를 보여 준다.
  - **서버:**
    - 브라우저 편집 API의 수정·삭제·업로드는 `403 read_only`로 거부한다.
    - 내부 API에서는 Obsidian 테마가 아예 없는 것처럼 동작한다(이슈 13).
    - import에서 Obsidian 테마 id와 겹치면 검증 오류로 처리한다.
    - reset은 Obsidian 테마를 지우지 않는다. 지워도 다음 동기화 때 다시 생기므로, 로컬 데이터만 지운다.
  - Obsidian 테마를 없애는 유일한 방법은 설정 화면에서 소스를 삭제하는 것이다.
- 마지막 사건을 지우면 테마도 지우는 기존 동작은 Obsidian 테마에 적용하지 않는다. 노트가 모두 건너뛰어져 사건이 0개여도 소스와 테마는 남고, 화면에만 나오지 않는다.

### 이슈 9 (중간) — 브라우저가 표시할 수 없는 첨부

heic(Safari 외 미지원), mov·mp4(재생 위치 이동에 HTTP Range 필요, 서버 미지원), pdf·xls 등이 있다.

- **권장:** 이미지 외 첨부는 파일 이름 링크로 보여 주고, 누르면 새 탭에서 연다.
- 동영상을 재생하려면 서버에 Range 요청 지원을 추가해야 하므로 이번 범위에서 뺀다.

### 이슈 10 (중간) — 실시간 감시의 한계

- 감시 이벤트가 누락되거나 inotify 한도(`fs.inotify.max_user_watches`)에 걸릴 수 있다. 5분마다 전체 재검사하는 것으로 보완한다.
- 컨테이너가 시작하면 모든 소스를 전체 동기화한다.
- 한 소스의 동기화는 한 번에 하나만 실행한다. 진행 중에 이벤트가 오면 끝난 뒤 한 번 더 실행한다.
- 노트 하나의 변환 오류는 그 노트만 건너뛴다. import처럼 전체를 거부하면 한 노트의 실수로 동기화 전체가 멈추기 때문이다.

### 이슈 11 (낮음) — 이미지 용량과 성능

원본 사진(수 MB)을 그대로 보내서 카드 대표 이미지도 무겁다. 썸네일을 만들려면 `sharp` 같은 네이티브 모듈이 필요해 이번 범위에서 뺀다. 카드와 본문 이미지는 lazy loading에 의존한다.

### 이슈 12 (낮음) — 설정 화면의 권한

설정 화면의 import, reset, 소스 추가·삭제는 데이터를 바꾸는 작업이다.

- **권장:** 설정 화면은 언제든 볼 수 있다. 쓰기 버튼은 LNB의 편집 허용이 켜져 있을 때만 활성화한다. 기존 안전 모델과 같다.

### 이슈 13 (결정됨) — 내부 API에서 Obsidian 데이터 차단

- **결정(2026-09-30):** 내부 API(`/internal/v1`)로는 vault에서 동기화한 테마와 사건을 **조회·추가·수정·삭제할 수 없다.**
- **구현 방식:** 내부 API에서는 Obsidian 테마가 존재하지 않는 것처럼 동작한다.

| 요청 | Obsidian 테마일 때 응답 |
|---|---|
| `GET /themes` | 목록에서 제외 |
| `GET /themes/{id}`, `GET …/items`, `GET …/items/{itemId}` | `404 not_found` |
| `POST …/items`, `PATCH …/items/{itemId}`, `POST …/media` | `404 not_found` |
| `POST /themes`에 같은 id | `409 already_exists` (id 충돌은 피할 수 없어 존재만 드러남) |

- **`404`로 통일한 이유:** `403`은 해당 테마가 있다는 사실과 성격을 알려 준다. 호출하는 쪽(LLM 포함)이 "막혀 있는 데이터"를 우회하려 시도하지 않게 하려는 것이다.
- **적용 위치:** `store.mjs`에 "Obsidian 테마 여부" 확인 하나를 두고, `internal-api.mjs`의 모든 경로에서 테마를 찾을 때 거친다. 목록 함수(`listThemes`)는 내부 API용 호출에서 Obsidian 테마를 빼고 반환한다.
- **테스트:** Obsidian 테마를 만든 뒤 내부 API의 모든 엔드포인트에서 목록 제외와 `404`를 확인한다.

## 6. 개발 단계

1. **규격 확장:** `YYYY-MM` 날짜, `bodyFormat`, 테마 `source`, 스키마 v3. 기존 데이터·테스트 호환을 확인한다.
2. **설정 페이지 골격:** 라우팅(`/settings`, 서버 fallback), 설정 아이콘, import·reset 이동, 모바일 안내.
3. **노트 변환기** (`obsidian.mjs`): frontmatter 파싱, 날짜·제목·요약·태그·첨부 경로 규칙.
   - 테스트는 예제와 같은 구조의 **가짜 vault 픽스처**로 한다. 실제 vault는 테스트에 쓰지 않는다.
   - frontmatter는 `key: value` 한 줄 형식만 지원하는 최소 파서로 시작한다. 예제의 키가 모두 이 형식이다.
4. **동기화 엔진:** 소스 관리 API, 미러 동기화 트랜잭션, 보고, `fs.watch` + debounce + 주기 검사, `/api/vault` 제공과 `sync_files`.
5. **화면:** 소스 목록·추가(폴더 선택기)·삭제·재동기화·보고, Markdown 렌더링, 읽기 전용 표시(배지, 편집 컨트롤 숨김).
6. **읽기 전용·비공개 강제:** 브라우저 편집 API(`403 read_only`), 내부 API(Obsidian 테마 숨김, 이슈 13), import, reset, export. `API_SPEC.md`에 `YYYY-MM` 날짜와 "vault에서 동기화한 테마는 이 API에 나오지 않는다"를 추가한다.
7. **운영 반영:** compose 볼륨·환경 변수, README 절차, 기존 `travel` 테마 정리 가이드.

완료 조건: vault의 `여행` 노트를 고치면 열린 화면에 수 초 안에 반영된다. 편집 허용 상태에서도 Obsidian 테마와 사건은 수정·삭제할 수 없다. 동기화하지 않은 vault 파일은 `/api/vault/`로 받을 수 없다. 내부 API로는 Obsidian 테마와 사건을 조회·등록·수정할 수 없다.

## 7. 결정이 필요한 사항

권장안을 기본값으로 진행한다.

| # | 항목 | 권장안 |
|---|---|---|
| 1 | `YYYY-MM` 날짜 지원 | 규격 전체에 추가 |
| 2 | 날짜 없는 노트 | 동기화하지 않고 설정 화면에 보고 |
| 3 | Markdown 렌더링 | Obsidian 사건만 `micromark`+GFM으로 렌더링(새 의존성) |
| 4 | 이미지 | 대표 이미지 1개는 `media`, 나머지는 본문 인라인 |
| 5 | Obsidian 사건 권한 | **확정:** 수정·삭제 모두 불가(완전 읽기 전용) |
| 6 | 의미 없는 태그(`#e775`, `#f707`) | 소스별 "무시할 태그" 목록으로 제외(16진수 규칙은 `#d200` 같은 실제 태그까지 지워서 쓰지 않음) |
| 7 | 민감 정보 | **확정:** 가리지 않음. 노트 제외 기능 없음(로그인 뒤에서만 조회) |
| 8 | 내부 API의 Obsidian 데이터 | **확정:** 조회·추가·수정·삭제 모두 불가. 테마가 없는 것처럼 `404` (이슈 13) |
| 9 | reset 범위 | 로컬 데이터만 삭제, Obsidian 테마는 유지 |
| 10 | 설정 화면 쓰기 권한 | 편집 허용이 켜져 있을 때만 |
| 11 | 이미지 외 첨부(pdf·mov·heic 등) | 파일 이름 링크 |
| 12 | 기존 `travel` 테마 | 동기화 확인 후 사용자가 직접 삭제 |

## 8. 구현 결과와 계획 대비 변경점

- **파일 구성:**
  - `obsidian.mjs`(신규): 노트 변환 `convertNote`, 동기화 엔진 `createSyncer`
  - `server.mjs`: 설정 API, `/api/vault`, `/settings` 경로
  - `store.mjs`: 스키마 v3, 읽기 전용 강제, reset·export·import 제외
  - `internal-api.mjs`: Obsidian 테마 숨김
  - `src/App.tsx`: 설정 화면, Markdown 렌더링, 읽기 전용 표시
  - `src/data.ts`: `YYYY-MM`, `source`, `bodyFormat`
- **유니코드 정규화(계획에 없던 이슈):** vault의 폴더·파일 이름은 macOS에서 만들어져 NFD(자모 분리)다. 노트 내용은 NFC다.
  - 화면에 보이는 글자(제목, 테마 이름, 태그, 보고 경로)와 사건 id는 NFC로 맞췄다. 그래서 검색이 되고, 서버 OS가 바뀌어도 id가 같다.
  - 파일은 실제 이름으로 찾는다. 노트에 적힌 첨부 경로가 NFC이고 실제 파일이 NFD여도(Linux에서는 둘이 다른 파일 이름) 둘 다 시도해서 찾는다.
- **vault 파일 응답:** 이미지·PDF·동영상은 바로 열린다. html·xlsx 등 그 밖의 형식은 `Content-Disposition: attachment` + `application/octet-stream`으로 다운로드만 된다. vault의 html이 앱과 같은 출처에서 실행되지 않게 하기 위해서다.
- **소스 해제:** 테마를 지우면 사건·`sync_sources`·`sync_files`가 FK cascade로 함께 지워진다. 감시도 멈춘다.
- **디렉터리를 못 찾을 때:** 마운트 해제 등으로 디렉터리를 못 찾으면 기존 사건을 지우지 않는다. 보고에 오류만 남긴다(`report.error`).
- **새 의존성:** `micromark` 4.0.3, `micromark-extension-gfm` 3.0.0(클라이언트 번들 약 +28KB gzip). 서버 런타임에는 추가 의존성이 없다.
- **검증:**
  - `npm test` 18개: 가짜 vault 픽스처로 변환 규칙, 동기화 미러, 파일 감시 반영, 읽기 전용, 내부 API 숨김, vault 파일 제공 범위, reset·export·import 제외, NFD 파일 이름을 확인했다.
  - 실제 vault는 읽기만 하는 임시 저장소로 브라우저에서 확인했다. `여행` 31개 중 29개 동기화(날짜 없는 2개 건너뜀), `구매이력` 188개 중 186개 동기화, Markdown 표·제목, 노트 한 개의 이미지 76장, PDF 링크가 정상이었다.
  - 컨테이너 빌드와 서버(Linux)의 inotify 감시는 이 환경에 Docker가 없어 검증하지 못했다.

### 8.1 후속 변경 (2026-09-30)

- **편집 허용 스위치와 분리:** 설정 화면의 모든 작업(import, reset, 동기화 추가·해제·재동기화, 무시할 태그)은 편집 허용 스위치와 무관하게 쓸 수 있다. 이슈 12의 결정을 바꿨다. 스위치는 타임라인의 사건·테마 편집에만 쓴다. 되돌릴 수 없는 작업은 확인 창으로 보호한다.
- **데이터 초기화 카드:** reset을 "데이터 가져오기"에서 분리해 별도 카드로 두었다.
- **디렉터리 선택:** 폴더 하나씩 들어가는 방식 대신, vault 아래 3단계까지의 디렉터리 트리를 목록으로 보여 주고 골라서 동기화한다(`GET /api/settings/vault` → `{ dirs: [{ name, path, depth }] }`).
- **중첩 금지:** 이미 동기화 중인 디렉터리와 같거나 상위·하위 관계인 디렉터리는 목록에서 비활성화하고 이유를 보여 준다. 서버도 같은 규칙으로 `409`를 돌려준다(NFC/NFD 차이 무시). 3단계보다 깊은 디렉터리는 `400`이다.
