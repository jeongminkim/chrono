# 데이터 저장소 전환 개발 계획 (JSON 파일 → SQLite)

> 작성일: 2026-09-29  
> 상태: 구현 완료 (2026-09-29). 11장의 결정 사항 반영, 컨테이너 빌드는 미검증  
> 관련 문서: [PROJECT_PLAN.md](PROJECT_PLAN.md) — 이 계획이 완료되면 3·5·7장의 데이터 흐름, 규격, Docker 구성을 대체한다.

## 1. 배경과 목표

지금은 호스트의 `data/data.json`과 `data/images/`를 컨테이너에 읽기 전용으로 마운트하고, 브라우저가 이 파일을 직접 받아 화면을 그린다. 원본 파일이 곧 운영 데이터다.

바뀐 정책은 다음과 같다.

| 구분 | 현재 | 변경 후 |
|---|---|---|
| 운영 데이터 | `data/data.json` | 컨테이너 볼륨의 SQLite DB |
| 첨부 이미지 | `data/images/*` (호스트) | 컨테이너 볼륨의 미디어 디렉터리 |
| `data.json`과 이미지의 역할 | 운영 원본 | **import 입력물**, import 후 삭제 |
| 디렉터리 이름 | `data/` | `import/` |
| 화면이 읽는 곳 | `GET /chrono/data/data.json` | `GET /chrono/api/timeline` |

목표:

- `import/`의 `data.json`과 이미지를 검증해 SQLite와 컨테이너 미디어 경로로 옮기는 import 명령을 만든다.
- import가 성공하면 `import/`의 `data.json`과 이미지를 지워도 화면이 그대로 동작한다.
- 화면 기능과 디자인은 바꾸지 않는다. 클라이언트는 데이터를 받는 주소만 바뀐다.
- 원본을 지운 뒤에도 데이터를 백업·수정할 수 있도록 export 명령을 둔다.

### 제외 범위

- 관리자 화면, 로그인, 화면에서의 데이터 편집
- 서버 측 검색·페이지네이션 (데이터 규모상 지금처럼 클라이언트에서 처리)
- 로컬 동영상 파일 저장 (현재 규격과 동일하게 `https` URL만 허용)

## 2. 핵심 설계 결정

| 항목 | 결정 | 이유 |
|---|---|---|
| DB 엔진 | Node.js 내장 `node:sqlite` (`DatabaseSync`) | 의존성 추가 없음. Node 22.13부터 플래그 없이 사용 가능하며, 현재 이미지(`node:22.22-alpine`)에서 바로 사용할 수 있다 |
| 저장 위치 | Docker named volume `chrono-store` → 컨테이너 `/var/lib/chrono` | "컨테이너 내부 경로"를 쓰되 컨테이너를 다시 빌드해도 데이터가 남아야 한다. 이미지 레이어에 두면 재배포 때 사라진다 |
| 미디어 파일명 | 내용의 SHA-256 해시 + 확장자 (`media/3fa9….webp`) | 중복 제거, 파일명 충돌 방지, 영구 캐시(`immutable`) 가능 |
| import 방식 | 기본은 **항목 단위 upsert**. `--replace` 옵션을 주면 파일에 포함된 테마를 통째로 교체 | 원본을 지우는 운영이라, 전체 교체가 기본이면 부분 파일을 import했을 때 기존 데이터가 사라진다 |
| 검증 | 기존 `parseTimelineData`(`src/data.ts`)를 그대로 재사용 | 규격을 한 곳에서만 관리 |
| API 응답 형식 | 지금의 `data.json` version 1 구조 그대로 | 클라이언트 파싱·검증·화면 코드를 바꾸지 않는다 |
| 원본 삭제 | import가 커밋되면 `data.json`과 import한 이미지를 **자동 삭제**. `--dry-run`은 아무것도 바꾸지 않는다 | 운영자 결정(11장). 삭제 후에는 DB가 유일한 사본이므로 export 백업을 README에 안내 |

### 대안과 보류 이유

- **`better-sqlite3`:** 안정성이 검증됐지만 네이티브 모듈이라 Alpine 빌드에 컴파일 도구가 필요하다. `node:sqlite`가 ExperimentalWarning 이상의 문제를 일으킬 때 전환한다.
- **서버 쪽 전체 교체 import:** 운영 편의는 좋지만 데이터 유실 위험이 커서 옵션(`--replace`)으로만 제공한다.

