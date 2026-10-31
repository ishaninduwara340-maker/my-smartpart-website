-- SmartParts: run ONCE in Supabase > SQL Editor  (safe to re-run)
create table if not exists public.site_settings (
  key text primary key,
  value jsonb,
  updated_at timestamptz default now()
);
alter table public.site_settings enable row level security;

-- Website (anon key) can READ settings; only the logged-in admin can WRITE.
drop policy if exists "settings read" on public.site_settings;
create policy "settings read" on public.site_settings for select using (true);
drop policy if exists "settings write" on public.site_settings;
create policy "settings write" on public.site_settings for all to authenticated using (true) with check (true);

insert into storage.buckets (id, name, public) values ('site-assets','site-assets',true)
on conflict (id) do nothing;

drop policy if exists "site-assets read" on storage.objects;
create policy "site-assets read" on storage.objects for select using (bucket_id = 'site-assets');
drop policy if exists "site-assets write" on storage.objects;
create policy "site-assets write" on storage.objects for all to authenticated using (bucket_id = 'site-assets') with check (bucket_id = 'site-assets');
