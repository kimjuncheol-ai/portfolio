const pgI = await openTab("https://www.instagram.com/artour_busan/");
await pgI.waitForTimeout(4000);
const metaI = await pgI.evaluate(() => document.querySelector('meta[property="og:description"]')?.content || document.body.innerText.slice(0, 600));
const pickI = (re) => { const m = metaI.match(re); return m ? Number(m[1].replace(/,/g, '')) : null; };
await pgI.goto("https://www.instagram.com/artour_busan/reels/");
await pgI.waitForTimeout(4000);
for (let i = 0; i < 6; i++) { await pgI.evaluate(() => window.scrollTo(0, document.body.scrollHeight)); await pgI.waitForTimeout(1200); }
const reelsI = await pgI.evaluate(() => [...new Map([...document.querySelectorAll('a[href*="/reel/"]')].map(a => [a.getAttribute('href'), a.innerText])).values()]);
const toNumI = (s) => { const m = String(s).replace(/,/g, '').match(/([\d.]+)\s*(만|천|K|M)?/); if (!m) return null; const k = { 만: 1e4, 천: 1e3, K: 1e3, M: 1e6 }[m[2]] || 1; return Math.round(parseFloat(m[1]) * k); };
const viewsI = reelsI.map(t => toNumI(t.split('\n').filter(Boolean).pop())).filter(v => v != null);
const outI = { followers: pickI(/팔로워\s*([\d,]+)/) ?? pickI(/([\d,]+)\s*Followers/i), posts: pickI(/게시물\s*([\d,]+)/) ?? pickI(/([\d,]+)\s*Posts/i), views: viewsI.length ? viewsI.reduce((a, b) => a + b, 0) : null, reels: viewsI.length };
await closeTab(pgI);
console.log('@@JSON' + JSON.stringify(outI));
