(() => {
  const config = window.SITE_AI_CONFIG || {};
  const isConfigured = Boolean(config.supabaseUrl && config.publishableKey);
  const pageName = location.pathname.split('/').pop() || 'index.html';

  const fallbackKnowledge = [
    {
      terms: ['김준철', '누구', '소개', '전공', 'root'],
      answer: '김준철은 대학에서 신학을, 대학원에서 종교철학을 공부했습니다. 대한성공회 부산교구 성직청원자이며 AI를 활용한 로컬 관광 콘텐츠·서비스 제작 역량을 기르고 있습니다.',
      source: ['index.html', 'home']
    },
    {
      terms: ['관광', '자원', '추천', '미술관', '치유'],
      answer: '이 사이트가 선정한 관광 자원은 부산현대미술관, 부산시립미술관, 부산어린이대공원 치유의 숲 세 곳입니다. 문화·예술과 자연·웰니스 경험을 중심으로 소개합니다.',
      source: ['report.html', 'report']
    },
    {
      terms: ['현대미술관', 'moca', '을숙도'],
      answer: '부산현대미술관은 을숙도의 생태환경과 동시대 예술이 맞닿는 서부산의 공립미술관입니다. 현대미술 전시, 어린이예술도서관, 을숙도 생태 탐방을 함께 경험할 수 있습니다.',
      source: ['report.html', 'report']
    },
    {
      terms: ['시립미술관', '이우환'],
      answer: '부산시립미술관은 부산 미술의 흐름과 국내외 현대미술을 연결하는 공립미술관입니다. 기획·소장품 전시와 이우환공간, 미술 교육 프로그램을 소개하고 있습니다.',
      source: ['report.html', 'report']
    },
    {
      terms: ['치유의 숲', '어린이대공원', '편백', '성지곡'],
      answer: '부산어린이대공원 치유의 숲은 성지곡수원지와 편백림을 걷는 도심 속 웰니스 공간입니다. 편백숲 걷기, 호흡과 명상, 수원지 산책을 대표 체험으로 소개합니다.',
      source: ['report.html', 'report']
    },
    {
      terms: ['딸깍상사', '회사', '브랜드', 'about'],
      answer: '딸깍상사는 AI·관광·콘텐츠를 중심으로 부산의 장소와 이야기를 콘텐츠와 서비스로 바꾸는 크리에이티브 컴퍼니입니다. 원칙은 “반복 업무는 AI에게, 방향과 최종 책임은 사람에게”입니다.',
      source: ['about.html', 'about']
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

  const suggestionsList = ['김준철은 어떤 사람인가요?', '선정 관광 자원 알려줘', '딸깍상사는 뭐예요?'];
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
    const normalized = question.toLowerCase().replace(/\s+/g, ' ');
    const ranked = fallbackKnowledge
      .map((entry) => ({ entry, score: entry.terms.reduce((score, term) => score + (normalized.includes(term.toLowerCase()) ? 1 : 0), 0) }))
      .sort((a, b) => b.score - a.score);
    if (!ranked[0]?.score) {
      return { answer: '현재 사이트에서 확인할 수 없는 내용입니다. 김준철 소개, 선정 관광 자원, 딸깍상사에 관해 질문해 주세요.', sources: [] };
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
      const fallbackAnswer = `${fallback.answer}\n\n(현재 RAG 서버 연결이 원활하지 않아 사이트 기본 자료로 답했습니다.)`;
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
    addMessage('assistant', '안녕하세요. 김준철의 포트폴리오 안내 AI입니다. 이 사이트에 있는 내용만 바탕으로 답합니다. 무엇이 궁금하신가요?');
    consentCheck.checked = false;
    consentAccept.disabled = true;
    consentPanel.hidden = false;
  });

  if (transcript.length) {
    transcript.forEach((message) => addMessage(message.role, message.text, message.sources || [], { persist: false }));
    suggestions.hidden = history.some((message) => message.role === 'user');
  } else {
    addMessage('assistant', '안녕하세요. 김준철의 포트폴리오 안내 AI입니다. 이 사이트에 있는 내용만 바탕으로 답합니다. 무엇이 궁금하신가요?');
  }
  if (savedTabState?.panelOpen) {
    panel.hidden = false;
    launcher.setAttribute('aria-expanded', 'true');
    launcher.setAttribute('aria-label', '사이트 안내 AI 닫기');
  }
  persistTabState();
})();
