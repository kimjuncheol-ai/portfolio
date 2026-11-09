// Keep the browser's offline answers and the Supabase FAQ migration in sync.
const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const filename='chatbot.js';
let js=fs.readFileSync(filename,'utf8');
const pattern=/const fallbackKnowledge = (\[[\s\S]*?\n  \]);/;
const matched=js.match(pattern);assert(matched,'Offline knowledge not found');
let catalog=vm.runInNewContext('('+matched[1]+')');
if(!catalog.every(e=>e.slug)){
 const seed=fs.readFileSync('supabase/migrations/202610290001_report_resources_knowledge.sql','utf8');
 const legacy=[...seed.matchAll(/^\('([^']+)','((?:''|[^'])*)','(?:''|[^'])*',array\['((?:''|[^'])*)'/gm)].map(m=>({slug:m[1],question:m[2].replaceAll("''","'"),firstTerm:m[3]}));
 catalog=catalog.map(entry=>{
   const old=legacy.find(e=>e.firstTerm===entry.terms[0]) || (entry.terms[0]==='카드뉴스'?{slug:'artour-cardnews',question:'아르투어부산 카드뉴스는 어디서 볼 수 있나요?'}:null);
   assert(old,'Unmapped scenario: '+entry.terms[0]);
   return {slug:old.slug,question:old.question,...entry};
 });
}
catalog=catalog.filter(e=>e.slug!=='sns');
const replace=(slug,fields)=>{
 const index=catalog.findIndex(e=>e.slug===slug);
 if(index<0)catalog.push({slug,...fields});else Object.assign(catalog[index],fields);
};
replace('contents',{answer:'Contents에는 프로젝트 5개와 로컬 제작 영상 16편이 있습니다. AI 영상 제작 연습 8편, AI 아이돌 3편, 엘라·부산 퍼포먼스·씨걸이 야외 스케치 3편, 액션 프리비즈 2편을 모았습니다. 뿌 초기 디자인과 부산 홍보 포스터도 볼 수 있습니다. 아르투어부산 프로젝트의 숏폼 19편 링크는 SNS의 전체 영상 모음으로 연결됩니다.'});
replace('ella',{terms:['엘라','브이로그','부산 배경 퍼포먼스','스토리 필름','야외 스케치'],answer:'Contents의 스토리 필름에는 약 56초의 엘라의 부산 당일치기, 부산 배경 퍼포먼스, 씨걸이의 야외 스케치가 있습니다. 원본 화면비로 보고 크게 보기 버튼으로 소리와 함께 감상할 수 있습니다. 씨걸이의 전체 숏폼 19편과 최신작 THE BERET는 SNS의 숏폼 모음에 있습니다.',source:['contents.html#story-films','스토리 필름']});
replace('bma',{answer:'부산시립미술관은 부산 미술과 국내외 현대미술, 이우환의 작품 세계를 소개하는 공립미술관입니다. Report의 [2] 카드에서 소개와 주소, 상세 팝업을 볼 수 있습니다. 최신 전시·운영 일정은 연결된 공식 홈페이지에서 확인해 주세요.'});
catalog.find(e=>e.slug==='contents').terms=[...new Set([...catalog.find(e=>e.slug==='contents').terms,'프로젝트','작업 모음','로컬 영상'])];
const planned=catalog.find(e=>e.slug==='report-upcoming');
if(planned)planned.terms=planned.terms.filter(t=>!['f1963','도모헌'].includes(t));
replace('social',{answer:'아르투어부산은 부산의 예술과 여행을 연결하는 로컬 콘텐츠 채널입니다. X → YouTube → Instagram → Facebook → 네이버 블로그 순서로 다섯 채널을 안내합니다. SNS 페이지에는 씨걸이 숏폼 19편, 도모헌·F1963 카드뉴스 두 편, 캐릭터 기본형·실사형과 초기 구상이 있습니다. 각 작품에서 확인된 원문으로 이동할 수 있습니다.'});
catalog.find(e=>e.slug==='artour-cardnews').terms=['카드뉴스','카드 뉴스','release.log'];
replace('artour-shorts',{question:'최신 씨걸이 숏폼과 전체 영상은 어디서 볼 수 있나요?',terms:['최신 씨걸이','씨걸이 영상','씨걸이 숏폼','최신 숏폼','최신 영상','숏폼','shorts','숏폼 몇','영상은 몇','영상 몇 편','19편','아르투어부산 최신'],answer:'SNS 페이지의 씨걸이 숏폼 모음에는 총 19편이 있습니다. 2026년 11월 6일 공개된 17편을 추가했으며 최신작은 30초 액션 예고편 《THE BERET》입니다. 부산 예술여행 하루 코스, 그림 속 여행, 영화의전당 런웨이, 도모헌 정원 등도 볼 수 있습니다. 좌우로 넘겨 작품을 고른 뒤 YouTube 등 각 채널에서 전체 영상을 감상하세요.',source:['sns.html#artour-shorts','씨걸이 숏폼 19편']});
replace('artour-domoheon',{question:'도모헌 카드뉴스는 어떤 내용인가요?',terms:['도모헌','도모헌 카드뉴스','카페 모모스','소소풍라운지','소소풍 정원'],answer:'도모헌 카드뉴스는 2026년 11월 3일 공개한 8장 시리즈입니다. 옛 부산시장 관사에서 시민 문화공간으로 바뀐 도모헌을 카페 모모스, 소소풍라운지, 소소풍 정원과 함께 소개합니다. 방문 안내와 저장·공유 카드까지 좌우로 넘겨 보고, 각 카드를 누르면 원본을 볼 수 있습니다.',source:['sns.html#cardnews-domoheon','도모헌 카드뉴스']});
replace('artour-f1963',{question:'F1963 카드뉴스는 어떤 내용인가요?',terms:['f1963','f1963 카드뉴스','테라로사','대나무 소리길'],answer:'F1963 카드뉴스는 2026년 10월 22일 공개한 8장 시리즈입니다. 테라로사 수영점에서 시작해 옛 와이어 공장의 건축, 전시, 예술도서관, 대나무 소리길로 이어지는 산책을 소개합니다. SNS에서 좌우로 넘기거나 카드 원본과 연결된 게시물을 볼 수 있습니다.',source:['sns.html#cardnews-f1963','F1963 카드뉴스']});
replace('media-navigation',{question:'영상과 카드뉴스는 어떻게 넘기고 크게 보나요?',terms:['슬라이드','좌우로','넘겨 보기','넘기는','스와이프','크게 보기','크게 보','영상 재생','영상 비율','영상 소리'],answer:'비슷한 영상·카드뉴스·이미지는 한 줄로 모았습니다. PC에서는 좌우 화살표나 가로 스크롤, 모바일에서는 스와이프로 넘길 수 있습니다. 목록에 키보드 초점을 둔 뒤 좌우 방향키도 사용할 수 있습니다. Contents의 영상은 원본 비율을 유지하고 크게 보기에서 소리를 켤 수 있으며, SNS 숏폼은 연결된 채널에서 전체 영상을 재생합니다.',source:['contents.html#ai-practice','영상 모음 사용 방법']});
replace('final-project',{question:'final_project 페이지에는 어떤 내용이 있나요?',terms:['final','final_project','최종 프로젝트','완성 프로젝트'],answer:'현재 final_project 페이지에는 제목만 마련되어 있습니다. 공개된 프로젝트 5개와 영상 제작 작업은 Contents 페이지에서 볼 수 있습니다.',source:['final.html','final_project']});
const sns=fs.readFileSync('sns.html','utf8');
const graph=JSON.parse(sns.match(/<script id="page-structured-data" type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'];
const films=graph.filter(n=>n['@type']==='VideoObject');assert.equal(films.length,19);
const specific=['the beret|베레모|작전명|액션 예고편','부산 예술여행 하루 코스|하루 코스','그림 속으로|그림 속 여행','런웨이|영화의전당 런웨이','야생의 씨걸이|다큐 패러디','부산 스냅|사진미술관 영상','지하철 문|지하철 씨걸이','비둘기|벽화 배틀','자갈치|새벽 경매','fpv|예술지도를 날아','어린 시절|처음 붓','도모헌 정원에서','작품인 척|미술관 작품인','와이어 공장에서 커피','캔버스를 놓친','새우깡|붓을 훔친','노을 앞에서|춤추기 시작한','바다를 그리던|야외 스케치 영상','부산 여행하던 갈매기'];
films.forEach((film,i)=>{
 const videoId=new URL(film.url).pathname.split('/').pop();
 const date=new Date(film.uploadDate).toLocaleDateString('ko-KR',{timeZone:'Asia/Seoul',year:'numeric',month:'long',day:'numeric'});
 const seconds=Number(film.duration.match(/\d+/)[0]);
 const premise=i===0?' 부산의 모든 예술이 사라진 상황에서 레이저 경보를 피해 명화를 되찾는 씨걸이의 액션 예고편입니다.':'';
 replace('artour-short-'+videoId,{question:`《${film.name}》 영상은 어떤 내용인가요?`,terms:[film.name,...specific[i].split('|')],answer:`《${film.name}》는 ${date} 공개한 아르투어부산의 ${seconds}초 AI 캐릭터 영상입니다.${premise} SNS의 숏폼 모음에서 해당 작품을 찾아 YouTube 등 연결된 채널로 전체 영상을 볼 수 있습니다.`,source:['sns.html#artour-shorts',film.name]});
});
js=js.replace(pattern,'const fallbackKnowledge = '+JSON.stringify(catalog,null,2).replaceAll('<','\\u003c').replace(/\n/g,'\n  ')+';');
js=js.replace(/const suggestionsList = pageName === 'report.html'[\s\S]*?;\n  suggestionsList/,`const suggestionsByPage = {
    'report.html': ['선정 관광 자원 여섯 곳 알려줘', '아르떼뮤지엄은 어떤 곳인가요?', '어떤 API를 사용하나요?'],
    'contents.html': ['어떤 프로젝트가 있나요?', '영상은 어떻게 크게 보나요?', '최신 씨걸이 영상은?'],
    'sns.html': ['최신 씨걸이 영상은?', '카드뉴스는 어디서 보나요?', 'SNS 채널을 알려줘']
  };
  const suggestionsList = suggestionsByPage[pageName] || ['김준철은 어떤 사람인가요?', '선정 관광 자원 알려줘', '딸깍상사는 뭐예요?'];
  suggestionsList`);
js=js.replace('현재 사이트에서 확인할 수 없는 내용입니다. 김준철 소개, 선정 관광 자원, 딸깍상사에 관해 질문해 주세요.','현재 사이트에서 확인할 수 없는 내용입니다. 김준철 소개, 부산 관광 자원, AI 제작 작업이나 아르투어부산 콘텐츠에 관해 질문해 주세요.');
js=js.replaceAll('안녕하세요. 김준철의 포트폴리오 안내 AI입니다. 이 사이트에 있는 내용만 바탕으로 답합니다. 무엇이 궁금하신가요?','안녕하세요. 김준철의 포트폴리오 안내 AI입니다. 이 사이트의 부산 관광·AI 제작 작업·아르투어부산 콘텐츠를 안내합니다. 무엇이 궁금하신가요?');
js=js.replace('(현재 RAG 서버 연결이 원활하지 않아 사이트 기본 자료로 답했습니다.)','(자료 검색 연결이 원활하지 않아 저장된 사이트 자료로 안내합니다.)');
fs.writeFileSync(filename,js);
const quote=s=>"'"+s.replaceAll("'","''")+"'";
const sqlArray=a=>'array['+a.map(quote).join(',')+']';
const rows=catalog.map(e=>'('+[quote(e.slug),quote(e.question),quote(e.answer),sqlArray(e.terms),sqlArray([e.source[0]]),'null','true','now()'].join(',')+')');
const sql='-- Site-only knowledge, synchronized with chatbot.js. No credentials.\nbegin;\ninsert into public.site_faqs (slug,question,answer,keywords,source_paths,embedding,active,updated_at) values\n'+rows.join(',\n')+'\non conflict (slug) do update set question=excluded.question,answer=excluded.answer,keywords=excluded.keywords,source_paths=excluded.source_paths,embedding=null,updated_at=now();\ncommit;\n';
fs.writeFileSync('supabase/migrations/202611090001_refresh_artour_chatbot.sql',sql);
for(const page of ['index.html','about.html','report.html','contents.html','sns.html','final.html']){
 const original=fs.readFileSync(page,'utf8');
 const revised=original.replace(/src="chatbot\.js(?:\?[^"]*)?"/,'src="chatbot.js?v=20261109-knowledge"');
 if(original!==revised)fs.writeFileSync(page,revised);
}
console.log(JSON.stringify({scenarios:catalog.length,films:films.length}));
