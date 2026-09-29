# 타임라인 웹 프로젝트 기술 및 개발 계획

> 작성일: 2026-09-29  
> 상태: 1차 구현 완료  
> 데이터 저장 방식(3·5·7장의 `data/data.json` 직접 제공)은 [DATA_STORE_PLAN.md](DATA_STORE_PLAN.md)의 SQLite + import 구조로 대체되었다.

## 1. 목표와 범위

여러 테마 중 하나를 선택하면 해당 테마의 이미지·텍스트 기반 타임라인을 보여주는 단일 페이지 웹 애플리케이션을 만든다.

### 포함 범위

- 상단 `<select>`를 이용한 테마 선택
- 선택한 테마의 타임라인 표시
- `data/data.json` 런타임 로딩
- 이미지와 텍스트가 포함된 타임라인 항목
- 데이터 작성 규격 및 LLM용 프롬프트 문서
- Docker Compose 기반 실행과 운영
- 데스크톱·모바일 반응형 화면, 기본 접근성 및 오류 안내

### 제외 범위

- 관리자 화면, 로그인, 데이터베이스, 별도 API 서버
- 화면에서의 데이터 편집
- 검색, 다국어, 분석 도구, 서버 사이드 렌더링

초기 요구에는 정적 파일만 필요하므로 백엔드를 두지 않는다. 필요성이 확인되기 전까지 위 제외 항목은 추가하지 않는다.

## 2. 권장 기술 스택

| 영역 | 선택 | 이유 |
|---|---|---|
| UI | React 19 + TypeScript | `react-chrono`의 현재 peer dependency와 타입 안정성 확보 |
| 빌드 | Vite 7 | 설정과 개발 서버가 단순하고 정적 산출물 생성에 적합 |
| 타임라인 | `react-chrono` 3.3.3 | 요구사항에 지정된 라이브러리. 세로형 타임라인과 미디어 지원 |
| 스타일 | 일반 CSS | UI 규모가 작아 별도 CSS 프레임워크가 불필요 |
| 데이터 | 정적 JSON + 브라우저 `fetch` | API와 DB 없이 운영 중 데이터 교체 가능 |
| 앱 서버 | Node.js 22 표준 HTTP 서버 | 의존성 추가 없이 화면·데이터·캐시 헤더 제공 |
| 프록시 | 기존 운영 Nginx 컨테이너 | 앱 컨테이너로 HTTP 요청만 전달 |
| 컨테이너 | Docker Compose | 앱 실행, 데이터 마운트와 기존 프록시 네트워크 연결 |
| 패키지 관리 | npm + `package-lock.json` | Node 기본 도구로 별도 설치가 필요 없음 |
| 테스트 | Node.js 내장 테스트 러너 + 정적 파일 smoke check | 별도 테스트 의존성 없이 검증·변환 로직과 실제 정적 제공만 확인 |

확인 기준일 현재 `react-chrono` 저장소의 최신 릴리스는 `3.3.3`이며 `react`/`react-dom ^19.2.3`, 빌드 환경 Node.js 22 이상을 요구한다. 구현 시 lock file에 실제 설치 버전을 고정하고, 업그레이드는 별도 작업으로 진행한다.

- 공식 저장소: <https://github.com/prabhuignoto/react-chrono>
- 공식 릴리스: <https://github.com/prabhuignoto/react-chrono/releases/tag/3.3.3>

## 3. 시스템 구조

```text
사용자 브라우저
  └─ 기존 운영 Nginx 컨테이너
      └─ HTTP proxy → chrono:3000
          └─ Chrono 앱 컨테이너
              ├─ /chrono/, /chrono/assets/*  ← 이미지에 포함된 Vite 빌드 결과
              └─ /chrono/data/*              ← 앱 컨테이너의 /data 읽기 전용 마운트
                  ├─ data.json
                  ├─ HOWTO_MAKE_DATA.md
                  └─ images/*
```

