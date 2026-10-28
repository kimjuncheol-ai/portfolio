import {test} from 'node:test';
import assert from 'node:assert/strict';
import {distance,recommend,normalizeWellness,normalizeFestival,safeURL} from '../lib/tourism.js';
import {loadProvider,providerURL} from '../lib/providers.js';
import handler from '../api/explore.js';
test('distance: actual Busan coordinates, missing coordinates and radius exclusion',()=>{
 const a={lat:35.16885,lng:129.12955,district:'해운대구',id:'a'};
 const b={lat:35.158497,lng:129.15985,district:'해운대구',id:'b'};
 assert.ok(distance(a,b)>2&&distance(a,b)<4);assert.equal(distance(a,a),0);assert.equal(distance(a,{lat:null,lng:null}),null);
 assert.equal(recommend([a],[{...b,lat:37,lng:127}]).length,0);
 assert.equal(recommend([{...a,lat:null}],[b]).length,1);
 assert.equal(recommend([{...a,lat:null}],[{...b,district:'기장군'}]).length,0);
});
test('recommendation ranks same district, limits three festivals per spot',()=>{
 const w={lat:35.16,lng:129.13,district:'해운대구',id:'a'};
 const f=Array.from({length:5},(_,n)=>({id:`f${n}`,title:'축제',lat:35.16+n/1000,lng:129.14,district:n===0?'수영구':'해운대구'}));
 const p=recommend([w],f);assert.equal(p.length,3);assert.equal(p[0].festival.district,'해운대구');assert.ok(p.every(i=>i.km<=25));
});
test('manual field names and unsafe links',()=>{
 const w=normalizeWellness({contentId:'702551',title:'센텀시티 스파랜드',baseAddr:'부산광역시 해운대구 센텀남대로 35',mapX:'129.13',mapY:'35.16',wellnessThemaCd:'EX050500'});
 assert.equal(w.district,'해운대구');assert.equal(w.theme,'온천·스파');assert.equal(w.sourceId,'702551');
 assert.equal(normalizeWellness({mapX:'',mapY:''}).lat,null);
 assert.equal(safeURL('javascript:alert(1)'),'');assert.equal(safeURL('//example.com'),'');
 assert.equal(normalizeFestival({UC_SEQ:1,MAIN_TITLE:'불꽃',USAGE_DAY_WEEK_AND_TIME:'매년 11월'}).period,'매년 11월');
 assert.equal(normalizeFestival({MAIN_TITLE:'센텀맥주축제(한,영,중간,중번,일)'}).title,'센텀맥주축제');
 assert.equal(normalizeFestival({MAIN_TITLE:'부산축제 (한, 영, 중간, 중번, 일)'}).title,'부산축제');
 assert.equal(normalizeFestival({MAIN_TITLE:'부산축제(특별행사)'}).title,'부산축제(특별행사)');
});
test('encoded key is decoded once, provider parameter names follow both guides',()=>{
 const u=providerURL('wellness','abc%2Bdef%3D');assert.equal(u.searchParams.get('serviceKey'),'abc+def=');assert.equal(u.searchParams.get('lDongRegnCd'),'26');assert.equal(u.searchParams.get('langDivCd'),'KOR');
 assert.equal(providerURL('festival','abc').searchParams.get('ServiceKey'),'abc');
});
test('pagination and single-item payloads',async()=>{
 let calls=0;const records=await loadProvider('festival','fake-test',async()=>{calls++;return {ok:true,json:async()=>({getFestivalKr:{header:{resultCode:'00'},item:{UC_SEQ:calls,MAIN_TITLE:'축제'},totalCount:2}})};});
 assert.equal(calls,2);assert.equal(records.length,2);
});
test('provider failures do not leak gateway URL or credential',async()=>{
 await assert.rejects(loadProvider('wellness','sensitive-test',async()=>({ok:true,json:async()=>({response:{header:{resultCode:'30',resultMsg:'sensitive-test'}}})})),{message:'UPSTREAM_REJECTED'});
});
test('missing keys return explicitly marked preview and POST is rejected',async()=>{
 const keys=[process.env.TOUR_API_KEY,process.env.BUSAN_FESTIVAL_API_KEY];delete process.env.TOUR_API_KEY;delete process.env.BUSAN_FESTIVAL_API_KEY;
 try{let body,status;const res={setHeader(){},status(n){status=n;return this;},json(x){body=x;}};await handler({method:'GET'},res);assert.equal(status,200);assert.equal(body.mode,'demo');assert.ok(body.pairs.length>0);assert.ok(!JSON.stringify(body).includes('serviceKey'));
 await handler({method:'POST'},res);assert.equal(status,405);
 }finally{for(const [i,k] of ['TOUR_API_KEY','BUSAN_FESTIVAL_API_KEY'].entries())if(keys[i])process.env[k]=keys[i];}
});
test('invalid credentials do not silently substitute demo data or expose keys',async()=>{
 const original=globalThis.fetch;process.env.TOUR_API_KEY='DO-NOT-EXPOSE-TOUR';process.env.BUSAN_FESTIVAL_API_KEY='DO-NOT-EXPOSE-FEST';
 globalThis.fetch=async()=>{throw new Error('https://secret.example?serviceKey=DO-NOT-EXPOSE-TOUR');};
 try{let body;await handler({method:'GET'},{setHeader(){},status(){return this;},json(x){body=x;}});assert.equal(body.mode,'error');assert.deepEqual(body.pairs,[]);assert.ok(!JSON.stringify(body).includes('DO-NOT-EXPOSE'));assert.ok(!JSON.stringify(body).includes('secret.example'));}
 finally{globalThis.fetch=original;delete process.env.TOUR_API_KEY;delete process.env.BUSAN_FESTIVAL_API_KEY;}
});
