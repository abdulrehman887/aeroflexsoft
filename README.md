# AEROFLEX — STOCK / ADMIN FIX V4

This package fixes the requested AEROFLEX workflows:
- Opening Stock + Current CTN per colour.
- Available Stock shows only variants whose current CTN is above 0.
- All Items keeps out-of-stock articles and hides CTN quantities there.
- Duplicate Article workflow starts the duplicate with 0 CTN so admin can enter fresh stock; if CTN is entered above 0 it appears in Available Stock.
- Current CTN = 0 automatically removes that colour/article from Available Stock.
- Separate ALL ITEMS and AVAILABLE STOCK admin views with separate edit actions.
- Existing article data and pictures load into Edit; no blank edit form.
- Print Available Stock and browser Save-as-PDF workflow restored.
- Admin login now requires Supabase Authentication; fake email/password no longer opens the dashboard.

## IMPORTANT PRODUCTION SETUP
1. This is AEROFLEX only. Do not change the AR COLLECTIVE project.
2. In `js/config.js`, paste the AEROFLEX Supabase publishable/anon key. Never paste a service-role/secret key.
3. The Supabase Auth user can be the already-created `aeroflexsoft@gmail.com` account.
4. `supabase-setup.sql` is for the AEROFLEX Supabase project only. Run it there if the RLS policies have not already been configured.
5. Put the AEROFLEX WhatsApp number in `WHATSAPP_NUMBER` when ready.
6. Product CRUD in this V4 package is browser-local until the database CRUD/storage connector is wired; do not treat localStorage as production data storage.