브라우저가 시작될 때 `/chrono/data/data.json`을 읽고 검증한다. 첫 번째 테마를 기본 선택한 뒤, 사용자가 테마를 바꾸면 이미 메모리에 있는 데이터만 교체해 `Chrono` 컴포넌트에 전달한다.

열린 화면에서도 변경을 반영하기 위해 5초마다 같은 파일을 조건부 요청한다. 응답 내용이 이전과 다를 때만 검증하고 상태를 갱신한다. 유효하지 않은 새 파일은 반영하지 않고 마지막 정상 데이터를 유지한다. 따라서 정상 파일을 원자적으로 교체하면 최대 약 5초 안에 재빌드, 컨테이너 재시작, 브라우저 새로고침 없이 반영된다.

### 데이터 흐름

1. 앱이 `/chrono/data/data.json`을 `fetch`한다.
2. 최상위 구조, 필수 문자열, 배열 여부, 테마 ID 중복을 런타임에 검사한다.
3. 검사 실패 시 빈 화면 대신 원인을 포함한 오류 안내를 표시한다.
4. 선택된 테마의 항목을 `react-chrono` 형식으로 변환한다.
5. 이미지가 실패하면 대체 텍스트와 텍스트 내용은 유지한다.
6. 5초마다 파일을 재검증하고 변경된 정상 데이터만 화면에 적용한다.
7. 선택 중인 테마가 새 데이터에도 있으면 선택을 유지하고, 삭제됐으면 첫 테마로 이동한다.

## 4. 예정 디렉터리 구조

```text
.
├── data/
│   ├── data.json
│   ├── HOWTO_MAKE_DATA.md
│   └── images/
├── documents/
│   └── PROJECT_PLAN.md
├── src/
│   ├── App.tsx
│   ├── data.ts
│   ├── main.tsx
│   └── styles.css
├── .dockerignore
├── .gitignore
├── Dockerfile
├── compose.yaml
├── index.html
├── nginx/
│   └── chrono-proxy.conf.example
├── package.json
├── package-lock.json
├── README.md
├── server.mjs
├── tsconfig.json
└── vite.config.ts
```

컴포넌트 분리는 실제로 재사용이 생길 때만 한다. 초기에는 데이터 로딩·검증을 `data.ts`, 화면을 `App.tsx`에 두는 정도로 충분하다.

## 5. `data.json` 규격 초안

도메인 데이터와 라이브러리 전용 속성을 분리해 라이브러리 교체나 버전 변경의 영향을 변환 함수 한 곳으로 제한한다.

```json
{
  "version": 1,
  "themes": [
    {
      "id": "space-history",
      "name": "우주 탐사의 역사",
      "items": [
        {
          "id": "sputnik-1",
          "date": "1957-10-04",
          "title": "스푸트니크 1호 발사",
          "description": "인류 최초의 인공위성이 지구 궤도에 진입했다.",
          "image": {
            "src": "data/images/sputnik-1.webp",
            "alt": "스푸트니크 1호 모형"
          },
          "sourceUrl": "https://example.com/source"
        }
      ]
    }
  ]
}
```

### 규칙

- `version`: 정수, 초기값 `1`. 호환되지 않는 규격 변경 시 증가한다.
- `themes`: 한 개 이상의 테마 배열.
- `theme.id`: 영문 소문자, 숫자, 하이픈으로 구성된 고유값.
- `theme.name`: select box에 표시할 이름.
- `items`: 시간순 항목 배열. 앱에서도 `date` 오름차순으로 정렬해 입력 순서 실수를 방지한다.
- `item.id`: 테마 안에서 고유한 값.
- `date`: 정렬 가능한 ISO 8601 날짜 문자열(`YYYY-MM-DD` 권장). 연도만 아는 사건은 별도 규칙을 HOWTO 문서에 명시한다.
- `title`, `description`: 필수 일반 텍스트. HTML은 허용하지 않는다.
- `image`: 선택값. 앱 base path 기준 상대 경로인 `src`와 의미 있는 `alt`를 함께 제공한다.
- `sourceUrl`: 선택값. 표시할 경우 `https` URL만 허용한다.

