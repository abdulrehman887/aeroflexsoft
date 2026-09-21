-- AEROFLEX ONLY. Do NOT run in AR COLLECTIVE.
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
