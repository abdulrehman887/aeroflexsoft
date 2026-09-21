-- AEROFLEX ONLY. Run this in the AEROFLEX Supabase SQL Editor.
-- This does NOT touch AR COLLECTIVE.

alter table public.products add column if not exists id text;
alter table public.products add column if not exists name text;
alter table public.products add column if not exists price numeric;
alter table public.products add column if not exists category text;
alter table public.products add column if not exists size text;
alter table public.products add column if not exists condition text;
alter table public.products add column if not exists description text;
alter table public.products add column if not exists image text;

alter table public.product_variants add column if not exists id text;
alter table public.product_variants add column if not exists product_id text;
alter table public.product_variants add column if not exists name text;
alter table public.product_variants add column if not exists image text;
alter table public.product_variants add column if not exists stock integer not null default 0 check (stock >= 0);
alter table public.product_variants add column if not exists opening_stock integer not null default 0 check (opening_stock >= 0);

alter table public.products enable row level security;
alter table public.product_variants enable row level security;

drop policy if exists "public read products" on public.products;
create policy "public read products" on public.products for select using (true);
drop policy if exists "authenticated manage products" on public.products;
create policy "authenticated manage products" on public.products for all to authenticated using (true) with check (true);

drop policy if exists "public read variants" on public.product_variants;
create policy "public read variants" on public.product_variants for select using (true);
drop policy if exists "authenticated manage variants" on public.product_variants;
create policy "authenticated manage variants" on public.product_variants for all to authenticated using (true) with check (true);

-- Storage policies for the existing public bucket named product-images.
drop policy if exists "public read product images" on storage.objects;
create policy "public read product images" on storage.objects for select using (bucket_id = 'product-images');
drop policy if exists "authenticated upload product images" on storage.objects;
create policy "authenticated upload product images" on storage.objects for insert to authenticated with check (bucket_id = 'product-images');
drop policy if exists "authenticated update product images" on storage.objects;
create policy "authenticated update product images" on storage.objects for update to authenticated using (bucket_id = 'product-images') with check (bucket_id = 'product-images');
drop policy if exists "authenticated delete product images" on storage.objects;
create policy "authenticated delete product images" on storage.objects for delete to authenticated using (bucket_id = 'product-images');
