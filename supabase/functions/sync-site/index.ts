import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders, json } from '../_shared/cors.ts'

const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const supabaseUrl = Deno.env.get('SUPABASE_URL')
const siteUrl = (Deno.env.get('SITE_URL') || '').replace(/\/$/, '')
const approvedPages = ['index.html', 'about.html', 'report.html', 'contents.html', 'sns.html', 'final.html']

const decodeHtml = (value: string) => value
  .replace(/&nbsp;/gi, ' ')
  .replace(/&amp;/gi, '&')
  .replace(/&lt;/gi, '<')
  .replace(/&gt;/gi, '>')
  .replace(/&quot;/gi, '"')
  .replace(/&#39;/gi, "'")
  .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
  .replace(/&#(\d+);/g, (_, number) => String.fromCodePoint(Number(number)))

const htmlToText = (html: string) => decodeHtml(html
  .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
  .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
  .replace(/<dialog\b[^>]*>[\s\S]*?<\/dialog>/gi, ' ')
  .replace(/<(br|\/p|\/div|\/section|\/article|\/li|\/h[1-6]|\/dt|\/dd)>/gi, '\n')
  .replace(/<[^>]+>/g, ' '))
  .split('\n')
  .map((line) => line.replace(/\s+/g, ' ').trim())
  .filter(Boolean)
  .filter((line) => !/^(about|report|contents|sns|final_project|kimjuncheol)$/.test(line))
  .join('\n')

const makeChunks = (text: string, limit = 1100) => {
  const paragraphs = text.split('\n').filter(Boolean)
  const chunks: string[] = []
  let current = ''
  for (const paragraph of paragraphs) {
    if (current && `${current}\n${paragraph}`.length > limit) {
      chunks.push(current)
      current = paragraph
    } else {
      current = current ? `${current}\n${paragraph}` : paragraph
    }
  }
  if (current) chunks.push(current)
  return chunks.filter((chunk) => chunk.length >= 20)
}

const sha256 = async (value: string) => {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405)
  if (!supabaseUrl || !serviceKey || !siteUrl) return json({ error: 'Sync server is not configured.' }, 503)

  try {
    const body = await request.json().catch(() => ({}))
    const token = request.headers.get('Authorization')?.replace(/^Bearer\s+/i, '')
    if (!token) return json({ error: 'Authentication required.' }, 401)
    const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })
    if (token !== serviceKey) {
      const { data: userData, error: userError } = await supabase.auth.getUser(token)
      if (userError || !userData.user) return json({ error: 'Invalid session.' }, 401)
      const { data: admin } = await supabase.from('site_admins').select('user_id').eq('user_id', userData.user.id).maybeSingle()
      if (!admin) return json({ error: 'Admin permission required.' }, 403)
    }

    const model = new Supabase.ai.Session('gte-small')
    const requestedPage = String(body.page || '')
    const pagesToSync = requestedPage === '__faq__' ? [] : approvedPages.includes(requestedPage) ? [requestedPage] : []
    if (!requestedPage || (!pagesToSync.length && requestedPage !== '__faq__')) return json({ error: 'An approved sync target is required.' }, 400)
    let chunkCount = 0
    for (const pagePath of pagesToSync) {
      const sourceUrl = `${siteUrl}/${pagePath}`
      const response = await fetch(sourceUrl, { headers: { 'User-Agent': 'kimjuncheol-site-indexer/1.0' } })
      if (!response.ok) throw new Error(`${pagePath}: HTTP ${response.status}`)
      const html = await response.text()
      const title = decodeHtml(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim() || pagePath)
      const chunks = makeChunks(htmlToText(html))
      const rows = []
      for (let index = 0; index < chunks.length; index += 1) {
        const content = chunks[index]
        const embedding = await model.run(content, { mean_pool: true, normalize: true })
        rows.push({
          page_path: pagePath,
          source_url: sourceUrl,
          page_title: title,
          section: `chunk ${index + 1}`,
          content,
          checksum: await sha256(content),
          embedding,
          active: true,
          updated_at: new Date().toISOString(),
        })
      }
      const { error: deleteError } = await supabase.from('site_documents').delete().eq('page_path', pagePath)
      if (deleteError) throw deleteError
      if (rows.length) {
        const { error: insertError } = await supabase.from('site_documents').insert(rows)
        if (insertError) throw insertError
      }
      chunkCount += rows.length
    }
    let faqCount = 0
    if (requestedPage === '__faq__') {
      const faqId = String(body.faqId || '')
      if (!/^[0-9a-f-]{30,40}$/i.test(faqId)) return json({ error: 'A valid FAQ id is required.' }, 400)
      const { data: faqs, error: faqError } = await supabase.from('site_faqs').select('id,question,answer,keywords').eq('active', true).eq('id', faqId)
      if (faqError) throw faqError
      for (const faq of faqs || []) {
        const input = `${faq.question}\n${(faq.keywords || []).join(' ')}\n${faq.answer}`
        const embedding = await model.run(input, { mean_pool: true, normalize: true })
        const { error: updateError } = await supabase.from('site_faqs').update({ embedding, updated_at: new Date().toISOString() }).eq('id', faq.id)
        if (updateError) throw updateError
      }
      faqCount = faqs?.length || 0
    }
    return json({ ok: true, pages: pagesToSync.length, chunks: chunkCount, faqs: faqCount })
  } catch (error) {
    console.error(error)
    return json({ error: error instanceof Error ? error.message : 'Sync failed.' }, 500)
  }
})
