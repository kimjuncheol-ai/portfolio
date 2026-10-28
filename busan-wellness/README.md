# 슬로웨이브 부산

한국관광공사 웰니스관광정보와 부산축제정보를 결합하는 여행 추천 웹서비스입니다. 별도 프레임워크 설치 없이 Node.js 22 이상에서 실행하며 Vercel Node Functions로 배포합니다.

## 로컬 실행

프로젝트 폴더에서 실행합니다.

```powershell
node scripts/dev.mjs
```

http://localhost:3210 에서 확인합니다. 키가 없으면 명확하게 표시된 미리보기만 제공합니다.

## API 키 등록

```powershell
cd 'C:\Users\user\Desktop\JC\포폴\busan-wellness'
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\register-keys.ps1
```

입력 순서는 `TOUR_API_KEY` (한국관광공사 웰니스관광정보), `BUSAN_FESTIVAL_API_KEY` (부산축제정보)입니다. 각각 공공데이터포털의 일반 인증키 Decoding 값을 붙여넣고 Enter를 누르세요. 입력은 숨겨지며 두 서비스를 같은 인증키로 이용하더라도 각각 입력합니다. Encoding 키도 지원합니다. 두 서비스 모두 활용신청 승인이 필요합니다.

키는 프로젝트 `.env`에만 저장됩니다. `.gitignore`와 `.vercelignore`에 등록되어 Git과 정적 배포에서 제외됩니다. 웹 화면에는 키 입력란이 없고 브라우저 요청은 같은 출처 `/api/explore`만 사용합니다. 로컬 서버는 다음 요청에서 `.env`를 다시 읽으므로 등록 후 페이지 새로고침으로 전환됩니다. 실제 키를 채팅에 보내지 마세요.

## 추천과 화면 기능

- 같은 구·군에 20점 가산, 거리에 최대 30점 부여. 직선거리 25km 이내에서 웰니스 장소별 최대 3개 축제 연결.
- 좌표가 없으면 같은 구·군인 경우에만 추천하고 거리 미상 표시.
- 지역·웰니스 테마·축제 월 검색, 거리·이름 정렬, 더 보기.
- 여행 상세에서 방문 순서, 일정 원문, 가격, 교통·편의시설(제공될 때), 지도 검색 링크 확인.
- 여행 저장은 브라우저 localStorage 사용. 링크 공유는 콘텐츠 ID를 사용.
- 지역 지도는 실제 경계·축척이 아닌 명시적인 구·군 개념도. 장소별 위치는 네이버 지도로 연결.
- 축제 월 검색은 원문의 `N월`만 사용. 월 범위의 중간 달·숫자 날짜·현재 진행 여부는 추정하지 않음.
- 실제 API 실패 시 오류 표시, 예시로 조용히 대체하지 않음. 성공 결과는 서버 메모리에 30분 캐싱.

## API 구현 근거

첨부 웰니스 v4.1 매뉴얼: `WellnessTursmService/areaBasedList`, `lDongRegnCd=26`, `langDivCd=KOR`, `MobileOS=ETC`, `MobileApp=BusanSlowwave`, `_type=json`. `contentId`, `baseAddr`, `mapX`, `mapY`, `wellnessThemaCd` 필드를 사용합니다. 부산축제는 `FestivalService/getFestivalKr`, `ServiceKey`, `resultType=json`과 `UC_SEQ`, `GUGUN_NM`, `LAT`, `LNG`, `USAGE_DAY_WEEK_AND_TIME` 등을 사용합니다. 두 서비스의 성공코드 및 응답 구조 차이를 처리하고 페이지별 조회합니다.

- [웰니스관광정보](https://www.data.go.kr/data/15144030/openapi.do)
- [부산축제정보 서비스](https://www.data.go.kr/data/15063500/openapi.do)
- [Vercel Node.js Functions](https://vercel.com/docs/functions/runtimes/node-js)

미리보기의 장소·축제 조합은 현재 개최 정보나 한국관광공사 공식 지정 여부를 확정하지 않습니다. 실데이터는 실제 키 등록 후 조회하여 검증해야 합니다. 가이드 문서 내부 내용은 API 명세 참고 자료로만 사용했습니다.

## Vercel 배포

프로젝트 Root Directory는 `busan-wellness`, Framework는 Other, Output Directory는 `public`입니다. `vercel.json`이 빌드와 함수 구성을 지정합니다. 저장소 전체가 아닌 이 프로젝트 폴더에서 배포하세요.

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\deploy-vercel.ps1
```

스크립트는 로그인, 프로젝트 연결, `.env`의 두 키를 stdin으로 Vercel Production 환경변수에 등록하고 `vercel --prod`를 실행합니다. 로컬 `.env`는 Vercel 서버로 자동 복사되지 않으므로 서버 환경변수 등록이 필요합니다. 환경변수 변경 후 재배포해야 적용됩니다. 배포 스크립트가 키를 명령 인자나 로그에 출력하지 않도록 구성했습니다. Vercel CLI는 공식 npm 레지스트리 패키지를 사용합니다.

## 검증

```powershell
node --test tests/*.test.mjs
node scripts/check.mjs
```

## 이미지 출처

상단 해운대 사진: 부산광역시, [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Busan_City_Haeundae_Beach_KOGL_(01).jpg), 공공누리 제1유형. 웹용 크기와 압축 적용. 스파랜드 예시 사진은 첨부 한국관광공사 매뉴얼의 이미지 URL, 숲 사진은 기존 프로젝트의 미리보기 이미지입니다. 실 API 이미지는 제공기관 출처를 표시하고 Type3 이미지에는 원본 비율을 유지합니다. 이미지 없는 장소에는 그래픽을 표시합니다.
