// UI preview only. Never returned as live API data.
const w = (id,title,district,lat,lng,theme,image,address) => ({id:`w-${id}`,sourceId:id,kind:'wellness',title,district,lat,lng,theme,image,address,description:'여행 조합을 미리 살펴보기 위한 예시 장소입니다. 실제 운영 정보는 API 연결 후 확인해 주세요.',source:'미리보기 예시',tel:'',homepage:''});
const f = (id,title,district,lat,lng,period,address) => ({id:`f-${id}`,sourceId:id,kind:'festival',title,district,lat,lng,period,address,theme:'축제',image:'',description:'부산축제정보 가이드의 축제명을 바탕으로 구성한 미리보기입니다. 올해 개최 여부와 날짜는 주최 측 확인이 필요합니다.',source:'첨부 가이드 기반 예시',tel:'',homepage:'',price:'주최 측 확인'});
export const demoWellness = [
  w('702551','센텀시티 스파랜드','해운대구',35.16885,129.12955,'온천·스파','https://tong.visitkorea.or.kr/cms/resource/02/3544802_image2_1.JPEG','부산광역시 해운대구 센텀남대로 35'),
  w('preview-forest','부산 치유의 숲','기장군',35.297,129.151,'숲·자연','/assets/forest.jpg','부산광역시 기장군 철마면'),
  w('preview-dongnae','동래 온천','동래구',35.222,129.083,'온천·스파','','부산광역시 동래구 온천동'),
  w('preview-coast','해운대 해변 산책','해운대구',35.158,129.16,'명상·쉼','','부산광역시 해운대구 해운대해변로')
];
demoWellness[0].copyright = 'Type3';
demoWellness[3].image = '/assets/busan.jpg';
export const demoFestivals = [
  f('405','해운대모래축제','해운대구',35.158497,129.15985,'매년 5월 · 가이드 기준, 올해 일정 확인 필요','해운대해수욕장 일대'),
  f('395','부산불꽃축제','수영구',35.152725,129.11848,'매년 11월 · 가이드 기준, 올해 일정 확인 필요','부산광역시 수영구 광안해변로 219'),
  f('preview-dongnae','동래읍성역사축제','동래구',35.205,129.091,'개최 일정 확인 필요','부산광역시 동래구 동래읍성 일대'),
  f('preview-gijang','기장멸치축제','기장군',35.227,129.244,'개최 일정 확인 필요','부산광역시 기장군 기장읍 대변항')
];
