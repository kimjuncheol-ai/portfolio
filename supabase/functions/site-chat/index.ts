import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders, json } from '../_shared/cors.ts'

type Match = { page_path: string; source_url: string; page_title: string; content: string; similarity: number }
type Faq = { question: string; answer: string; keywords?: string[]; source_paths: string[]; similarity?: number }

const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const supabaseUrl = Deno.env.get('SUPABASE_URL')
const siteUrl = (Deno.env.get('SITE_URL') || '').replace(/\/$/, '')
const sourceFromPath = (path: string) => ({ url: `${siteUrl}/${path}`, title: path.replace('.html', '') || 'home' })
const normalize = (value: string) => value.toLowerCase().replace(/[^0-9a-z가-힣]+/g, ' ').trim()

const lexicalScore = (question: string, faq: Faq) => {
  const target = normalize(question)
  const terms = [faq.question, ...(faq.keywords || [])].flatMap((value) => normalize(value).split(' ')).filter((term) => term.length >= 2)
  return new Set(terms.filter((term) => target.includes(term))).size
}

const makeExtractiveAnswer = (question: string, matches: Match[]) => {
  const terms = normalize(question).split(' ').filter((term) => term.length >= 2)
  const candidates = matches.flatMap((match) => match.content.replace(/\n+/g, '. ').split(/(?<=[.!?。])\s+/)
    .map((sentence) => sentence.trim()).filter((sentence) => sentence.length >= 20 && sentence.length <= 260)
    .map((sentence) => ({ sentence, score: terms.reduce((score, term) => score + (normalize(sentence).includes(term) ? 1 : 0), 0) + (match.similarity || 0) })))
    .sort((a, b) => b.score - a.score)
  const selected: string[] = []
  for (const candidate of candidates) {
    if (!selected.includes(candidate.sentence)) selected.push(candidate.sentence)
    if (selected.length === 2) break
  }
  return selected.length ? `사이트에서 다음 내용을 확인했습니다. ${selected.join(' ')}` : '이 사이트에서 확인되지 않는 내용입니다.'
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405)
  if (!supabaseUrl || !serviceKey || !siteUrl) return json({ error: 'RAG server is not configured.' }, 503)
  try {
    const body = await request.json()
    const message = String(body.message || '').trim().slice(0, 500)
    const page = String(body.page || '').slice(0, 80)
    const sessionId = String(body.sessionId || '')
    if (!/^[0-9a-f-]{30,40}$/i.test(sessionId)) return json({ error: 'Invalid session.' }, 400)

    const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })
    if (body.action === 'withdraw') {
      await supabase.from('site_chat_sessions').delete().eq('id', sessionId)
      return json({ ok: true })
    }
    if (body.consent !== true || body.consentVersion !== 'v1') return json({ error: '정보 수집 동의가 필요합니다.' }, 403)
    if (!message) return json({ error: '질문을 입력해 주세요.' }, 400)

    await supabase.from('site_chat_sessions').delete().lt('last_seen_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
    const model = new Supabase.ai.Session('gte-small')
    const embedding = await model.run(message, { mean_pool: true, normalize: true })
    const [{ data: semanticFaqs }, { data: lexicalFaqs }, { data: documents, error: documentError }] = await Promise.all([
      supabase.rpc('match_site_faqs', { query_embedding: embedding, match_threshold: 0.72, match_count: 3 }),
      supabase.from('site_faqs').select('question,answer,keywords,source_paths').eq('active', true),
      supabase.rpc('match_site_documents', { query_embedding: embedding, match_threshold: 0.46, match_count: 6 }),
    ])
    if (documentError) throw documentError
    const semantic = (semanticFaqs || []) as Faq[]
    const lexical = ((lexicalFaqs || []) as Faq[]).map((faq) => ({ faq, score: lexicalScore(message, faq) })).sort((a, b) => b.score - a.score)
    const chosenFaq = lexical[0]?.score > 0 ? lexical[0].faq : null
    const matches = (documents || []) as Match[]
    const questionTerms = normalize(message).split(' ').filter((term) => term.length >= 2)
    const hasDocumentKeyword = matches.some((match) => questionTerms.some((term) => normalize(match.content).includes(term)))

    let answer: string
    let sources: { url: string; title: string }[]
    if (/^(안녕|안녕하세요|hello|hi|반가워)/i.test(message)) {
      answer = '안녕하세요. 김준철의 포트폴리오 안내 AI입니다. 김준철 소개, 선정 관광 자원, 체험 프로그램, 딸깍상사에 관해 물어보세요.'
      sources = []
    } else if (chosenFaq) {
      answer = chosenFaq.answer
      sources = [...new Set(chosenFaq.source_paths || [])].map(sourceFromPath)
    } else if (matches.length && hasDocumentKeyword) {
      answer = makeExtractiveAnswer(message, matches)
      sources = [...new Map(matches.map((match) => [match.page_path, { url: match.source_url, title: match.page_title }])).values()].slice(0, 4)
    } else {
      answer = '이 사이트에서 확인되지 않는 내용입니다. 김준철 소개, 선정 관광 자원, 체험 프로그램, 딸깍상사에 관해 질문해 주세요.'
      sources = []
    }
    await supabase.from('site_chat_sessions').upsert({ id: sessionId, entry_page: page, last_seen_at: new Date().toISOString(), consent_version: 'v1', consent_at: new Date().toISOString() }, { onConflict: 'id' })
    await supabase.from('site_chat_messages').insert([{ session_id: sessionId, role: 'user', content: message }, { session_id: sessionId, role: 'assistant', content: answer, sources }])
    return json({ answer, sources, mode: chosenFaq ? 'scenario' : matches.length && hasDocumentKeyword ? 'extractive' : 'guardrail' })
  } catch (error) {
    console.error(error)
    return json({ error: '사이트 자료를 검색하는 중 오류가 발생했습니다.' }, 500)
  }
})
