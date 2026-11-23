(() => {
  const key = 'portfolio-boot-seen-v1';
  const sshTarget = 'kimjuncheol@218.235.89.82';
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  if (motion.matches || typeof HTMLDialogElement === 'undefined' ||
      !document.documentElement.classList.contains('portfolio-boot-pending')) return;
  try {
    if (localStorage.getItem(key)) return;
  } catch {
    return;
  }

  const screen = document.createElement('dialog');
  screen.className = 'portfolio-boot';
  screen.setAttribute('aria-label', '포트폴리오 시작 화면');
  screen.innerHTML = `
    <div class="portfolio-boot__rain" aria-hidden="true"></div>
    <div class="portfolio-boot__console" aria-hidden="true">
      <p class="portfolio-boot__host">PORTFOLIO TERMINAL</p>
      <div class="portfolio-boot__log">
        <p><span>$ </span><span data-boot-command></span></p>
        <p hidden><span>login: </span><span data-boot-user></span></p>
        <p hidden><span>password: </span><span data-boot-password></span></p>
      </div>
      <div class="portfolio-boot__meter"></div>
      <p class="portfolio-boot__ready" hidden>[ OK ] CONNECTED</p>
    </div>`;
  const rain = screen.querySelector('.portfolio-boot__rain');
  for (let index = 0; index < 24; index++) {
    const column = document.createElement('span');
    column.textContent = Array.from({ length: 17 }, () => '01アカサタナハ'[Math.floor(Math.random() * 8)]).join('');
    column.style.setProperty('--delay', `${(index % 6) * 55}ms`);
    rain.append(column);
  }
  screen.addEventListener('cancel', (event) => event.preventDefault());
  document.body.append(screen);
  screen.showModal();
  document.documentElement.classList.add('portfolio-boot-active');
  document.documentElement.classList.remove('portfolio-boot-pending');

  let audio;
  function enableSound() {
    const Context = window.AudioContext || window.webkitAudioContext;
    if (!Context) return;
    try {
      audio ||= new Context();
      audio.resume().catch(() => {});
    } catch { /* The visual sequence does not require sound. */ }
  }
  screen.addEventListener('pointerdown', enableSound);
  screen.addEventListener('keydown', enableSound);
  if (navigator.userActivation?.hasBeenActive) enableSound();

  function tone(frequency, duration, volume, offset = 0) {
    if (audio?.state !== 'running') return;
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    const time = audio.currentTime + offset;
    oscillator.type = 'triangle';
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(volume, time);
    gain.gain.exponentialRampToValueAtTime(.0001, time + duration);
    oscillator.connect(gain).connect(audio.destination);
    oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
    oscillator.start(time);
    oscillator.stop(time + duration);
  }

  const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));
  async function type(selector, message) {
    const field = screen.querySelector(selector);
    field.parentElement.hidden = false;
    field.classList.add('is-typing');
    for (const character of message) {
      field.textContent += character;
      if (character !== ' ') tone(142 + Math.random() * 70, .019, .022);
      await wait(24 + Math.random() * 43);
    }
    field.classList.remove('is-typing');
    tone(105, .038, .035);
  }

  const ready = screen.querySelector('.portfolio-boot__ready');
  let holding = false;
  function holdCompletedScreen() {
    if (holding) return;
    holding = true;
    window.setTimeout(() => {
      screen.classList.add('is-leaving');
      window.setTimeout(() => {
        screen.close();
        screen.remove();
        document.documentElement.classList.remove('portfolio-boot-active');
        if (audio) audio.close().catch(() => {});
        try { localStorage.setItem(key, '1'); } catch { /* Storage can be disabled mid-visit. */ }
      }, 240);
    }, 1000);
  }
  ready.addEventListener('animationend', holdCompletedScreen, { once: true });
  (async () => {
    await wait(180);
    await type('[data-boot-command]', `ssh ${sshTarget}`);
    await wait(150);
    await type('[data-boot-user]', 'kimjuncheol');
    await wait(150);
    await type('[data-boot-password]', '••••••');
    await wait(210);
    ready.hidden = false;
    screen.classList.add('is-connected');
    tone(440, .1, .035);
    tone(660, .14, .028, .075);
    window.setTimeout(holdCompletedScreen, 350);
  })();
})();