## 3. 변경 후 구조

```text
사용자 브라우저
  └─ 기존 Nginx
      └─ chrono:3000 (앱 컨테이너)
          ├─ /chrono/, /chrono/assets/*     ← Vite 빌드 결과 (이미지 내부)
          ├─ /chrono/api/timeline           ← SQLite 조회 결과 (JSON, version 1)
          └─ /chrono/api/media/<hash>.<ext> ← 볼륨의 미디어 파일

컨테이너 볼륨 chrono-store:/var/lib/chrono
  ├─ chrono.db (+ -wal, -shm)
  └─ media/<sha256>.<ext>

호스트 ./import → 컨테이너 /import (원본 자동 삭제를 위해 쓰기 가능, import 할 때만 사용)
  ├─ HOWTO_MAKE_DATA.md   ← 계속 유지
  ├─ data.json            ← import 후 삭제
  └─ images/*             ← import 후 삭제
```

### 데이터 흐름

1. 운영자가 `import/`에 `data.json`과 이미지를 둔다.
2. `docker compose run --rm chrono node store.mjs import /import`를 실행한다.
3. import 명령이 JSON과 이미지를 검증하고, 이미지를 해시 이름으로 볼륨에 복사한 뒤 한 트랜잭션으로 DB에 기록한다.
4. 서버는 `/chrono/api/timeline` 요청이 오면 DB를 읽어 version 1 JSON으로 응답한다. 로컬 이미지 경로는 `media/<hash>.<ext>`(API 기준 상대 경로)로 바꿔서 내보낸다.
5. 브라우저는 지금처럼 5초마다 조건부 요청을 보낸다. 데이터가 바뀌지 않았으면 서버가 ETag로 304를 돌려준다.
6. import 명령이 `data.json`과 import한 이미지를 삭제한다. 운영자는 화면을 확인하고 export로 백업한다.

### 미디어 경로가 그대로 동작하는 이유

클라이언트는 이미 `new URL(src, dataUrl)`로 미디어 경로를 데이터 주소 기준으로 해석한다. 그래서 API가 `media/3fa9….webp`를 돌려주면 브라우저에서 `/chrono/api/media/3fa9….webp`가 된다. 이 값은 현재 `parseTimelineData`의 상대 경로 규칙(`/`로 시작하지 않음, `..` 없음)도 통과한다. 클라이언트에서 바꿀 것은 `dataUrl` 한 줄뿐이다.

## 4. DB 스키마

화면이 쓰는 데이터를 통째로 받아가고 검색도 클라이언트에서 하므로, 태그와 미디어는 JSON 문자열 컬럼에 둔다. 정규화는 실제로 서버 쪽 조회가 필요해질 때 한다.

```sql
PRAGMA journal_mode = WAL;      -- import 중에도 서버가 읽을 수 있게
PRAGMA foreign_keys = ON;

CREATE TABLE meta (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);                                -- schema_version, revision(ETag용)

CREATE TABLE themes (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  sort_order INTEGER NOT NULL
);

CREATE TABLE items (
  theme_id    TEXT NOT NULL REFERENCES themes(id) ON DELETE CASCADE,
  id          TEXT NOT NULL,
  date        TEXT NOT NULL,
  title       TEXT NOT NULL,
  description TEXT NOT NULL,
  body        TEXT,
  tags        TEXT NOT NULL DEFAULT '[]',  -- JSON 배열
  media       TEXT,                        -- JSON 객체, 로컬 파일은 "media/<hash>.<ext>"
  source_url  TEXT,
  updated_at  TEXT NOT NULL,
  PRIMARY KEY (theme_id, id)
);
```

- `revision`은 import가 커밋될 때마다 1씩 올린다. 서버는 이 값으로 ETag를 만든다(`"rev-<n>"`).
- `schema_version`은 서버 시작과 import 때 확인한다. 스키마를 바꿀 때는 `store.mjs`에 순차 마이그레이션을 추가한다.

## 5. import 명령 상세

