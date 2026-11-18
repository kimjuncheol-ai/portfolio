const pgX = await openTab("https://x.com/artour_busan");
await pgX.waitForTimeout(5000);
const headX = await pgX.evaluate(() => [...document.querySelectorAll('a[href$="/followers"], a[href$="/verified_followers"]')].map(a => a.innerText.replace(/\n/g, ' ')).join(' ') + ' ' + document.body.innerText.slice(0, 2500));
const nX = (re) => { const m = headX.match(re); return m ? Number(m[1].replace(/,/g, '')) : null; };
const seenX = {};
for (let i = 0; i < 16; i++) {
  const rows = await pgX.evaluate(() => [...document.querySelectorAll('article')].map(a => ({ href: a.querySelector('time')?.closest('a')?.getAttribute('href') || '', label: a.querySelector('[role="group"]')?.getAttribute('aria-label') || '', text: a.querySelector('[data-testid="tweetText"]')?.innerText || '' })));
  rows.forEach((r) => { if (r.href) seenX[r.href] = r; });
  await pgX.evaluate(() => window.scrollBy(0, 1400)); await pgX.waitForTimeout(1100);
}
const metricX = (label, words) => { const m = label.replace(/,/g, '').match(new RegExp(`(\\d+)\\s*(?:${words})|(?:${words})\\s*(\\d+)`, 'i')); return m ? Number(m[1] || m[2]) : null; };
const postsX = Object.values(seenX).map(r => ({ ...r, views: metricX(r.label, '조회수|views?'), likes: metricX(r.label, '마음에 들어요|좋아요|likes?') }));
const viewsX = postsX.map(p => p.views).filter(v => v != null);
const likesX = postsX.map(p => p.likes).filter(v => v != null);
const bestX = postsX.filter(p => p.views != null).sort((a, b) => b.views - a.views)[0];
const outX = { followers: nX(/([\d,]+)\s*(?:팔로워|Followers?)/) ?? nX(/팔로워\s*([\d,]+)/), posts: nX(/게시물\s*([\d,]+)/) ?? nX(/([\d,]+)\s*posts/i), views: viewsX.length ? viewsX.reduce((a, b) => a + b, 0) : null, likes: viewsX.length ? likesX.reduce((a, b) => a + b, 0) : null, top: bestX ? { title: bestX.text.split('\n')[0].slice(0, 60), views: bestX.views, url: 'https://x.com' + bestX.href } : null, counted: viewsX.length };
await closeTab(pgX);
console.log('@@JSON' + JSON.stringify(outX));
