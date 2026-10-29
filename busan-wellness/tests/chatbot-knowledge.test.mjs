import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { lexicalScore } from '../../supabase/functions/_shared/faq-score.ts';
import { verifyServiceRole } from '../../supabase/functions/_shared/service-auth.ts';
const source = readFileSync(new URL('../../chatbot.js', import.meta.url), 'utf8');
const literal = source.slice(source.indexOf('const fallbackKnowledge = ') + 'const fallbackKnowledge = '.length, source.indexOf('\n  ];') + 4);
const knowledge = vm.runInNewContext('(' + literal + ')');
function answer(question) {
  return knowledge.map(e => ({e,score:lexicalScore(question,{keywords:e.terms})})).sort((a,b)=>b.score-a.score)[0];
}
test('new place names beat generic tourism/profile phrasing, with or without spaces', () => {
  assert.match(answer('아르떼뮤지엄은 어떤 곳인가요?').e.answer, /영도구/);
  assert.match(answer('뮤지엄원 소개해줘').e.answer, /센텀서로 20/);
  assert.match(answer('허심청 웰니스 체험 알려줘').e.answer, /온천장로107/);
  assert.match(answer('선정 관광 자원 몇 곳이야?').e.answer, /총 여섯 곳/);
});
test('API, pending-list and project answers keep the implemented boundaries clear', () => {
  assert.match(answer('어떤 API를 사용하나요?').e.answer, /국문 관광정보 서비스_GW/);
  assert.match(answer('추가 예정 목록 알려줘').e.answer, /아직 상세 카드와 API 연동이 완료된 목록은 아닙니다/);
  assert.match(answer('슬로웨이브 뭐야?').e.answer, /부산축제정보/);
  assert.match(answer('SNS 채널 어디야?').e.answer, /X → YouTube → Instagram → Facebook → 네이버 블로그/);
  assert.match(answer('픽셀 이미지도 자동 갱신돼?').e.answer, /유지됩니다/);
});
test('API live state and current ticket prices are not invented in fixed answers', () => {
  const api = answer('공공데이터 API 작동해?').e.answer;
  assert.match(api, /실시간 운영·예약 가능 여부를 보증하지 않습니다/);
  assert.ok(!api.includes('지금 정상 작동'));
  assert.ok(!knowledge.some(e => e.answer.includes('세 곳입니다')));
  assert.ok(knowledge.every(e => /^(report|contents|sns|about|index)\.html(?:#|$)/.test(e.source[0])));
});
test('forged service-role payload alone cannot authorize synchronization', async () => {
  const forged = 'e30.' + Buffer.from(JSON.stringify({role:'service_role'})).toString('base64url') + '.invalid';
  let checked = false;
  assert.equal(await verifyServiceRole(forged, 'https://project.example', 'server-only', async (_url, init) => { checked = true; assert.equal(init.method, 'HEAD'); return {ok:false}; }), false);
  assert.equal(checked, true);
  assert.equal(await verifyServiceRole('not-a-jwt', 'https://project.example', 'server-only', async () => { throw new Error(); }), false);
});
