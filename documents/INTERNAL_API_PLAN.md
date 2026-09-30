# 컨테이너 간 내부 REST API 개발 계획

> 작성일: 2026-09-30  
> 상태: 구현 완료 (2026-09-30). 결정 사항과 계획 대비 변경점은 7·8장 참고  
> 연동 규격: [import/API_SPEC.md](../import/API_SPEC.md) (다른 컨테이너 개발자용)  
> 전제: [DATA_STORE_PLAN.md](DATA_STORE_PLAN.md)의 SQLite 저장소, [EDIT_FEATURE_PLAN.md](EDIT_FEATURE_PLAN.md)의 편집 함수(`store.mjs`)

## 1. 목표와 범위

같은 서버의 다른 컨테이너가 Chrono의 테마와 사건을 조회하고 등록할 수 있는 REST API를 만든다.

- **조회:** 테마 목록, 테마 하나, 테마 안의 사건 목록(필터·페이지), 사건 하나
- **등록:** 테마 생성, 테마 안에 사건 등록, 사건에 이미지 추가
- **수정·삭제:** 사건 수정과 삭제(2단계, 6장 결정 사항 참고)
- **인증:** 없음. 서버 내부 컨테이너끼리만 쓰는 API이기 때문이다(요구사항).
- **외부 차단:** Nginx에서 이 API 경로를 외부에 열지 않는다. 설정 방법은 README에 둔다.

### 제외 범위

- 인증·권한, 호출량 제한, 웹훅(변경 알림)
- 대량 등록 API. 대량 데이터는 기존 import 디렉터리 방식을 쓴다.
- 테마 이름 변경·삭제. 필요해지면 추가한다.

## 2. 설계 결정

| 항목 | 결정 | 이유 |
|---|---|---|
| 경로 | `/internal/v1/...` | 브라우저용 `/api/...`와 섞이지 않게 분리한다. Nginx에서 접두어 하나로 막을 수 있고, `v1`으로 이후 호환성을 관리한다 |
| 포트·프로세스 | 기존 앱 서버(`chrono:3000`)에 라우트 추가 | 새 컨테이너나 포트 없이 같은 저장소 함수와 트랜잭션을 그대로 쓴다 |
| 외부 차단 1차 | Nginx `location ^~ /internal/ { return 404; }` | 요구사항. 외부 요청은 앱에 도달하기 전에 막힌다 |
| 외부 차단 2차 | 앱이 `X-Forwarded-For` 같은 프록시 헤더가 붙은 `/internal/` 요청을 404로 거부 | Nginx 설정을 빠뜨리거나 다른 `server` 블록이 앱을 프록시해도 외부로 열리지 않게 하는 안전장치. Nginx 예시는 이 헤더를 항상 붙인다 |
| 데이터 형식 | `data.json` 규격의 테마·사건 객체를 그대로 사용 | 검증(`parseTimelineData`)과 문서(HOWTO)를 한 곳에서 관리한다 |
| 검증 | 등록·수정할 때마다 저장될 형태로 `parseTimelineData` 검증 후 커밋 | import와 같은 원칙. DB는 항상 화면이 읽을 수 있는 상태로 유지한다 |
| 미디어 응답 | 로컬 이미지 `src`를 `/api/media/<sha256>.<ext>` 절대 경로로 내보냄 | 호출하는 쪽이 `http://chrono:3000` + `src`로 바로 받을 수 있다 |
| 미디어 등록 | JSON에는 `https` URL만 허용하고, 로컬 이미지는 별도 업로드 엔드포인트(바이너리 본문) 사용 | 기존 `addMedia`(시그니처 검사, 해시 저장, 최대 5개)를 재사용한다. base64 JSON은 크기와 파싱 비용이 크다 |
| 화면 반영 | 쓰기마다 `revision`을 올림 | 열린 브라우저 화면이 5초 안에 자동 반영한다(기존 동작) |
| 오류 형식 | `{ "error": { "code": "...", "message": "..." } }` + HTTP 상태 코드 | 기계가 분기할 `code`와 사람이 읽을 `message`를 분리한다 |

## 3. API 목록 (v1)

자세한 요청·응답은 [import/API_SPEC.md](../import/API_SPEC.md)에 있다.

| 메서드 | 경로 | 설명 | 단계 |
|---|---|---|---|
| GET | `/internal/v1/themes` | 테마 목록(사건 수 포함) | 1 |
| POST | `/internal/v1/themes` | 테마 생성 `{ id, name }` | 1 |
| GET | `/internal/v1/themes/{themeId}` | 테마 하나 | 1 |
| GET | `/internal/v1/themes/{themeId}/items` | 사건 목록. `from`, `to`, `tag`, `q`, `limit`, `offset` | 1 |
| POST | `/internal/v1/themes/{themeId}/items` | 사건 등록 | 1 |
| GET | `/internal/v1/themes/{themeId}/items/{itemId}` | 사건 하나 | 1 |
| POST | `/internal/v1/themes/{themeId}/items/{itemId}/media` | 이미지 업로드(바이너리) | 1 |
| PATCH | `/internal/v1/themes/{themeId}/items/{itemId}` | 사건 부분 수정 | 1 |
| DELETE | `/internal/v1/themes/{themeId}/items/{itemId}` | 사건 삭제 — 제공하지 않음(7장) | — |