`data/HOWTO_MAKE_DATA.md`에는 위 스키마, 필수·선택 필드, 날짜·이미지 규칙, 완성 예시, 금지 사항과 아래 형태의 LLM 프롬프트를 포함한다.

```text
주어진 자료만 사용해 data.json의 version 1 규격으로 출력하라.
JSON 외의 설명과 Markdown 코드 펜스는 출력하지 마라.
모르는 사실이나 출처 URL을 만들지 말고, 사건은 날짜 오름차순으로 정렬하라.
각 항목의 id는 테마 내에서 고유하게 만들고 description은 일반 텍스트로 작성하라.
이미지의 저작권과 실제 경로가 확인되지 않으면 image 필드를 생략하라.
출력 전 필수 필드, ID 중복, 날짜 형식, JSON 문법을 스스로 검사하라.
```

## 6. 화면 및 동작 설계

- 낮은 높이의 GNB에 서비스명과 Light/Dark 모드 전환 버튼을 둔다.
- 테마 `<select>`의 기본값은 `전체`이며 모든 테마를 연속해서 표시한다.
- 테마 선택 시 해당 테마만 표시한다.
- select 오른쪽에서 날짜·제목·내용을 검색하고 점프 버튼으로 첫 결과 카드에 스크롤·포커스한다.
- 검색 결과가 없으면 화면 최하단에 3초간 토스트를 표시한다.
- 데스크톱 화면은 좌측 탐색 30%, 우측 타임라인 70%로 분할한다.
- 좌측에는 서비스명, 모드 전환, 스크롤 가능한 테마 목록과 검색을 배치한다.
- `전체` 선택 시 모든 테마 항목을 날짜순으로 합친 타임라인 하나를 표시한다.
- 카드를 클릭하면 우측 타임라인 영역 절반 너비의 상세 패널을 열어 제목, 내용, 이미지와 닫기 버튼을 표시한다.
- 로딩 중에는 짧은 상태 문구를 표시한다.
- 데이터가 없거나 잘못되면 사용자용 오류와 확인할 파일 경로를 표시한다.
- 선택된 테마의 항목을 `react-chrono`의 `alternating` 모드로 표시한다.
- 좁은 화면에서는 `VERTICAL` 모드 또는 한쪽 정렬로 전환해 가로 스크롤을 피한다.
- 모든 이미지에 `alt`, select에 label, 키보드 포커스 표시를 제공한다.
- 애니메이션은 `prefers-reduced-motion` 설정을 존중한다.
- 외부 이미지보다 `data/images/`의 WebP/AVIF 이미지를 권장한다. 화면 폭에 맞춰 CSS로 최대 크기를 제한한다.

## 7. Docker 및 기존 Nginx 연동안

### 빌드와 배포

- 빌드 단계는 `node:22-alpine`에서 `npm ci`와 `npm run build`를 수행한다.
- 런타임 단계는 Node.js 표준 HTTP 서버로 빌드 결과와 `/data` 파일을 제공한다.
- Compose의 `chrono` 서비스만 호스트 `./data`를 `/data:ro`로 마운트한다.
- 기존 Nginx에는 이 프로젝트의 호스트 경로나 Docker 볼륨을 마운트하지 않는다.
- 두 컨테이너는 기존 외부 Docker 네트워크에서 통신한다. 네트워크 이름은 `NGINX_NETWORK`로 전달하며 기본값은 `proxy`다.
- 앱 컨테이너는 호스트 포트를 공개하지 않고 Docker 네트워크에 `3000`만 노출한다.
- Vite의 base path는 `/chrono/`로 빌드한다.
- 최초 프록시 설정 반영에만 Nginx reload가 필요하고 이후 데이터 변경에는 필요 없다.

