# Chrono Timeline

테마를 선택해 이미지와 텍스트로 구성된 타임라인을 보는 개인용 웹사이트입니다. 앱 컨테이너가 화면과 데이터를 직접 제공하며, 기존 Nginx는 HTTP 프록시만 담당합니다.

화면 데이터는 컨테이너 볼륨의 SQLite DB와 미디어 디렉터리에 저장됩니다. `import/`에 넣은 `data.json`과 이미지를 import하면 DB로 옮겨지고 원본은 자동 삭제되며, 열린 화면에도 5초 안에 반영됩니다.

초기 화면에는 모든 테마가 표시됩니다. 테마·태그 필터, 날짜·제목·내용 검색과 Light/Dark 모드를 제공합니다. LNB 상단의 설정 아이콘(`/settings`)에서 import·reset과 Obsidian 디렉터리 동기화를 관리합니다. LNB의 **편집 허용** 스위치를 켜면 테마·사건 삭제와 상세 패널에서의 날짜·제목·내용·태그 수정, 이미지 추가·삭제(사건당 최대 5개)를 할 수 있습니다. 모바일 화면(760px 이하)에서는 편집할 수 없습니다.

## 로컬 개발

Node.js 22 이상이 필요합니다.

```bash
npm install
npm run build
npm start      # API·미디어 서버 :3000 (저장소: .store/)
npm run dev    # Vite :5173, /api 요청은 :3000으로 프록시
```

<http://localhost:5173/>에서 확인합니다. 로컬 데이터는 `npm run import`로 `import/`의 내용을 `.store/`에 넣습니다(원본이 삭제되니 주의하세요).

프로덕션 서버를 로컬에서 확인하려면 먼저 빌드합니다.

```bash
npm run build
npm start
```

이때 주소는 <http://localhost:3000/>입니다.

## 데이터 관리

- `import/HOWTO_MAKE_DATA.md`: 필드 규격, 예시, LLM용 프롬프트
- `import/data.json`, `import/images/`: import할 원본. **import에 성공하면 `data.json`과 import한 이미지가 자동 삭제됩니다.** 참조되지 않은 파일과 HOWTO 문서는 남습니다.

**화면에서 import:** 설정 화면(`/settings`)의 **import** 버튼을 누르면, 서버의 import 디렉터리(컨테이너 `/import`, 로컬 `import/`)를 먼저 검증해 추가·건너뜀 건수를 보여 주고, 확인하면 가져옵니다. 동작은 아래 기본 import(추가 전용)와 같습니다. **데이터 초기화** 카드의 **reset** 버튼은 저장된 모든 테마·사건과 첨부 이미지를 삭제합니다(되돌릴 수 없으니 먼저 export로 백업하세요). Obsidian에서 동기화하는 테마는 reset·export 대상이 아닙니다.

**명령으로 import:** 덮어쓰기(`--overwrite`)나 교체(`--replace`)가 필요할 때 씁니다. 컨테이너가 떠 있으면 `run --rm` 대신 `exec`도 됩니다.

```bash
# 검증만 (아무것도 바꾸지 않음)
docker compose run --rm chrono node store.mjs import /import --dry-run
# import (기본: 추가 전용. 새 테마·새 항목만 넣고, 이미 있는 항목과 테마 이름은 그대로 둔다)
docker compose run --rm chrono node store.mjs import /import
# 이미 있는 항목도 파일 내용으로 덮어쓰기 (화면에서 편집한 내용이 사라질 수 있음)
docker compose run --rm chrono node store.mjs import /import --overwrite
# --overwrite에 더해, 파일에 포함된 테마에서 파일에 없는 항목은 삭제
docker compose run --rm chrono node store.mjs import /import --replace
```

건너뛴 항목은 결과의 `skipped`, `skippedIds`에 표시됩니다.

원본이 삭제되면 DB가 유일한 사본입니다. 간단한 수정은 화면의 편집 기능을 쓰고, 백업이나 대량 수정에는 export를 씁니다. export 결과를 고친 뒤 `import/`에 넣고 `--overwrite`로 다시 import합니다.

```bash
docker compose run --rm -v "$PWD/export:/export" chrono node store.mjs export /export
```

정기 백업이 필요하면 호스트 cron에 등록합니다.

