# Site-only RAG setup

The static site works without Supabase in local-preview mode. Complete these steps to enable live RAG and the admin console.

1. Create a Supabase project and run `migrations/202610260001_site_rag.sql` in the SQL editor.
2. In Authentication, create the administrator email/password user.
3. Add that user's UUID to `public.site_admins`:
   `insert into public.site_admins (user_id) values ('USER_UUID');`
4. Set the Edge Function secret `SITE_URL=https://kimjuncheol-ai.github.io/portfolio`.
5. Deploy `site-chat` without JWT verification (it is the public visitor endpoint) and deploy `sync-site` normally.
6. Put the project's public URL and publishable key in `/supabase-config.js`.
7. Open `/admin.html`, sign in, and run the first sync.

The chatbot uses Supabase's built-in `gte-small` embedding model and curated site-only answers. No paid generative AI API key is required. Never put a Supabase secret/service-role key in `supabase-config.js`.
