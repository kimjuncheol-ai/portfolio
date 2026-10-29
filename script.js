const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.site-nav');

const closeMenu = () => {
  if (!menuButton || !navigation) return;

  menuButton.setAttribute('aria-expanded', 'false');
  navigation.classList.remove('is-open');
};

if (menuButton && navigation) {
  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') === 'true';

    menuButton.setAttribute('aria-expanded', String(!open));
    navigation.classList.toggle('is-open', !open);
  });

  navigation.addEventListener('click', (event) => {
    if (event.target.matches('a')) closeMenu();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 700) closeMenu();
  });
}

const currentPage = location.pathname.split('/').pop() || 'index.html';

document.querySelectorAll('.site-nav a').forEach((link) => {
  if (link.getAttribute('href') === currentPage) {
    link.setAttribute('aria-current', 'page');
  }
});

const typingLines = [...document.querySelectorAll('.typing-line')];
const profileOutput = document.querySelector('.profile-output');

if (typingLines.length) {
  const storageKey = 'kimjuncheol-intro-played';
  const savedContent = typingLines.map((line) => [...line.childNodes].map((node) => ({
    text: node.textContent,
    isBreak: node.nodeName === 'BR'
  })));
  const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
  const totalCharacters = savedContent.flat().reduce((total, part) => total + (part.isBreak ? 0 : [...part.text].length), 0);
  let typedCharacters = 0;

  let introductionPlayed = false;

  try {
    introductionPlayed = sessionStorage.getItem(storageKey) === 'true';
  } catch (error) {
    introductionPlayed = false;
  }

  const typeLine = async (line, parts) => {
    line.hidden = false;
    line.classList.add('is-typing');

    for (const part of parts) {
      if (part.isBreak) {
        line.append(document.createElement('br'));
      } else {
        for (const character of [...part.text]) {
          line.append(character);
          typedCharacters += 1;
          if (profileOutput) profileOutput.style.setProperty('--print-progress', `${(typedCharacters / totalCharacters) * 100}%`);
          await wait(32);
        }
      }
    }

    line.classList.remove('is-typing');
  };

  const playIntroduction = async () => {
    typingLines.forEach((line) => {
      line.textContent = '';
      line.hidden = true;
    });
    typedCharacters = 0;
    if (profileOutput) {
      profileOutput.style.setProperty('--print-progress', '0%');
      profileOutput.classList.add('is-printing');
    }

    try {
      sessionStorage.setItem(storageKey, 'true');
    } catch (error) {
      // The animation still works if storage is unavailable.
    }

    await wait(500);
    for (let index = 0; index < typingLines.length; index += 1) {
      await typeLine(typingLines[index], savedContent[index]);
      await wait(350);
    }
    typingLines.at(-1).classList.add('typing-complete');
    if (profileOutput) {
      profileOutput.style.setProperty('--print-progress', '100%');
      profileOutput.classList.remove('is-printing');
    }
  };

  if (introductionPlayed || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    typingLines.at(-1).classList.add('typing-complete');
    if (profileOutput) profileOutput.style.setProperty('--print-progress', '100%');
  } else {
    playIntroduction();
  }
}

const tourPopup = document.querySelector('#tour-popup');

