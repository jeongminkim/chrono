# Chrono 내부 API 연동 규격 (v1)

> 상태: 구현 완료, 실제 동작과 대조해 확인함 (2026-09-30). 개발 계획: `documents/INTERNAL_API_PLAN.md`

Chrono는 테마별로 사건(날짜가 있는 기록)을 모아 타임라인으로 보여 주는 개인용 웹 서비스입니다. 이 문서는 **같은 서버의 다른 Docker 컨테이너**가 Chrono의 테마와 사건을 조회·등록·수정하는 REST API의 전체 규격입니다. 이 문서에 없는 동작은 없다고 가정하세요.

## 0. 요약 (먼저 읽기)

- Base URL: `http://chrono:3000/internal/v1`. 인증은 없습니다. 모든 응답은 JSON입니다(성공 시 JSON 객체, 실패 시 `{ "error": { "code", "message" } }`).
- 할 수 있는 일: 테마 목록·조회·생성, 사건 목록(필터·페이지)·조회·등록·수정, 사건에 이미지 업로드.
- **할 수 없는 일:** 테마·사건·이미지 삭제, 테마 이름 변경, 사건 `id`·`media`·`sourceUrl` 수정, JSON 안의 로컬 파일 경로나 base64 이미지.
- 사건을 등록할 때는 **`id`를 직접 정해서 보내세요.** 재시도해도 중복 등록되지 않습니다.
- 사건은 **이미 있는 테마에만** 등록됩니다. 테마가 없으면 먼저 만드세요(테마는 자동으로 생기지 않습니다).
- 로컬 이미지는 사건을 등록한 뒤 업로드 엔드포인트로 **파일 바이트를 그대로** 보냅니다.
- 등록·수정한 내용은 열려 있는 브라우저 화면에 5초 안에 반영됩니다.

## 1. 접속

| 항목 | 값 |
|---|---|
| Base URL | `http://chrono:3000/internal/v1` (아래 경로는 모두 이 뒤에 붙습니다) |
| 네트워크 | 호출하는 컨테이너가 Docker 네트워크 `websvr`에 연결되어 있어야 합니다. `chrono`는 그 네트워크 안의 호스트 이름입니다 |
| 인증 | 없음 |
| 외부 접근 | 불가. 인터넷이나 Nginx를 거친 요청(`X-Forwarded-For`, `X-Real-IP`, `Forwarded` 헤더가 붙은 요청)은 모두 `404`입니다 |
| 요청 본문 | JSON 요청은 `Content-Type: application/json` 필수(`; charset=utf-8` 붙여도 됨). 이미지 업로드만 이미지 바이너리 |
| 문자 인코딩 | UTF-8. 쿼리 문자열의 한글 등은 URL 인코딩하세요(예: `tag=%EC%9D%BC%EB%B3%B8`) |
| 권장 헤더 | `User-Agent: <서비스 이름>/<버전>` — 쓰기 요청은 서버 로그에 호출한 주소와 이 값이 남습니다 |
| 크기 제한 | JSON 본문 256KB, 이미지 10MB |
| 지원 메서드 | `GET`, `POST`, `PATCH`만. `PUT`, `DELETE`, `HEAD` 등은 `404` |

호출하는 쪽 `compose.yaml` 예시:

```yaml
services:
  my-service:
    networks: [websvr]
networks:
  websvr:
    external: true
```

## 2. 데이터 모델

```ts
// 응답에서 값이 없는 선택 필드(body, media, sourceUrl, caption 등)는 null이 아니라 키 자체가 생략됩니다.

type Theme = {
  id: string;        // ID 규칙(아래)
  name: string;      // 표시 이름. 앞뒤 공백은 제거되어 저장
  itemCount: number; // 사건 수 (응답 전용)
};

type Item = {
  id: string;           // 테마 안에서 고유. ID 규칙(아래). 등록 시 생략 가능(서버가 생성)
  date: string;         // "YYYY", "YYYY-MM" 또는 "YYYY-MM-DD". 실제 존재하는 날짜여야 함(2024-13, 2024-02-30은 오류)
  title: string;        // 필수, 빈 문자열 불가, 일반 텍스트(HTML 불가)
  description: string;  // 필수, 빈 문자열 불가. 타임라인 카드에 보이는 짧은 요약
  body?: string;        // 선택. 상세 화면의 긴 설명. 없으면 화면에 description이 대신 보임. 빈 문자열 불가(생략할 것)
  tags: string[];       // 응답에는 항상 있음(없으면 []). 앞뒤 공백·빈 값·중복은 서버가 제거
  media?: Media[];      // 선택. 1~5개. 첫 번째가 카드 대표 이미지
  sourceUrl?: string;   // 선택. https URL만
};

type Media =
  | { type: "image"; src: string; alt: string; caption?: string }
  | { type: "video"; src: string; poster?: string; caption?: string; youtubeId?: string };
```