```bash
docker compose run --rm chrono node store.mjs import /import [--dry-run] [--replace]
```

처리 순서:

1. `/import/data.json`을 읽고 `parseTimelineData`로 검증한다. 실패하면 즉시 종료하고, DB와 볼륨은 건드리지 않는다.
2. `media.src`와 `media.poster` 중 로컬 경로를 모두 확인한다.
   - `/import` 밖으로 나가는 경로는 거부한다. 기존 규칙에 더해 `realpath`로 심볼릭 링크도 확인한다.
   - 파일이 있어야 한다.
   - 확장자는 `webp`, `avif`, `png`, `jpg`, `jpeg`, `gif`, `svg`만 허용한다.
   - 파일 하나당 10MB 이하여야 한다.
3. `--dry-run`이면 여기서 검증 결과와 변경 예정 건수만 출력하고 끝낸다.
4. 이미지를 SHA-256으로 해싱해 `media/<hash>.<ext>`로 복사한다. 임시 파일에 쓴 뒤 rename하고, 같은 해시가 이미 있으면 건너뛴다.
5. 한 트랜잭션 안에서 다음을 처리한다.
   - 테마: id 기준 upsert. 새 테마는 기존 테마 뒤에 붙고, 기존 테마의 순서는 유지한다.
   - 항목: `(theme_id, id)` 기준 upsert. 로컬 미디어 경로는 해시 경로로 바꿔 저장한다.
   - `--replace`: 파일에 포함된 테마마다 파일에 없는 항목을 삭제한다. 파일에 없는 테마는 그대로 둔다.
   - `revision`을 1 올린다.
6. 커밋 후 어떤 항목도 참조하지 않는 `media/` 파일을 삭제한다.
7. `data.json`과 import한 이미지 파일을 삭제하고, 비게 된 하위 디렉터리를 정리한다. 참조되지 않은 파일과 `HOWTO_MAKE_DATA.md`는 남긴다.
8. 결과를 출력한다: 항목의 추가/변경/삭제 수, 복사한 이미지 수, 새 revision.

실패 처리:

- 4단계 이후에 실패하면 트랜잭션을 롤백한다. 복사된 미디어 파일은 참조되지 않은 채 남고, 다음 import의 6단계에서 정리된다.
- 서버는 WAL 모드 덕분에 import 중에도 이전 데이터를 계속 제공한다.

## 6. export 명령 (백업·수정용)

원본 JSON을 지우고 나면 DB가 유일한 사본이다. 데이터를 고칠 방법도 export → 수정 → import밖에 없다.

```bash
docker compose run --rm -v "$PWD/export:/export" chrono node store.mjs export /export
```

- `/export/data.json`: DB 전체를 version 1 규격으로 출력한다. 로컬 미디어 경로는 `images/<hash>.<ext>`로 바꾼다.
- `/export/images/`: 참조 중인 미디어 파일을 복사한다.
- 출력물은 그대로 `import/`에 넣어 다시 import할 수 있어야 한다(왕복 보장, 테스트로 확인).

DB 파일 자체의 백업이 필요하면 `VACUUM INTO '/export/chrono.db'`를 쓰는 `backup` 하위 명령을 같은 방식으로 추가한다. 이 기능은 export만으로 부족할 때 넣는다.

## 7. 파일별 변경 계획

