# 페이지별 구조화 데이터

기준 URL: https://kimjuncheol-ai.github.io/portfolio/

각 HTML의 `<head>`에 정적 JSON-LD를 직접 포함합니다. 화면 렌더링이나 검색 로봇의 JavaScript 실행에 의존해 메타데이터를 삽입하지 않습니다. 본문·디자인·공통 CSS는 변경하지 않습니다.

| 페이지 | 스키마 | 실제 내용 |
|---|---|---|
| index.html | ProfilePage, Person, WebSite | 김준철의 자기소개와 픽셀 초상 |
| about.html | AboutPage, Brand | 딸깍상사 소개·슬로건·브랜드 로고 |
| report.html | CollectionPage, ItemList, TouristAttraction, Museum | 페이지 순서 그대로 관광지 6곳의 주소·소개·공식 사이트·지도·이미지 |
| contents.html | CollectionPage, ItemList, CreativeWork | 프로젝트 5개와 로컬 제작 영상 16개 |
| sns.html | CollectionPage, Brand, ItemList, VideoObject, CreativeWork | SNS 5개 채널, 숏폼 19편, 카드뉴스 2편과 각 시리즈의 8개 이미지 |
| final.html | WebPage | 현재 표시된 final_project 기본 페이지 정보 |
| admin.html | WebPage | 관리자 로그인 페이지. 기존 noindex,nofollow 유지; 관리자 신원·인증 정보 제외 |
| projects/frame/index.html | WebPage, WebApplication | FRAME 프리비즈 스튜디오 |

공개 페이지에는 절대 URL의 canonical을 함께 지정했습니다. 다른 서비스인 `busan-wellness/public/index.html`은 포트폴리오 페이지 목록에 포함하지 않습니다.

## 데이터 원칙

- 본문에 없는 평점·리뷰·가격·사업자 정보·완성 프로젝트·검색 기능은 만들지 않습니다.
- 딸깍상사와 아르투어부산은 Brand로 구분하고, 포트폴리오 소유자 Person과 혼동하지 않습니다.
- Shorts의 게시 시각은 2026-11-09에 확인한 YouTube 메타데이터의 실제 시간대 포함 값을 사용했습니다. 게시일이 확인되지 않은 로컬 제작 영상은 CreativeWork로 표현하며 파일 생성일을 공개일로 사용하지 않습니다.
- 최초 등록하는 새 Shorts에 검증된 게시 시각이 없으면 CreativeWork로 생성합니다. 기존 JSON-LD의 검증된 VideoObject 게시 시각은 재생성할 때 보존합니다.
- `report-resources.js`는 API로 화면의 주소·소개가 바뀔 때 해당 관광지 JSON-LD도 같은 값으로 갱신합니다. API 연결 실패 시 정적 저장 정보가 남습니다.
- JSON-LD와 Schema.org 검증을 통과해도 검색 결과의 특수 표시·노출 순위는 보장하지 않습니다. 목록·외부 영상 링크를 개별 영상 시청 페이지라고 취급하지 않습니다.

## 재생성 및 검사

이 저장소의 작업 환경에 설치된 Node.js와 Playwright를 사용합니다. 배포 시에는 생성된 HTML만 읽으므로 별도 빌드나 패키지 설치가 필요하지 않습니다.

```powershell
node scripts/update-structured-data.cjs
node scripts/validate-structured-data.cjs
```

새 영상의 확인된 YouTube 메타데이터 JSON 배열(`videoId`, `publishDate`)이 있으면 재생성 명령의 첫 번째 인자로 전달할 수 있습니다. API 키나 인증 토큰은 넣지 않습니다.

검사기는 공식 Schema.org 어휘를 내려받아 타입·속성·상속·값의 타입·엔터티 참조를 확인합니다. 별도 어휘 JSON 파일이 있으면 첫 번째 인자로 전달할 수 있습니다. `--compare-head` 옵션은 현재 HEAD와 본문·공통 CSS·공통 JS가 같은지도 추가 검사합니다.

검증 범위: 8개 페이지 JSON-LD, 관광지·프로젝트·Shorts의 실제 HTML 대조, 목록 개수와 순서, 이미지 파일 존재, 관리자 검색 제외, PC 1440px 및 모바일 390px의 화면·미디어 배치 비교, 관광 API 응답 후 메타데이터 동기화. 브라우저의 이미지 리샘플링·WebGL 출력은 픽셀 비교에서 가리고 원본 경로·크기·위치·표시 스타일을 별도 대조합니다.

2026-11-09 검증 결과: 위 8개 페이지를 공식 Schema.org 검사기에 각각 입력해 모두 오류 0개·경고 0개를 확인했습니다. 로컬 타입·속성·참조·본문 대조, PC/모바일 16개 화면 비교, 관광 API 갱신 후 JSON-LD 일치, 재생성 시 파일 불변 검사도 통과했습니다.

참고: [Google 구조화 데이터 정책](https://developers.google.com/search/docs/appearance/structured-data/sd-policies), [Google ProfilePage](https://developers.google.com/search/docs/appearance/structured-data/profile-page), [Google VideoObject](https://developers.google.com/search/docs/appearance/structured-data/video), [Schema.org 어휘](https://schema.org/version/latest/schemaorg-current-https.jsonld), [Schema.org 검사기](https://validator.schema.org/).
