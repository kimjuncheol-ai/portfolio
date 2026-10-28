import { normalizeWellness, normalizeFestival } from './tourism.js';
let cache;
let pending;
export function decodeKey(key) { try { return decodeURIComponent(key.trim()); } catch { return key.trim(); } }
export function providerURL(kind, key, page = 1) {
  const u = new URL(kind === 'wellness' ? 'https://apis.data.go.kr/B551011/WellnessTursmService/areaBasedList' : 'https://apis.data.go.kr/6260000/FestivalService/getFestivalKr');
  u.searchParams.set(kind === 'wellness' ? 'serviceKey' : 'ServiceKey', decodeKey(key));
  for (const [k,v] of Object.entries({numOfRows:'100',pageNo:String(page), ...(kind === 'wellness' ? {MobileOS:'ETC',MobileApp:'BusanSlowwave',langDivCd:'KOR',lDongRegnCd:'26',arrange:'A',_type:'json'} : {resultType:'json'})})) u.searchParams.set(k,v);
  return u;
}
export async function loadProvider(kind, key, fetcher = fetch) {
  let result = [], total = 0;
  for (let page=1; page<=10; page++) {
    const r = await fetcher(providerURL(kind,key,page), {signal:AbortSignal.timeout(12000)});
    if (!r.ok) throw new Error('UPSTREAM_UNAVAILABLE');
    let data; try { data = await r.json(); } catch { throw new Error('UPSTREAM_INVALID_RESPONSE'); }
    const root = kind === 'wellness' ? data.response : data.getFestivalKr || data.response;
    const code = root?.header?.resultCode ?? root?.resultCode;
    if (!root || (code != null && !['00','0000','0'].includes(String(code)))) throw new Error('UPSTREAM_REJECTED');
    const body = root.body || root;
    const raw = kind === 'wellness' ? body.items?.item : body.item || body.items?.item;
    const rows = raw ? Array.isArray(raw) ? raw : [raw] : [];
    result.push(...rows);
    total = Number(body.totalCount || rows.length);
    if (result.length >= total || !rows.length) break;
  }
  if (result.length < total) throw new Error('UPSTREAM_PAGE_LIMIT');
  return result.filter(i => kind !== 'wellness' || String(i.lDongRegnCd) === '26' || String(i.baseAddr).startsWith('부산')).map(kind === 'wellness' ? normalizeWellness : normalizeFestival);
}
export async function loadLive(keys) {
  if (cache && cache.expires > Date.now() && cache.keys.every((k,i) => k === keys[i])) return cache.value;
  if (pending && pending.keys.every((k,i) => k === keys[i])) return pending.promise;
  const promise = Promise.allSettled([loadProvider('wellness',keys[0]),loadProvider('festival',keys[1])]).then(results => {
    const sources = results.map((r,i) => ({name:i ? '부산축제정보' : '웰니스관광정보',status:r.status === 'fulfilled' ? 'live' : 'error',message:r.status === 'fulfilled' ? '' : '제공기관 응답을 확인하지 못했습니다. 키 승인 상태·호출 한도·서비스 상태를 확인해 주세요.'}));
    const value = {wellness:results[0].status === 'fulfilled' ? results[0].value : [],festivals:results[1].status === 'fulfilled' ? results[1].value : [],sources};
    if(results.every(r => r.status === 'fulfilled')) cache = {value,keys:[...keys],expires:Date.now()+30*60*1000};
    return value;
  }).finally(()=>{pending=undefined;});
  pending={keys:[...keys],promise};
  return promise;
}
