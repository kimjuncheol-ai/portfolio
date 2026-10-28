export const themeNames = { EX050100: '온천·스파', EX050200: '온천·스파', EX050300: '한방 체험', EX050400: '명상·쉼', EX050500: '온천·스파', EX050600: '웰니스', EX050700: '숲·자연' };
export function clean(value = '') { return String(value).replace(/<[^>]*>/g, ' ').replace(/&nbsp;|&#160;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim(); }
export function safeURL(value) { try { const u = new URL(value); return ['https:', 'http:'].includes(u.protocol) ? u.href.replace(/^http:/, 'https:') : ''; } catch { return ''; } }
export function district(address) { return String(address).match(/(?:부산(?:광역시)?\s+)?([가-힣]+(?:구|군))(?:\s|$)/)?.[1] || ''; }
function coord(value, min, max) { const n = Number(value); return value !== '' && value != null && Number.isFinite(n) && n >= min && n <= max ? n : null; }
export function normalizeWellness(i) {
  return { id: `w-${i.contentId}`, sourceId: String(i.contentId), kind: 'wellness', title: clean(i.title), district: district(i.baseAddr), address: clean(`${i.baseAddr || ''} ${i.detailAddr || ''}`), lat: coord(i.mapY, 33, 39), lng: coord(i.mapX, 124, 132), theme: themeNames[i.wellnessThemaCd] || '웰니스', image: safeURL(i.orgImage || i.thumbImage), copyright: clean(i.cpyrhtDivCd), description: clean(i.overview), tel: clean(i.tel), homepage: '', period: '', source: '한국관광공사 웰니스관광정보' };
}
export function normalizeFestival(i) {
  const homepage = String(i.HOMEPAGE_URL || '').match(/https?:\/\/[^\s<>"']+/)?.[0];
  return { id: `f-${i.UC_SEQ}`, sourceId: String(i.UC_SEQ), kind: 'festival', title: clean(i.MAIN_TITLE || i.TITLE), district: clean(i.GUGUN_NM) || district(i.ADDR1), address: clean(i.ADDR1), lat: coord(i.LAT, 33, 39), lng: coord(i.LNG, 124, 132), theme: '축제', image: safeURL(i.MAIN_IMG_NORMAL), description: clean(i.ITEMCNTNTS || i.SUBTITLE), tel: clean(i.CNTCT_TEL), homepage: safeURL(homepage), period: clean(i.USAGE_DAY_WEEK_AND_TIME || i.USAGE_DAY), price: clean(i.USAGE_AMOUNT), transport: clean(i.TRFC_INFO), accessibility: clean(i.MIDDLE_SIZE_RM1), source: '부산광역시 부산축제정보 서비스' };
}
export function distance(a, b) {
  if ([a.lat, a.lng, b.lat, b.lng].some(v => v == null || !Number.isFinite(v))) return null;
  const rad = n => n * Math.PI / 180;
  const h = Math.sin(rad(b.lat-a.lat)/2)**2 + Math.cos(rad(a.lat))*Math.cos(rad(b.lat))*Math.sin(rad(b.lng-a.lng)/2)**2;
  return Math.round(6371 * 2 * Math.asin(Math.min(1, Math.sqrt(h))) * 10) / 10;
}
export function recommend(wellness, festivals) {
  const pairs = [];
  for (const w of wellness) {
    const nearby = festivals.map(f => {
      const km = distance(w, f), same = Boolean(w.district && w.district === f.district);
      return { f, km, same, score: (same ? 20 : 0) + (km == null ? 0 : Math.max(0, 30-km)) };
    }).filter(p => p.km == null ? p.same : p.km <= 25).sort((a,b) => b.score-a.score).slice(0, 3);
    for (const p of nearby) pairs.push({ id: `${w.id}_${p.f.id}`, wellness: w, festival: p.f, km: p.km, score: Math.round(p.score * 10)/10, reason: p.same ? `${w.district} 안에서 쉼과 축제를 함께` : `직선거리 ${p.km}km의 가까운 두 장소`, district: w.district || p.f.district, title: `${w.title}에서 쉬고, ${p.f.title} 즐기기` });
  }
  return pairs.sort((a,b) => b.score-a.score);
}