**ID 규칙** (테마 id, 사건 id 공통): 영문 소문자·숫자·하이픈, 하이픈으로 시작·끝나거나 연속될 수 없음. 정규식 `^[a-z0-9]+(-[a-z0-9]+)*$`. 예: `travel`, `2026-09-30-seoul-walk`. 한 번 정하면 바꿀 수 없습니다.

**Media 규칙**

| 필드 | 규칙 |
|---|---|
| `type` | `"image"` 또는 `"video"` |
| `src` (등록 시) | `https` URL만 허용. 로컬 경로(`images/a.jpg`, `/api/media/...` 등)는 `400`. 로컬 이미지는 업로드 엔드포인트(5.7)를 쓰세요 |
| `src` (응답) | 업로드한 이미지는 `/api/media/<sha256>.<ext>` 형태의 경로입니다. 파일은 `http://chrono:3000` + `src`로 내려받습니다. 그 외에는 등록한 URL 그대로입니다 |
| `alt` | 이미지일 때 필수, 빈 문자열 불가 |
| `caption` | 선택 |
| 동영상 `src` | YouTube URL(`youtube.com/watch?v=ID`, `youtu.be/ID`, `/embed/ID`, `/shorts/ID`) 또는 `https` 동영상 파일 URL. YouTube 주소인데 동영상 ID를 찾을 수 없으면 `400` |
| `poster` | 동영상 미리보기 이미지. 선택, `https` URL만 |
| `youtubeId` | YouTube 동영상이면 서버가 채웁니다(응답 전용, 보내지 마세요) |
| 개수·중복 | 사건당 최대 5개(업로드한 이미지 포함). 한 사건 안에서 같은 `src`는 불가. 업로드한 이미지는 파일 내용이 같으면 같은 `src`가 되어 중복으로 거부됩니다 |

## 3. 공통 동작

- **정렬:** 사건 목록은 `date` 오름차순, 같은 날짜는 `id` 오름차순입니다. 날짜는 문자열로 비교하므로 `"2024"`는 `"2024-01-01"`보다 앞입니다. 테마 목록은 만들어진 순서입니다.
- **알 수 없는 필드:** 등록 요청의 규격에 없는 필드는 오류 없이 무시되고 저장되지 않습니다. 수정(PATCH) 요청은 허용 필드 외에는 `400`입니다.
- **동시 수정:** 잠금이 없어 마지막 저장이 이깁니다. 브라우저 편집 화면이나 import 작업과 동시에 같은 사건을 고치면 나중 것이 남습니다.
- **빈 테마:** 사건이 없는 테마는 이 API에는 보이지만(`itemCount: 0`) 브라우저 화면에는 나오지 않습니다. 브라우저에서 테마의 마지막 사건을 삭제하면 테마도 함께 삭제되므로, 테마가 사라질 수 있다고 가정하세요.
- **보이지 않는 테마:** Chrono에는 Obsidian vault에서 동기화하는 읽기 전용 테마가 있을 수 있습니다. 이 테마와 그 사건은 이 API에 **나오지 않으며**(목록에서 제외, 조회·등록·수정은 `404 not_found`), 같은 id로 테마를 만들려 하면 `409 already_exists`입니다. 존재 여부를 추측하거나 우회하려 하지 마세요.
- **import와의 관계:** 운영자가 `data.json` 파일로 대량 import할 때, 이 API로 등록한 사건과 같은 id가 있으면 기본 설정에서는 import가 그 사건을 건너뜁니다.

## 4. 오류 처리

실패 응답 본문:

```json
{ "error": { "code": "validation_failed", "message": "date는 유효한 YYYY, YYYY-MM 또는 YYYY-MM-DD 날짜여야 합니다." } }
```

`message`는 사람이 읽는 한국어 설명입니다(어느 필드가 왜 틀렸는지 포함). 프로그램 분기는 HTTP 상태와 `code`로 하세요.