## 4. 이슈와 대응

### 이슈 1 (높음) — 인증이 없으므로 "누가 네트워크에 있는가"가 곧 권한이다

`chrono:3000`에 닿는 모든 컨테이너가 사건을 등록하고, 2단계부터는 수정·삭제까지 할 수 있다. 지금 `websvr` 네트워크에는 Nginx와 앱 외에 다른 서비스도 붙어 있을 수 있다. 그중 하나가 침해되면 Chrono 데이터도 함께 위험해진다. 기존 브라우저용 쓰기 API(`/api/themes/...`)도 Nginx 인증에만 의존하므로 같은 위험이 이미 있다.

- **대응(권장):** API를 쓰는 컨테이너 전용 Docker 네트워크(예: `chrono-api`)를 따로 만들어 `chrono`와 호출 컨테이너만 연결한다. `websvr`에는 Nginx와 `chrono`만 둔다.
- **선택:** 나중에 인증이 필요해지면 `INTERNAL_API_TOKEN` 환경 변수와 `Authorization: Bearer` 헤더 확인을 추가한다. 설정하지 않으면 지금처럼 인증 없이 동작하게 만들 수 있다.

### 이슈 2 (높음) — Nginx 차단 누락

Nginx의 `location /`가 앱 전체를 프록시하므로, `/internal/` 차단 블록을 빠뜨리면 내부 API가 인터넷에 그대로 열린다. Basic Auth가 있어도 인증된 사용자는 호출할 수 있다.

- **대응:** 2장의 1차(Nginx)·2차(앱의 프록시 헤더 거부) 차단을 함께 둔다. README에 차단 설정과 외부에서 404가 나오는지 확인하는 `curl` 명령을 둔다.
- **주의:** 2차 차단은 Nginx가 `X-Forwarded-For`를 붙인다는 전제에 기댄다. README의 Nginx 예시에 이 헤더를 필수로 명시한다.

### 이슈 3 (중간) — 빈 테마의 표시와 자동 삭제

- 현재 규격상 사건이 없는 테마는 화면(`/api/timeline`)에 나오지 않는다.
- 편집 기능은 마지막 사건을 지우면 테마도 자동으로 지운다.
- `POST /themes`로 만든 빈 테마는 사건이 등록될 때까지 화면에 보이지 않는다.

- **대응:** 내부 API의 테마 목록은 빈 테마도 `itemCount: 0`으로 돌려준다. 자동 삭제는 유지하고 규격 문서에 명시한다. 사건을 등록할 때 테마가 없으면 404를 돌려주고, 테마 자동 생성은 하지 않는다. 오타로 테마가 생기는 것을 막기 위해서다.

### 이슈 4 (중간) — 사건 id 생성과 재시도 안전성

사건 id는 `^[a-z0-9]+(-[a-z0-9]+)*$` 규칙을 따르고, 테마 안에서 고유해야 한다.

- **대응:** `id`는 선택 필드로 둔다.
  - 보내면 그대로 쓰고, 이미 있으면 409를 돌려준다. 호출하는 쪽이 id를 정해 두면 네트워크 오류로 재시도해도 중복 등록되지 않는다.
  - 생략하면 서버가 `YYYYMMDD-<6자리 랜덤>`을 만든다. 이때는 재시도하면 중복 등록될 수 있다는 점을 규격에 명시한다.

### 이슈 5 (중간) — import·화면 편집과의 충돌

- API로 등록한 사건과 같은 id가 나중에 `data.json`에 있으면, import 기본 동작(추가 전용)은 그 사건을 건너뛴다. `--overwrite`를 쓰면 API로 등록한 내용이 덮인다.
- 화면 편집과 API 수정이 같은 사건을 동시에 고치면 마지막 저장이 이긴다.

- **대응:** 개인용 규모라 잠금은 두지 않는다. 규격에 "마지막 저장 우선"을 명시한다. 충돌 감지가 필요해지면 `If-Match: <revision>`을 추가한다.

### 이슈 6 (중간) — 목록 크기와 페이지 처리

테마에 사건이 수백 건이 되면 한 번에 모두 돌려주기 부담스럽다.

- **대응:** 날짜 오름차순(같은 날짜는 id순)으로 정렬하고 `limit`(기본 100, 최대 500)과 `offset`을 쓴다. 응답에 `total`을 넣는다. 현재 저장소는 JSON 컬럼을 메모리에서 필터링한다. 수천 건을 넘으면 `date` 인덱스와 SQL 필터로 바꾼다.

### 이슈 7 (낮음) — 요청 크기와 형식

- **JSON 본문:** 256KB로 제한한다(사건 1건 기준으로 충분).
- **이미지:** 10MB 이하, 시그니처로 형식을 확인한다(기존 `addMedia`).
- **Content-Type:** JSON 요청이 `application/json`이 아니면 415를 돌려준다.

### 이슈 8 (낮음) — 관측과 문제 추적

인증이 없어서 누가 호출했는지 알 수 없다.