```cron
0 4 * * * cd /path/to/chrono && docker compose run --rm -v "$PWD/backup/$(date +\%Y\%m\%d):/export" chrono node store.mjs export /export
```

> `docker compose down -v`는 DB 볼륨(`chrono-store`)까지 삭제합니다. 사용하지 마세요.

## Obsidian 동기화

설정 화면에서 Obsidian vault의 디렉터리(3단계까지 트리로 표시)를 골라 테마로 등록하면, 그 아래 `.md` 노트가 사건으로 들어오고 노트를 고치면 몇 초 안에 반영됩니다(5분마다 전체 재검사도 함). 상세 규칙은 [documents/SETTINGS_OBSIDIAN_PLAN.md](documents/SETTINGS_OBSIDIAN_PLAN.md)를 참고하세요.

- **디렉터리 선택:** 이미 동기화 중인 디렉터리와 그 상위·하위 디렉터리는 고를 수 없습니다. 같은 노트가 두 테마에 들어가지 않게 하기 위해서입니다(서버도 같은 규칙으로 거부).
- **마운트:** `compose.yaml`이 vault(`/home/kyo/syncthing/obsidian/personal`)를 컨테이너 `/vault`에 **읽기 전용**으로 연결합니다(`VAULT_DIR=/vault`). 앱은 vault를 절대 수정하지 않습니다. 경로가 다르면 `compose.yaml`을 고치세요.
- **변환 규칙:** 날짜는 frontmatter `date` → 파일 이름 앞의 `YYYY`, `YYYY-MM`, `YYYY-MM-DD` 순으로 찾고, 날짜가 없는 노트는 건너뛰고 설정 화면에 보고합니다. 제목은 frontmatter `title`(앞의 날짜 제거), 요약은 frontmatter `description`/`summary` 또는 본문 첫 문단입니다. 본문은 Markdown(표·제목·목록)으로 보이고, 첫 이미지가 카드 대표 이미지가 됩니다. PDF·동영상 등 이미지가 아닌 첨부는 파일 링크로 바뀝니다.
- **태그:** frontmatter `tags`와 본문의 `#태그`를 씁니다. 의미 없는 태그(예: `#e775`)는 설정 화면의 "무시할 태그"에 넣으세요.
- **읽기 전용:** 동기화한 테마와 사건은 편집 허용이어도 수정·삭제할 수 없고, 내부 API(`/internal/v1`)에는 아예 나오지 않습니다. 없애려면 설정 화면에서 동기화를 해제합니다(vault는 그대로).
- **첨부 파일 제공:** `/api/vault/…`는 동기화한 노트가 참조하는 파일만 줍니다. vault의 다른 노트나 파일은 받을 수 없습니다.
- **기존 데이터와 중복:** 같은 노트로 만든 `data.json`을 이미 import했다면(예: `travel` 테마) 같은 사건이 두 번 보입니다. 동기화한 결과를 확인한 뒤 편집 모드에서 기존 테마를 삭제하세요. 손으로 다듬은 요약은 옮겨지지 않으니, 필요하면 노트 frontmatter에 `description`을 넣으세요.

## Docker Compose 운영

`chrono` 컨테이너는 기존 Nginx 컨테이너가 참여 중인 외부 Docker 네트워크 `websvr`에 연결됩니다. 네트워크 이름이 다르면 `compose.yaml`의 `networks`를 수정하세요. 네트워크가 없다면 먼저 만듭니다(`docker network create websvr`).

```bash
docker compose up -d --build
```

`chrono` 컨테이너만 named volume `chrono-store`(`/var/lib/chrono`, DB와 미디어)와 호스트 `import/`(`/import`)를 마운트합니다. 컨테이너는 `node` 사용자(uid 1000)로 실행되므로, Linux 호스트에서는 import 원본을 삭제할 수 있도록 `import/`에 uid 1000의 쓰기 권한이 필요합니다. Nginx 컨테이너에는 이 프로젝트의 경로나 볼륨을 마운트하지 않습니다.

## 기존 Nginx 연결

앱은 루트(`/`) 경로를 쓰므로 Chrono 전용 도메인(또는 서브도메인)의 `server` 블록으로 연결합니다. Nginx 컨테이너를 `chrono`와 같은 Docker 네트워크에 연결하고 [`nginx/chrono-proxy.conf.example`](nginx/chrono-proxy.conf.example)을 참고해 `server` 블록을 추가합니다.

