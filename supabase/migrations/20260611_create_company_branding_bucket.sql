-- Create company_branding storage bucket
insert into storage.buckets (id, name, public)
values ('company_branding', 'company_branding', true)
on conflict (id) do nothing;

-- Allow authenticated users to upload, update, delete
create policy "Auth users can manage company branding"
on storage.objects for all
to authenticated
using (bucket_id = 'company_branding')
with check (bucket_id = 'company_branding');

-- Allow public read access
create policy "Public can view company branding"
on storage.objects for select
to public
using (bucket_id = 'company_branding');
