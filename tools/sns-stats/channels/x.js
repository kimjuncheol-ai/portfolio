const pgX = await openTab("https://x.com/artour_busan");
await pgX.waitForTimeout(5000);
const headX = await pgX.evaluate(() => [...document.querySelectorAll('a[href$="/followers"], a[href$="/verified_followers"]')].map(a => a.innerText.replace(/\n/g, ' ')).join(' ') + ' ' + document.body.innerText.slice(0, 2500));
const nX = (re) => { const m = headX.match(re); return m ? Number(m[1].replace(/,/g, '')) : null; };
const seenX = {};
for (let i = 0; i < 16; i++) {
  const rows = await pgX.evaluate(() => [...document.querySelectorAll('article')].map(a => [a.querySelector('time')?.closest('a')?.getAttribute('href') || a.innerText.slice(0, 40), a.querySelector('[role="group"]')?.getAttribute('aria-label') || '']));
  rows.forEach(([k, v]) => { seenX[k] = v; });
  await pgX.evaluate(() => window.scrollBy(0, 1400)); await pgX.waitForTimeout(1100);
}
const viewsX = Object.values(seenX).map(l => { const m = l.replace(/,/g, '').match(/(?:조회수|views?)\s*(\d+)|(\d+)\s*(?:조회수|views?)/i); return m ? Number(m[1] || m[2]) : null; }).filter(v => v != null);
const outX = { followers: nX(/([\d,]+)\s*(?:팔로워|Followers?)/) ?? nX(/팔로워\s*([\d,]+)/), posts: nX(/게시물\s*([\d,]+)/) ?? nX(/([\d,]+)\s*posts/i), views: viewsX.length ? viewsX.reduce((a, b) => a + b, 0) : null, counted: viewsX.length };
await closeTab(pgX);
console.log('@@JSON' + JSON.stringify(outX));
