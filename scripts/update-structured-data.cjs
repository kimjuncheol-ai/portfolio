// Rebuild static JSON-LD from the actual HTML; never change visible markup.
// Optional: node scripts/update-structured-data.cjs path/to/verified-youtube-metadata.json
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..');
const base = 'https://kimjuncheol-ai.github.io/portfolio/';
const files = ['index.html', 'about.html', 'report.html', 'contents.html', 'sns.html', 'final.html', 'admin.html', 'projects/frame/index.html'];
const absolute = value => new URL(value, base).href;
const ref = id => ({ '@id': id });
const personId = base + '#person';
const siteId = base + '#website';
const artourId = base + 'sns.html#brand';
const metadata = process.argv[2] ? JSON.parse(fs.readFileSync(path.resolve(process.argv[2]), 'utf8')) : [];
const videoDates = new Map(metadata.map(v => [v.videoId, v.publishDate]));
const jsonScript = /\s*<script id="page-structured-data" type="application\/ld\+json">[\s\S]*?<\/script>/;

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage();
  await page.route('**/*', r => r.abort());
  const pages = {};
  for (const file of files) {
    const html = fs.readFileSync(path.join(root, file), 'utf8');
    const existing = html.match(/<script id="page-structured-data" type="application\/ld\+json">([\s\S]*?)<\/script>/);
    if (existing) for (const node of JSON.parse(existing[1])['@graph']) {
      if (node['@type'] === 'VideoObject' && node.uploadDate) videoDates.set(new URL(node.url).pathname.split('/').pop(), node.uploadDate);
    }
    await page.setContent(html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ''), { waitUntil: 'domcontentloaded' });
    pages[file] = await page.evaluate(() => {
      const text = e => (e?.textContent || '').replace(/\s+/g, ' ').trim();
      const attr = (e, name) => e?.getAttribute(name) || '';
      return {
        title: document.title,
        description: attr(document.querySelector('meta[name="description"]'), 'content'),
        intro: text(document.querySelector('.typing-copy')),
        portrait: attr(document.querySelector('.profile-output img'), 'src'),
        slogan: text(document.querySelector('.brand-story__slogan')),
        brandDescription: [...document.querySelectorAll('.brand-story > p')].slice(2).map(text).join(' '),
        logo: attr(document.querySelector('.brand-marks__master img'), 'src'),
        tours: [...document.querySelectorAll('[data-resource-key]')].map(e => ({ key: e.dataset.resourceKey, name: text(e.querySelector('h2')), description: text(e.querySelector('[data-api-intro]')), address: text(e.querySelector('[data-api-address]')), map: attr(e.querySelector('[data-api-address]'), 'href'), official: attr(e.querySelector('[data-official-url]'), 'data-official-url'), image: attr(e.querySelector('img'), 'src'), caption: attr(e.querySelector('img'), 'alt') })),
        projects: [...document.querySelectorAll('.project-entry')].map(e => ({ id: e.id, name: text(e.querySelector('h3')), description: text(e.querySelector('.project-entry__body > p:not(.project-entry__kind)')), image: attr(e.querySelector('img'), 'src'), kind: text(e.querySelector('.project-entry__kind')), link: attr(e.querySelector('.project-actions a'), 'href') })),
        clips: [...document.querySelectorAll('.practice-card')].map(e => ({ name: text(e.querySelector('header strong')), description: text(e.querySelector('footer > span')), src: attr(e.querySelector('video'), 'src'), poster: attr(e.querySelector('video'), 'poster') })),
        channels: [...document.querySelectorAll('.channel-card')].map(e => ({ name: text(e.querySelector('.channel-card__network')), url: attr(e, 'href'), description: text(e.querySelector('p')) })),
        shorts: [...document.querySelectorAll('.short-card')].map(e => ({ name: text(e.querySelector('h3')), url: attr(e.querySelector('.short-card__preview'), 'href'), image: attr(e.querySelector('img'), 'src'), date: attr(e.querySelector('time'), 'datetime'), seconds: Number(text(e.querySelector('.short-card__preview > span')).match(/\d+/)?.[0]), links: [...e.querySelectorAll('.project-actions a')].map(a => attr(a, 'href')) })),
        cards: [...document.querySelectorAll('.cardnews-series')].map(e => ({ id: e.id, name: text(e.querySelector('h3')), description: text(e.querySelector('.cardnews-series__head > div:last-child > p')), date: text(e.querySelector('.project-entry__kind')).match(/\d{4}-\d{2}-\d{2}/)?.[0], links: [...e.querySelectorAll('.project-actions a')].map(a => attr(a, 'href')), images: [...e.querySelectorAll('.cardnews-strip figure')].map(f => ({ src: attr(f.querySelector('a'), 'href'), caption: attr(f.querySelector('img'), 'alt') })) }))
      };
    });
  }
  const person = { '@type': 'Person', '@id': personId, name: '김준철', alternateName: 'kimjuncheol', url: base, image: absolute(pages['index.html'].portrait), description: pages['index.html'].intro };
  const website = { '@type': 'WebSite', '@id': siteId, url: base, name: 'kimjuncheol', inLanguage: 'ko-KR', creator: ref(personId) };
  for (const file of files) {
    const d = pages[file];
    const url = file === 'index.html' ? base : absolute(file);
    const pageId = url + '#webpage';
    const graph = [person, website];
    const entity = { '@type': 'WebPage', '@id': pageId, url, name: d.title, description: d.description, inLanguage: 'ko-KR', isPartOf: ref(siteId) };
    if (file !== 'admin.html') entity.author = ref(personId);
    graph.push(entity);
    const itemList = (id, name, items) => {
      const list = { '@type': 'ItemList', '@id': url + '#' + id, name, numberOfItems: items.length, itemListElement: items.map((item, i) => ({ '@type': 'ListItem', position: i + 1, item: ref(item['@id']) })) };
      graph.push(list, ...items);
      return ref(list['@id']);
    };
    if (file === 'index.html') {
      entity['@type'] = 'ProfilePage';
      entity.description = d.intro;
      entity.mainEntity = ref(personId);
    } else if (file === 'about.html') {
      const brandId = url + '#brand';
      entity['@type'] = 'AboutPage';
      entity.name = '딸깍상사 소개와 브랜드 가이드 | kimjuncheol';
      entity.description = d.brandDescription;
      entity.mainEntity = ref(brandId);
      graph.push({ '@type': 'Brand', '@id': brandId, name: '딸깍상사', url, description: d.brandDescription, slogan: d.slogan, logo: absolute(d.logo) });
    } else if (file === 'report.html') {
      entity['@type'] = 'CollectionPage';
      entity.name = '부산 예술·웰니스 관광 자원 6곳 | kimjuncheol';
      entity.description = '부산의 예술 공간과 온천·숲 관광 자원 6곳의 소개, 주소, 체험 정보를 모았습니다.';
      entity.mainEntity = itemList('tourism-resources', '부산 예술·웰니스 관광 자원', d.tours.map(t => ({ '@type': ['moca','bma','museum1','arte'].includes(t.key) ? ['TouristAttraction','Museum'] : 'TouristAttraction', '@id': url + '#resource-' + t.key, name: t.name, description: t.description, url: t.official, image: { '@type': 'ImageObject', contentUrl: absolute(t.image), caption: t.caption }, address: { '@type': 'PostalAddress', streetAddress: t.address, addressRegion: '부산광역시', addressCountry: 'KR' }, hasMap: t.map })));
    } else if (file === 'contents.html') {
      entity['@type'] = 'CollectionPage';
      entity.name = 'AI 프로젝트와 영상 제작 아카이브 | kimjuncheol';
      entity.description = '게임, 부산 예술지도, 아르투어부산 캠페인, 프리비즈 도구, 공공데이터 여행 서비스와 AI 제작 연습 영상 아카이브입니다.';
      entity.mainEntity = [itemList('projects', 'AI로 만들고 연결한 프로젝트', d.projects.map(p => ({ '@type': 'CreativeWork', '@id': url + '#' + p.id, name: p.name, description: p.description, image: absolute(p.image), url: url + '#' + p.id, creator: ref(personId), ...(p.link ? { sameAs: absolute(p.link) } : {}) })))];
      // Unknown publication dates are not replaced with file timestamps or invented dates.
      entity.mainEntity.push(itemList('video-practice', 'AI 영상 제작 연습', d.clips.map((v,i) => ({ '@type': 'CreativeWork', '@id': url + '#clip-' + (i + 1), name: v.name, description: v.description, genre: 'AI 영상 제작', url: absolute(v.src), image: absolute(v.poster), encodingFormat: 'video/mp4', creator: ref(personId) }))));
    } else if (file === 'sns.html') {
      entity['@type'] = 'CollectionPage';
      entity.name = '아르투어부산 SNS 채널과 콘텐츠 | kimjuncheol';
      entity.about = ref(artourId);
      graph.push({ '@type': 'Brand', '@id': artourId, name: '아르투어부산', alternateName: 'ARTOUR BUSAN', url, description: '부산의 예술과 여행을 카드뉴스, 숏폼과 블로그 기록으로 연결하는 콘텐츠 브랜드입니다.', sameAs: d.channels.map(c => c.url) });
      entity.mainEntity = [itemList('short-films', '씨걸이의 부산 숏폼', d.shorts.map(v => {
        const id = new URL(v.url).pathname.split('/').pop();
        const uploadDate = videoDates.get(id);
        return { '@type': uploadDate ? 'VideoObject' : 'CreativeWork', '@id': url + '#short-' + id, name: v.name, description: v.name + ' · 아르투어부산 AI 제작 캐릭터 영상', url: v.url, thumbnailUrl: absolute(v.image), inLanguage: 'ko-KR', creator: ref(personId), about: ref(artourId), ...(uploadDate ? { uploadDate, duration: 'PT' + v.seconds + 'S', embedUrl: 'https://www.youtube.com/embed/' + id } : { datePublished: v.date }), sameAs: v.links.filter(l => l !== v.url) };
      }))];
      entity.mainEntity.push(
        itemList('social-channels', '아르투어부산 5개 SNS 채널', d.channels.map((c,i) => ({ '@type': 'WebPage', '@id': url + '#channel-' + (i + 1), name: '아르투어부산 ' + c.name, description: c.description, url: c.url, about: ref(artourId) }))),
        itemList('card-news', '아르투어부산 카드뉴스', d.cards.map(c => ({ '@type': 'CreativeWork', '@id': url + '#' + c.id, name: c.name, description: c.description, datePublished: c.date, url: url + '#' + c.id, creator: ref(personId), about: ref(artourId), sameAs: c.links, hasPart: c.images.map(i => ({ '@type': 'ImageObject', contentUrl: absolute(i.src), caption: i.caption })) })))
      );
    } else if (file === 'projects/frame/index.html') {
      entity.mainEntity = ref(url + '#application');
      graph.push({ '@type': 'WebApplication', '@id': url + '#application', name: 'FRAME 프리비즈 스튜디오', url, description: d.description, applicationCategory: 'MultimediaApplication', operatingSystem: '웹 브라우저', browserRequirements: '최신 Chrome 또는 Edge, WebGL 및 하드웨어 가속', inLanguage: 'ko-KR', creator: ref(personId) });
    } else if (file === 'admin.html') {
      // Keep the existing noindex,nofollow policy; expose no admin identity or credentials.
      graph.splice(0, graph.length, { '@type': 'WebPage', '@id': pageId, url, name: d.title, description: '사이트 챗봇 관리자 로그인 페이지', inLanguage: 'ko-KR' });
    }
    const structured = { '@context': 'https://schema.org', '@graph': graph };
    let html = fs.readFileSync(path.join(root, file), 'utf8').replace(jsonScript, '');
    const canonical = `<link rel="canonical" href="${url}">`;
    if (!/<link\b[^>]*rel=["']canonical["']/i.test(html) && file !== 'admin.html') html = html.replace('</head>', `  ${canonical}\n</head>`);
    const serialized = JSON.stringify(structured, null, 2).replaceAll('<', '\\u003c');
    html = html.replace(/\s*<\/head>/, `\n  <script id="page-structured-data" type="application/ld+json">\n${serialized}\n  </script>\n</head>`);
    fs.writeFileSync(path.join(root, file), html);
    console.log(file, graph.length + ' entities');
  }
  await browser.close();
})().catch(error => { console.error(error); process.exit(1); });
