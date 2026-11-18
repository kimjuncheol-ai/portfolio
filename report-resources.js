// Public presentation data only. All authentication and upstream calls stay on the server.
window.REPORT_TOURS = {
  museum1: {
    name: '뮤지엄 원', type: '문화·예술',
    description: '센텀시티의 미디어 전문 현대미술관으로, LED로 둘러싸인 공간에서 영상과 설치 작품을 만날 수 있습니다. 스크린 밖으로 확장되는 빛과 색을 따라 자신만의 감상 포인트를 찾아보세요.',
    tags: ['#미디어아트', '#현대미술', '#센텀시티'],
    programsUrl: 'https://www.museum1.co.kr/',
    images: [['assets/report/museum1.jpg', '뮤지엄 원 미디어아트 공간 · 한국관광공사 제공']],
    programs: [
      { name: '미디어아트 감상', audience: '관람객', description: '바닥과 벽, 천장으로 이어지는 영상 공간에서 작품의 색과 움직임을 감상합니다.', detail: '전시별 구성·요금은 공식 홈페이지 확인' },
      { name: '현대미술 작품 탐색', audience: '관람객', description: '영상뿐 아니라 전시 중인 설치·사진 등 다양한 매체의 작품을 살펴봅니다.', detail: '관람 제안 · 작품 구성은 전시별 상이' }
    ], reviews: []
  },
  arte: {
    name: '아르떼뮤지엄 부산', type: '문화·예술',
    description: '부산 영도에서 빛·소리·향을 함께 경험하는 몰입형 미디어아트 전시 공간입니다. 자연과 부산의 풍경을 재해석한 작품 사이를 걸으며 감각에 집중하는 시간을 보낼 수 있습니다.',
    tags: ['#영도', '#몰입형전시', '#미디어아트'],
    programsUrl: 'https://kr.artemuseum.com/BUSAN',
    images: [['assets/report/arte.webp', 'GARDEN STARRY BUSAN · 아르떼뮤지엄 부산 공식 홈페이지']],
    programs: [
      { name: '몰입형 미디어아트 감상', audience: '관람객', description: '빛과 소리로 확장되는 작품 사이를 걸으며 공간 전체를 감상합니다.', detail: '상설 전시 · 운영·티켓 정보는 공식 홈페이지 확인' },
      { name: '부산을 담은 GARDEN 감상', audience: '관람객', description: '부산의 매력을 다이내믹·버라이어티·드림의 세 가지 콘셉트로 표현한 미디어아트를 만납니다.', detail: 'GARDEN STARRY BUSAN · 작품 구성 변경 가능' }
    ], reviews: []
  },
  hurshim: {
    name: '허심청', type: '온천·웰니스',
    description: '동래 온천장에 자리한 도시형 온천 시설로, 여러 온천탕과 찜질 공간을 갖추고 있습니다. 예술 공간을 둘러본 뒤 따뜻한 물과 휴식으로 여행의 속도를 늦춰보세요.',
    tags: ['#동래온천', '#온천욕', '#웰니스'],
    programsUrl: 'https://www.hotelnongshim.com/kr/',
    images: [['assets/report/hurshim.jpg', '허심청 온천 내부 · 한국관광공사 제공 · 공공누리 제3유형']],
    programs: [
      { name: '온천욕', audience: '온천 이용객', description: '여러 형태의 온천탕을 이용하며 쉬어가는 체험입니다. 개인의 건강 상태에 맞춰 이용해 주세요.', detail: '이용 시간·요금은 공식 안내 확인' },
      { name: '찜질·휴식', audience: '시설 이용객', description: '찜질 공간과 부대시설을 이용해 여행 중 휴식 시간을 가질 수 있습니다.', detail: '이용 조건·추가 요금은 공식 안내 확인' }
    ], reviews: []
  },
  mmch: {
    name: '부산근현대역사관', type: '역사·전시', checked: '2026.11.17',
    description: '옛 한국은행 부산지점 건물을 고쳐 문을 연 역사관으로, 부산의 근현대를 전시로 풀어냅니다. 지하 옛 금고는 금고미술관이 되었고, 1929년에 지어진 별관에는 책을 읽으며 쉬어 갈 대청서가가 있습니다.',
    tags: ['#원도심', '#금고미술관', '#대청서가'],
    programsUrl: 'https://www.busan.go.kr/mmch/index',
    images: [['assets/report/mmch.jpg', '부산근현대역사관 본관 외관 · 한국관광공사 제공 · 공공누리 제1유형'], ['assets/report/mmch-2.jpg', '부산근현대역사관 별관 대청서가 · 한국관광공사 제공 · 공공누리 제1유형']],
    programs: [
      { name: '근현대 역사 전시', audience: '관람객', description: '개항기부터 현대까지 부산의 변화를 상설 전시로 살펴봅니다.', detail: '09:00–18:00(입장 마감 17:00) · 월요일·1월 1일 휴관 · 무료' },
      { name: '대청서가', audience: '누구나', description: '1929년 건립 별관의 서가에서 책을 고르고 쉬어 갈 수 있습니다.', detail: '이용 조건은 공식 홈페이지 확인' }
    ], reviews: []
  },
  kangkangee: {
    name: '깡깡이예술마을', type: '공공예술·마을', checked: '2026.11.17',
    description: '배를 고치던 영도 대평동 수리조선 마을에 공공예술을 더한 마을입니다. 벽화 골목과 마을박물관, 주민이 운영하는 대평마을다방을 따라 조선소 곁 풍경을 천천히 걸어볼 수 있습니다.',
    tags: ['#영도', '#수리조선', '#공공예술'],
    programsUrl: 'http://kangkangee.com/',
    images: [['assets/report/kangkangee.jpg', '깡깡이예술마을 안내센터와 벽화 · 한국관광공사 제공 · 공공누리 제1유형'], ['assets/report/kangkangee-2.jpg', '깡깡이마을박물관 전시 · 한국관광공사 제공 · 공공누리 제1유형']],
    programs: [
      { name: '마을 산책', audience: '방문객', description: '벽화와 공공예술 작품을 따라 수리조선 마을 골목을 걷습니다. 주민 생활 공간이므로 조용히 둘러봐 주세요.', detail: '마을 둘러보기 무료' },
      { name: '마을박물관·대평마을다방', audience: '방문객', description: '수리조선의 역사를 전시로 보고 주민이 운영하는 다방에서 쉬어 갑니다.', detail: '10:00–17:00 · 월요일 휴무 · 방문 전 051-418-3336 확인 권장' }
    ], reviews: []
  },
  domoheon: {
    name: '도모헌', type: '문화·정원', checked: '2026.11.02',
    description: '1984년에 지어진 옛 부산시장 관사를 2024년 시민에게 개방한 문화공간입니다. 카페 모모스와 소소풍라운지, 부산 제1호 생활정원 소소풍을 오가며 머물 수 있습니다.',
    tags: ['#남천동', '#소소풍정원', '#열린관사'],
    programsUrl: 'https://www.busan.go.kr/domoheon/index',
    images: [['assets/report/domoheon.jpg', '여름의 도모헌 · 출처: 부산시'], ['assets/report/domoheon-2.jpg', '소소풍 정원 · 출처: 부산시 도모헌']],
    programs: [
      { name: '소소풍 정원 산책', audience: '누구나', description: '차량 진입로를 바꾼 산책길과 생태연못을 따라 정원을 걷습니다.', detail: '입장 무료' },
      { name: '라운지 전시·독서', audience: '누구나', description: '소소풍라운지에서 전시를 보거나 책을 읽으며 쉬어 갑니다.', detail: '화~금·일 10:00–18:00 / 토 10:00–20:00 · 월요일·공휴일 휴관' }
    ], reviews: []
  }
};

