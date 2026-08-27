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
        { name: '함께 미술관', audience: '어린이·가족', description: '진행자와 함께 전시를 대화식으로 감상하며 작품에 관한 질문과 생각을 나누는 전시 설명 프로그램입니다.', detail: '전시 연계 · 사전 예약' },
        { name: '부산모카 꼼지락 〈움직여 볼까?〉', audience: '6–7세 어린이 단체', description: '작품을 감상한 뒤 보이지 않는 움직임을 상상하고 몸으로 표현하며 감각과 창의성을 확장하는 체험입니다.', detail: '전시실·창작실 · 무료' }
      ],
      reviews: [
        { title: '부산현대미술관에서 만난 세 전시 관람 후기', author: '부산광역시', url: 'https://blog.naver.com/cooolbusan/224328255685' },
        { title: '무료로 만나는 〈코뿔소와 유니콘〉 전시 관람 후기', author: '부산교육', url: 'https://blog.naver.com/with_pen/224327082717' },
        { title: '부산현대미술관 무료전시, 초등 아이와 다녀온 후기', author: '텔미', url: 'https://blog.naver.com/tellmememory/224330861096' }
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
        { name: '내일의 미술관: 상상이 만드는 공간', audience: '초등학생', description: '어린이의 상상력을 바탕으로 미래의 미술관과 새로운 예술 공간을 탐색하는 창의 교육 프로그램입니다.', detail: '2026. 5. 1.–6. 1. · 사전 접수' },
        { name: '점과 시간 사이의 무한한 층위', audience: '시민 관람객', description: '작가들의 작품을 통해 점과 시간, 기억이 겹쳐지는 방식을 살펴보는 전시 연계 예술 프로그램입니다.', detail: '2026. 3. 14.–4. 27. · 도모헌 연계' }
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
  const officialLink = tourPopup.querySelector('#popup-official-link');
  const folderButtons = [...tourPopup.querySelectorAll('.win95-folder')];
  const closeButton = tourPopup.querySelector('.win95-close');
  const titlebar = tourPopup.querySelector('.win95-titlebar');
  let activeTour = tourData.moca;

  const renderHome = () => {
    const gallery = activeTour.images.map(([src, alt, imageClass = '']) => `<img class="${imageClass}" src="${src}" alt="${alt}" loading="lazy">`).join('');
    popupContent.innerHTML = `
      <h2>${activeTour.name}</h2>
      <p class="win95-intro">${activeTour.description}</p>
      <div class="win95-type-row"><span class="win95-tag-icon" aria-hidden="true"></span><strong class="win95-type-label">${activeTour.type}</strong></div>
      <div class="win95-meta"><span>${activeTour.tags.join(' ')}</span><span>조사일: 2026-08-27</span></div>
      <div class="win95-gallery">${gallery}</div>`;
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
    const reviews = activeTour.reviews.map((review, index) => `
      <a class="win95-review-card" href="${review.url}" target="_blank" rel="noopener noreferrer">
        <span class="win95-review-icon" aria-hidden="true"></span>
        <span class="win95-review-copy"><strong>${review.title}</strong><small>${review.author} · 네이버 블로그 원문</small></span>
        <span class="win95-review-open" aria-hidden="true">열기 ↗</span>
      </a>`).join('');
    popupContent.innerHTML = `
      <h2>${activeTour.name} — 방문자 후기</h2>
      <div class="win95-meta"><span>검색일: 2026-08-27</span></div>
      <div class="win95-review-list">${reviews}</div>`;
  };

  const selectFolder = (section) => {
    folderButtons.forEach((button) => button.classList.toggle('is-active', button.dataset.section === section));
    popupStatus.textContent = section;
    popupAddress.textContent = `C:\\${activeTour.name}\\${section}`;
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
    } else {
      popupContent.innerHTML = `<h2>${section}</h2><p>이 폴더의 내용은 준비 중입니다.</p>`;
    }
  };

  document.querySelectorAll('[data-popup-title]').forEach((button) => {
    button.addEventListener('click', () => {
      activeTour = tourData[button.dataset.popupKey];
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
