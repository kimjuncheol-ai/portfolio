const pgY = await openTab("https://www.youtube.com/@artour_busan/shorts");
await pgY.waitForTimeout(5000);
for (let i = 0; i < 4; i++) { await pgY.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight)); await pgY.waitForTimeout(1200); }
const tY = (await pgY.evaluate(() => document.body.innerText)).replace(/,/g, '');
const subY = tY.match(/구독자\s*(없음|[\d.]+\s*(?:천|만)?\s*명)/);
const toNumY = (s) => { if (!s || s === '없음') return 0; const m = s.match(/([\d.]+)\s*(천|만)?/); return Math.round(parseFloat(m[1]) * ({ 천: 1e3, 만: 1e4 }[m[2]] || 1)); };
const viewsY = [...tY.matchAll(/조회수\s*(없음|[\d.]+\s*(?:천|만)?회)/g)].map(m => toNumY(m[1]));
const outY = { followers: subY ? toNumY(subY[1]) : null, views: viewsY.length ? viewsY.reduce((a, b) => a + b, 0) : null, posts: viewsY.length || null };
await closeTab(pgY);
console.log('@@JSON' + JSON.stringify(outY));