```nginx
location / {
    auth_basic "Chrono";                              # 인증 필수 (다른 방식도 가능)
    auth_basic_user_file /etc/nginx/chrono.htpasswd;
    client_max_body_size 10m;                         # 이미지 업로드
    proxy_pass http://chrono:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

> **인증은 Nginx가 맡습니다.** 앱에는 자체 인증이 없고, 편집 API(삭제·수정·업로드)가 있으므로 사이트 전체(`/`)에 반드시 인증을 걸어야 합니다. 앱은 다른 사이트에서 보낸 쓰기 요청(CSRF)만 거부합니다. 또한 `chrono:3000`은 같은 Docker 네트워크의 다른 컨테이너가 Nginx를 거치지 않고 접근할 수 있으므로, 그 네트워크에는 신뢰하는 컨테이너만 두세요.

### 내부 API 외부 차단

`/internal/` 경로는 같은 서버의 다른 컨테이너가 쓰는 인증 없는 API입니다([연동 규격](import/API_SPEC.md), [개발 계획](documents/INTERNAL_API_PLAN.md)). **외부에 절대 열면 안 되므로**, 앱을 프록시하는 모든 `server` 블록에 아래 `location`을 `location /`보다 앞에 추가합니다. `^~`는 이 경로가 정규식 `location`보다도 우선하게 합니다.

```nginx
location ^~ /internal/ {
    return 404;
}
```

- `location /`의 `proxy_set_header X-Forwarded-For …`는 지우지 마세요. 앱은 이 헤더가 붙은(= Nginx를 거친) `/internal/` 요청을 한 번 더 거부합니다. 차단 블록을 빠뜨렸을 때의 안전장치입니다.
- 적용 후 확인:
  ```bash
  nginx -t && nginx -s reload                                   # Nginx 컨테이너 안에서
  curl -i https://<도메인>/internal/v1/themes                    # 외부: 404여야 함
  docker run --rm --network websvr curlimages/curl -s http://chrono:3000/internal/v1/themes   # 내부: 테마 목록
  ```
- 내부 API는 `chrono:3000`에 닿는 모든 컨테이너(`websvr` 네트워크)가 인증 없이 조회·등록·수정할 수 있습니다. 이 네트워크에는 신뢰하는 컨테이너만 연결하세요.

Nginx 설정 반영에는 최초 한 번 reload가 필요합니다. 이후 화면 배포는 앱 컨테이너 재빌드, 데이터 변경은 import만으로 처리합니다.

## 검증

```bash
npm test
npm run build
npm audit
```

- 상태 확인: `GET /healthz`
- 웹사이트: `GET /`
- 타임라인 데이터: `GET /api/timeline`
- 설정: `GET /api/settings/vault[?path=]`, `GET|POST /api/settings/sources`, `PATCH|DELETE /api/settings/sources/<테마>`, `POST /api/settings/sources/<테마>/sync`
- vault 첨부: `GET /api/vault/<vault 기준 경로>` (동기화한 노트가 참조하는 파일만)
- 미디어: `GET /api/media/<sha256>.<ext>`
- 내부 API(컨테이너 간, 외부 차단): `/internal/v1/themes[/…]` — [규격](import/API_SPEC.md)
- 편집(헤더 `X-Chrono-Edit: 1` 필요): `POST /api/import[?dryRun=1]`, `POST /api/reset`, `DELETE /api/themes/<테마>`, `DELETE|PATCH /api/themes/<테마>/items/<사건>`, `POST /api/themes/<테마>/items/<사건>/media`, `POST /api/themes/<테마>/items/<사건>/cover`(대표 이미지 변경, Obsidian 사건 포함), `DELETE …/media/<순번>`

상세 설계는 [`documents/PROJECT_PLAN.md`](documents/PROJECT_PLAN.md), 데이터 저장소 구조를 다룬 [`documents/DATA_STORE_PLAN.md`](documents/DATA_STORE_PLAN.md), 편집 기능을 다룬 [`documents/EDIT_FEATURE_PLAN.md`](documents/EDIT_FEATURE_PLAN.md)를 참고하세요.
