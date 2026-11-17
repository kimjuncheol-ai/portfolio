const pgF = await openTab("https://www.facebook.com/profile.php?id=61595298063187");
await pgF.waitForTimeout(5000);
const tF = await pgF.evaluate(() => document.body.innerText.slice(0, 4000));
const mF = tF.replace(/,/g, '').match(/팔로워\s*(\d+)\s*명/);
const endF = new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);
await pgF.goto("https://www.facebook.com/professional_dashboard/content/content_library/?date_range=CUSTOM&end_date=" + endF + "&post_type=ALL_CONTENT&sort_by=DATE&sorting_method=DATE_DESCENDING&start_date=2026-01-01");
await pgF.waitForTimeout(8000);
let prevF = -1, rowsF = [];
for (let i = 0; i < 25; i++) {
  rowsF = await pgF.evaluate(() => { [...document.querySelectorAll('*')].filter(d => d.scrollHeight > d.clientHeight + 50 && getComputedStyle(d).overflowY !== 'visible').forEach(d => { d.scrollTop = d.scrollHeight; }); window.scrollTo(0, document.body.scrollHeight); return document.body.innerText.split('게시됨 • ').slice(0, -1).map(s => s.trim().split('\n').slice(-3).join(' ')); });
  if (rowsF.length === prevF && i > 3) break; prevF = rowsF.length; await pgF.waitForTimeout(1500);
}
const outF = { followers: mF ? Number(mF[1]) : null, posts: rowsF.length || null };
await closeTab(pgF);
console.log('@@JSON' + JSON.stringify(outF));
