# data.json 작성 안내

이 디렉터리(`import/`)에 `data.json`과 이미지를 두고 import하면 앱의 DB로 옮겨집니다. import에 성공하면 `data.json`과 import된 이미지는 자동 삭제됩니다. 실행 방법은 README의 "데이터 관리"를 참고하세요.

`data.json`은 UTF-8 JSON 파일이며 최상위 `version`은 `1`, `themes`에는 한 개 이상의 테마가 필요합니다.

## 필드

- `theme.id`, `item.id`: 영문 소문자, 숫자, 하이픈으로 만든 고유 ID
- `theme.name`: 선택 상자에 표시할 테마명
- `item.date`: `YYYY`, `YYYY-MM` 또는 `YYYY-MM-DD` (연도만, 월까지만 아는 사건도 쓸 수 있음)
- `item.title`, `item.description`: HTML이 아닌 일반 텍스트. `description`은 카드 요약
- `item.body`: 선택 필드. 상세 패널에 표시할 설명이며 생략하면 `description` 사용
- `item.tags`: 선택 필드. 태그 필터와 검색에 사용하는 문자열 배열
- `item.media`: 선택 필드. 카드와 상세 패널에 보여줄 이미지·동영상 **최대 5개의 배열** (아래 참고)
- `item.sourceUrl`: 선택 필드. 사실을 확인할 수 있는 `https` URL

항목은 날짜순으로 작성합니다. 앱도 표시 전에 날짜순으로 다시 정렬합니다.

## 미디어

`media`는 미디어 객체의 배열입니다.

- 이미지와 동영상을 섞어 **최대 5개**까지 넣을 수 있습니다. 6개 이상이면 import가 거부됩니다.
- 배열 순서대로 표시되며, **첫 번째 항목이 카드의 대표 이미지**가 됩니다. 상세 패널에는 모두 표시됩니다.
- 한 사건 안에서 같은 `src`를 두 번 넣을 수 없습니다.
- 이전 형식처럼 객체 하나만 적어도 됩니다(`"media": { ... }`는 `"media": [{ ... }]`와 같습니다). export는 항상 배열로 출력합니다.

각 객체의 `type`은 `image` 또는 `video`이며, 두 형식 모두 선택적으로 `caption`(상세 패널 미디어 아래 설명)을 넣을 수 있습니다.

### 이미지

| 필드 | 필수 | 설명 |
| --- | --- | --- |
| `type` | 예 | `"image"` |
| `src` | 예 | `data.json` 기준 상대 경로 또는 `https` URL |
| `alt` | 예 | 이미지 내용을 설명하는 대체 텍스트 |
| `caption` | 아니요 | 이미지 출처 또는 설명 |

로컬 이미지(`webp`, `avif`, `png`, `jpg`, `jpeg`, `gif`, `svg`, 파일당 10MB 이하)는 `data.json`과 같은 디렉터리 안에 두고, `data.json` 위치를 기준으로 한 상대 경로로 적습니다. 예를 들어 `import/images/example.webp` 파일은 `"images/example.webp"`(또는 `"./images/example.webp"`)로 기록합니다. `/`로 시작하는 경로나 `..`로 상위 디렉터리를 가리키는 경로는 허용하지 않습니다. `http` URL도 허용하지 않습니다.

### 동영상

| 필드 | 필수 | 설명 |
| --- | --- | --- |
| `type` | 예 | `"video"` |
| `src` | 예 | YouTube URL 또는 동영상 파일(`.mp4`, `.webm` 등)의 `https` URL |
| `poster` | 아니요 | YouTube가 아닌 동영상의 미리보기 이미지. 경로 규칙은 이미지 `src`와 같음 |
| `caption` | 아니요 | 동영상 출처 또는 설명 |

YouTube는 `https://www.youtube.com/watch?v=ID`, `https://youtu.be/ID`, `/embed/ID`, `/shorts/ID` 형식을 지원하며, 썸네일은 YouTube에서 자동으로 가져옵니다. 동영상은 로컬 파일을 지원하지 않으므로 `https` URL만 사용합니다.

## 예시

```json
{
  "version": 1,
  "themes": [
    {
      "id": "sample-theme",
      "name": "샘플 테마",
      "items": [
        {
          "id": "sample-event",
          "date": "2026-01-01",
          "title": "사건 제목",
          "description": "검증된 사실을 간결하게 설명합니다.",
          "body": "상세 패널에서 보여줄 설명입니다.",
          "tags": ["샘플", "연표"],
          "media": [
            {
              "type": "image",
              "src": "images/example.webp",
              "alt": "이미지의 의미를 설명하는 문장",
              "caption": "이미지 출처 또는 설명"
            },
            {
              "type": "image",
              "src": "images/example-2.webp",
              "alt": "두 번째 이미지 설명"
            }
          ],
          "sourceUrl": "https://example.com/source"
        },
        {
          "id": "sample-video",
          "date": "2026-02-01",
          "title": "동영상이 있는 사건",
          "description": "YouTube 동영상을 함께 보여줍니다.",
          "media": [
            {
              "type": "video",
              "src": "https://www.youtube.com/watch?v=FlpstXNjImY",
              "caption": "동영상 출처 또는 설명"
            }
          ]
        }
      ]
    }
  ]
}
```

## LLM 프롬프트

아래 프롬프트 뒤에 근거 자료를 붙여 사용합니다.

```text
제공된 근거 자료만 사용해 data.json version 1 규격의 JSON을 작성하라.
JSON 외의 설명과 Markdown 코드 펜스는 출력하지 마라.
모르는 사실, 날짜, 출처 URL을 만들지 마라.
테마와 항목의 id는 영문 소문자, 숫자, 하이픈만 사용하고 각 범위에서 중복하지 마라.
date는 YYYY, YYYY-MM 또는 YYYY-MM-DD 형식으로 쓰고 항목을 날짜 오름차순으로 정렬하라.
title, description, body에는 HTML을 넣지 마라. 검색에 유용한 핵심어를 tags 문자열 배열로 작성하라.
이미지나 동영상은 media 배열에 최대 5개까지 넣는다. 첫 번째 항목이 대표 이미지다. 이미지는 {"type":"image","src","alt","caption"?}, 동영상은 {"type":"video","src","poster"?,"caption"?} 형식을 따르고, 한 사건 안에서 같은 src를 반복하지 마라.
이미지 src는 data.json 기준 상대 경로(예: images/example.webp) 또는 https URL, 동영상 src는 YouTube URL 또는 https 동영상 파일 URL만 쓴다.
저작권과 실제 파일 경로·URL이 확인되지 않은 미디어는 media 필드를 생략하라.
출처가 있다면 https URL만 사용하라.
출력 전 JSON 문법, 필수 필드, 날짜 형식, ID 중복을 검사하라.
```

import 전에 `--dry-run`으로 검증하는 것을 권장합니다. import는 기본적으로 **추가 전용**입니다. 이미 있는 `theme.id`에 새 `item.id`의 항목을 넣으면 그 테마 뒤에 추가되고, 이미 있는 `item.id`의 항목과 테마 이름은 건드리지 않고 건너뜁니다(화면에서 편집한 내용 보호). 기존 항목을 파일 내용으로 바꾸려면 export한 `data.json`과 `images/`를 이 디렉터리에 넣고 수정한 뒤 `--overwrite`로 import합니다.
