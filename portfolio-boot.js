(() => {
  const key = 'portfolio-boot-seen-v1';
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  if (motion.matches || typeof HTMLDialogElement === 'undefined') return;
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
      <p>$ ./portfolio</p>
      <strong>kimjuncheol_</strong>
      <div class="portfolio-boot__meter"></div>
      <p class="portfolio-boot__ready">[ OK ] READY</p>
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
        try { localStorage.setItem(key, '1'); } catch { /* Storage can be disabled mid-visit. */ }
      }, 240);
    }, 1000);
  }
  ready.addEventListener('animationend', holdCompletedScreen, { once: true });
  window.setTimeout(holdCompletedScreen, 1500);
})();