### 캐시 정책

- 해시가 붙은 `/chrono/assets/*`: 장기 캐시.
- `/chrono/data/data.json`: `Cache-Control: no-cache`로 매 요청 원본 재검증. 앱 서버의 ETag를 사용해 미변경 응답 비용을 줄인다.
- `index.html`: `no-cache`로 새 배포의 자산 경로가 즉시 반영되게 설정.

캐시 헤더와 ETag는 앱 서버가 설정한다. 기존 Nginx 설정에는 프록시 location만 합친다.

```nginx
location /chrono/ {
    proxy_pass http://chrono:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

`data.json`은 임시 파일에 완전히 쓴 뒤 같은 파일시스템에서 rename하는 방식으로 교체한다. 쓰는 중간 상태가 노출되는 문제를 피할 수 있다.

개인용 서비스이므로 5초 폴링의 요청량은 운영상 무시할 수 있다. 별도 백엔드나 SSE, WebSocket은 도입하지 않는다.

## 8. 개발 계획

### 1단계 — 프로젝트 기반

- Vite React TypeScript 최소 프로젝트 생성
- `react-chrono` 설치 및 lock file 생성
- 기본 CSS와 정적 화면 구성
- 빌드·런타임 Dockerfile과 Compose 구성
- Node 정적 서버와 상태 확인 경로 구현
- 기존 Nginx와 공유할 Docker 네트워크 이름 확인

완료 조건: `docker compose up -d --build` 후 기존 Nginx 경로에서 기본 화면이 열린다.

### 2단계 — 데이터 규격과 로딩

- 예제 `data/data.json` 작성
- `data/HOWTO_MAKE_DATA.md` 작성
- 런타임 데이터 검증, 날짜 정렬, 5초 재검증 및 오류 상태 구현
- 검증·변환 로직을 확인하는 작은 단위 테스트 1개 작성

완료 조건: 정상·손상·빈 JSON에 대해 화면이 예측 가능한 상태를 표시하고, 손상된 갱신에서는 마지막 정상 화면을 유지한다.

### 3단계 — 타임라인 화면

- 테마 select와 선택 상태 연결
- 선택한 데이터를 `react-chrono` 항목으로 변환
- 이미지, 텍스트, 출처 링크 표시
- 모바일 레이아웃과 접근성 확인

완료 조건: 두 개 이상의 테마를 전환해 각 타임라인을 키보드와 모바일 화면에서 조회할 수 있다.

### 4단계 — 운영 검증과 문서화

- 앱 컨테이너의 데이터 bind mount, ETag와 캐시 헤더 확인
- 기존 Nginx 프록시 연결과 `/healthz` 확인
- 정적 파일 smoke check
- 이미지 용량 및 깨진 경로 확인
- README에 설치, 실행, 데이터 갱신, 장애 확인 절차 추가

완료 조건: 새 환경에서 README만 보고 빌드·연동하고, 데이터 파일 교체 후 5초 안에 열린 화면에서 변경을 확인할 수 있다.

## 9. 주요 이슈와 대응

| 우선순위 | 이슈 | 영향 | 최소 대응 |
|---|---|---|---|
| 높음 | LLM이 잘못된 JSON이나 필드를 생성 | 전체 화면 로딩 실패 | 런타임 검증, 명확한 오류, HOWTO에 출력 규칙과 예시 제공 |
| 높음 | Nginx와 앱 컨테이너의 Docker 네트워크 불일치 | 프록시 502 | 같은 외부 네트워크 연결과 `chrono:3000` 이름 해석 확인 |
| 높음 | `react-chrono`와 React 버전 불일치 | 설치 또는 실행 실패 | 검증된 버전과 lock file 고정, Dependabot식 자동 업그레이드는 초기 제외 |
| 중간 | 브라우저/Nginx 캐시로 변경 데이터가 늦게 보임 | 자동 갱신 실패 | `no-cache`, ETag와 5초 조건부 요청을 통합 테스트 |
| 중간 | 파일 저장 중 폴링이 불완전한 JSON을 읽음 | 일시적 검증 오류 | 임시 파일 작성 후 원자적 rename, 클라이언트는 마지막 정상 데이터 유지 |
| 중간 | 외부 이미지 장애·핫링크·저작권 문제 | 깨진 화면 또는 법적 위험 | 검증된 로컬 이미지 권장, 대체 텍스트와 실패 fallback 제공 |
| 중간 | 큰 이미지와 긴 타임라인 | 초기 로딩 및 렌더링 지연 | WebP/AVIF, 이미지 크기 제한과 lazy loading; 실제 측정 전 페이지네이션은 제외 |
| 중간 | 날짜 정밀도가 사건마다 다름 | 잘못된 정렬 또는 오해 | ISO 정렬용 날짜와 화면 표시 규칙을 HOWTO에 명시 |
| 낮음 | 라이브러리 기본 UI가 작은 화면에서 복잡함 | 모바일 사용성 저하 | breakpoint에서 단일 세로 모드 사용 |
| 낮음 | 데이터 파일 직접 수정 중 부분 저장 | 잠깐 잘못된 JSON 제공 | 임시 파일 작성 후 원자적 교체를 운영 절차로 안내 |

## 10. 보안 및 품질 기준

- 설명은 React 텍스트로 렌더링하고 임의 HTML 삽입 기능은 사용하지 않는다.
- 출처 링크는 `https`만 허용하고 새 창 링크에는 `rel="noopener noreferrer"`를 설정한다.
- 앱 컨테이너의 데이터 bind mount는 읽기 전용으로 설정한다.
- 앱 포트는 호스트에 공개하지 않고 기존 Nginx와 공유하는 Docker 네트워크에만 노출한다.
- Nginx에 기본 보안 헤더(`X-Content-Type-Options`, `Referrer-Policy`, 최소 CSP)를 설정한다.
- 외부 이미지 도메인을 허용해야 한다면 CSP에 필요한 호스트만 추가한다.
- 데이터 오류가 콘솔에만 남지 않도록 화면에 복구 가능한 메시지를 표시한다.

## 11. 완료 기준

- Compose 명령 한 번으로 앱 컨테이너를 빌드하고 실행한다.
- 기존 Nginx는 파일 마운트 없이 앱 컨테이너로 요청만 프록시한다.
- 앱 컨테이너가 화면, 데이터와 `/healthz`를 제공한다.
- select에 모든 테마가 표시되고 전환 시 해당 타임라인만 보인다.
- 각 타임라인에 날짜, 제목, 설명과 선택적 이미지·출처가 표시된다.
- 정상 `data.json` 교체 후 재빌드·Nginx reload·브라우저 새로고침 없이 5초 안에 변경이 반영된다.
- 잘못된 갱신 파일은 적용하지 않고 마지막 정상 데이터를 유지한다.
- 잘못된 데이터, 네트워크 실패, 깨진 이미지에서 빈 화면이나 무한 로딩이 발생하지 않는다.
- 모바일과 키보드 조작으로 핵심 기능을 사용할 수 있다.
- 운영자가 `HOWTO_MAKE_DATA.md`만으로 사람이 직접 또는 LLM을 이용해 유효한 데이터를 만들 수 있다.

## 12. 구현 전 확정할 사항

다음 항목은 코딩을 막지는 않으며 기본값으로 시작할 수 있다.

- 실제 서비스명과 페이지 제목
- 기본 선택 테마: 배열의 첫 번째 항목 사용
- 이미지 정책: 로컬 파일 우선, 외부 URL은 필요한 경우에만 허용
- 날짜 표시 언어: 한국어, 입력은 ISO 8601
- 기존 Nginx의 공개 URL: 기본 `/chrono/`, 실제 인프라 경로가 다르면 Vite base path와 함께 확정