| 파일 | 변경 |
|---|---|
| `data/` → `import/` | 디렉터리 이름 변경. `HOWTO_MAKE_DATA.md`는 남기고, `data.json`과 `images/`는 import 후 삭제 대상. 남아 있는 `data copy.json`도 정리 |
| `store.mjs` (신규) | DB 열기·마이그레이션, `readTimeline()`, `importDir()`, `exportDir()`, CLI 진입점(`import`/`export`). `parseTimelineData`는 import·export 경로에서만 동적으로 불러오고, 서버 경로는 `.ts`에 의존하지 않게 한다 |
| `server.mjs` | `/chrono/data/*` 라우트를 제거한다. `GET /chrono/api/timeline`(revision ETag, `no-cache`)과 `GET /chrono/api/media/<hash>.<ext>`(해시 형식 검증, `immutable` 1년 캐시)를 추가한다. `DATA_DIR` 대신 `STORE_DIR`(기본 `/var/lib/chrono`)을 쓴다 |
| `src/App.tsx` | `dataUrl`을 `${BASE_URL}api/timeline`으로 변경. 그 밖에는 변경 없음 |
| `vite.config.ts` | 개발 서버에서 `/chrono/api` 요청을 `localhost:3000`(`npm start`)으로 넘기는 `server.proxy`를 추가 |
| `Dockerfile` | `COPY data /data`와 `DATA_DIR`을 제거. `store.mjs`와 `src/data.ts`를 런타임 이미지에 복사. `/var/lib/chrono`를 만들고 `node` 사용자 소유로 설정(named volume이 이 소유권을 이어받음). `STORE_DIR` 환경 변수 추가 |
| `compose.yaml` | `./data:/data:ro`를 `chrono-store:/var/lib/chrono`와 `./import:/import`(쓰기 가능)로 교체. `volumes: chrono-store:` 선언 추가 |
| `.gitignore` | `import/*`를 무시하되 `!import/HOWTO_MAKE_DATA.md`는 추적. 로컬 개발용 저장소 `.store/`와 `export/`도 무시 |
| `.dockerignore` | `import`, `.store`, `export` 추가 (개인 데이터가 빌드 컨텍스트에 들어가지 않게) |
| `src/server.test.mjs` | 임시 `STORE_DIR`로 API 응답, ETag·304, 미디어 제공, 잘못된 미디어 경로 404를 확인 |
| `src/store.test.mjs` (신규) | 임시 디렉터리로 import(upsert·`--replace`·경로 탈출 거부·파일 누락 실패 시 DB 불변)와 export → import 왕복 결과가 같은지 확인 |
| `package.json` | `test`에 `store.test.mjs` 추가. 로컬용 `import`/`export` 스크립트 추가 |
| `README.md`, `import/HOWTO_MAKE_DATA.md`, `PROJECT_PLAN.md` | 운영 절차와 경로를 새 구조로 수정. PROJECT_PLAN에는 이 문서로 대체된 장을 표시 |

`nginx/chrono-proxy.conf.example`은 `/chrono/` 전체를 프록시하므로 바꾸지 않는다.

### 로컬 개발

```bash
STORE_DIR=.store npm run import -- import   # import/ → .store/
STORE_DIR=.store npm start                   # API 서버 :3000
npm run dev                                  # Vite :5173, /chrono/api는 :3000으로 프록시
```

## 8. 개발 단계

### 1단계 — 저장소 계층 (`store.mjs`)

- `node:sqlite`로 DB 열기, WAL 설정, 스키마 생성과 `schema_version` 확인
- `readTimeline()`: 테마를 `sort_order` 순으로 읽고 version 1 JSON 구조를 만든다
- 단위 테스트: 빈 DB, 테마·항목 조회

완료 조건: 테스트 DB에서 `readTimeline()` 결과가 `parseTimelineData`를 통과한다.

### 2단계 — import 명령

- 5장의 처리 순서, `--dry-run`, `--replace`, 미디어 복사·정리
- 테스트: 정상 import, 재import 시 upsert, `--replace` 삭제, 경로 탈출·확장자·용량 거부, 실패 시 DB와 revision 불변

완료 조건: 현재 `data/data.json`(여행 테마)을 import한 결과를 export하면 원본과 내용이 같다(미디어 경로만 다름).

### 3단계 — 서버 API 전환

- `/chrono/api/timeline`, `/chrono/api/media/*` 추가, `/chrono/data/*` 제거
- ETag 304, 캐시 헤더, 해시 형식이 아닌 미디어 요청의 404 확인

완료 조건: `server.test.mjs`가 새 경로로 통과한다.

### 4단계 — 클라이언트·개발 환경

- `dataUrl` 변경, Vite 프록시 추가
- 브라우저 확인: 목록, 상세 패널, 로컬 이미지, YouTube, 5초 자동 갱신(import 후 반영)

완료 조건: import 후 새로고침 없이 5초 안에 화면에 반영된다.

### 5단계 — export

- 6장의 export 명령과 왕복 테스트

완료 조건: export 결과를 빈 DB에 import하면 같은 화면이 나온다.

### 6단계 — 컨테이너·디렉터리 전환과 문서

