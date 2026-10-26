update public.site_faqs
set keywords = array['김준철','소개','누구','사람','전공','신학','종교','종교철학','성공회'], embedding = null, updated_at = now()
where slug = 'profile';

update public.site_faqs
set keywords = array['치유의 숲','어린이대공원','편백','성지곡수원지','웰니스','숲','걷기','쉬고','휴식','산책'], embedding = null, updated_at = now()
where slug = 'forest';
