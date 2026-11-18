const pgI = await openTab("https://www.instagram.com/artour_busan/");
await pgI.waitForTimeout(4000);
const metaI = await pgI.evaluate(() => document.querySelector('meta[property="og:description"]')?.content || document.body.innerText.slice(0, 600));
const pickI = (re) => { const m = metaI.replace(/,/g, '').match(re); return m ? Number(m[1]) : null; };
for (let i = 0; i < 6; i++) { await pgI.evaluate(() => window.scrollTo(0, document.body.scrollHeight)); await pgI.waitForTimeout(1200); }
const postsI = await pgI.evaluate(() => [...new Set([...document.querySelectorAll('a[href*="/p/"], a[href*="/reel/"]')].map(a => a.getAttribute('href')))]);
await pgI.goto("https://www.instagram.com/artour_busan/reels/");
await pgI.waitForTimeout(4000);
for (let i = 0; i < 6; i++) { await pgI.evaluate(() => window.scrollTo(0, document.body.scrollHeight)); await pgI.waitForTimeout(1200); }
const reelsI = await pgI.evaluate(() => [...new Map([...document.querySelectorAll('a[href*="/reel/"]')].map(a => [a.getAttribute('href').split('/').filter(Boolean).pop(), a.innerText])).entries()]);
const toNumI = (s) => { const m = String(s).replace(/,/g, '').match(/([\d.]+)\s*(만|천|K|M)?/); if (!m) return null; const k = { 만: 1e4, 천: 1e3, K: 1e3, M: 1e6 }[m[2]] || 1; return Math.round(parseFloat(m[1]) * k); };
const viewsByIdI = Object.fromEntries(reelsI.map(([id, t]) => [id, toNumI(t.split('\n').filter(Boolean).pop())]).filter(([, v]) => v != null));
let likesI = 0, likedI = 0; const infoI = {};
const pagesI = [];
for (const href of postsI) { try { await pgI.goto('https://www.instagram.com' + href, { waitUntil: 'domcontentloaded', timeout: 8000 }); } catch (e) {} await pgI.waitForTimeout(700); pagesI.push(await pgI.evaluate(() => '<meta property="og:description" content="' + (document.querySelector('meta[property="og:description"]')?.content || '').replace(/"/g, '&quot;') + '"')); }
postsI.forEach((href, idx) => {
  const html = pagesI[idx]; const d = ((html.match(/<meta property="og:description" content="([^"]*)"/) || [])[1] || '').replace(/&quot;/g, '"').replace(/&#x([0-9a-f]+);/gi, (m, h) => String.fromCodePoint(parseInt(h, 16))).replace(/&amp;/g, '&');
  const lm = d.replace(/,/g, '').match(/좋아요\s*(\d+)/) || d.replace(/,/g, '').match(/(\d+)\s*likes?/i);
  const cap = (d.match(/:\s*["“](.*)/s) || [])[1] || '';
  if (lm) { likesI += Number(lm[1]); likedI++; }
  infoI[href.split('/').filter(Boolean).pop()] = { url: 'https://www.instagram.com' + href, likes: lm ? Number(lm[1]) : null, title: cap.split(/\n|  /)[0].replace(/["”.]+$/, '').trim().slice(0, 60) };
});
const topIdI = Object.entries(viewsByIdI).sort((a, b) => b[1] - a[1])[0];
const topI = topIdI ? { title: infoI[topIdI[0]]?.title || topIdI[0], views: topIdI[1], url: infoI[topIdI[0]]?.url || "https://www.instagram.com/artour_busan/reel/" + topIdI[0] + "/" } : null;
const viewsI = Object.values(viewsByIdI);
const outI = { followers: pickI(/팔로워\s*(\d+)/) ?? pickI(/(\d+)\s*Followers/i), posts: pickI(/게시물\s*(\d+)/) ?? pickI(/(\d+)\s*Posts/i), views: viewsI.length ? viewsI.reduce((a, b) => a + b, 0) : null, likes: likedI ? likesI : null, top: topI };
await closeTab(pgI);
console.log('@@JSON' + JSON.stringify(outI));
