// Render editorial art in Chromium, then animate the layers and encode portrait MP4s.
// Run from the project root with PLAYWRIGHT_MODULE and FFMPEG set.
const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');
const vm = require('node:vm');
const { execFile } = require('node:child_process');
const { promisify } = require('node:util');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const run = promisify(execFile);
const ffmpeg = process.env.FFMPEG || 'ffmpeg';
const output = path.resolve('assets/report/motion/reels');
const width = 720;
const height = 1280;
const fps = 24;
const frameCount = 120;
const escape = (text) => String(text).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const accents = ['#a3e8a8','#e7d498','#a6d9f3','#c9e6ab','#eec8aa'];
const coat = (index) => String(index + 1).padStart(2, '0');

const css = `
  * {box-sizing:border-box}
  html,body {margin:0;width:720px;height:1280px;overflow:hidden}
  body {font-family:"Malgun Gothic",sans-serif;color:#f4f8ef}
  .canvas,.layer {position:absolute;inset:0}
  .layer {z-index:3}
  .canvas {background:linear-gradient(156deg,#263b2a,#101913 56%,#15291c)}
  .canvas.text-only {background:radial-gradient(ellipse at 92% 38%,#42604b,#15251a 55%,#101912)}
  .canvas.text-only::after {content:'';position:absolute;inset:280px -180px 220px 160px;border:1px solid #85b59170;transform:rotate(-34deg);box-shadow:0 0 0 35px #8fc79d15,0 0 0 95px #8fc79d13}
  .image {position:absolute;inset:310px 0 auto;width:100%;height:570px;display:block;object-fit:contain;object-position:center}
  .full .image {object-fit:cover;object-position:var(--anchor,center)}
  .frame {position:absolute;z-index:2;inset:30px;border:1px solid #b9e0bf50;pointer-events:none}
  .eyebrow {position:absolute;top:68px;left:59px;color:var(--accent);font:700 17px/1.2 Consolas,monospace;letter-spacing:.13em}
  .count {position:absolute;top:68px;right:59px;color:var(--accent);font:700 17px/1.2 Consolas,monospace}
  .heading {position:absolute;top:113px;left:58px;right:58px}
  .place {font-size:23px;font-weight:700;color:var(--accent);margin:0 0 17px}
  h1 {margin:0;font-size:clamp(33px,7.5vw,54px);font-weight:800;line-height:1.19;letter-spacing:-.054em;word-break:keep-all;overflow-wrap:anywhere;text-wrap:balance;text-shadow:0 3px 16px #061109a0}
  .text-only-head .heading {top:335px}
  .text-only-head h1 {font-size:65px}
  .caption {position:absolute;bottom:129px;left:58px;right:58px;padding:26px 27px 28px;border:1px solid #b1e2bd54;border-left:4px solid var(--accent);background:#0e2119e8}
  .caption small {display:block;margin-bottom:9px;color:var(--accent);font:700 16px/1.2 Consolas,monospace;letter-spacing:.1em}
  .caption p {margin:0;font-size:25px;line-height:1.55;word-break:keep-all;overflow-wrap:anywhere}
  .credit {position:absolute;bottom:70px;left:58px;right:58px;color:#e3f1e4;font-size:15px;line-height:1.4}
  .rule {position:absolute;bottom:47px;left:58px;right:58px;height:2px;background:#a7dbad57}
`;

async function imageData(file) {
  if (!file) return '';
  const extension = path.extname(file).toLowerCase();
  const type = { '.png': 'png', '.jpg': 'jpeg', '.webp': 'webp' }[extension];
  if (!type) throw Error('Unsupported photograph: ' + file);
  return `data:image/${type};base64,${(await fs.readFile(path.resolve('assets/report', file))).toString('base64')}`;
}

