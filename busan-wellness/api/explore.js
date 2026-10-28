import { demoWellness, demoFestivals } from '../lib/demo.js';
import { recommend } from '../lib/tourism.js';
import { loadLive } from '../lib/providers.js';
export default async function handler(req,res) {
  res.setHeader('Cache-Control','no-store');
  if(req.method !== 'GET') { res.setHeader('Allow','GET'); return res.status(405).json({message:'허용되지 않은 요청입니다.'}); }
  const keys = [process.env.TOUR_API_KEY,process.env.BUSAN_FESTIVAL_API_KEY];
  if(keys.some(k => !k?.trim())) return res.status(200).json({mode:'demo',message:'미리보기 · 예시 조합입니다. API 연결 후 실제 공공데이터로 전환됩니다.',wellness:demoWellness,festivals:demoFestivals,pairs:recommend(demoWellness,demoFestivals),sources:[]});
  try {
    const data = await loadLive(keys);
    const failed = data.sources.some(s=>s.status==='error');
    return res.status(200).json({...data,mode:failed?'error':'live',message:failed?'일부 공공데이터를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.':'공공데이터 연결됨 · 축제 일정은 주최 측 최종 확인이 필요합니다.',updatedAt:new Date().toISOString(),pairs:recommend(data.wellness,data.festivals)});
  } catch { return res.status(502).json({mode:'error',message:'공공데이터 연결에 실패했습니다. 잠시 후 다시 시도해 주세요.',pairs:[],wellness:[],festivals:[],sources:[]}); }
}
