-- Create company_logos storage bucket
insert into storage.buckets (id, name, public)
values ('company_logos', 'company_logos', true)
on conflict (id) do nothing;

-- Allow authenticated users to manage
create policy "Auth users can manage company logos"
on storage.objects for all
to authenticated
using (bucket_id = 'company_logos')
with check (bucket_id = 'company_logos');

-- Allow public read access
create policy "Public can view company logos"
on storage.objects for select
to public
using (bucket_id = 'company_logos');
