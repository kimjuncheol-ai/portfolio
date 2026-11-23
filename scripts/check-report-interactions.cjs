const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');

async function run() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const base = process.env.UI_AUDIT_URL || 'http://127.0.0.1:8791';
  const errors = [];
  let folders = 0;
  let videos = 0;
  let stills = 0;
  try {
    for (const width of [320, 390, 768, 1440]) {
      const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
      page.on('pageerror', error => errors.push({ width, message: error.message }));
      await page.goto(base + '/report.html');
      const dialog = page.locator('#tour-popup');
      for (const card of await page.locator('.resource-card').all()) {
        const key = await card.getAttribute('data-resource-key');
        await card.locator('[data-popup-key]').click();
        for (const folder of ['홈', '체험 프로그램', '방문자 후기', '모션 카드뉴스']) {
          await dialog.locator('.win95-content').evaluate(element => { element.scrollTop = element.scrollHeight; });
          await dialog.locator('.win95-folder[data-section="' + folder + '"]').click();
          await page.waitForFunction(() => document.querySelector('#tour-popup .win95-content').scrollTop === 0);
          assert.equal(await dialog.locator('.win95-folder[aria-current="true"]').getAttribute('data-section'), folder);
          assert((await dialog.locator('.win95-folder').evaluateAll(buttons => buttons.every(b => b.getAttribute('aria-controls') === 'popup-content'))));
          folders += 1;
        }

        const total = key === 'moca' ? 5 : 2;
        const checkVideo = async () => {
          const video = dialog.locator('.report-reel video');
          await page.waitForFunction(() => {
            const media = document.querySelector('#tour-popup video');
            return media?.readyState >= 1 || media?.error;
          });
          const meta = await video.evaluate(media => ({
            width: media.videoWidth, height: media.videoHeight, duration: media.duration, error: media.error?.message
          }));
          assert(!meta.error, `${width}px ${key} ${meta.error}`);
          assert.deepEqual([meta.width, meta.height], [720, 1280]);
          assert(Math.abs(meta.duration - (key === 'moca' ? 5 : 10)) < 0.2);
          assert.equal(await dialog.locator('a[download]').getAttribute('href'), await video.getAttribute('src'));
          videos += 1;
        };
        await checkVideo();
        if (key === 'moca') {
          for (let index = 1; index < total; index += 1) {
            await dialog.locator('[data-motion-next]').click();
            await checkVideo();
          }
          for (let index = 1; index < total; index += 1) await dialog.locator('[data-motion-prev]').click();
        } else {
          assert(!(await dialog.locator('[data-motion-next]').isVisible()));
        }
        if (width === 390 && key === 'moca') {
          const player = await dialog.locator('.report-reel video').elementHandle();
          await player.evaluate(video => video.play());
          await page.waitForFunction(video => video.currentTime > 0.2, player);
          await dialog.locator('.win95-folder[data-section="홈"]').click();
          assert(await player.evaluate(video => video.paused));
          await dialog.locator('[data-motion-folder]').click();
        }
        await dialog.locator('[data-motion-view]').click();
        const seen = new Set();
        for (let index = 0; index < total; index += 1) {
          const image = dialog.locator('.report-reel img');
          assert.equal(await dialog.locator('[data-motion-count]').innerText(), `${index + 1} / ${total}`);
          assert.deepEqual(await image.evaluate(async element => {
            await element.decode();
            return [element.naturalWidth, element.naturalHeight];
          }), [720, 1280]);
          const src = await image.getAttribute('src');
          assert(!seen.has(src));
          seen.add(src);
          assert(await dialog.locator('.report-reel').evaluate(element => element.scrollWidth <= element.clientWidth + 1));
          stills += 1;
          if (index + 1 < total) await dialog.locator('[data-motion-next]').click();
        }
        await page.keyboard.press('Escape');
        await dialog.waitFor({ state: 'hidden' });
      }
      await page.close();
    }
    assert.deepEqual(errors, []);
    console.log({ folders, portraitMP4: videos, portraitJPG: stills, errors });
  } finally {
    await browser.close();
  }
}

run().catch(error => { console.error(error); process.exitCode = 1; });
