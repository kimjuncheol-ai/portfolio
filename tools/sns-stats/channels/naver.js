const pgN = await openTab("https://blog.naver.com/artour_busan");
await pgN.waitForTimeout(4000);
const tN = await pgN.evaluate(() => { const parts = [document.body.innerText]; document.querySelectorAll('iframe').forEach(f => { try { parts.push(f.contentDocument.body.innerText); } catch (e) {} }); return parts.join('\n'); });
const nbN = tN.replace(/,/g, '').match(/이웃\s*(\d+)\s*명/);
const postsN = tN.replace(/,/g, '').match(/전체보기\s*(\d+)\s*개의 글/);
let dailyN = null, noteN = '';
try { await pgN.goto("https://blog.stat.naver.com/blog/daily/daily/cv?blogId=artour_busan&isIE8=false"); } catch (e) { noteN = 'stat page error'; }
await pgN.waitForTimeout(6000);
const sN = (await pgN.evaluate(() => document.body.innerText)).replace(/,/g, '');
if (/nidlogin|로그인/.test(pgN.url())) noteN = 'naver login required';
else if (/시스템 오류/.test(sN)) noteN = 'naver stats temporarily unavailable';
else { const m = sN.match(/조회수\s*\n?\s*(\d+)/); if (m) dailyN = Number(m[1]); else noteN = 'daily views not found'; }
let prevN = null;
if (dailyN != null) {
  const prevBtn = pgN.getByText('이전 기간 조회').first();
  if (await prevBtn.count()) { await prevBtn.click(); await pgN.waitForTimeout(4000); const pm = (await pgN.evaluate(() => document.body.innerText)).replace(/,/g, '').match(/조회수\s*\n?\s*(\d+)/); if (pm) prevN = Number(pm[1]); }
}
const outN = { followers: nbN ? Number(nbN[1]) : null, posts: postsN ? Number(postsN[1]) : null, views: null, dailyViews: dailyN, dailyViewsYesterday: prevN, note: noteN };
await closeTab(pgN);
console.log('@@JSON' + JSON.stringify(outN));
