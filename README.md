# Chrono Timeline

테마를 선택해 이미지와 텍스트로 구성된 타임라인을 보는 개인용 웹사이트입니다. 앱 컨테이너가 화면과 데이터를 직접 제공하며, 기존 Nginx는 HTTP 프록시만 담당합니다.

화면 데이터는 컨테이너 볼륨의 SQLite DB와 미디어 디렉터리에 저장됩니다. `import/`에 넣은 `data.json`과 이미지를 import하면 DB로 옮겨지고 원본은 자동 삭제되며, 열린 화면에도 5초 안에 반영됩니다.

초기 화면에는 모든 테마가 표시됩니다. 테마 필터, 날짜·제목·내용 검색 점프와 Light/Dark 모드를 제공합니다.

## 로컬 개발

Node.js 22 이상이 필요합니다.

```bash
npm install
npm run build
npm start      # API·미디어 서버 :3000 (저장소: .store/)
npm run dev    # Vite :5173, /chrono/api 요청은 :3000으로 프록시
```

<http://localhost:5173/chrono/>에서 확인합니다. 로컬 데이터는 `npm run import`로 `import/`의 내용을 `.store/`에 넣습니다(원본이 삭제되니 주의하세요).

프로덕션 서버를 로컬에서 확인하려면 먼저 빌드합니다.

```bash
npm run build
npm start
```

이때 주소는 <http://localhost:3000/chrono/>입니다.

## 데이터 관리

- `import/HOWTO_MAKE_DATA.md`: 필드 규격, 예시, LLM용 프롬프트
- `import/data.json`, `import/images/`: import할 원본. **import에 성공하면 `data.json`과 import한 이미지가 자동 삭제됩니다.** 참조되지 않은 파일과 HOWTO 문서는 남습니다.

```bash
# 검증만 (아무것도 바꾸지 않음)
docker compose run --rm chrono node store.mjs import /import --dry-run
# import (기본: 같은 id 항목은 덮어쓰고 새 항목은 추가)
docker compose run --rm chrono node store.mjs import /import
# 파일에 포함된 테마에서, 파일에 없는 항목은 삭제
docker compose run --rm chrono node store.mjs import /import --replace
```

원본이 삭제되면 DB가 유일한 사본입니다. 데이터를 고칠 때와 백업할 때는 export를 씁니다. export 결과는 그대로 `import/`에 넣어 다시 import할 수 있습니다.

```bash
docker compose run --rm -v "$PWD/export:/export" chrono node store.mjs export /export
```

정기 백업이 필요하면 호스트 cron에 등록합니다.

```cron
0 4 * * * cd /path/to/chrono && docker compose run --rm -v "$PWD/backup/$(date +\%Y\%m\%d):/export" chrono node store.mjs export /export
```

> `docker compose down -v`는 DB 볼륨(`chrono-store`)까지 삭제합니다. 사용하지 마세요.

## Docker Compose 운영

기존 Nginx 컨테이너가 참여 중인 Docker 네트워크 이름을 지정해 실행합니다. 기본값은 `proxy`입니다.

```bash
NGINX_NETWORK=proxy docker compose up -d --build
```

`chrono` 컨테이너만 named volume `chrono-store`(`/var/lib/chrono`, DB와 미디어)와 호스트 `import/`(`/import`)를 마운트합니다. 컨테이너는 `node` 사용자(uid 1000)로 실행되므로, Linux 호스트에서는 import 원본을 삭제할 수 있도록 `import/`에 uid 1000의 쓰기 권한이 필요합니다. Nginx 컨테이너에는 이 프로젝트의 경로나 볼륨을 마운트하지 않습니다.

## 기존 Nginx 연결

Nginx 컨테이너를 `chrono`와 같은 Docker 네트워크에 연결하고 [`nginx/chrono-proxy.conf.example`](nginx/chrono-proxy.conf.example)의 내용을 기존 `server` 블록에 포함합니다.

```nginx
location /chrono/ {
    proxy_pass http://chrono:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

Nginx 설정 반영에는 최초 한 번 reload가 필요합니다. 이후 화면 배포는 앱 컨테이너 재빌드, 데이터 변경은 import만으로 처리합니다.

## 검증

```bash
npm test
npm run build
npm audit
```

- 상태 확인: `GET /healthz`
- 웹사이트: `GET /chrono/`
- 타임라인 데이터: `GET /chrono/api/timeline`
- 미디어: `GET /chrono/api/media/<sha256>.<ext>`

상세 설계는 [`documents/PROJECT_PLAN.md`](documents/PROJECT_PLAN.md)와 데이터 저장소 구조를 다룬 [`documents/DATA_STORE_PLAN.md`](documents/DATA_STORE_PLAN.md)를 참고하세요.