| HTTP | code | 의미 | 호출하는 쪽의 대응 |
|---|---|---|---|
| 400 | `invalid_json` | 본문이 올바른 JSON이 아님 | 본문을 고쳐 다시 보냄 |
| 400 | `validation_failed` | 필드 규칙 위반, 잘못된 쿼리 값, 수정할 수 없는 필드, 같은 사건에 이미 있는 이미지 | `message`를 보고 값을 고침. 그대로 재시도하지 않음 |
| 404 | `not_found` | 테마·사건이 없음, 없는 경로, 지원하지 않는 메서드, 외부(Nginx 경유)에서 호출 | 경로와 id 확인. 테마가 없으면 먼저 생성 |
| 409 | `already_exists` | 같은 id의 테마 또는 사건이 이미 있음 | 재시도 중이었다면 이미 성공한 것. GET으로 확인 |
| 409 | `media_limit` | 사건에 미디어가 이미 5개 | 더 올리지 않음 |
| 413 | `too_large` | JSON 256KB 또는 이미지 10MB 초과 | 줄여서 다시 보냄 |
| 415 | `unsupported_media_type` | JSON 요청인데 `Content-Type`이 `application/json`이 아님, 또는 업로드한 파일이 지원하는 이미지가 아님 | 헤더나 파일 확인 |
| 500 | `internal_error` | 서버 오류 | 잠시 후 재시도 |

재시도 원칙: 네트워크 오류와 `5xx`만 재시도합니다.

- **사건 등록:** `id`를 정해서 보냈다면 재시도해도 안전합니다(두 번째는 `409 already_exists`).
- **이미지 업로드:** 같은 이미지를 다시 올리면 `400 validation_failed`(중복)가 납니다. 업로드한 이미지의 `src` 파일 이름은 **파일 내용의 SHA-256 해시(소문자 16진수 64자)**입니다. 그러니 올리기 전에 파일의 SHA-256을 계산해, 사건 `media`의 `src` 중 그 해시를 포함한 것이 있으면 건너뛰세요(아래 Node.js 예시 참고).

## 5. 엔드포인트

| # | 메서드 | 경로 | 성공 |
|---|---|---|---|
| 5.1 | GET | `/themes` | `200` `{ themes: Theme[] }` |
| 5.2 | POST | `/themes` | `201` `Theme` |
| 5.3 | GET | `/themes/{themeId}` | `200` `Theme` |
| 5.4 | GET | `/themes/{themeId}/items` | `200` `{ total, limit, offset, items: Item[] }` |
| 5.5 | GET | `/themes/{themeId}/items/{itemId}` | `200` `Item` |
| 5.6 | POST | `/themes/{themeId}/items` | `201` `Item` |
| 5.7 | POST | `/themes/{themeId}/items/{itemId}/media` | `201` `Item` |
| 5.8 | PATCH | `/themes/{themeId}/items/{itemId}` | `200` `Item` |

경로 끝의 `/`는 있어도 됩니다.

### 5.1 테마 목록 — `GET /themes`

```json
{ "themes": [ { "id": "travel", "name": "여행", "itemCount": 29 } ] }
```

### 5.2 테마 생성 — `POST /themes`

요청:

```json
{ "id": "books", "name": "읽은 책" }
```

- `id`(ID 규칙)와 `name`(빈 문자열 불가) 모두 필수입니다.
- 응답 `201`: `{ "id": "books", "name": "읽은 책", "itemCount": 0 }`
- 같은 id가 있으면 `409 already_exists`입니다.

### 5.3 테마 조회 — `GET /themes/{themeId}`

응답 `200`: Theme 하나. 없으면 `404`입니다.

### 5.4 사건 목록 — `GET /themes/{themeId}/items`

| 쿼리 | 기본값 | 설명 |
|---|---|---|
| `from` | 없음 | 이 날짜 이후(포함). `YYYY`, `YYYY-MM`, `YYYY-MM-DD` 중 하나 |
| `to` | 없음 | 이 날짜 이전(포함). 형식은 `from`과 같음 |
| `tag` | 없음 | 이 태그가 정확히 있는 사건만 |
| `q` | 없음 | `title`·`description`·`body`·`date`·`tags`에서 대소문자 무시 부분 일치 |
| `limit` | 100 | 1~500 정수. 범위를 벗어나면 `400` |
| `offset` | 0 | 0 이상 정수 |

**날짜 필터 규칙:** 사건 `date`의 앞부분을 필터 값 길이만큼 잘라 비교합니다. 예를 들어 `from=2024&to=2024`는 `"2024"`, `"2024-03-01"`, `"2024-12-31"`을 모두 포함합니다. `from=2024-05`는 `"2024-05-01"` 이후를 포함하지만, 연도만 있는 `"2024"`는 제외합니다.

응답 `200`. `total`은 필터를 적용한 전체 건수이고, `items`는 그중 `offset`부터 `limit`개입니다. 전부 받으려면 `offset`을 `limit`만큼 늘리며 `offset >= total`이 될 때까지 반복하세요.

