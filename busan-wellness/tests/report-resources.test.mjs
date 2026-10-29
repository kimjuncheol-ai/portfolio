import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isBusan, loadReportResources } from '../lib/report-resources.js';
import handler from '../api/report-resources.js';

const secret = 'TEST-DO-NOT-EXPOSE';
const titles = ['부산현대미술관', '부산시립미술관', '뮤지엄 원', '아르떼뮤지엄 부산', '부산 어린이대공원'];
function fakeFetch(seen) {
  return async url => {
    seen.push(new URL(url));
    const u = new URL(url), wellness = u.pathname.includes('WellnessTursmService');
    const keyword = u.searchParams.get('keyword');
    const title = wellness ? '허심청' : keyword ? titles.find(t => t.replace(/\s/g, '').includes(keyword.replace(/\s/g, ''))) : titles[Number(u.searchParams.get('contentId'))];
    const base = wellness ? { contentId: '127419', title, baseAddr: '부산광역시 동래구 온천장로 1', lDongRegnCd: '26' } : { contentid: String(titles.indexOf(title)), title, addr1: '부산광역시 해운대구 센텀서로 20', lDongRegnCd: '26', areacode: '' };
    const outside = { ...base, title: '뮤지엄 원', addr1: '서울특별시 중구 세종대로 1', lDongRegnCd: '11' };
    return { ok: true, json: async () => ({ response: { header: { resultCode: '0000' }, body: { items: { item: keyword ? [outside, base] : [{ ...base, overview: '<p>공식 소개입니다.</p>', mdfcnDt: '20261029120000' }] } } } }) };
  };
}
test('requires Busan region code AND address, supports current legal-dong code', () => {
  assert.equal(isBusan({ addr1: '부산광역시 영도구 해양로 1', lDongRegnCd: '26' }, 'kor'), true);
  assert.equal(isBusan({ addr1: '서울특별시 중구 1', lDongRegnCd: '26' }, 'kor'), false);
  assert.equal(isBusan({ addr1: '부산광역시 영도구 1', lDongRegnCd: '11', areacode: '6' }, 'kor'), false);
  assert.equal(isBusan({ baseAddr: '부산광역시 동래구 1', lDongRegnCd: '26' }, 'wellness'), true);
});
test('existing shared key loads six fixed Busan records without exposing credentials', async () => {
  const seen = [], result = await loadReportResources({ TOUR_API_KEY: secret }, fakeFetch(seen));
  assert.equal(result.mode, 'live');
  assert.equal(result.resources.length, 6);
  assert.ok(result.sources.every(s => s.status === 'live'));
  assert.ok(seen.filter(u => u.pathname.endsWith('searchKeyword2')).every(u => u.searchParams.get('lDongRegnCd') === '26'));
  assert.ok(!JSON.stringify(result).includes(secret));
  assert.ok(!JSON.stringify(result).includes('serviceKey'));
  assert.ok(result.resources.every(r => r.address.startsWith('부산광역시')));
});
test('missing, rejected or failed services never pretend to be live or leak upstream errors', async () => {
  const missing = await loadReportResources({}, () => { throw new Error('must-not-call'); });
  assert.equal(missing.mode, 'offline');
  assert.ok(missing.sources.every(s => s.status === 'pending'));
  const failed = await loadReportResources({ TOUR_API_KEY: secret }, async () => { throw new Error(`serviceKey=${secret}`); });
  assert.equal(failed.mode, 'offline');
  assert.ok(failed.sources.every(s => s.status === 'error'));
  assert.ok(!JSON.stringify(failed).includes(secret));
});
test('public read endpoint rejects unrelated origins and mutation methods', async () => {
  let status, body;
  const res = { setHeader() {}, status(n) { status = n; return this; }, json(x) { body = x; }, end() {} };
  await handler({ method: 'GET', headers: { origin: 'https://unrelated.example' } }, res);
  assert.equal(status, 403);
  await handler({ method: 'POST', headers: { origin: 'null' } }, res);
  assert.equal(status, 405);
  assert.equal(body.mode, 'offline');
  await handler({ method: 'OPTIONS', headers: { origin: 'https://kimjuncheol-ai.github.io' } }, res);
  assert.equal(status, 204);
});