if (tourPopup) {
  const tourData = {
    ...window.REPORT_TOURS,
    moca: {
      name: '부산현대미술관',
      type: '문화·예술',
      description: '부산현대미술관은 을숙도의 생태환경과 동시대 예술이 맞닿는 서부산의 공립미술관입니다. 뉴미디어와 실험적 전시, 어린이예술도서관을 통해 예술을 보고 읽고 체험하는 복합 문화 경험을 제공합니다.',
      tags: ['#현대미술', '#뉴미디어', '#을숙도', '#어린이예술도서관'],
      programsUrl: 'https://www.busan.go.kr/moca/education05',
      images: [
        ['assets/home/moca-exterior.png', '부산현대미술관 전경'],
        ['assets/home/moca-poster-01.jpg', '부산현대미술관 기관의 순환 전시 포스터', 'crop-left'],
        ['assets/home/moca-poster-02.jpg', '부산현대미술관 코뿔소와 유니콘 전시 포스터', 'crop-left']
      ],
      programs: [
        { name: '동시대 미술 전시 감상', audience: '관람객', description: '전시실에서 뉴미디어를 포함한 다양한 매체의 동시대 미술을 감상합니다.', detail: '관람 제안 · 전시별 일정은 공식 홈페이지 확인' },
        { name: '어린이예술도서관', audience: '어린이·가족', description: '책과 예술이 만나는 공간을 이용하며 전시 감상과 다른 방식으로 예술을 접합니다.', detail: '이용·예약 조건은 공식 안내 확인' }
      ],
      reviews: [
        { title: '부산현대미술관에서 만난 세 전시 관람 후기', author: '부산광역시', url: 'https://blog.naver.com/cooolbusan/224328255685' },
        { title: '무료로 만나는 〈코뿔소와 유니콘〉 전시 관람 후기', author: '부산교육', url: 'https://blog.naver.com/with_pen/224327082717' },
        { title: '부산현대미술관 무료전시, 초등 아이와 다녀온 후기', author: '텔미', url: 'https://blog.naver.com/tellmememory/224330861096' }
      ],
      motionVideos: [
        'assets/video/busan-moca-card-1.mp4',
        'assets/video/busan-moca-card-2.mp4',
        'assets/video/busan-moca-card-3.mp4',
        'assets/video/busan-moca-card-4.mp4',
        'assets/video/busan-moca-card-5.mp4'
      ]
    },
    bma: {
      name: '부산시립미술관',
      type: '문화·예술',
      description: '부산시립미술관은 부산 미술의 흐름을 기록하며 국내외 현대미술을 연결하는 도시 대표 공립미술관입니다. 본관의 기획·소장품 전시와 이우환공간을 통해 동시대 미술과 깊은 사유를 함께 만날 수 있습니다.',
      tags: ['#부산미술', '#현대미술', '#이우환공간', '#공립미술관'],
      programsUrl: 'https://art.busan.go.kr/lecetuxre2/list.nm',
      images: [
        ['assets/home/bma-exterior.png', '부산시립미술관 전경'],
        ['assets/home/bma-poster-01.png', '부산시립미술관 이우환공간 전경'],
        ['assets/home/bma-poster-02.png', '부산시립미술관 무빙 온 아시아 전시 포스터']
      ],
      programs: [
        { name: '본관 전시 감상', audience: '관람객', description: '리노베이션을 마치고 다시 문을 연 본관에서 전시를 감상합니다. 전시 구성과 도슨트 운영은 공식 안내를 확인해 주세요.', detail: '본관 정상 운영 · 공식 홈페이지 2026.10.29 확인' },
        { name: '이우환공간 감상', audience: '관람객', description: '이우환공간에서 작품과 공간의 관계를 천천히 살펴봅니다.', detail: '별관 정상 운영 · 운영·입장 조건은 공식 안내 확인' }
      ],
      reviews: [
        { title: '리노베이션 중 별관 이우환공간 관람 후기', author: '혜천', url: 'https://blog.naver.com/hyechon49/224324132060' },
        { title: '공사 중에도 만나는 이우환공간 무료 관람 후기', author: '안녕서니', url: 'https://blog.naver.com/goodmorning_sunny/224347461533' },
        { title: '부산시립미술관 주차비와 평일 관람 후기', author: '여행러부엉', url: 'https://blog.naver.com/miny9776/223280525652' }
      ]
    },
    forest: {
      name: '부산어린이대공원 치유의 숲',
      type: '자연·웰니스',
      description: '부산어린이대공원 치유의 숲은 성지곡수원지와 울창한 편백림을 따라 걷는 도심 속 산림 치유 공간입니다. 숲길 걷기와 호흡, 명상을 통해 자연의 리듬 속에서 몸과 마음을 가볍게 회복할 수 있습니다.',
      tags: ['#치유의숲', '#편백림', '#성지곡수원지', '#웰니스'],
      programsUrl: 'https://www.bisco.or.kr/bschildpark/sub/sub04/sub04_1/',
      images: [
        ['assets/home/forest-01.jpg', '부산어린이대공원 성지곡수원지'],
        ['assets/home/forest-02.jpg', '부산어린이대공원 숲길과 나무 데크'],
        ['assets/home/forest-03.jpg', '부산어린이대공원 관광안내센터']
      ],
      programs: [
        { name: '편백·삼나무 산림욕장 걷기', audience: '누구나', description: '약 5만 그루의 삼나무와 편백나무가 우거진 3.5km 숲길에서 자연 관찰과 명상, 가벼운 운동을 즐기는 치유 체험입니다.', detail: '총 3.5km · 봄·여름 추천' },
        { name: '성지곡수원지 순환 산책', audience: '누구나', description: '성지곡수원지를 중심으로 키우미 숲과 수변공원을 잇는 순환도로를 걸으며 물과 숲의 풍경을 함께 경험합니다.', detail: '약 2.4km · 40–60분' }
      ],
      reviews: [
        { title: '부산 어린이대공원 다녀온 솔직 후기', author: '대기만성', url: 'https://blog.naver.com/seegodhot/224190483649' },
        { title: '무료 숲속 놀이터, 37개월 아이와 방문한 후기', author: '써니아빠', url: 'https://blog.naver.com/ssunyf/224226474384' },
        { title: '아이와 다녀온 어린이대공원 창의교육관 후기', author: '3도맘', url: 'https://blog.naver.com/3dddo_mom/224249431297' }
      ]
    }
  };
  const popupTitle = tourPopup.querySelector('#popup-title');
  const popupAddress = tourPopup.querySelector('#popup-address');
  const popupContent = tourPopup.querySelector('#popup-content');
  const popupStatus = tourPopup.querySelector('#popup-status');
  const popupItemCount = tourPopup.querySelector('#popup-item-count');
  const officialLink = tourPopup.querySelector('#popup-official-link');
  const folderButtons = [...tourPopup.querySelectorAll('.win95-folder')];
  const motionFolder = tourPopup.querySelector('[data-motion-folder]');
  const closeButton = tourPopup.querySelector('.win95-close');
  const titlebar = tourPopup.querySelector('.win95-titlebar');
  let activeTour = tourData.moca;
  const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  window.addEventListener('report:resource', ({ detail }) => {
    const tour = tourData[detail.key];
    if (!tour) return;
    if (detail.description) tour.description = detail.description.split(/(?<=[.!?])\s+/u).slice(0, 2).join(' ');
    tour.apiUpdatedAt = detail.modifiedAt;
    tour.apiSource = detail.source === 'wellness' ? '한국관광공사_웰니스관광정보' : '한국관광공사_국문 관광정보 서비스_GW';
    tour.apiSourceUrl = detail.source === 'wellness' ? 'https://www.data.go.kr/data/15144030/openapi.do' : 'https://www.data.go.kr/data/15101578/openapi.do';
    if (detail.image) {
      const license = { Type1: '공공누리 제1유형', Type3: '공공누리 제3유형' }[detail.copyright] || '이용 조건은 API 원문 확인';
      const photo = [detail.image, `${tour.name} · 한국관광공사 제공 · ${license}`];
      if (window.REPORT_TOURS?.[detail.key]) tour.images = [photo];
      else tour.images[0] = photo;
    }
    if (tourPopup.open && activeTour === tour && popupStatus.textContent === '홈') renderHome();
  });

  const renderHome = () => {
    const gallery = activeTour.images.map(([src, alt, imageClass = '']) => `<img class="${escapeHTML(imageClass)}" src="${escapeHTML(src)}" alt="${escapeHTML(alt)}" loading="lazy">`).join('');
    const source = activeTour.apiSource ? `<p class="win95-data-source">출처: <a href="${activeTour.apiSourceUrl}" target="_blank" rel="noopener noreferrer">${escapeHTML(activeTour.apiSource)}</a> · 자료 수정일 ${escapeHTML(activeTour.apiUpdatedAt?.slice(0,8))}${activeTour === tourData.forest ? ' · 공원 전체 정보이며 치유의 숲 세부 운영은 공식 안내 확인' : ''}</p>` : '<p class="win95-data-source">공식 홈페이지 기준 편집 · 확인일 2026.10.29</p>';
    popupContent.innerHTML = `
      <h2>${escapeHTML(activeTour.name)}</h2>
      <p class="win95-intro">${escapeHTML(activeTour.description)}</p>
      <div class="win95-type-row"><span class="win95-tag-icon" aria-hidden="true"></span><strong class="win95-type-label">${activeTour.type}</strong></div>
      <div class="win95-meta"><span>${activeTour.tags.join(' ')}</span><span>편집 기준: 2026.10.29</span></div>
      <div class="win95-gallery${activeTour.images.length === 1 ? ' win95-gallery--single' : ''}">${gallery}</div>${source}`;
  };

  const renderPrograms = () => {
    const programs = activeTour.programs.map((program, index) => `
      <article class="win95-info-card">
        <div class="win95-info-card__bar"><span>[${index + 1}] ${program.name}</span></div>
        <div class="win95-info-card__body">
          <div class="win95-type-row"><span class="win95-tag-icon" aria-hidden="true"></span><strong class="win95-type-label">${program.audience}</strong></div>
          <p>${program.description}</p>
          <div class="win95-card-meta"><span>${program.detail}</span></div>
        </div>
      </article>`).join('');
    popupContent.innerHTML = `<h2>${activeTour.name} — 체험 프로그램</h2><div class="win95-info-list">${programs}</div>`;
  };

  const renderReviews = () => {
    if (!activeTour.reviews.length) {
      popupContent.innerHTML = `<h2>${activeTour.name} — 방문자 후기</h2><p>방문자 후기는 준비 중입니다. 원문을 확인한 후 추가하겠습니다.</p>`;
      return;
    }
    const reviews = activeTour.reviews.map((review, index) => `
      <a class="win95-review-card" href="${review.url}" target="_blank" rel="noopener noreferrer">
        <span class="win95-review-icon" aria-hidden="true"></span>
        <span class="win95-review-copy"><strong>${review.title}</strong><small>${review.author} · 네이버 블로그 원문</small></span>
        <span class="win95-review-open" aria-hidden="true">열기 ↗</span>
      </a>`).join('');
    popupContent.innerHTML = `
      <h2>${activeTour.name} — 방문자 후기</h2>
      <div class="win95-meta"><span>이전 수집 후기 · 방문 당시의 정보이며 현재 운영과 다를 수 있습니다.</span></div>
      <div class="win95-review-list">${reviews}</div>`;
  };

  const renderMotionCards = () => {
    const videos = activeTour.motionVideos.map((src, index) => `
      <article class="win95-motion-card">
        <div class="win95-motion-card__bar"><span>[${index + 1}] MOTION CARD</span></div>
        <video autoplay muted loop playsinline controls preload="metadata" aria-label="부산현대미술관 모션 카드뉴스 ${index + 1}">
          <source src="${src}" type="video/mp4">
          이 브라우저에서는 MP4 영상을 재생할 수 없습니다.
        </video>
      </article>`).join('');
    popupContent.innerHTML = `
      <h2>${activeTour.name} — 모션 카드뉴스</h2>
      <div class="win95-motion-meta"><span>5개 영상</span><span>자동 재생 · 반복</span></div>
      <div class="win95-motion-grid">${videos}</div>`;
    popupContent.querySelectorAll('video').forEach((video) => video.play().catch(() => {}));
  };

  const selectFolder = (section) => {
    folderButtons.forEach((button) => button.classList.toggle('is-active', button.dataset.section === section));
    popupStatus.textContent = section;
    popupAddress.textContent = `C:\\${activeTour.name}\\${section}`;
    popupItemCount.textContent = section === '모션 카드뉴스' ? '5개 영상' : `${activeTour.motionVideos ? 4 : 3}개 개체`;
    officialLink.classList.toggle('is-program-link', section === '체험 프로그램');
    if (section === '홈') {
      officialLink.hidden = false;
      officialLink.textContent = '공식 홈페이지 열기';
      officialLink.href = officialLink.dataset.homeUrl;
    } else if (section === '체험 프로그램') {
      officialLink.hidden = false;
      officialLink.textContent = '더 많은 소식/프로그램 보기';
      officialLink.href = activeTour.programsUrl;
    } else {
      officialLink.hidden = true;
    }
    if (section === '홈') {
      renderHome();
    } else if (section === '체험 프로그램') {
      renderPrograms();
    } else if (section === '방문자 후기') {
      renderReviews();
    } else if (section === '모션 카드뉴스' && activeTour.motionVideos) {
      renderMotionCards();
    } else {
      popupContent.innerHTML = `<h2>${section}</h2><p>이 폴더의 내용은 준비 중입니다.</p>`;
    }
  };

  document.querySelectorAll('[data-popup-title]').forEach((button) => {
    button.addEventListener('click', () => {
      activeTour = tourData[button.dataset.popupKey];
      motionFolder.hidden = !activeTour.motionVideos;
      popupTitle.textContent = `${button.dataset.popupTitle} - 탐색기`;
      officialLink.dataset.homeUrl = button.dataset.officialUrl;
      selectFolder('홈');
      tourPopup.style.removeProperty('margin');
      tourPopup.style.removeProperty('left');
      tourPopup.style.removeProperty('top');
      tourPopup.showModal();
    });
  });

  let dragState = null;

  titlebar.addEventListener('pointerdown', (event) => {
    if (event.button !== 0 || event.target.closest('.win95-close')) return;
    const rect = tourPopup.getBoundingClientRect();
    tourPopup.style.margin = '0';
    tourPopup.style.left = `${rect.left}px`;
    tourPopup.style.top = `${rect.top}px`;
    dragState = { pointerId: event.pointerId, offsetX: event.clientX - rect.left, offsetY: event.clientY - rect.top };
    titlebar.setPointerCapture(event.pointerId);
    event.preventDefault();
  });

  titlebar.addEventListener('pointermove', (event) => {
    if (!dragState || event.pointerId !== dragState.pointerId) return;
    const maxLeft = Math.max(0, window.innerWidth - tourPopup.offsetWidth);
    const maxTop = Math.max(0, window.innerHeight - tourPopup.offsetHeight);
    const left = Math.min(maxLeft, Math.max(0, event.clientX - dragState.offsetX));
    const top = Math.min(maxTop, Math.max(0, event.clientY - dragState.offsetY));
    tourPopup.style.left = `${left}px`;
    tourPopup.style.top = `${top}px`;
  });

  const stopDragging = (event) => {
    if (!dragState || event.pointerId !== dragState.pointerId) return;
    if (titlebar.hasPointerCapture(event.pointerId)) titlebar.releasePointerCapture(event.pointerId);
    dragState = null;
  };

  titlebar.addEventListener('pointerup', stopDragging);
  titlebar.addEventListener('pointercancel', stopDragging);

  folderButtons.forEach((button) => button.addEventListener('click', () => selectFolder(button.dataset.section)));
  closeButton.addEventListener('click', () => tourPopup.close());
  tourPopup.addEventListener('click', (event) => {
    if (event.target === tourPopup) tourPopup.close();
  });
}

// Fit native-ratio video cards into a compact grid without cropping their frames.
(() => {
  const grids = document.querySelectorAll('.archive-video-grid:not(.archive-video-grid--idol)');
  grids.forEach((grid) => {
    let queued = false;
    const arrange = () => {
      queued = false;
      const cards = [...grid.children];
      const singleColumn = window.matchMedia('(max-width: 700px)').matches;
      grid.classList.toggle('has-masonry', !singleColumn);
      if (singleColumn) return;
      const styles = getComputedStyle(grid);
      const row = parseFloat(styles.gridAutoRows);
      const gap = parseFloat(styles.rowGap);
      cards.forEach((card) => {
        const rows = Math.ceil((card.getBoundingClientRect().height + gap) / (row + gap));
        card.style.setProperty('--card-rows', rows);
      });
    };
    const schedule = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(arrange);
    };
    const observer = new ResizeObserver(schedule);
    observer.observe(grid);
    [...grid.children].forEach((card) => observer.observe(card));
    document.fonts.ready.then(schedule);
    window.addEventListener('resize', schedule, { passive: true });
    arrange();
  });
})();
