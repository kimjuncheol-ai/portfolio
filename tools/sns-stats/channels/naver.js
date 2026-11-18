const pgN = await openTab("https://blog.naver.com/artour_busan");
await pgN.waitForTimeout(4000);
const tN = await pgN.evaluate(() => { const parts = [document.body.innerText]; document.querySelectorAll('iframe').forEach(f => { try { parts.push(f.contentDocument.body.innerText); } catch (e) {} }); return parts.join('\n'); });
const nbN = tN.replace(/,/g, '').match(/이웃\s*(\d+)\s*명/);
const postsN = tN.replace(/,/g, '').match(/전체보기\s*(\d+)\s*개의 글/);
await pgN.goto("https://blog.stat.naver.com/blog/visit/cv?blogId=artour_busan&isIE8=false");
await pgN.waitForTimeout(6000);
const tableN = async () => { const t = (await pgN.evaluate(() => document.body.innerText)).replace(/,/g, ''); return t.slice(t.indexOf('조회수 목록')); };
const dailyN = {};
const readDailyN = async () => { for (const m of (await tableN()).matchAll(/(\d{4})\.(\d{2})\.(\d{2})\.\s*\([^)]*\)\s+(\d+)/g)) dailyN[`${m[1]}-${m[2]}-${m[3]}`] = Number(m[4]); };
await readDailyN();
const prevN = pgN.getByText('이전 기간 조회').first();
if (await prevN.count()) { await prevN.click(); await pgN.waitForTimeout(4000); await readDailyN(); }
const monthlyN = {};
const monthTab = pgN.getByText('월간', { exact: true }).first();
if (await monthTab.count()) { await monthTab.click(); await pgN.waitForTimeout(5000); for (const m of (await tableN()).matchAll(/(\d{4})\.(\d{2})\.\s*월간\s+(\d+)/g)) monthlyN[`${m[1]}-${m[2]}`] = Number(m[3]); }
const outN = { followers: nbN ? Number(nbN[1]) : null, posts: postsN ? Number(postsN[1]) : null, views: null, daily: dailyN, monthly: monthlyN };
await closeTab(pgN);
console.log('@@JSON' + JSON.stringify(outN));
