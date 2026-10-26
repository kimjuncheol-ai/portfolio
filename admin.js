(() => {
  const config = window.SITE_AI_CONFIG || {};
  const connection = document.querySelector('#admin-connection');
  const loginSection = document.querySelector('#rag-login');
  const dashboard = document.querySelector('#rag-dashboard');
  const loginForm = document.querySelector('#admin-login-form');
  const loginMessage = document.querySelector('#login-message');
  const dashboardMessage = document.querySelector('#dashboard-message');
  const documentList = document.querySelector('#document-list');
  const scenarioList = document.querySelector('#scenario-list');
  const conversationList = document.querySelector('#conversation-list');
  const syncButton = document.querySelector('#sync-site');
  const logoutButton = document.querySelector('#admin-logout');
  const refreshConversations = document.querySelector('#refresh-conversations');
  const tabButtons = [...document.querySelectorAll('[data-admin-tab]')];
  const tabPanels = [...document.querySelectorAll('[data-admin-panel]')];
  let scenarioIds = [];

  if (!config.supabaseUrl || !config.publishableKey || !window.supabase) {
    connection.textContent = 'not configured';
    loginMessage.textContent = '챗봇 서버가 아직 연결되지 않았습니다.';
    loginForm.querySelector('button').disabled = true;
    return;
  }

  const client = window.supabase.createClient(config.supabaseUrl, config.publishableKey);
  connection.textContent = 'secure';
  const setMessage = (element, message, error = false) => {
    element.textContent = message;
    element.classList.toggle('is-error', error);
  };
  const formatDate = (value) => value ? new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : '—';

  const verifyAdmin = async () => {
    const { data, error } = await client.from('site_admins').select('user_id').limit(1).maybeSingle();
    return !error && Boolean(data);
  };

  const loadDocuments = async () => {
    const { data, error } = await client.from('site_documents').select('id,page_path,page_title,section,content,active,updated_at').order('page_path').order('section');
    if (error) throw error;
    documentList.replaceChildren();
    data.forEach((document) => {
      const row = documentList.insertRow();
      row.innerHTML = `<td><strong></strong><small></small></td><td><strong></strong><small></small></td><td>${formatDate(document.updated_at)}</td><td><label class="rag-switch"><input type="checkbox" ${document.active ? 'checked' : ''} aria-label="문서 활성화"><span></span></label></td>`;
      row.cells[0].querySelector('strong').textContent = document.page_title;
      row.cells[0].querySelector('small').textContent = document.page_path;
      row.cells[1].querySelector('strong').textContent = document.section || 'body';
      row.cells[1].querySelector('small').textContent = document.content.slice(0, 105);
      row.querySelector('input').addEventListener('change', async (event) => {
        event.target.disabled = true;
        const { error: updateError } = await client.from('site_documents').update({ active: event.target.checked }).eq('id', document.id);
        event.target.disabled = false;
        if (updateError) {
          event.target.checked = !event.target.checked;
          setMessage(dashboardMessage, updateError.message, true);
        } else {
          setMessage(dashboardMessage, '검색 문서 상태를 변경했습니다.');
          loadDocuments();
        }
      });
    });
    document.querySelector('#stat-documents').textContent = data.length;
    document.querySelector('#stat-pages').textContent = new Set(data.map((item) => item.page_path)).size;
    document.querySelector('#stat-sync').textContent = data.length ? formatDate(data.reduce((latest, item) => item.updated_at > latest ? item.updated_at : latest, '')) : '—';
  };

  const loadScenarios = async () => {
    const { data, error } = await client.from('site_faqs').select('id,slug,question,answer,keywords,source_paths,active,updated_at').order('slug');
    if (error) throw error;
    scenarioIds = data.map((scenario) => scenario.id);
    scenarioList.replaceChildren();
    data.forEach((scenario) => {
      const card = document.createElement('article');
      card.className = 'rag-scenario';
      card.innerHTML = `
        <header><div><span></span><strong></strong></div><label class="rag-switch"><input type="checkbox" ${scenario.active ? 'checked' : ''} aria-label="답변 시나리오 활성화"><span></span></label></header>
        <label>질문 의도<input class="rag-scenario__question" type="text" maxlength="180"></label>
        <label>답변<textarea class="rag-scenario__answer" rows="4" maxlength="1600"></textarea></label>
        <label>키워드<input class="rag-scenario__keywords" type="text" maxlength="350"></label>
        <footer><small></small><button class="rag-button" type="button">save scenario</button></footer>`;
      card.querySelector('header span').textContent = scenario.slug;
      card.querySelector('header strong').textContent = (scenario.source_paths || []).join(', ');
      card.querySelector('.rag-scenario__question').value = scenario.question;
      card.querySelector('.rag-scenario__answer').value = scenario.answer;
      card.querySelector('.rag-scenario__keywords').value = (scenario.keywords || []).join(', ');
      card.querySelector('footer small').textContent = `updated ${formatDate(scenario.updated_at)}`;
      card.querySelector('.rag-switch input').addEventListener('change', async (event) => {
        const { error: updateError } = await client.from('site_faqs').update({ active: event.target.checked, updated_at: new Date().toISOString() }).eq('id', scenario.id);
        if (updateError) {
          event.target.checked = !event.target.checked;
          setMessage(dashboardMessage, updateError.message, true);
        }
      });
      card.querySelector('footer button').addEventListener('click', async (event) => {
        event.target.disabled = true;
        const payload = {
          question: card.querySelector('.rag-scenario__question').value.trim(),
          answer: card.querySelector('.rag-scenario__answer').value.trim(),
          keywords: card.querySelector('.rag-scenario__keywords').value.split(',').map((value) => value.trim()).filter(Boolean),
          embedding: null,
          updated_at: new Date().toISOString()
        };
        const { error: updateError } = await client.from('site_faqs').update(payload).eq('id', scenario.id);
        event.target.disabled = false;
        if (updateError) return setMessage(dashboardMessage, updateError.message, true);
        setMessage(dashboardMessage, '답변 시나리오를 저장했습니다. 동기화를 실행하면 의미 검색에도 반영됩니다.');
        loadScenarios();
      });
      scenarioList.append(card);
    });
    document.querySelector('#stat-faqs').textContent = data.filter((item) => item.active).length;
  };

  const loadConversations = async () => {
    conversationList.innerHTML = '<p class="rag-empty">loading conversations…</p>';
    const { data, error } = await client.from('site_chat_messages').select('id,session_id,role,content,sources,created_at').order('created_at', { ascending: false }).limit(80);
    if (error) throw error;
    conversationList.replaceChildren();
    if (!data.length) {
      conversationList.innerHTML = '<p class="rag-empty">아직 저장된 대화가 없습니다.</p>';
      return;
    }
    const grouped = Map.groupBy ? Map.groupBy(data, (item) => item.session_id) : data.reduce((map, item) => map.set(item.session_id, [...(map.get(item.session_id) || []), item]), new Map());
    grouped.forEach((items, sessionId) => {
      const block = document.createElement('article');
      block.className = 'rag-conversation';
      const heading = document.createElement('header');
      heading.innerHTML = `<strong>session ${sessionId.slice(0, 8)}</strong><span>${formatDate(items[0].created_at)}</span>`;
      block.append(heading);
      [...items].reverse().forEach((message) => {
        const row = document.createElement('div');
        row.className = `rag-conversation__message rag-conversation__message--${message.role}`;
        const role = document.createElement('strong');
        role.textContent = message.role;
        const content = document.createElement('p');
        content.textContent = message.content;
        row.append(role, content);
        block.append(row);
      });
      conversationList.append(block);
    });
  };

  const loadAdmin = async () => {
    await Promise.all([loadDocuments(), loadScenarios(), loadConversations()]);
  };

  const showSession = async (session) => {
    if (!session) {
      loginSection.hidden = false;
      dashboard.hidden = true;
      return;
    }
    const allowed = await verifyAdmin();
    if (!allowed) {
      await client.auth.signOut();
      loginSection.hidden = false;
      dashboard.hidden = true;
      setMessage(loginMessage, '이 계정에는 챗봇 관리자 권한이 없습니다.', true);
      return;
    }
    loginSection.hidden = true;
    dashboard.hidden = false;
    try { await loadAdmin(); } catch (error) { setMessage(dashboardMessage, error.message, true); }
  };

  tabButtons.forEach((button) => button.addEventListener('click', () => {
    tabButtons.forEach((item) => item.classList.toggle('is-active', item === button));
    tabPanels.forEach((panel) => {
      const active = panel.dataset.adminPanel === button.dataset.adminTab;
      panel.hidden = !active;
      panel.classList.toggle('is-active', active);
    });
  }));

  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const button = loginForm.querySelector('button');
    button.disabled = true;
    setMessage(loginMessage, '관리자 권한을 확인하는 중…');
    const values = new FormData(loginForm);
    const { data, error } = await client.auth.signInWithPassword({ email: values.get('email'), password: values.get('password') });
    button.disabled = false;
    if (error) return setMessage(loginMessage, '로그인에 실패했습니다.', true);
    setMessage(loginMessage, '');
    await showSession(data.session);
  });
  logoutButton.addEventListener('click', async () => { await client.auth.signOut(); await showSession(null); });
  refreshConversations.addEventListener('click', () => loadConversations().catch((error) => setMessage(dashboardMessage, error.message, true)));
  syncButton.addEventListener('click', async () => {
    syncButton.disabled = true;
    setMessage(dashboardMessage, '사이트 문서와 답변 시나리오를 임베딩하는 중입니다…');
    const { data: sessionData } = await client.auth.getSession();
    try {
      const targets = [
        ...['index.html', 'about.html', 'report.html', 'contents.html', 'sns.html', 'final.html'].map((page) => ({ page })),
        ...scenarioIds.map((faqId) => ({ page: '__faq__', faqId }))
      ];
      const total = { pages: 0, chunks: 0, faqs: 0 };
      for (let index = 0; index < targets.length; index += 1) {
        setMessage(dashboardMessage, `동기화 중 ${index + 1}/${targets.length}: ${targets[index].page}`);
        const response = await fetch(`${config.supabaseUrl}/functions/v1/${config.syncFunction || 'sync-site'}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', apikey: config.publishableKey, Authorization: `Bearer ${sessionData.session.access_token}` },
          body: JSON.stringify({ action: 'sync', ...targets[index] })
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result.error || `${targets[index].page} 동기화에 실패했습니다.`);
        total.pages += result.pages || 0;
        total.chunks += result.chunks || 0;
        total.faqs += result.faqs || 0;
      }
      setMessage(dashboardMessage, `${total.pages}개 페이지, ${total.chunks}개 문서, ${total.faqs}개 시나리오를 동기화했습니다.`);
      await loadAdmin();
    } catch (error) {
      setMessage(dashboardMessage, error.message, true);
    } finally { syncButton.disabled = false; }
  });

  client.auth.getSession().then(({ data }) => showSession(data.session));
})();
