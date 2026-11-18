const pgK = await openTab("https://blog.stat.naver.com/blog/rank/like?blogId=artour_busan&isIE8=false");
await pgK.waitForTimeout(5000);
const sumK = async () => { const t = (await pgK.evaluate(() => document.body.innerText)).replace(/,/g, ''); const head = (t.match(/(\d{4})\.(\d{2})\.(?:(\d{2})\.)?/) || []); const rows = [...t.matchAll(/^\d+\t[^\t]+\t(\d+)\t/gm)].map(m => Number(m[1])); return { key: head[3] ? `${head[1]}-${head[2]}-${head[3]}` : `${head[1]}-${head[2]}`, likes: rows.reduce((a, b) => a + b, 0) }; };
const tab = async (name) => { const el = pgK.getByText(name, { exact: true }).first(); if (await el.count()) { await el.click(); await pgK.waitForTimeout(3500); } };
const back = async () => { const el = pgK.getByText('이전 기간 조회').first(); if (!(await el.count())) return false; await el.click(); await pgK.waitForTimeout(2500); return true; };
const monthK = new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 7);
const monthlyK = {};
await tab('월간');
for (let i = 0; i < 4; i++) { const r = await sumK(); if (r.key < monthK) monthlyK[r.key] = r.likes; if (!(await back())) break; }
const dailyK = {};
await tab('일간');
for (let i = 0; i < 35; i++) { const r = await sumK(); if (!r.key.startsWith(monthK)) break; dailyK[r.key] = r.likes; if (!(await back())) break; }
await closeTab(pgK);
console.log('@@JSON' + JSON.stringify({ monthly: monthlyK, daily: dailyK }));
