insert into public.site_admins (user_id)
select id from auth.users where lower(email) = lower('kkimjuncheol@gmail.com')
on conflict (user_id) do nothing;

comment on table public.site_admins is 'Accounts allowed to use the website chatbot admin console.';
