const pgY = await openTab("https://www.youtube.com/@artour_busan/shorts");
await pgY.waitForTimeout(5000);
for (let i = 0; i < 4; i++) { await pgY.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight)); await pgY.waitForTimeout(1200); }
const tY = (await pgY.evaluate(() => document.body.innerText)).replace(/,/g, '');
const subY = tY.match(/구독자\s*(없음|[\d.]+\s*(?:천|만)?\s*명)/);
const toNumY = (s) => { if (!s || s === '없음') return 0; const m = s.match(/([\d.]+)\s*(천|만)?/); return Math.round(parseFloat(m[1]) * ({ 천: 1e3, 만: 1e4 }[m[2]] || 1)); };
const viewsY = [...tY.matchAll(/조회수\s*(없음|[\d.]+\s*(?:천|만)?회)/g)].map(m => toNumY(m[1]));
const itemsY = await pgY.evaluate(() => [...new Map([...document.querySelectorAll('a[href^="/shorts/"]')].map(a => [a.getAttribute('href'), a.innerText])).entries()]);
// Shorts tiles list "title" then "조회수 N회" in reading order; tile links come in the same order.
const linesY = tY.split('\n').map(s => s.trim()).filter(Boolean);
const tilesY = linesY.map((line, i) => { const v = line.match(/^조회수\s*(없음|[\d.]+\s*(?:천|만)?회)$/); return v ? { title: linesY[i - 1] || '', views: toNumY(v[1]) } : null; }).filter(Boolean);
const hrefsY = itemsY.map(([href]) => href).filter((h, i, all) => all.indexOf(h) === i);
const shortsY = tilesY.map((t, i) => ({ ...t, url: hrefsY[i] ? 'https://www.youtube.com' + hrefsY[i] : 'https://www.youtube.com/@artour_busan/shorts' }));
const bestY = shortsY.sort((a, b) => b.views - a.views)[0];
await pgY.goto("https://studio.youtube.com/channel/UCGCsElQVju6rVecK1A4-kZg");
await pgY.waitForTimeout(8000);
const studioY = (await pgY.evaluate(() => document.body.innerText)).replace(/,/g, '').match(/현재 구독자 수\s*([\d.]+\s*(?:천|만)?)/);
const outY = { top: bestY ? { title: bestY.title.replace(/\s*#Shorts\s*$/, '').slice(0, 60), views: bestY.views, url: bestY.url } : null, followers: studioY ? toNumY(studioY[1]) : subY ? toNumY(subY[1]) : null, views: viewsY.length ? viewsY.reduce((a, b) => a + b, 0) : null, posts: viewsY.length || null };
await closeTab(pgY);
console.log('@@JSON' + JSON.stringify(outY));
