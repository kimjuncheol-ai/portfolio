(() => {
  const config = window.SITE_AI_CONFIG || {};
  const isConfigured = Boolean(config.supabaseUrl && config.publishableKey);
  const pageName = location.pathname.split('/').pop() || 'index.html';

  const fallbackKnowledge = [
    {
      "slug": "arte",
      "question": "아르떼뮤지엄 부산은 어떤 곳인가요?",
      "terms": [
        "아르떼뮤지엄",
        "아르떼 뮤지엄",
        "arte museum",
        "영도 미디어아트"
      ],
      "answer": "아르떼뮤지엄 부산은 영도구 해양로247번길 29에 있는 몰입형 미디어아트 전시 공간입니다. 빛·소리·향으로 자연과 부산의 풍경을 경험하며, report의 [4] 카드에서 상세 소개와 공식 홈페이지를 확인할 수 있습니다.",
      "source": [
        "report.html",
        "report"
      ]
    },
    {
      "slug": "museum1",
      "question": "뮤지엄 원은 어떤 곳인가요?",
      "terms": [
        "뮤지엄 원",
        "뮤지엄원",
        "museum1",
        "museum 1",
        "센텀 미디어아트"
      ],
      "answer": "뮤지엄 원은 해운대구 센텀서로 20에 있는 미디어 전문 현대미술관입니다. LED로 둘러싸인 공간의 영상과 설치 작품을 감상할 수 있으며, report의 [3] 카드에서 상세 소개와 공식 홈페이지를 확인할 수 있습니다.",
      "source": [
        "report.html",
        "report"
      ]
    },
    {
      "slug": "hurshim",
      "question": "허심청은 어떤 곳인가요?",
      "terms": [
        "허심청",
        "동래온천",
        "온천욕",
        "온천",
        "찜질"
      ],
      "answer": "허심청은 동래구 온천장로107번길 32에 있는 도시형 온천 시설입니다. 다양한 온천탕과 찜질·휴식 공간을 이용할 수 있습니다. report의 [5] 카드에서 상세 내용을 볼 수 있으며 이용 시간·요금은 공식 홈페이지를 확인해 주세요.",
      "source": [
        "report.html",
        "report"
      ]
    },
    {
      "slug": "report-api",
      "question": "Report는 어떤 API로 업데이트되나요?",
      "terms": [
        "공공데이터",
        "api",
        "데이터 연결",
        "실시간",
        "자동 갱신",
        "업데이트",
        "led"
      ],
      "answer": "Report는 한국관광공사_국문 관광정보 서비스_GW와 한국관광공사_웰니스관광정보 API를 사용합니다. 부산 6곳의 주소·상세 소개와 팝업의 제공 사진을 갱신하며 카드의 녹색 픽셀 이미지는 고정합니다. 초록 LED는 두 API 정상 응답, 노랑은 확인 중·부분 연결, 빨강은 응답 확인 불가를 뜻합니다. 응답은 최대 30분 캐시하므로 실시간 운영·예약 가능 여부를 보증하지 않습니다. 인증키는 서버에서만 사용합니다.",
      "source": [
        "report.html#resource-api-title",
        "API 연결 상태와 출처"
      ]
    },
    {
      "slug": "report-upcoming",
      "question": "추가 구현 예정 공간은 어디인가요?",
      "terms": [
        "구현 예정",
        "추가 예정",
        "예정 목록",
        "next destinations",
        "고은사진미술관",
        "깡깡이"
      ],
      "answer": "Report에는 F1963, 고은사진미술관, 부산근현대역사관, 영화의전당, 부산영화체험박물관, 부산문화회관, 깡깡이예술마을, 흰여울문화마을, 부산박물관, 복천박물관, 도모헌, 을숙도생태공원 등 부산 12곳을 추가 구현 예정으로 소개합니다. 아직 상세 카드와 API 연동이 완료된 목록은 아닙니다. F1963과 도모헌은 SNS 페이지의 아르투어부산 카드뉴스로 먼저 소개하고 있습니다.",
      "source": [
        "report.html#resource-planned-title",
        "추가 구현 예정 공간"
      ]
    },
    {
      "slug": "report-pixel",
      "question": "관광지 카드 이미지는 어떤 스타일인가요?",
      "terms": [
        "픽셀",
        "픽셀 이미지",
        "8비트",
        "8bit",
        "카드 이미지",
        "녹색 이미지"
      ],
      "answer": "Report의 관광지 6곳은 녹색 계열의 1:1 픽셀 아트 카드로 통일했습니다. 이미지에 마우스를 올리면 밝아지고, 클릭하면 Windows 95 탐색기 스타일의 상세 팝업이 열립니다. API가 갱신되어도 카드의 픽셀 이미지는 유지됩니다.",
      "source": [
        "report.html",
        "report"
      ]
    },
    {
      "slug": "profile",
      "question": "김준철은 어떤 사람인가요?",
      "terms": [
        "김준철",
        "누구",
        "소개",
        "전공",
        "root"
      ],
      "answer": "김준철은 대학에서 신학을, 대학원에서 종교철학을 공부했습니다. 대한성공회 부산교구 성직청원자이며 AI를 활용한 로컬 관광 콘텐츠·서비스 제작 역량을 기르고 있습니다.",
      "source": [
        "index.html",
        "home"
      ]
    },
    {
      "slug": "tour-resources",
      "question": "선정 관광 자원을 알려주세요.",
      "terms": [
        "관광",
        "자원",
        "추천",
        "미술관",
        "report",
        "몇 곳",
        "여섯 곳",
        "6곳"
      ],
      "answer": "Report의 부산 관광 자원은 총 여섯 곳입니다. [1] 부산현대미술관, [2] 부산시립미술관, [3] 뮤지엄 원, [4] 아르떼뮤지엄 부산, [5] 허심청, [6] 부산어린이대공원 치유의 숲 순서로, 예술 감상에서 온천·자연 속 휴식으로 이어지도록 배치했습니다. 카드를 좌우로 넘겨 여섯 곳을 살펴보고, 픽셀 이미지를 누르면 해당 관광지의 상세 탐색기 팝업이 열립니다.",
      "source": [
        "report.html",
        "report"
      ]
    },
    {
      "slug": "moca",
      "question": "부산현대미술관은 어떤 곳인가요?",
      "terms": [
        "현대미술관",
        "moca",
        "을숙도"
      ],
      "answer": "부산현대미술관은 을숙도의 생태환경과 동시대 예술이 맞닿는 서부산의 공립미술관입니다. 현대미술 전시, 어린이예술도서관, 을숙도 생태 탐방을 함께 경험할 수 있습니다.",
      "source": [
        "report.html",
        "report"
      ]
    },
    {
      "slug": "bma",
      "question": "부산시립미술관은 현재 운영하나요?",
      "terms": [
        "시립미술관",
        "이우환"
      ],
      "answer": "부산시립미술관은 부산 미술과 국내외 현대미술, 이우환의 작품 세계를 소개하는 공립미술관입니다. Report의 [2] 카드에서 소개와 주소, 상세 팝업을 볼 수 있습니다. 최신 전시·운영 일정은 연결된 공식 홈페이지에서 확인해 주세요.",
      "source": [
        "report.html",
        "report"
      ]
    },
    {
      "slug": "forest",
      "question": "치유의 숲은 어떤 곳인가요?",
      "terms": [
        "치유의 숲",
        "어린이대공원",
        "편백",
        "성지곡"
      ],
      "answer": "부산어린이대공원 치유의 숲은 성지곡수원지와 편백림을 걷는 도심 속 웰니스 공간입니다. 편백숲 걷기, 호흡과 명상, 수원지 산책을 대표 체험으로 소개합니다.",
      "source": [
        "report.html",
        "report"
      ]
    },
    {
      "slug": "company",
      "question": "딸깍상사는 어떤 회사인가요?",
      "terms": [
        "딸깍상사",
        "회사",
        "브랜드",
        "about"
      ],
      "answer": "딸깍상사는 AI·관광·콘텐츠를 중심으로 부산의 장소와 이야기를 콘텐츠와 서비스로 바꾸는 크리에이티브 컴퍼니입니다. 원칙은 “반복 업무는 AI에게, 방향과 최종 책임은 사람에게”입니다.",
      "source": [
        "about.html",
        "about"
      ]
    },
    {
      "slug": "contents",
      "question": "Contents에는 어떤 작업이 있나요?",
      "terms": [
        "콘텐츠",
        "contents",
        "ai 제작",
        "제작 연습",
        "영상 연습",
        "모션 스터디",
        "프로젝트",
        "작업 모음",
        "로컬 영상"
      ],
      "answer": "Contents에는 프로젝트 5개와 로컬 제작 영상 16편이 있습니다. AI 영상 제작 연습 8편, AI 아이돌 3편, 엘라·부산 퍼포먼스·씨걸이 야외 스케치 3편, 액션 프리비즈 2편을 모았습니다. 뿌 초기 디자인과 부산 홍보 포스터도 볼 수 있습니다. 아르투어부산 프로젝트의 숏폼 19편 링크는 SNS의 전체 영상 모음으로 연결됩니다. 상단의 프로젝트 5개는 좌우 화살표나 스와이프로 넘겨 보고 각 카드의 실행·방문 링크로 연결할 수 있습니다.",
      "source": [
        "contents.html",
        "contents"
      ]
    },
    {
      "slug": "ppoo",
      "question": "부산에 떨어진 뿌는 무엇인가요?",
      "terms": [
        "뿌",
        "ppoo",
        "외계인"
      ],
      "answer": "부산에 떨어진 뿌는 우주선 고장으로 부산에 불시착한 외계인이 부산의 음식과 사투리, 예술과 온천을 경험하는 로컬 관찰 예능 IP입니다. Contents의 캐릭터·포스터 섹션에서 초기 설정 시트와 두 장의 장면 이미지를 볼 수 있습니다.",
      "source": [
        "contents.html#ppoo-project",
        "부산에 떨어진 뿌"
      ]
    },
    {
      "slug": "ella",
      "question": "엘라 브이로그는 어디에 있나요?",
      "terms": [
        "엘라",
        "브이로그",
        "부산 배경 퍼포먼스",
        "스토리 필름",
        "야외 스케치"
      ],
      "answer": "Contents의 스토리 필름에는 약 56초의 엘라의 부산 당일치기, 부산 배경 퍼포먼스, 씨걸이의 야외 스케치가 있습니다. 원본 화면비로 보고 크게 보기 버튼으로 소리와 함께 감상할 수 있습니다. 씨걸이의 전체 숏폼 19편과 최신작 THE BERET는 SNS의 숏폼 모음에 있습니다.",
      "source": [
        "contents.html#story-films",
        "스토리 필름"
      ]
    },
    {
      "slug": "action-previz",
      "question": "액션 프리비즈는 무엇인가요?",
      "terms": [
        "액션",
        "프리비즈 원본",
        "rect",
        "무도가"
      ],
      "answer": "액션 프리비즈 섹션에는 rect-rush-10s 원본과 캐릭터·공간 적용 실험 영상이 함께 있습니다. 회색 무도가와 레이스 무도가 캐릭터 시트, 스카이브리지 공간 이미지도 배치했습니다.",
      "source": [
        "contents.html#action-previz",
        "액션 프리비즈"
      ]
    },
    {
      "slug": "busan-posters",
      "question": "부산 홍보 포스터를 볼 수 있나요?",
      "terms": [
        "포스터",
        "홍보 이미지"
      ],
      "answer": "Contents의 부산 홍보 포스터 항목에는 상어의 형상과 북항 야경을 결합한 포스터, 세일러 캐릭터를 앞세운 포스터 두 작품이 있습니다. 이미지를 누르면 원본 비율로 크게 볼 수 있습니다.",
      "source": [
        "contents.html#busan-posters",
        "부산 홍보 포스터"
      ]
    },
    {
      "slug": "artour-character",
      "question": "아르투어부산 캐릭터와 초기 구상을 알려주세요.",
      "terms": [
        "초기 구상",
        "초기 콘셉트",
        "초기 컨셉",
        "씨걸이 캐릭터",
        "갈매기 캐릭터"
      ],
      "answer": "SNS 페이지에는 아르투어부산의 예술·웰니스 초기 구상과 씨걸이 캐릭터 설명이 있습니다. 푸른 베레모와 크로스백을 공유하는 귀여운 기본형, 실제 갈매기의 질감을 살린 실사형 시트를 함께 볼 수 있습니다.",
      "source": [
        "sns.html#artour-character",
        "아르투어부산 캐릭터와 초기 구상"
      ]
    },
    {
      "slug": "bukang",
      "question": "집에 가자 부캉아는 어떤 게임인가요?",
      "terms": [
        "부캉",
        "게임",
        "북항",
        "unity"
      ],
      "answer": "집에 가자 부캉아는 북항 수로를 배경으로 한 Unity 3D 횡스크롤 액션 게임입니다. 물대포와 파도, 다섯 유형의 관람객과 150초 뒤 등장하는 보스를 구현했습니다. Contents에서 실행 화면과 제작 내용을 볼 수 있으며 게임의 웹 배포는 준비 중입니다.",
      "source": [
        "contents.html#bukang-project",
        "집에 가자 부캉아"
      ]
    },
    {
      "slug": "seagull",
      "question": "씨걸이의 부산 예술지도는 무엇인가요?",
      "terms": [
        "씨걸",
        "예술지도",
        "예술 지도",
        "seagull"
      ],
      "answer": "씨걸이의 부산 예술지도는 다섯 예술 공간의 방문 안내, 전시 소식, 연계 산책 코스를 탐색하는 웹사이트입니다. Contents의 예술지도 열기 링크에서 로그인 없이 둘러볼 수 있습니다. 운영·전시 자료는 2026년 10월 19일 조사 기준입니다.",
      "source": [
        "contents.html#seagull-project",
        "씨걸이의 부산 예술지도"
      ]
    },
    {
      "slug": "frame",
      "question": "FRAME 스튜디오는 어떤 도구인가요?",
      "terms": [
        "frame",
        "프리비즈",
        "스튜디오",
        "3d",
        "마네킹"
      ],
      "answer": "FRAME은 사진, 3D 마네킹과 제품을 배치하고 카메라 구도를 조절해 PNG로 저장하는 프리비즈 도구입니다. Contents의 스튜디오 실행 버튼으로 열 수 있고 사진은 브라우저 안에서 처리됩니다. 사진의 입체감은 간이 깊이 표현이며 실제 3D 스캔은 아닙니다.",
      "source": [
        "contents.html#frame-project",
        "FRAME 프리비즈 스튜디오"
      ]
    },
    {
      "slug": "social",
      "question": "아르투어부산 SNS 채널은 어디인가요?",
      "terms": [
        "아르투어부산",
        "아르투어 부산",
        "sns",
        "인스타그램",
        "유튜브",
        "네이버 블로그",
        "페이스북",
        "facebook",
        "트위터",
        "5채널"
      ],
      "answer": "아르투어부산은 부산의 예술과 여행을 연결하는 로컬 콘텐츠 채널입니다. X → YouTube → Instagram → Facebook → 네이버 블로그 순서로 다섯 채널을 안내합니다. SNS 페이지에는 씨걸이 숏폼 19편, 도모헌·F1963 카드뉴스 두 편, 캐릭터 기본형·실사형과 초기 구상이 있습니다. 각 작품에서 확인된 원문으로 이동할 수 있습니다.",
      "source": [
        "sns.html",
        "sns"
      ]
    },
    {
      "slug": "artour-cardnews",
      "question": "아르투어부산 카드뉴스는 어디서 볼 수 있나요?",
      "terms": [
        "카드뉴스",
        "카드 뉴스",
        "release.log"
      ],
      "answer": "SNS 페이지의 카드뉴스 섹션에는 아르투어부산 시리즈 두 편이 있습니다. 2026년 11월 3일의 도모헌 편은 카페 모모스에서 소소풍라운지와 소소풍 정원으로 이어지는 산책을, 10월 22일의 F1963 편은 테라로사 수영점에서 건축·전시·예술도서관·대나무 소리길로 이어지는 코스를 여덟 장으로 소개합니다. 카드를 누르면 원본 크기로 볼 수 있고 Instagram, 네이버 블로그, X 게시물로 이동할 수 있습니다.",
      "source": [
        "sns.html#artour-cardnews",
        "아르투어부산 카드뉴스"
      ]
    },
    {
      "slug": "slowwave",
      "question": "슬로웨이브 부산은 무엇인가요?",
      "terms": [
        "슬로웨이브",
        "slowwave",
        "웰니스 축제",
        "축제 여행"
      ],
      "answer": "슬로웨이브 부산은 한국관광공사 웰니스관광정보와 부산축제정보 공공데이터 API로 부산의 쉼과 축제를 연결하는 여행 추천 웹서비스입니다. Contents의 [5] 프로젝트에 있는 웹사이트 보기 링크로 이용할 수 있습니다. Report의 관광지 API 연동과는 별도의 서비스입니다.",
      "source": [
        "contents.html#slowwave-project",
        "슬로웨이브 부산"
      ]
    },
    {
      "slug": "programs",
      "question": "관광지 체험 프로그램을 알려주세요.",
      "terms": [
        "체험 프로그램",
        "프로그램",
        "체험",
        "교육 프로그램"
      ],
      "answer": "Report 카드의 이미지를 눌러 탐색기를 연 다음 체험 프로그램 폴더를 선택하세요. 미술관은 전시·미디어아트 감상, 허심청은 온천욕·찜질·휴식, 어린이대공원 치유의 숲은 숲길·수원지 산책을 소개합니다. 일정과 예약·요금은 공식 홈페이지에서 확인해야 합니다.",
      "source": [
        "report.html",
        "report"
      ]
    },
    {
      "slug": "artour-shorts",
      "question": "최신 씨걸이 숏폼과 전체 영상은 어디서 볼 수 있나요?",
      "terms": [
        "최신 씨걸이",
        "씨걸이 영상",
        "씨걸이 숏폼",
        "최신 숏폼",
        "최신 영상",
        "숏폼",
        "shorts",
        "숏폼 몇",
        "영상은 몇",
        "영상 몇 편",
        "19편",
        "아르투어부산 최신"
      ],
      "answer": "SNS 페이지의 씨걸이 숏폼 모음에는 총 19편이 있습니다. 2026년 11월 6일 공개된 17편을 추가했으며 최신작은 30초 액션 예고편 《THE BERET》입니다. 부산 예술여행 하루 코스, 그림 속 여행, 영화의전당 런웨이, 도모헌 정원 등도 볼 수 있습니다. 좌우로 넘겨 작품을 고른 뒤 YouTube 등 각 채널에서 전체 영상을 감상하세요.",
      "source": [
        "sns.html#artour-shorts",
        "씨걸이 숏폼 19편"
      ]
    },
    {
      "slug": "artour-domoheon",
      "question": "도모헌 카드뉴스는 어떤 내용인가요?",
      "terms": [
        "도모헌",
        "도모헌 카드뉴스",
        "카페 모모스",
        "소소풍라운지",
        "소소풍 정원"
      ],
      "answer": "도모헌 카드뉴스는 2026년 11월 3일 공개한 8장 시리즈입니다. 옛 부산시장 관사에서 시민 문화공간으로 바뀐 도모헌을 카페 모모스, 소소풍라운지, 소소풍 정원과 함께 소개합니다. 방문 안내와 저장·공유 카드까지 좌우로 넘겨 보고, 각 카드를 누르면 원본을 볼 수 있습니다.",
      "source": [
        "sns.html#cardnews-domoheon",
        "도모헌 카드뉴스"
      ]
    },
    {
      "slug": "artour-f1963",
      "question": "F1963 카드뉴스는 어떤 내용인가요?",
      "terms": [
        "f1963",
        "f1963 카드뉴스",
        "테라로사",
        "대나무 소리길"
      ],
      "answer": "F1963 카드뉴스는 2026년 10월 22일 공개한 8장 시리즈입니다. 테라로사 수영점에서 시작해 옛 와이어 공장의 건축, 전시, 예술도서관, 대나무 소리길로 이어지는 산책을 소개합니다. SNS에서 좌우로 넘기거나 카드 원본과 연결된 게시물을 볼 수 있습니다.",
      "source": [
        "sns.html#cardnews-f1963",
        "F1963 카드뉴스"
      ]
    },
    {
      "slug": "media-navigation",
      "question": "프로젝트·관광지·채널·영상을 어떻게 넘기고 열어 보나요?",
      "terms": [
        "슬라이드",
        "좌우로",
        "넘겨 보기",
        "넘기는",
        "스와이프",
        "크게 보기",
        "크게 보",
        "영상 재생",
        "영상 비율",
        "영상 소리",
        "프로젝트 넘기",
        "관광지 넘기",
        "채널 넘기",
        "카드 넘기"
      ],
      "answer": "Contents의 프로젝트 5개, Report의 관광지 6곳, SNS의 채널 5개와 비슷한 영상·카드뉴스·이미지는 한 줄로 모았습니다. PC에서는 좌우 화살표나 가로 스크롤, 모바일에서는 스와이프로 넘길 수 있습니다. 목록에 키보드 초점을 두면 좌우 방향키와 Home·End 키도 사용할 수 있고, 목록 위 숫자로 현재 보이는 항목을 확인할 수 있습니다. 관광지의 픽셀 이미지는 상세 팝업을 열고, 프로젝트와 SNS 채널은 방문 링크로 연결됩니다. Contents 영상은 원본 비율을 유지하며 크게 보기에서 소리를 켤 수 있습니다.",
      "source": [
        "contents.html#projects",
        "가로 목록 사용 방법"
      ]
    },
    {
      "slug": "final-project",
      "question": "final_project 페이지에는 어떤 내용이 있나요?",
      "terms": [
        "final",
        "final_project",
        "최종 프로젝트",
        "완성 프로젝트"
      ],
      "answer": "현재 final_project 페이지에는 제목만 마련되어 있습니다. 공개된 프로젝트 5개와 영상 제작 작업은 Contents 페이지에서 볼 수 있습니다.",
      "source": [
        "final.html",
        "final_project"
      ]
    },
    {
      "slug": "artour-short-R7GuS-eGlgc",
      "question": "《작전명 아르투어부산, 씨걸이 액션 예고편 〈THE BERET〉》 영상은 어떤 내용인가요?",
      "terms": [
        "작전명 아르투어부산, 씨걸이 액션 예고편 〈THE BERET〉",
        "the beret",
        "베레모",
        "작전명",
        "액션 예고편"
      ],
      "answer": "《작전명 아르투어부산, 씨걸이 액션 예고편 〈THE BERET〉》는 2026년 11월 6일 공개한 아르투어부산의 30초 AI 캐릭터 영상입니다. 부산의 모든 예술이 사라진 상황에서 레이저 경보를 피해 명화를 되찾는 씨걸이의 액션 예고편입니다. SNS의 숏폼 모음에서 해당 작품을 찾아 YouTube 등 연결된 채널로 전체 영상을 볼 수 있습니다.",
      "source": [
        "sns.html#artour-shorts",
        "작전명 아르투어부산, 씨걸이 액션 예고편 〈THE BERET〉"
      ]
    },
    {
      "slug": "artour-short-iZiGoajz63k",
      "question": "《씨걸이의 부산 예술여행 하루 코스》 영상은 어떤 내용인가요?",
      "terms": [
        "씨걸이의 부산 예술여행 하루 코스",
        "부산 예술여행 하루 코스",
        "하루 코스"
      ],
      "answer": "《씨걸이의 부산 예술여행 하루 코스》는 2026년 11월 6일 공개한 아르투어부산의 30초 AI 캐릭터 영상입니다. SNS의 숏폼 모음에서 해당 작품을 찾아 YouTube 등 연결된 채널로 전체 영상을 볼 수 있습니다.",
      "source": [
        "sns.html#artour-shorts",
        "씨걸이의 부산 예술여행 하루 코스"
      ]
    },
    {
      "slug": "artour-short-2z0K8uExmJ4",
      "question": "《그림 속으로 뛰어든 씨걸이》 영상은 어떤 내용인가요?",
      "terms": [
        "그림 속으로 뛰어든 씨걸이",
        "그림 속으로",
        "그림 속 여행"
      ],
      "answer": "《그림 속으로 뛰어든 씨걸이》는 2026년 11월 6일 공개한 아르투어부산의 30초 AI 캐릭터 영상입니다. SNS의 숏폼 모음에서 해당 작품을 찾아 YouTube 등 연결된 채널로 전체 영상을 볼 수 있습니다.",
      "source": [
        "sns.html#artour-shorts",
        "그림 속으로 뛰어든 씨걸이"
      ]
    },
    {
      "slug": "artour-short-iAFqjx-fNjU",
      "question": "《영화의전당 런웨이에 선 씨걸이, 비트마다 변신》 영상은 어떤 내용인가요?",
      "terms": [
        "영화의전당 런웨이에 선 씨걸이, 비트마다 변신",
        "런웨이",
        "영화의전당 런웨이"
      ],
      "answer": "《영화의전당 런웨이에 선 씨걸이, 비트마다 변신》는 2026년 11월 6일 공개한 아르투어부산의 30초 AI 캐릭터 영상입니다. SNS의 숏폼 모음에서 해당 작품을 찾아 YouTube 등 연결된 채널로 전체 영상을 볼 수 있습니다.",
      "source": [
        "sns.html#artour-shorts",
        "영화의전당 런웨이에 선 씨걸이, 비트마다 변신"
      ]
    },
    {
      "slug": "artour-short-1Wf18tAp08A",
      "question": "《야생의 씨걸이, 미술관에 가다》 영상은 어떤 내용인가요?",
      "terms": [
        "야생의 씨걸이, 미술관에 가다",
        "야생의 씨걸이",
        "다큐 패러디"
      ],
      "answer": "《야생의 씨걸이, 미술관에 가다》는 2026년 11월 6일 공개한 아르투어부산의 30초 AI 캐릭터 영상입니다. SNS의 숏폼 모음에서 해당 작품을 찾아 YouTube 등 연결된 채널로 전체 영상을 볼 수 있습니다.",
      "source": [
        "sns.html#artour-shorts",
        "야생의 씨걸이, 미술관에 가다"
      ]
    },
    {
      "slug": "artour-short-3j9XEsFXciw",
      "question": "《사진미술관에서 영감 받은 씨걸이의 부산 스냅》 영상은 어떤 내용인가요?",
      "terms": [
        "사진미술관에서 영감 받은 씨걸이의 부산 스냅",
        "부산 스냅",
        "사진미술관 영상"
      ],
      "answer": "《사진미술관에서 영감 받은 씨걸이의 부산 스냅》는 2026년 11월 6일 공개한 아르투어부산의 30초 AI 캐릭터 영상입니다. SNS의 숏폼 모음에서 해당 작품을 찾아 YouTube 등 연결된 채널로 전체 영상을 볼 수 있습니다.",
      "source": [
        "sns.html#artour-shorts",
        "사진미술관에서 영감 받은 씨걸이의 부산 스냅"
      ]
    },
    {
      "slug": "artour-short-LcNPtQl4jsw",
      "question": "《지하철 문이 열릴 때마다 변하는 씨걸이》 영상은 어떤 내용인가요?",
      "terms": [
        "지하철 문이 열릴 때마다 변하는 씨걸이",
        "지하철 문",
        "지하철 씨걸이"
      ],
      "answer": "《지하철 문이 열릴 때마다 변하는 씨걸이》는 2026년 11월 6일 공개한 아르투어부산의 30초 AI 캐릭터 영상입니다. SNS의 숏폼 모음에서 해당 작품을 찾아 YouTube 등 연결된 채널로 전체 영상을 볼 수 있습니다.",
      "source": [
        "sns.html#artour-shorts",
        "지하철 문이 열릴 때마다 변하는 씨걸이"
      ]
    },
    {
      "slug": "artour-short-9yxj4PdmyKc",
      "question": "《씨걸이 vs 비둘기, 영도 벽화 스피드 배틀》 영상은 어떤 내용인가요?",
      "terms": [
        "씨걸이 vs 비둘기, 영도 벽화 스피드 배틀",
        "비둘기",
        "벽화 배틀"
      ],
      "answer": "《씨걸이 vs 비둘기, 영도 벽화 스피드 배틀》는 2026년 11월 6일 공개한 아르투어부산의 30초 AI 캐릭터 영상입니다. SNS의 숏폼 모음에서 해당 작품을 찾아 YouTube 등 연결된 채널로 전체 영상을 볼 수 있습니다.",
      "source": [
        "sns.html#artour-shorts",
        "씨걸이 vs 비둘기, 영도 벽화 스피드 배틀"
      ]
    },
    {
      "slug": "artour-short-JBi62cPZZwg",
      "question": "《자갈치 새벽 경매에서 씨걸이가 낙찰받은 것》 영상은 어떤 내용인가요?",
      "terms": [
        "자갈치 새벽 경매에서 씨걸이가 낙찰받은 것",
        "자갈치",
        "새벽 경매"
      ],
      "answer": "《자갈치 새벽 경매에서 씨걸이가 낙찰받은 것》는 2026년 11월 6일 공개한 아르투어부산의 30초 AI 캐릭터 영상입니다. SNS의 숏폼 모음에서 해당 작품을 찾아 YouTube 등 연결된 채널로 전체 영상을 볼 수 있습니다.",
      "source": [
        "sns.html#artour-shorts",
        "자갈치 새벽 경매에서 씨걸이가 낙찰받은 것"
      ]
    },
    {
      "slug": "artour-short-UVDOtvPccDQ",
      "question": "《씨걸이 시점으로 부산 예술지도를 날아 봤다》 영상은 어떤 내용인가요?",
      "terms": [
        "씨걸이 시점으로 부산 예술지도를 날아 봤다",
        "fpv",
        "예술지도를 날아"
      ],
      "answer": "《씨걸이 시점으로 부산 예술지도를 날아 봤다》는 2026년 11월 6일 공개한 아르투어부산의 30초 AI 캐릭터 영상입니다. SNS의 숏폼 모음에서 해당 작품을 찾아 YouTube 등 연결된 채널로 전체 영상을 볼 수 있습니다.",
      "source": [
        "sns.html#artour-shorts",
        "씨걸이 시점으로 부산 예술지도를 날아 봤다"
      ]
    },
    {
      "slug": "artour-short-VXgM8_-qbmo",
      "question": "《씨걸이의 어린 시절, 광안리에서 처음 붓을 든 날》 영상은 어떤 내용인가요?",
      "terms": [
        "씨걸이의 어린 시절, 광안리에서 처음 붓을 든 날",
        "어린 시절",
        "처음 붓"
      ],
      "answer": "《씨걸이의 어린 시절, 광안리에서 처음 붓을 든 날》는 2026년 11월 6일 공개한 아르투어부산의 30초 AI 캐릭터 영상입니다. SNS의 숏폼 모음에서 해당 작품을 찾아 YouTube 등 연결된 채널로 전체 영상을 볼 수 있습니다.",
      "source": [
        "sns.html#artour-shorts",
        "씨걸이의 어린 시절, 광안리에서 처음 붓을 든 날"
      ]
    },
    {
      "slug": "artour-short-RrO6QMVmLVM",
      "question": "《도모헌 정원에서 하루를 보낸 씨걸이》 영상은 어떤 내용인가요?",
      "terms": [
        "도모헌 정원에서 하루를 보낸 씨걸이",
        "도모헌 정원에서"
      ],
      "answer": "《도모헌 정원에서 하루를 보낸 씨걸이》는 2026년 11월 6일 공개한 아르투어부산의 30초 AI 캐릭터 영상입니다. SNS의 숏폼 모음에서 해당 작품을 찾아 YouTube 등 연결된 채널로 전체 영상을 볼 수 있습니다.",
      "source": [
        "sns.html#artour-shorts",
        "도모헌 정원에서 하루를 보낸 씨걸이"
      ]
    },
    {
      "slug": "artour-short-yGas7SWgwHE",
      "question": "《미술관에서 작품인 척하던 씨걸이의 최후》 영상은 어떤 내용인가요?",
      "terms": [
        "미술관에서 작품인 척하던 씨걸이의 최후",
        "작품인 척",
        "미술관 작품인"
      ],
      "answer": "《미술관에서 작품인 척하던 씨걸이의 최후》는 2026년 11월 6일 공개한 아르투어부산의 30초 AI 캐릭터 영상입니다. SNS의 숏폼 모음에서 해당 작품을 찾아 YouTube 등 연결된 채널로 전체 영상을 볼 수 있습니다.",
      "source": [
        "sns.html#artour-shorts",
        "미술관에서 작품인 척하던 씨걸이의 최후"
      ]
    },
    {
      "slug": "artour-short-scQCI-Zfb-s",
      "question": "《와이어 공장에서 커피 마시는 씨걸이?》 영상은 어떤 내용인가요?",
      "terms": [
        "와이어 공장에서 커피 마시는 씨걸이?",
        "와이어 공장에서 커피"
      ],
      "answer": "《와이어 공장에서 커피 마시는 씨걸이?》는 2026년 11월 6일 공개한 아르투어부산의 30초 AI 캐릭터 영상입니다. SNS의 숏폼 모음에서 해당 작품을 찾아 YouTube 등 연결된 채널로 전체 영상을 볼 수 있습니다.",
      "source": [
        "sns.html#artour-shorts",
        "와이어 공장에서 커피 마시는 씨걸이?"
      ]
    },
    {
      "slug": "artour-short-Pt2TVh1oXNE",
      "question": "《옥상에서 그림 그리던 씨걸이가 캔버스를 놓친 순간》 영상은 어떤 내용인가요?",
      "terms": [
        "옥상에서 그림 그리던 씨걸이가 캔버스를 놓친 순간",
        "캔버스를 놓친"
      ],
      "answer": "《옥상에서 그림 그리던 씨걸이가 캔버스를 놓친 순간》는 2026년 11월 6일 공개한 아르투어부산의 30초 AI 캐릭터 영상입니다. SNS의 숏폼 모음에서 해당 작품을 찾아 YouTube 등 연결된 채널로 전체 영상을 볼 수 있습니다.",
      "source": [
        "sns.html#artour-shorts",
        "옥상에서 그림 그리던 씨걸이가 캔버스를 놓친 순간"
      ]
    },
    {
      "slug": "artour-short-8wQXvJDziyE",
      "question": "《새우깡 대신 붓을 훔친 씨걸이》 영상은 어떤 내용인가요?",
      "terms": [
        "새우깡 대신 붓을 훔친 씨걸이",
        "새우깡",
        "붓을 훔친"
      ],
      "answer": "《새우깡 대신 붓을 훔친 씨걸이》는 2026년 11월 6일 공개한 아르투어부산의 30초 AI 캐릭터 영상입니다. SNS의 숏폼 모음에서 해당 작품을 찾아 YouTube 등 연결된 채널로 전체 영상을 볼 수 있습니다.",
      "source": [
        "sns.html#artour-shorts",
        "새우깡 대신 붓을 훔친 씨걸이"
      ]
    },
    {
      "slug": "artour-short-N60e1VIv6TI",
      "question": "《노을 앞에서 갑자기 춤추기 시작한 씨걸이》 영상은 어떤 내용인가요?",
      "terms": [
        "노을 앞에서 갑자기 춤추기 시작한 씨걸이",
        "노을 앞에서",
        "춤추기 시작한"
      ],
      "answer": "《노을 앞에서 갑자기 춤추기 시작한 씨걸이》는 2026년 11월 6일 공개한 아르투어부산의 30초 AI 캐릭터 영상입니다. SNS의 숏폼 모음에서 해당 작품을 찾아 YouTube 등 연결된 채널로 전체 영상을 볼 수 있습니다.",
      "source": [
        "sns.html#artour-shorts",
        "노을 앞에서 갑자기 춤추기 시작한 씨걸이"
      ]
    },
    {
      "slug": "artour-short-o_zs5KoBEXA",
      "question": "《바다를 그리던 갈매기가 갑자기 진지해진 이유》 영상은 어떤 내용인가요?",
      "terms": [
        "바다를 그리던 갈매기가 갑자기 진지해진 이유",
        "바다를 그리던",
        "야외 스케치 영상"
      ],
      "answer": "《바다를 그리던 갈매기가 갑자기 진지해진 이유》는 2026년 11월 3일 공개한 아르투어부산의 30초 AI 캐릭터 영상입니다. SNS의 숏폼 모음에서 해당 작품을 찾아 YouTube 등 연결된 채널로 전체 영상을 볼 수 있습니다.",
      "source": [
        "sns.html#artour-shorts",
        "바다를 그리던 갈매기가 갑자기 진지해진 이유"
      ]
    },
    {
      "slug": "artour-short-8KEOQmPHO7A",
      "question": "《부산 여행하던 갈매기가 갑자기 진지해진 이유》 영상은 어떤 내용인가요?",
      "terms": [
        "부산 여행하던 갈매기가 갑자기 진지해진 이유",
        "부산 여행하던 갈매기"
      ],
      "answer": "《부산 여행하던 갈매기가 갑자기 진지해진 이유》는 2026년 10월 22일 공개한 아르투어부산의 20초 AI 캐릭터 영상입니다. SNS의 숏폼 모음에서 해당 작품을 찾아 YouTube 등 연결된 채널로 전체 영상을 볼 수 있습니다.",
      "source": [
        "sns.html#artour-shorts",
        "부산 여행하던 갈매기가 갑자기 진지해진 이유"
      ]
    }
  ];

  const shell = document.createElement('section');
  shell.className = 'site-ai';
  shell.dataset.page = pageName;
  shell.innerHTML = `
    <button class="site-ai__launcher" type="button" aria-expanded="false" aria-controls="site-ai-panel">
      <span class="site-ai__launcher-mark" aria-hidden="true">&gt;_</span>
      <span class="sr-only">사이트 안내 AI 열기</span>
    </button>
    <aside class="site-ai__panel" id="site-ai-panel" aria-label="사이트 안내 AI" hidden>
      <header class="site-ai__header">
        <div><strong>site_rag.bot</strong><span><i aria-hidden="true"></i>${isConfigured ? 'online' : 'local preview'}</span></div>
        <button class="site-ai__close" type="button" aria-label="챗봇 닫기">×</button>
      </header>
      <section class="site-ai__consent" aria-labelledby="site-ai-consent-title">
        <p class="site-ai__consent-code">PRIVACY / CONSENT v1</p>
        <h2 id="site-ai-consent-title">챗봇 이용 정보 수집 동의</h2>
        <p>사이트 안내와 답변 품질 확인을 위해 다음 정보를 수집합니다.</p>
        <dl>
          <div><dt>수집 항목</dt><dd>익명 세션 ID, 질문·답변, 접속 페이지, 이용 시각</dd></div>
          <div><dt>이용 목적</dt><dd>사이트 질문 응답, 답변 시나리오 개선</dd></div>
          <div><dt>보관 기간</dt><dd>현재 탭: 탭 종료 시 삭제 / 서버: 수집일로부터 90일</dd></div>
          <div><dt>저장 위치</dt><dd>현재 브라우저 탭 및 Supabase 클라우드 데이터베이스</dd></div>
        </dl>
        <p class="site-ai__consent-note">동의를 거부할 수 있으나, 거부하면 챗봇을 이용할 수 없습니다. 광고·마케팅 목적으로 사용하지 않습니다.</p>
        <label class="site-ai__consent-check"><input type="checkbox"><span>위 내용을 확인했으며 정보 수집에 동의합니다.</span></label>
        <div class="site-ai__consent-actions"><button type="button" data-consent-accept disabled>동의하고 시작</button><button type="button" data-consent-close>동의하지 않음</button></div>
      </section>
      <div class="site-ai__messages" role="log" aria-live="polite" aria-relevant="additions"></div>
      <div class="site-ai__suggestions" aria-label="추천 질문"></div>
      <form class="site-ai__form">
        <label class="sr-only" for="site-ai-input">질문</label>
        <span aria-hidden="true">$</span>
        <textarea id="site-ai-input" rows="1" maxlength="500" placeholder="사이트에 대해 물어보세요" required></textarea>
        <button type="submit" aria-label="질문 보내기">↵</button>
      </form>
      <p class="site-ai__scope"><span>이 사이트의 공개된 내용만 근거로 답합니다.</span><button type="button" data-consent-withdraw>동의 철회·대화 삭제</button></p>
    </aside>`;
  document.body.append(shell);

  const launcher = shell.querySelector('.site-ai__launcher');
  const panel = shell.querySelector('.site-ai__panel');
  const closeButton = shell.querySelector('.site-ai__close');
  const messages = shell.querySelector('.site-ai__messages');
  const suggestions = shell.querySelector('.site-ai__suggestions');
  const form = shell.querySelector('.site-ai__form');
  const input = shell.querySelector('textarea');
  const submitButton = form.querySelector('button');
  const consentPanel = shell.querySelector('.site-ai__consent');
  const consentCheck = shell.querySelector('.site-ai__consent-check input');
  const consentAccept = shell.querySelector('[data-consent-accept]');
  const consentClose = shell.querySelector('[data-consent-close]');
  const consentWithdraw = shell.querySelector('[data-consent-withdraw]');
  const tabStateKey = 'site-ai-tab-state-v1';
  const consentKey = 'site-ai-consent-v1';
  const createSessionId = () => crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`;
  const readTabState = () => {
    try {
      const stored = JSON.parse(sessionStorage.getItem(tabStateKey) || 'null');
      return stored?.version === 1 ? stored : null;
    } catch (error) {
      return null;
    }
  };
  const savedTabState = readTabState();
  let sessionId = typeof savedTabState?.sessionId === 'string' ? savedTabState.sessionId : createSessionId();
  const history = Array.isArray(savedTabState?.history)
    ? savedTabState.history.filter((item) => ['user', 'assistant'].includes(item?.role) && typeof item?.content === 'string').slice(-12)
    : [];
  const transcript = Array.isArray(savedTabState?.transcript)
    ? savedTabState.transcript.filter((item) => ['user', 'assistant'].includes(item?.role) && typeof item?.text === 'string').slice(-30)
    : [];
  const persistTabState = () => {
    try {
      sessionStorage.setItem(tabStateKey, JSON.stringify({
        version: 1,
        sessionId,
        history: history.slice(-12),
        transcript: transcript.slice(-30),
        panelOpen: !panel.hidden
      }));
    } catch (error) { /* Continue without persistence when storage is unavailable. */ }
  };
  let hasConsent = false;
  try { hasConsent = localStorage.getItem(consentKey) === 'accepted'; } catch (error) { hasConsent = false; }
  consentPanel.hidden = hasConsent;

  const addMessage = (role, text, sources = [], { persist = true } = {}) => {
    const item = document.createElement('article');
    item.className = `site-ai__message site-ai__message--${role}`;
    const label = document.createElement('strong');
    label.textContent = role === 'assistant' ? 'guide@portfolio:~$' : 'visitor@portfolio:~$';
    const copy = document.createElement('p');
    copy.textContent = text;
    item.append(label, copy);
    if (sources.length) {
      const sourceList = document.createElement('div');
      sourceList.className = 'site-ai__sources';
      sources.forEach((source) => {
        const link = document.createElement('a');
        link.href = source.url || source[0];
        link.textContent = `[${source.title || source[1]}]`;
        link.addEventListener('click', () => window.gtag?.('event', 'chatbot_source_click', { source_page: link.href }));
        sourceList.append(link);
      });
      item.append(sourceList);
    }
    messages.append(item);
    messages.scrollTop = messages.scrollHeight;
    if (persist) {
      transcript.push({ role, text, sources });
      if (transcript.length > 30) transcript.splice(0, transcript.length - 30);
      persistTabState();
    }
    return item;
  };

  const suggestionsByPage = {
    'report.html': ['선정 관광 자원 여섯 곳 알려줘', '아르떼뮤지엄은 어떤 곳인가요?', '어떤 API를 사용하나요?'],
    'contents.html': ['어떤 프로젝트가 있나요?', '영상은 어떻게 크게 보나요?', '최신 씨걸이 영상은?'],
    'sns.html': ['최신 씨걸이 영상은?', '카드뉴스는 어디서 보나요?', 'SNS 채널을 알려줘']
  };
  const suggestionsList = suggestionsByPage[pageName] || ['김준철은 어떤 사람인가요?', '선정 관광 자원 알려줘', '딸깍상사는 뭐예요?'];
  suggestionsList.forEach((question) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = question;
    button.addEventListener('click', () => {
      input.value = question;
      form.requestSubmit();
    });
    suggestions.append(button);
  });

  const localAnswer = (question) => {
    const normalizeTerm = value => value.toLowerCase().replace(/[^0-9a-z가-힣]/g, '');
    const normalized = normalizeTerm(question);
    const ranked = fallbackKnowledge
      .map((entry) => {
        const matched = entry.terms.map(normalizeTerm).filter(term => term && normalized.includes(term));
        return { entry, score: Math.max(0, ...matched.map(term => term.length ** 2)) + Math.min(matched.length, 5) / 100 };
      })
      .sort((a, b) => b.score - a.score);
    if (!ranked[0]?.score) {
      return { answer: '현재 사이트에서 확인할 수 없는 내용입니다. 김준철 소개, 부산 관광 자원, AI 제작 작업이나 아르투어부산 콘텐츠에 관해 질문해 주세요.', sources: [] };
    }
    return { answer: ranked[0].entry.answer, sources: [{ url: ranked[0].entry.source[0], title: ranked[0].entry.source[1] }] };
  };

  const remoteAnswer = async (question) => {
    const response = await fetch(`${config.supabaseUrl}/functions/v1/${config.chatFunction || 'site-chat'}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: config.publishableKey
      },
      body: JSON.stringify({ message: question, history: history.slice(-6), sessionId, page: pageName, consent: true, consentVersion: 'v1' })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || '답변 서버에 연결하지 못했습니다.');
    return data;
  };

  const ask = async (question) => {
    if (!hasConsent) return;
    suggestions.hidden = true;
    addMessage('user', question);
    history.push({ role: 'user', content: question });
    persistTabState();
    const waiting = addMessage('assistant', '자료를 검색하고 있습니다…', [], { persist: false });
    waiting.classList.add('is-waiting');
    submitButton.disabled = true;
    input.disabled = true;
    try {
      const result = isConfigured ? await remoteAnswer(question) : localAnswer(question);
      waiting.remove();
      addMessage('assistant', result.answer, result.sources || []);
      history.push({ role: 'assistant', content: result.answer });
      persistTabState();
      window.gtag?.('event', 'chatbot_question', { page_path: pageName, answer_mode: isConfigured ? 'rag' : 'local' });
    } catch (error) {
      waiting.remove();
      const fallback = localAnswer(question);
      const fallbackAnswer = `${fallback.answer}\n\n(자료 검색 연결이 원활하지 않아 저장된 사이트 자료로 안내합니다.)`;
      addMessage('assistant', fallbackAnswer, fallback.sources);
      history.push({ role: 'assistant', content: fallbackAnswer });
      persistTabState();
    } finally {
      submitButton.disabled = false;
      input.disabled = false;
      input.focus();
    }
  };

  const openPanel = () => {
    panel.hidden = false;
    launcher.setAttribute('aria-expanded', 'true');
    launcher.setAttribute('aria-label', '사이트 안내 AI 닫기');
    input.focus();
    persistTabState();
    window.gtag?.('event', 'chatbot_open', { page_path: pageName });
  };
  const closePanel = () => {
    panel.hidden = true;
    launcher.setAttribute('aria-expanded', 'false');
    launcher.setAttribute('aria-label', '사이트 안내 AI 열기');
    persistTabState();
    launcher.focus();
  };

  launcher.addEventListener('click', () => panel.hidden ? openPanel() : closePanel());
  closeButton.addEventListener('click', closePanel);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !panel.hidden) closePanel();
  });
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      form.requestSubmit();
    }
  });
  input.addEventListener('input', () => {
    input.style.height = 'auto';
    input.style.height = `${Math.min(input.scrollHeight, 96)}px`;
  });
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const question = input.value.trim();
    if (!question || submitButton.disabled) return;
    input.value = '';
    input.style.height = 'auto';
    ask(question);
  });

  consentCheck.addEventListener('change', () => { consentAccept.disabled = !consentCheck.checked; });
  consentAccept.addEventListener('click', () => {
    hasConsent = true;
    try { localStorage.setItem(consentKey, 'accepted'); } catch (error) { /* Continue for this session. */ }
    consentPanel.hidden = true;
    input.focus();
    window.gtag?.('event', 'chatbot_consent', { consent_version: 'v1' });
  });
  consentClose.addEventListener('click', closePanel);
  consentWithdraw.addEventListener('click', async () => {
    if (!window.confirm('동의를 철회하고 현재 대화 기록을 삭제할까요?')) return;
    if (isConfigured) {
      await fetch(`${config.supabaseUrl}/functions/v1/${config.chatFunction || 'site-chat'}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', apikey: config.publishableKey },
        body: JSON.stringify({ action: 'withdraw', sessionId })
      }).catch(() => {});
    }
    try { localStorage.removeItem(consentKey); } catch (error) { /* Local storage may be unavailable. */ }
    try { sessionStorage.removeItem(tabStateKey); } catch (error) { /* Session storage may be unavailable. */ }
    hasConsent = false;
    sessionId = createSessionId();
    history.length = 0;
    transcript.length = 0;
    messages.replaceChildren();
    addMessage('assistant', '안녕하세요. 김준철의 포트폴리오 안내 AI입니다. 이 사이트의 부산 관광·AI 제작 작업·아르투어부산 콘텐츠를 안내합니다. 무엇이 궁금하신가요?');
    consentCheck.checked = false;
    consentAccept.disabled = true;
    consentPanel.hidden = false;
  });

  if (transcript.length) {
    transcript.forEach((message) => addMessage(message.role, message.text, message.sources || [], { persist: false }));
    suggestions.hidden = history.some((message) => message.role === 'user');
  } else {
    addMessage('assistant', '안녕하세요. 김준철의 포트폴리오 안내 AI입니다. 이 사이트의 부산 관광·AI 제작 작업·아르투어부산 콘텐츠를 안내합니다. 무엇이 궁금하신가요?');
  }
  if (savedTabState?.panelOpen) {
    panel.hidden = false;
    launcher.setAttribute('aria-expanded', 'true');
    launcher.setAttribute('aria-label', '사이트 안내 AI 닫기');
  }
  persistTabState();
})();
