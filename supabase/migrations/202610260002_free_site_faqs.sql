create table if not exists public.site_faqs (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  question text not null,
  answer text not null,
  keywords text[] not null default '{}',
  source_paths text[] not null default '{}',
  embedding extensions.vector(384),
  active boolean not null default true,
  updated_at timestamptz not null default now()
);

alter table public.site_faqs enable row level security;
revoke all on public.site_faqs from anon;
grant select, update on public.site_faqs to authenticated;
grant all on public.site_faqs to service_role;

create policy "admins read site faqs" on public.site_faqs for select to authenticated using ((select public.is_site_admin()));
create policy "admins update site faqs" on public.site_faqs for update to authenticated using ((select public.is_site_admin())) with check ((select public.is_site_admin()));

insert into public.site_faqs (slug, question, answer, keywords, source_paths) values
('profile', '김준철은 어떤 사람인가요?', '김준철은 대학에서 신학을, 대학원에서 종교철학을 공부했습니다. 대한성공회 부산교구 성직청원자이며 AI를 활용한 로컬 관광 콘텐츠·서비스 제작 역량을 기르고 있습니다.', array['김준철','소개','누구','전공','신학','종교철학','성공회'], array['index.html']),
('site-purpose', '이 사이트는 왜 만들었나요?', '이 웹사이트는 K-뉴딜 아카데미 SKplanet AI 활용 로컬관광콘텐츠·서비스 과정을 위해 만든 김준철의 포트폴리오입니다.', array['사이트','목적','포트폴리오','과정','SKplanet'], array['index.html']),
('tour-resources', '선정 관광 자원을 알려주세요.', '선정 관광 자원은 부산현대미술관, 부산시립미술관, 부산어린이대공원 치유의 숲 세 곳입니다. 문화·예술 두 곳과 자연·웰니스 한 곳으로 구성했습니다.', array['관광','관광지','자원','추천','세 곳'], array['report.html']),
('moca', '부산현대미술관은 어떤 곳인가요?', '부산현대미술관은 을숙도의 생태환경과 동시대 예술이 맞닿는 서부산의 공립미술관입니다. 현대미술 전시, 어린이예술도서관, 을숙도 생태 탐방을 함께 경험할 수 있습니다.', array['부산현대미술관','현대미술관','모카','MOCA','을숙도','어린이예술도서관'], array['report.html']),
('bma', '부산시립미술관은 어떤 곳인가요?', '부산시립미술관은 부산 미술의 흐름과 국내외 현대미술을 연결하는 대표 공립미술관입니다. 기획·소장품 전시와 이우환공간, 미술 교육 프로그램을 경험할 수 있습니다.', array['부산시립미술관','시립미술관','이우환','공립미술관'], array['report.html']),
('forest', '치유의 숲은 어떤 곳인가요?', '부산어린이대공원 치유의 숲은 성지곡수원지와 울창한 편백림을 걷는 도심 속 웰니스 공간입니다. 편백숲 걷기, 호흡과 명상, 수원지 산책을 대표 체험으로 소개합니다.', array['치유의 숲','어린이대공원','편백','성지곡수원지','웰니스','숲'], array['report.html']),
('programs', '관광지 체험 프로그램을 알려주세요.', '부산현대미술관은 전시 연계 감상과 어린이 창작 프로그램, 부산시립미술관은 어린이 예술 교육과 전시 연계 프로그램, 치유의 숲은 편백·삼나무 숲길과 성지곡수원지 순환 산책을 소개합니다. 자세한 내용은 report 페이지의 각 관광지 카드를 눌러 확인할 수 있습니다.', array['체험','프로그램','교육','산책','전시','무엇을'], array['report.html']),
('company', '딸깍상사는 어떤 회사인가요?', '딸깍상사는 AI·관광·콘텐츠를 중심으로 부산의 장소와 이야기를 콘텐츠와 서비스로 바꾸는 크리에이티브 컴퍼니입니다. 반복 업무는 AI에게 맡기고 방향과 최종 책임은 사람이 맡는다는 원칙을 갖고 있습니다.', array['딸깍상사','회사','브랜드','AI 콘텐츠','about'], array['about.html']),
('contact', '김준철에게 어떻게 연락하나요?', '이메일은 kkimjuncheol@gmail.com입니다. 사이트 하단의 이메일 주소를 누르면 메일 작성 화면으로 연결됩니다.', array['연락','이메일','메일','문의','contact'], array['index.html']),
('social', 'SNS와 유튜브 주소를 알려주세요.', '사이트 하단에서 PPOO in Busan 유튜브와 인스타그램으로 이동할 수 있습니다. 유튜브는 @PPOOinBusan, 인스타그램은 @ppooinbusan입니다.', array['SNS','유튜브','인스타그램','PPOO','소셜'], array['index.html'])
on conflict (slug) do update set question=excluded.question, answer=excluded.answer, keywords=excluded.keywords, source_paths=excluded.source_paths, updated_at=now();

create index if not exists site_faqs_embedding_hnsw on public.site_faqs using hnsw (embedding extensions.vector_cosine_ops) where embedding is not null;

create or replace function public.match_site_faqs(query_embedding extensions.vector(384), match_threshold float default 0.5, match_count int default 3)
returns table (id uuid, question text, answer text, source_paths text[], similarity float)
language sql stable security definer set search_path = public, extensions
as $$
  select f.id, f.question, f.answer, f.source_paths, 1 - (f.embedding <=> query_embedding) as similarity
  from public.site_faqs f
  where f.active = true and f.embedding is not null and 1 - (f.embedding <=> query_embedding) >= match_threshold
  order by f.embedding <=> query_embedding
  limit least(match_count, 5);
$$;

revoke all on function public.match_site_faqs(extensions.vector, float, int) from public, anon, authenticated;
grant execute on function public.match_site_faqs(extensions.vector, float, int) to service_role;