```json
{
  "total": 29,
  "limit": 100,
  "offset": 0,
  "items": [
    {
      "id": "2002-02-japan-tokyo",
      "date": "2002-02-09",
      "title": "일본 도쿄",
      "description": "2002.02.09~02.13, 첫 도쿄 여행.",
      "body": "친구와 함께 다녀왔다.",
      "tags": ["해외", "일본", "도쿄"],
      "media": [
        { "type": "image", "src": "/api/media/50d858e0985ecc7f60418aaf0cc5ab587f42c2570a884095a9e8ccacd0f6545c.jpg", "alt": "신주쿠 거리의 밤 풍경", "caption": "2002년 도쿄 밤거리" }
      ]
    }
  ]
}
```

테마가 없으면 `404`입니다. 사건이 없거나 필터에 맞는 사건이 없으면 `200`과 빈 `items`를 돌려줍니다.

### 5.5 사건 조회 — `GET /themes/{themeId}/items/{itemId}`

응답 `200`: Item 하나. 테마나 사건이 없으면 `404`입니다.

### 5.6 사건 등록 — `POST /themes/{themeId}/items`

요청(Item에서 `youtubeId`를 뺀 필드. `media`는 배열이며, 객체 하나도 받습니다):

```json
{
  "id": "2026-09-30-seoul-walk",
  "date": "2026-09-30",
  "title": "서울 산책",
  "description": "가을 오후 한강 산책.",
  "body": "여의도에서 반포까지 걸었다.",
  "tags": ["국내", "서울"],
  "media": [{ "type": "video", "src": "https://youtu.be/FlpstXNjImY", "caption": "한강" }],
  "sourceUrl": "https://example.com/post/123"
}
```

응답 `201`: 저장된 Item. 서버가 정리한 값(태그 등)과 `id`가 들어 있습니다.

- 필수 필드는 `date`, `title`, `description`입니다. 선택 필드에 값이 없으면 빈 문자열을 보내지 말고 키를 생략하세요(`body: ""`는 `400`).
- `id`를 생략하면 서버가 `<date의 숫자>-<영소문자·숫자 6자>`(예: `20260930-k3x9qa`)를 만듭니다. 이 경우 재시도하면 같은 사건이 두 번 등록될 수 있습니다.
- 같은 id가 테마에 이미 있으면 `409 already_exists`, 테마가 없으면 `404 not_found`입니다.
- `media[].src`와 `poster`는 `https` URL만 됩니다. 로컬 이미지는 등록 후 5.7로 올리세요.

### 5.7 이미지 업로드 — `POST /themes/{themeId}/items/{itemId}/media?alt=<대체 텍스트>`

- 본문은 이미지 파일 바이트 그대로입니다. multipart, base64, JSON이 아닙니다.
- `Content-Type`은 `image/`로 시작해야 합니다(예: `image/jpeg`). 실제 형식은 파일 내용으로 판별합니다. 지원 형식은 WebP, AVIF, PNG, JPEG, GIF, SVG이고, 그 밖의 파일이나 `image/`가 아닌 `Content-Type`은 `415`입니다.
- `alt`(쿼리, URL 인코딩)를 생략하면 `"<사건 제목> 사진 <순번>"`이 들어갑니다. `caption`은 업로드로 지정할 수 없습니다.
- 이미지는 사건 `media` 배열의 끝에 붙습니다. 이미 5개면 `409 media_limit`, 같은 사건에 내용이 같은 이미지가 있으면 `400 validation_failed`입니다.
- 응답 `201`: 갱신된 Item입니다. 새 이미지는 `media`의 마지막 항목이고, `src`는 `/api/media/<sha256>.<ext>`입니다.

### 5.8 사건 수정 — `PATCH /themes/{themeId}/items/{itemId}`

요청: 아래 필드 중 바꿀 것만 보냅니다. 다른 필드가 하나라도 있으면 `400`입니다(`id`, `media`, `sourceUrl`은 수정할 수 없음).

| 필드 | 동작 |
|---|---|
| `date` | 교체. 형식 규칙은 등록과 같음 |
| `title` | 교체. 빈 문자열 불가 |
| `description` | 교체. 빈 문자열 불가 |
| `body` | 교체. **`""`를 보내면 body가 삭제됩니다** |
| `tags` | **목록 전체를 교체**합니다. 태그 하나를 추가하려면 먼저 GET으로 현재 `tags`를 받아 합친 배열을 보내세요 |

```json
{ "title": "서울 산책 (여의도~반포)", "tags": ["국내", "서울", "한강"] }
```

