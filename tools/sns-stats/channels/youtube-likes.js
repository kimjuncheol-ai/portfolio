const pgL = await openTab("https://www.youtube.com/@artour_busan/shorts");
await pgL.waitForTimeout(5000);
for (let i = 0; i < 4; i++) { await pgL.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight)); await pgL.waitForTimeout(1000); }
const idsL = await pgL.evaluate(() => [...new Set([...document.querySelectorAll('a[href^="/shorts/"]')].map(a => a.getAttribute('href').split('/').pop()))]);
let likesL = 0, readL = 0;
const sliceL = typeof SLICE === "undefined" ? [0, idsL.length] : SLICE;
for (const id of idsL.slice(sliceL[0], sliceL[1])) {
  try { await pgL.goto("https://www.youtube.com/watch?v=" + id, { waitUntil: 'domcontentloaded', timeout: 10000 }); } catch (e) {}
  try { await pgL.waitForSelector('like-button-view-model button, segmented-like-dislike-button-view-model button', { timeout: 7000 }); } catch (e) {} await pgL.waitForTimeout(800);
  const labels = await pgL.evaluate(() => [...document.querySelectorAll('like-button-view-model button, button[aria-label]')].map(b => (b.getAttribute('aria-label') || '') + ' ' + b.innerText).filter(a => /좋아요|like/i.test(a)));
  if (!labels.length) continue;
  readL++;
  const m = labels.join(' ').replace(/,/g, '').match(/(\d+)\s*명과 함께|(\d+)\s*(?:개|명)?\s*좋아요|좋아요\s*표시[^\d]*(\d+)/);
  likesL += m ? Number(m[1] || m[2] || m[3]) : 0;
}
await closeTab(pgL);
console.log("@@JSON" + JSON.stringify({ likes: likesL, checked: readL, of: idsL.slice(sliceL[0], sliceL[1]).length, total: idsL.length }));
