/* Local photographs and editorial copy for the Report explorer. */
(() => {
  const archive = 'https://visitbusan.net/archive/dataSearch/view.nm?dataSid=METADATA';
  const tourApi = 'https://korean.visitkorea.or.kr/';
  const moca = (number, id, title, copy) => [
    `motion/moca-${number}.webp`, title, copy, '부산관광공사 부산관광아카이브 · 공공누리 제2유형',
    archive + id
  ];
  const photo = (file, title, copy, credit, url = tourApi) => [file, title, copy, credit, url];
  const kto = '한국관광공사 · 공공누리 제3유형';
  const open = '한국관광공사 · 공공누리 제1유형';
  const busan = '부산광역시 도모헌';
  const bma = '부산시립미술관';
  const forest = '부산어린이대공원';
  window.REPORT_MOTION = {
    moca: [
      moca(1, '019846', '을숙도에서 만나는 동시대 미술', '전시장에 들어서서 먼저 작품의 크기와 빛이 공간을 어떻게 바꾸는지 살펴보세요.'),
      moca(2, '019848', '작품 주위를 걸어 보기', '한 작품도 서 있는 위치에 따라 다르게 보입니다. 전시 동선을 따라 시선을 옮겨 보세요.'),
      moca(3, '019850', '색과 재료를 들여다보다', '화려한 색 너머로 무엇이 매달려 있고, 빛이 바닥에 어떻게 번지는지 살펴보세요.'),
      moca(4, '019857', '멀리서 한 번, 가까이서 한 번', '벽을 따라 펼쳐진 작업은 한 걸음 물러서 전체를 보고 다시 다가가면 다른 부분이 눈에 들어옵니다.'),
      moca(5, '019851', '전시실 밖으로, 을숙도로', '관람을 마쳤다면 미술관 밖으로 나와 을숙도를 걸어 보세요. 사진은 지난 전시 기록이며 현재 전시는 공식 안내에서 확인할 수 있습니다.')
    ],
    bma: [
      photo('../home/bma-exterior.webp', '부산의 미술을 만나는 본관', '부산 미술과 국내외 현대미술을 함께 소개하는 공립미술관입니다.', bma, 'https://art.busan.go.kr/'),
      photo('../home/bma-poster-01.png', '이우환공간에서 천천히', '작품 사이의 간격과 비어 있는 공간도 관람의 일부입니다. 본관과 별관의 전시 안내를 확인하세요.', bma, 'https://art.busan.go.kr/')
    ],
    museum1: [
      photo('museum1.jpg', '영상이 전시장을 채우는 순간', '센텀시티의 미디어 전문 미술관. 화면과 반사면 사이를 걸으며 영상이 공간을 바꾸는 방식을 살펴보세요.', kto, 'https://tong.visitkorea.or.kr/cms/resource/01/3493601_image2_1.jpg'),
      photo(null, '한 장면을 두 위치에서', '가까이에서는 빛의 움직임을, 한 걸음 뒤에서는 여러 화면이 이어지는 장면을 볼 수 있습니다.')
    ],
    arte: [
      photo('arte.webp', '빛으로 다시 만나는 부산', 'GARDEN STARRY BUSAN에서는 부산의 집과 해안 풍경이 벽과 바닥을 따라 펼쳐집니다.', '아르떼뮤지엄 부산', 'https://kr.artemuseum.com/BUSAN'),
      photo(null, '영상과 소리가 만나는 자리', '한 장면이 바뀔 때까지 잠시 머물러 보세요. 전시별 운영 정보는 공식 안내에서 확인할 수 있습니다.')
    ],
    hurshim: [
      photo('hurshim.jpg', '동래에서 쉬어 가는 온천', '돔 아래 펼쳐진 다양한 온천탕에서 몸을 쉬게 하는 부산 도심 온천입니다.', kto, 'https://tong.visitkorea.or.kr/cms/resource/37/4090237_image2_1.jpg'),
      photo(null, '산책 뒤 온천 한 번', '온천장 일정을 짤 때는 온천과 휴식에 쓸 시간을 넉넉히 남겨 보세요. 운영과 요금은 방문 전에 확인하세요.')
    ],
    forest: [
      photo('../home/forest-01.jpg', '물가에서 시작하는 산책', '성지곡수원지 물가를 따라 걸으며 부산 도심 한가운데서 숲과 물을 만납니다.', forest, 'https://www.bisco.or.kr/bschildpark/'),
      photo('../home/forest-02.webp', '편백 숲에서 걸음을 늦추다', '그늘진 숲길에 들어서면 발밑과 나무 사이로 들어오는 빛을 찬찬히 살펴보세요.', forest, 'https://www.bisco.or.kr/bschildpark/')
    ],
    mmch: [
      photo('mmch.jpg', '옛 한국은행에서 부산의 근현대로', '대청동 본관에서는 은행 건물의 흔적과 부산의 근현대사를 함께 읽을 수 있습니다.', open),
      photo('mmch-2.jpg', '별관의 대청서가', '1929년 지어진 별관으로 건너가 부산을 다룬 책을 한 권 골라 보세요.', open)
    ],
    kangkangee: [
      photo('kangkangee.jpg', '배를 고치던 영도의 골목', '수리조선 작업 소리에서 이름을 얻은 마을. 안내센터에서 골목 산책을 시작해 보세요.', open),
      photo('kangkangee-2.jpg', '박물관에서 듣는 마을의 이야기', '마을박물관에서 주민들의 일과 생활을 담은 기록을 살펴보세요.', open)
    ],
    domoheon: [
      photo('domoheon.jpg', '시민에게 열린 옛 부산시장 관사', '한때 관사였던 남천동 건물을 둘러보고 시민 문화공간으로 달라진 모습을 살펴보세요.', busan, 'https://www.busan.go.kr/domoheon/index'),
      photo('domoheon-2.jpg', '소소풍 정원으로', '건물 밖에서는 정원길을 따라 천천히 걸으며 도심 속 초록을 즐길 수 있습니다.', busan, 'https://www.busan.go.kr/domoheon/index')
    ],
    f1963: [
      photo('f1963-1.jpg', '와이어 공장에 남은 시간', '옛 고려제강 공장의 골조를 살린 공간에 전시와 공연, 도서관이 들어섰습니다.', kto),
      photo('f1963-2.jpg', '대나무숲 소리길', '실내를 둘러본 뒤 옛 공장 바닥을 잘라 만든 디딤돌을 따라 대나무숲을 걸어 보세요.', kto)
    ],
    goeun: [
      photo('goeun-1.jpg', '해운대에서 사진을 만나다', '담쟁이가 감싼 건물 안에서 국내외 작가의 사진 기획전을 볼 수 있습니다.', kto),
      photo('goeun-2.jpg', '한 장면 뒤의 기록', '세계 사진사의 흐름을 살피고, 포토라이브러리에서는 작품을 사진집으로 이어서 볼 수 있습니다.', open)
    ],
    dureraum: [
      photo('dureraum-1.jpg', '빅루프가 만든 도시의 지붕', '영화의전당 야외극장 위로 뻗은 빅루프 아래를 걸으며 건축의 크기를 느껴 보세요.', kto),
      photo('dureraum-2.jpg', '해가 지면 켜지는 빛', '저녁에는 빅루프의 조명이 공간을 바꿉니다. 시네마테크에서 볼 영화도 함께 골라 보세요.', kto)
    ],
    huinnyeoul: [
      photo('huinnyeoul-1.jpg', '절벽 위에서 만나는 영도의 바다', '주택 사이에 난 골목을 따라가다 보면 지붕 너머로 탁 트인 바다가 보입니다.', open),
      photo('huinnyeoul-2.jpg', '계단 골목과 해안길', '아래 해안으로 이어지는 길도 걸어 보세요. 골목에서는 주민의 일상을 존중해 조용히 둘러봐 주세요.', open)
    ],
    bmuseum: [
      photo('bmuseum-1.jpg', '대연동에서 만나는 부산의 역사', '동래관에서는 선사 시대부터 고려까지 이 지역에 남은 흔적을 살펴봅니다.', kto),
      photo('bmuseum-2.jpg', '생활 속에 남은 근현대', '부산관의 생활상 디오라마를 보며 근현대 부산의 일상이 어떻게 달라졌는지 살펴보세요.', kto)
    ],
    bokcheon: [
      photo('bokcheon-1.jpg', '동래의 옛 무덤에서 나온 유물', '복천동고분군에서 출토된 갑옷과 투구, 금동관을 가까이에서 볼 수 있습니다.', kto),
      photo('bokcheon-2.jpg', '박물관에서 고분공원까지', '야외전시관에서 무덤 내부의 발굴 모습을 살핀 뒤 능선을 따라 고분공원을 걸어 보세요.', kto)
    ]
  };
})();