- `data/` → `import/` 이름 변경, Dockerfile·compose·ignore 파일 수정
- README, HOWTO, PROJECT_PLAN 갱신

완료 조건: 새 환경에서 README 절차만으로 빌드 → import → 화면 확인 → 원본 삭제까지 할 수 있다.

## 9. 운영 전환 절차 (최초 1회)

1. 새 버전을 배포한다: `docker compose up -d --build`. 이 시점의 DB는 비어 있어 화면에는 "아직 데이터가 없습니다"가 표시된다. 짧은 공백도 없어야 한다면 2~3단계를 배포 직후 바로 실행한다.
2. `import/`에 기존 `data.json`과 `images/`가 있는지 확인한다. 저장소 이름 변경으로 옮겨져 있어야 한다.
3. `docker compose run --rm chrono node store.mjs import /import --dry-run`으로 검증한다.
4. `docker compose run --rm chrono node store.mjs import /import`를 실행한다.
5. 화면에서 항목 수, 이미지, 상세 패널을 확인한다.
6. `export`로 백업을 만들고 안전한 곳에 보관한다.
7. (자동) import 성공 시 `import/data.json`과 import한 이미지는 이미 삭제돼 있다. 참조되지 않아 남은 파일(예: `images/space.svg`, `images/web.svg`)은 필요 없으면 직접 지운다.

> 현재 `parseTimelineData`는 테마가 0개이거나 항목이 0개인 테마가 있으면 오류를 낸다. 빈 DB 상태와 `--replace`로 항목이 모두 지워진 테마가 여기에 해당한다. 그래서 `readTimeline()`은 항목이 없는 테마를 응답에서 빼고, 클라이언트는 `allowEmpty` 옵션으로 테마 0개를 허용해 "아직 데이터가 없습니다"를 표시한다.

## 10. 위험과 대응

| 우선순위 | 위험 | 대응 |
|---|---|---|
| 높음 | 원본 삭제 후 볼륨 유실(`docker compose down -v`, 호스트 교체) | 삭제 전 export를 필수 절차로 둔다. README에 `down -v` 금지 경고. 정기 export는 운영자 cron으로 |
| 높음 | 부분 파일을 `--replace`로 import해 기존 항목 삭제 | 기본은 upsert. `--replace`는 삭제될 건수를 먼저 출력하고, `--dry-run`을 권장 |
| 중간 | `node:sqlite` 실험 단계 경고와 API 변경 | Node 버전을 `22.22`로 고정(현재와 동일). 문제가 생기면 `better-sqlite3`로 교체하되 영향 범위는 `store.mjs`로 한정 |
| 중간 | named volume 권한 문제(`node` 사용자가 쓸 수 없음) | Dockerfile에서 디렉터리를 미리 만들고 `chown node`. 첫 import 테스트로 확인 |
| 중간 | 업로드된 SVG에 스크립트 포함 | 같은 출처로 제공되지만 CSP `script-src 'self'`가 인라인 스크립트를 막는다. SVG 응답에 `Content-Security-Policy: sandbox`를 추가 |
| 낮음 | import 중 서버 조회 충돌 | WAL 모드와 단일 트랜잭션. 서버는 커밋 전 데이터를 계속 제공 |
| 낮음 | 쓰이지 않는 미디어 누적 | import 커밋 후 참조되지 않는 파일 정리 |

## 11. 결정 사항 (2026-09-29 확정)

1. **테마 삭제:** 별도 명령은 두지 않는다. 필요해지면 `store.mjs delete-theme <id>`를 추가한다.
2. **빈 DB 화면:** 오류 대신 "아직 데이터가 없습니다"를 표시한다. API는 `{ version: 1, themes: [] }`를 돌려주고, 클라이언트는 `parseTimelineData(text, { allowEmpty: true })`로 받는다.
3. **정기 백업:** 수동 export를 기본으로 하고, README에 cron 예시를 둔다.
4. **import 원본 자동 삭제:** 적용. import가 커밋되면 `data.json`과 import한 이미지를 삭제한다. 이를 위해 `/import`는 쓰기 가능으로 마운트한다(Linux 호스트에서는 uid 1000 쓰기 권한 필요).
