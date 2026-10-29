import { clean, safeURL } from './tourism.js';
import { decodeKey } from './providers.js';

export const reportSources = [
  { id: 'kor', name: '한국관광공사 국문 관광정보', url: 'https://www.data.go.kr/data/15101578/openapi.do' },
  { id: 'wellness', name: '한국관광공사 웰니스관광정보', url: 'https://www.data.go.kr/data/15144030/openapi.do' }
];
const selections = [
  { key: 'moca', source: 'kor', keyword: '부산현대미술관', match: /^부산현대미술관$/ },
  { key: 'bma', source: 'kor', keyword: '부산시립미술관', match: /^부산시립미술관$/ },
  { key: 'museum1', source: 'kor', keyword: '뮤지엄', match: /뮤지엄\s*원|뮤지엄\s*1|museum\s*1/i },
  { key: 'arte', source: 'kor', keyword: '아르떼뮤지엄', match: /아르떼뮤지엄.*부산/ },
  { key: 'hurshim', source: 'wellness', id: '127419' },
  { key: 'forest', source: 'kor', keyword: '어린이대공원', match: /어린이대공원/ }
];
const websites = { moca: 'https://www.busan.go.kr/moca/index', bma: 'https://art.busan.go.kr/index.nm', forest: 'https://www.bisco.or.kr/bschildpark/', museum1: 'https://www.museum1.co.kr/', arte: 'https://kr.artemuseum.com/BUSAN', hurshim: 'https://www.hotelnongshim.com/kr/' };

// Both a regional code and a Busan address are required before data leaves the server.
export function isBusan(item, source) {
  return /^부산(?:광역시)?\s/.test(clean(item.addr1 || item.baseAddr)) &&
    (String(item.lDongRegnCd) === '26' || (source === 'kor' && !item.lDongRegnCd && String(item.areacode) === '6'));
}
async function request(source, operation, params, key, fetcher) {
  const u = new URL(`https://apis.data.go.kr/B551011/${source === 'kor' ? 'KorService2' : 'WellnessTursmService'}/${operation}`);
  u.search = new URLSearchParams({ serviceKey: decodeKey(key), MobileOS: 'ETC', MobileApp: 'ArtourBusanPortfolio', _type: 'json', numOfRows: '100', pageNo: '1', ...params });
  let data;
  try {
    const r = await fetcher(u, { signal: AbortSignal.timeout(10000) });
    if (!r.ok) throw new Error();
    data = await r.json();
  } catch { throw new Error('unavailable'); }
  const root = data?.response;
  if (!['00', '0000'].includes(String(root?.header?.resultCode))) throw new Error('rejected');
  const raw = root.body?.items?.item;
  return raw ? (Array.isArray(raw) ? raw : [raw]) : [];
}
async function loadSelection(selection, key, fetcher) {
  const source = selection.source;
  let item;
  if (source === 'kor') {
    const rows = await request(source, 'searchKeyword2', { lDongRegnCd: '26', keyword: selection.keyword }, key, fetcher);
    const found = rows.find(row => isBusan(row, source) && selection.match.test(row.title || ''));
    if (!found?.contentid) throw new Error('not-found');
    const details = await request(source, 'detailCommon2', { contentId: String(found.contentid) }, key, fetcher);
    item = { ...found, ...details[0] };
  } else {
    [item] = await request(source, 'detailCommon', { langDivCd: 'KOR', contentId: selection.id }, key, fetcher);
  }
  if (!item || !isBusan(item, source)) throw new Error('outside-busan');
  return {
    key: selection.key, source, title: clean(item.title),
    address: clean([item.addr1 || item.baseAddr, item.addr2 || item.detailAddr].filter(Boolean).join(' ')),
    description: clean(item.overview), image: safeURL(item.firstimage || item.firstimage2),
    copyright: clean(item.cpyrhtDivCd), modifiedAt: clean(item.modifiedtime || item.mdfcnDt),
    contentId: String(item.contentid || item.contentId), officialUrl: websites[selection.key]
  };
}
export async function loadReportResources(env = process.env, fetcher = fetch) {
  const keys = { kor: env.KTO_KOR_API_KEY || env.TOUR_API_KEY, wellness: env.TOUR_API_KEY };
  const checkedAt = new Date().toISOString();
  const results = await Promise.allSettled(selections.map(s => keys[s.source]?.trim() ? loadSelection(s, keys[s.source], fetcher) : Promise.reject(new Error('pending'))));
  const resources = results.flatMap(r => r.status === 'fulfilled' ? [r.value] : []);
  const sources = reportSources.map(source => {
    const selected = results.filter((_, index) => selections[index].source === source.id);
    const status = !keys[source.id]?.trim() ? 'pending' : selected.every(r => r.status === 'fulfilled') ? 'live' : 'error';
    return { ...source, status, checkedAt };
  });
  return { mode: sources.every(s => s.status === 'live') ? 'live' : resources.length ? 'partial' : 'offline', region: '부산광역시', checkedAt, resources, sources };
}