async function draw(page, venue, key, scene, index, total, stage) {
  const [file, headline, copy, credit] = scene;
  const color = accents[(venue.ordinal + index) % accents.length];
  const image = await imageData(file);
  const isMoca = key === 'moca';
  const photo = image ? `<img class="image" src="${image}" alt="">` : '';
  const background = `<div class="canvas ${isMoca ? 'full' : ''} ${file ? '' : 'text-only'}">${photo}<div class="frame"></div></div>`;
  const headlineLayer = `<div class="layer ${file ? '' : 'text-only-head'}">
    <span class="eyebrow">BUSAN FIELD NOTES</span><span class="count">${coat(index)} / ${coat(total - 1)}</span>
    <header class="heading"><p class="place">${escape(venue.name)}</p><h1>${escape(headline).replaceAll('\n','<br>')}</h1></header></div>`;
  const detailLayer = `<div class="layer"><div class="caption"><small>FIELD NOTE ${coat(index)}</small><p>${escape(copy)}</p></div>
    <div class="credit">${credit ? `사진 · ${escape(credit)}` : '운영과 관람 정보는 공식 홈페이지에서 확인하세요.'}</div><div class="rule"></div></div>`;
  await page.setContent(`<!doctype html><html lang="ko"><meta charset="utf-8"><style>${css}</style><body style="--accent:${color};--anchor:${[47,61,52,51,20][index] || 50}% center">
    <div data-layer="base">${background}</div><div data-layer="head">${headlineLayer}</div><div data-layer="detail">${detailLayer}</div></body></html>`);
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(Array.from(document.images, image => image.decode()));
    const photo = document.querySelector('.image');
    if (!photo) return;
    const photoBox = photo.getBoundingClientRect();
    const heading = document.querySelector('.heading');
    const title = heading.querySelector('h1');
    while (heading.getBoundingClientRect().bottom > photoBox.top - 18 &&
           parseFloat(getComputedStyle(title).fontSize) > 34) {
      title.style.fontSize = `${parseFloat(getComputedStyle(title).fontSize) - 2}px`;
    }
    const caption = document.querySelector('.caption');
    if (heading.getBoundingClientRect().bottom > photoBox.top - 18 ||
        caption.getBoundingClientRect().top < photoBox.bottom + 18) {
      throw Error('Photo and typography overlap: ' + title.innerText);
    }
  });
  const base = path.join(stage, `${key}-${coat(index)}`);
  await page.screenshot({ path: path.join(output, `${key}-${coat(index)}.jpg`), type: 'jpeg', quality: 86 });
  for (const layer of ['base', 'head', 'detail']) {
    await page.evaluate((active) => {
      for (const element of document.querySelectorAll('[data-layer]')) element.hidden = element.dataset.layer !== active;
    }, layer);
    await page.screenshot({ path: `${base}-${layer}.png`, omitBackground: layer !== 'base' });
  }
  return base;
}

async function encodeScene(base, file) {
  const input = ['base', 'head', 'detail'].flatMap(layer => ['-loop','1','-framerate',String(fps),'-i',`${base}-${layer}.png`]);
  const filter = [
    '[0:v]format=yuv420p[base]',
    '[1:v]format=rgba,fade=in:st=0.12:d=0.38:alpha=1[head]',
    '[2:v]format=rgba,fade=in:st=0.65:d=0.45:alpha=1[detail]',
    "[base][head]overlay=0:'max(0,12-30*t)'[withhead]",
    "[withhead][detail]overlay=0:'max(0,15-30*max(t-0.62,0))'[video]"
  ].join(';');
  await run(ffmpeg, ['-hide_banner','-loglevel','error','-y','-filter_complex_threads','1',...input,
    '-filter_complex',filter,'-map','[video]','-frames:v',String(frameCount),'-c:v','libx264',
    '-threads','2','-preset','fast','-crf','21','-pix_fmt','yuv420p','-movflags','+faststart',file]);
}

async function main() {
  await fs.mkdir(output, { recursive: true });
  const stage = await fs.mkdtemp(path.join(os.tmpdir(), 'report-reels-'));
  const box = { window: {} };
  vm.runInNewContext(await fs.readFile('report-motion.js','utf8'),box);
  const source = await fs.readFile('report.html','utf8');
  const names = Object.fromEntries([...source.matchAll(/data-popup-key="([^"]+)" data-popup-title="([^"]+)"/g)]
    .map(([, key, name], ordinal) => [key, { name, ordinal }]));
  const sets = Object.entries(box.window.REPORT_MOTION);
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  let cursor = 0;
  try {
    async function worker() {
      const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
      try {
        while (cursor < sets.length) {
          const [key, scenes] = sets[cursor++];
          const segments = [];
          for (const [index, scene] of scenes.entries()) {
            const base = await draw(page, names[key], key, scene, index, scenes.length, stage);
            const clip = key === 'moca' ? path.join(output, `moca-${coat(index)}.mp4`) : `${base}.mp4`;
            await encodeScene(base, clip);
            segments.push(clip);
          }
          if (key !== 'moca') {
            const list = path.join(stage, `${key}.txt`);
            await fs.writeFile(list, segments.map(clip => `file '${clip.replaceAll('\\','/')}'`).join('\n') + '\n');
            await run(ffmpeg, ['-hide_banner','-loglevel','error','-y','-f','concat','-safe','0','-i',list,'-c','copy','-movflags','+faststart',path.join(output,`${key}.mp4`)]);
          }
          console.log(`Rendered ${key}: ${scenes.length} cards`);
        }
      } finally { await page.close(); }
    }
    await Promise.all(Array.from({length: 3}, worker));
  } finally {
    await browser.close();
    for (const entry of await fs.readdir(stage)) await fs.unlink(path.join(stage, entry));
    await fs.rmdir(stage);
  }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