응답 `200`: 갱신된 Item. 빈 객체 `{}`를 보내면 아무것도 바꾸지 않고 현재 Item을 돌려줍니다.

## 6. 자주 쓰는 작업 순서

**사건 하나 기록하기 (이미지 포함)**
1. `GET /themes/{themeId}`. `404`이면 `POST /themes`로 테마를 만듭니다.
2. `POST /themes/{themeId}/items`로 등록합니다. `id`는 날짜와 영문 요약으로 직접 정합니다(예: `2026-09-30-seoul-walk`).
3. 로컬 이미지가 있으면 파일마다 `POST …/items/{id}/media?alt=…`로 올립니다(사건당 총 5개까지). 재실행할 수 있는 작업이라면, 파일의 SHA-256이 이미 `media[].src`에 있는지 먼저 확인해 건너뜁니다.
4. 재시도하다 `409 already_exists`를 받으면 `GET`으로 저장된 내용을 확인합니다.

**특정 기간의 사건 모두 읽기**
- `GET /themes/{themeId}/items?from=2024&to=2024&limit=500`. `total`이 500을 넘으면 `offset`을 늘려 반복합니다.

**사건에 태그 추가하기**
- `GET …/items/{id}`로 `tags`를 받아 새 태그를 합친 뒤, `PATCH …/items/{id}`에 `{ "tags": [...] }`로 보냅니다.

## 7. 호출 예시

```bash
BASE=http://chrono:3000/internal/v1

curl -s $BASE/themes
curl -s -G $BASE/themes/travel/items --data-urlencode 'tag=일본' --data-urlencode 'from=2020' --data-urlencode 'limit=20'

curl -s -X POST $BASE/themes \
  -H 'Content-Type: application/json' -d '{"id":"books","name":"읽은 책"}'

curl -s -X POST $BASE/themes/travel/items \
  -H 'Content-Type: application/json' -H 'User-Agent: diary-bot/1.0' \
  -d '{"id":"2026-09-30-seoul-walk","date":"2026-09-30","title":"서울 산책","description":"가을 오후 한강 산책.","tags":["서울"]}'

curl -s -X POST "$BASE/themes/travel/items/2026-09-30-seoul-walk/media?alt=%ED%95%9C%EA%B0%95%20%EB%85%B8%EC%9D%84" \
  -H 'Content-Type: image/jpeg' --data-binary @sunset.jpg

curl -s -X PATCH $BASE/themes/travel/items/2026-09-30-seoul-walk \
  -H 'Content-Type: application/json' -d '{"tags":["서울","한강"]}'

# 업로드한 이미지 내려받기
curl -s -o sunset.jpg "http://chrono:3000$(curl -s $BASE/themes/travel/items/2026-09-30-seoul-walk | jq -r '.media[-1].src')"
```

Node.js(18 이상, 내장 `fetch`):

```js
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

const base = "http://chrono:3000/internal/v1";
const headers = { "user-agent": "diary-bot/1.0" };

async function call(method, path, { json, bytes, contentType } = {}) {
  const res = await fetch(base + path, {
    method,
    headers: { ...headers, ...(json !== undefined && { "content-type": "application/json" }), ...(bytes && { "content-type": contentType }) },
    body: json !== undefined ? JSON.stringify(json) : bytes,
  });
  const body = await res.json();
  if (!res.ok) throw Object.assign(new Error(body.error.message), { status: res.status, code: body.error.code });
  return body;
}

try {
  await call("GET", "/themes/travel");
} catch (e) {
  if (e.code !== "not_found") throw e;
  await call("POST", "/themes", { json: { id: "travel", name: "여행" } });
}

try {
  await call("POST", "/themes/travel/items", {
    json: { id: "2026-09-30-seoul-walk", date: "2026-09-30", title: "서울 산책", description: "가을 오후 한강 산책.", tags: ["서울"] },
  });
} catch (e) {
  if (e.code !== "already_exists") throw e; // 재시도 중 이미 등록됨
}

// 이미지 업로드: 이미 올린 파일(같은 SHA-256)은 건너뛰어 재실행해도 안전하게 한다.
const bytes = await readFile("sunset.jpg");
const hash = createHash("sha256").update(bytes).digest("hex");
const item = await call("GET", "/themes/travel/items/2026-09-30-seoul-walk");
if (!item.media?.some((m) => m.src.includes(hash))) {
  await call("POST", `/themes/travel/items/2026-09-30-seoul-walk/media?alt=${encodeURIComponent("한강 노을")}`, {
    bytes, contentType: "image/jpeg",
  });
}
```