(() => {
  const panel = document.querySelector('[data-api-monitor]');
  if (!panel) return;
  const endpoint = 'https://busan-slowwave.vercel.app/api/report-resources';
  const sentence = panel.querySelector('[data-api-message]');
  const time = panel.querySelector('time');
  const retry = panel.querySelector('button');
  let busy = false;
  const sourceNames = { kor: '국문 관광정보 서비스_GW', wellness: '웰니스관광정보' };
  const sourceStates = { live: '정상 응답', pending: '연결 준비 중', error: '응답 확인 불가' };
  const safeImage = value => { try { const u = new URL(value); return u.protocol === 'https:' && u.hostname === 'tong.visitkorea.or.kr' ? u.href : ''; } catch { return ''; } };
  // Keep search metadata aligned with the exact API text displayed on the card.
  const syncStructuredResource = (card, key) => {
    const script = document.getElementById('page-structured-data');
    if (!script) return;
    try {
      const data = JSON.parse(script.textContent);
      const resource = data['@graph']?.find(node => node['@id']?.endsWith(`#resource-${key}`));
      if (!resource) return;
      const address = card.querySelector('[data-api-address]');
      resource.description = card.querySelector('[data-api-intro]').textContent;
      resource.address.streetAddress = address.textContent;
      resource.hasMap = address.href;
      script.textContent = JSON.stringify(data).replaceAll('<', '\\u003c');
    } catch {
      // Metadata must never prevent the existing API presentation from working.
    }
  };
  const refresh = async () => {
    if (busy) return;
    busy = true;
    retry.disabled = true;
    panel.setAttribute('aria-busy', 'true');
    try {
      const response = await fetch(endpoint, { signal: AbortSignal.timeout(25000), cache: 'no-store', credentials: 'omit' });
      if (!response.ok) throw new Error();
      const data = await response.json();
      if (data.region !== '부산광역시' || !Array.isArray(data.sources) || !Array.isArray(data.resources)) throw new Error();
      let updated = 0;
      for (const item of data.resources) {
        if (!/^부산(?:광역시)?\s/.test(item.address || '')) continue;
        const card = [...document.querySelectorAll('[data-resource-key]')].find(c => c.dataset.resourceKey === item.key);
        if (!card) continue;
        const address = card.querySelector('[data-api-address]');
        address.textContent = item.address;
        address.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.address)}`;
        // The card's one-line intro stays the curated noun phrase so all six read alike; the API description appears in the explorer.
        syncStructuredResource(card, item.key);
        const stamp = card.querySelector('[data-api-stamp]');
        stamp.textContent = `API 갱신 · ${item.modifiedAt?.slice(0,4)}.${item.modifiedAt?.slice(4,6)}.${item.modifiedAt?.slice(6,8)} 자료`;
        const image = safeImage(item.image);
        // Pixel artwork is permanent; API photos are shown inside the explorer only.
        window.dispatchEvent(new CustomEvent('report:resource', { detail: { ...item, image } }));
        updated++;
      }
      const live = data.mode === 'live' && data.sources.length === 2 && data.sources.every(s => s.status === 'live') && updated === 6;
      panel.dataset.state = live ? 'live' : updated ? 'partial' : 'offline';
      sentence.textContent = live
        ? '이 페이지는 한국관광공사 국문 관광정보·웰니스관광정보 API를 연동하여 업데이트되고 있습니다.'
        : updated ? '일부 API만 응답했습니다. 확인된 정보부터 갱신하고 있습니다.' : 'API 응답을 확인하지 못했습니다. 저장된 소개를 표시하고 있습니다.';
      for (const [id, name] of Object.entries(sourceNames)) {
        const source = data.sources.find(s => s.id === id);
        const row = panel.querySelector(`[data-source="${id}"]`);
        row.dataset.state = source?.status === 'live' ? 'live' : 'offline';
        row.querySelector('span:last-child').textContent = `${name} · ${sourceStates[source?.status] || '응답 확인 불가'}`;
      }
      if (!Number.isFinite(Date.parse(data.checkedAt))) throw new Error();
      time.dateTime = data.checkedAt;
      time.textContent = new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Seoul' }).format(new Date(data.checkedAt)) + ' (KST)';
    } catch {
      panel.dataset.state = 'offline';
      sentence.textContent = 'API 연결을 확인하지 못했습니다. 저장된 소개를 표시하고 있습니다.';
      panel.querySelectorAll('[data-source]').forEach(row => {
        row.dataset.state = 'offline';
        row.querySelector('span:last-child').textContent = `${sourceNames[row.dataset.source]} · 응답 확인 불가`;
      });
    } finally {
      busy = false;
      retry.disabled = false;
      panel.setAttribute('aria-busy', 'false');
    }
  };
  retry.addEventListener('click', refresh);
  document.addEventListener('DOMContentLoaded', refresh, { once: true });
  setInterval(() => { if (!document.hidden) refresh(); }, 30 * 60_000);
})();