- **대응:** 쓰기 요청마다 한 줄 로그를 남긴다(`시각 메서드 경로 상태 원격주소 User-Agent`). 호출하는 쪽에는 `User-Agent`에 서비스 이름을 넣도록 규격에서 요청한다.

### 이슈 9 (낮음) — 브라우저용 CSRF 검사와의 관계

브라우저용 쓰기 API는 `X-Chrono-Edit` 헤더를 요구한다. 컨테이너 간 호출에는 브라우저가 없으므로 `/internal/`에는 요구하지 않는다. 또한 `/internal/`은 2차 차단으로 Nginx를 거친 요청을 모두 거부하므로, 브라우저가 CSRF로 이 API를 호출할 경로도 없다.

## 5. 구현 계획

### 파일별 변경

| 파일 | 변경 |
|---|---|
| `store.mjs` | `listThemes()`(빈 테마 포함, 사건 수), `getTheme()`, `listItems(themeId, filter)`, `getItem()`, `createTheme()`, `createItem()`(id 생성·중복 409·검증). 기존 `updateItem`, `deleteItem`, `addMedia` 재사용 |
| `internal-api.mjs` (신규) | `/internal/v1/` 라우팅, 프록시 헤더 거부, JSON 파싱·크기 제한, 오류 형식, 미디어 경로 변환, 쓰기 로그 |
| `server.mjs` | `/internal/` 요청을 `internal-api.mjs`로 위임(한 줄) |
| `src/internal-api.test.mjs` (신규) | 조회·필터·페이지, 등록·중복 409·검증 400, 업로드, 프록시 헤더가 붙은 요청 404, 빈 테마 표시 |
| `nginx/chrono-proxy.conf.example`, `README.md` | `/internal/` 차단 블록과 확인 방법 (이번 문서 작업에서 먼저 반영) |
| `compose.yaml`, `README.md` | (선택) 호출 컨테이너 전용 `chrono-api` 네트워크 예시 |
| `import/API_SPEC.md` | 연동 규격 (이번 문서 작업에서 먼저 작성) |

### 단계

1. **조회 API와 차단:** 테마·사건 조회, 2차 차단(프록시 헤더 거부), 테스트. 완료 조건: 외부(Nginx 경유) 요청은 404, 내부 컨테이너에서는 조회된다.
2. **등록 API:** 테마 생성, 사건 등록, 이미지 업로드. 완료 조건: 등록하면 5초 안에 브라우저 화면에 나타나고, 규격에 맞지 않는 요청은 저장되지 않는다.
3. **수정·삭제 API:** PATCH, DELETE. 7장 결정 후 진행한다.
4. **운영 반영:** Nginx 차단 적용, 외부 `curl` 확인, (선택) 전용 네트워크 구성.

## 6. 테스트·검증

- 단위·통합 테스트는 `node --test`로 작성하고, 임시 저장소와 임시 서버를 쓴다(기존 방식과 같음).
- 배포 후 확인:
  - 외부: `curl -i https://<도메인>/internal/v1/themes` → `404`
  - 내부: `docker run --rm --network websvr curlimages/curl -s http://chrono:3000/internal/v1/themes` → 테마 목록

## 7. 결정 사항 (2026-09-30 확정)

1. **수정·삭제 API:** 수정(PATCH)은 제공하고, 삭제(DELETE)는 제공하지 않는다. 필요해지면 추가한다.
2. **전용 Docker 네트워크:** 도입하지 않는다(운영자 결정). 호출 컨테이너는 기존 `websvr` 네트워크에 연결한다. 이슈 1의 위험(같은 네트워크의 모든 컨테이너가 인증 없이 쓰기 가능)은 그대로 받아들인다.
3. **사건 등록 시 테마 자동 생성:** 하지 않는다(404).
4. **id 생략:** 허용한다. 서버가 `YYYYMMDD-<랜덤 6자>`를 만들고, 날짜가 없으면 랜덤 6자만 쓴다.

## 8. 구현 결과

- `internal-api.mjs`(신규)에 라우팅·오류 형식·프록시 헤더 거부·쓰기 로그를 두고, `server.mjs`는 `/internal/` 요청을 위임만 한다.
- `store.mjs`에 `listThemes`, `getTheme`, `listItems`, `getItem`, `createTheme`, `createItem`을 추가했다. 사건 등록의 중복 확인은 쓰기 트랜잭션 안에서 해, 동시 요청에도 같은 id가 두 번 들어가지 않는다.
- `StoreError`에 오류 코드(`validation_failed`, `already_exists`, `media_limit` 등)를 추가했다. 브라우저용 API의 응답 형식은 바꾸지 않았다.
- 프록시 헤더 거부는 `X-Forwarded-For`, `X-Real-IP`, `Forwarded` 중 하나라도 있으면 404로 응답한다.
- 테스트: `src/internal-api.test.mjs`(조회·필터·페이지, 등록·중복·검증·형식 오류, 수정, 업로드, 외부 차단, 화면 반영). 전체 `npm test` 15개 통과. 컨테이너 빌드와 실제 Nginx 차단은 이 환경에 Docker가 없어 검증하지 못했다.
