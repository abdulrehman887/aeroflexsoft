# AEROFLEX — Complete Website Starter

## Included
- HOME / SHOP / ABOUT / CONTACT / WHATSAPP
- Separate ALL ITEMS and AVAILABLE STOCK pages
- Exact categories: AEROFLEX, LOOK LASTER, LS, CAMLO
- Product detail with colour selection
- Per-colour stock in CTN
- OUT OF STOCK / ORDER ON REQUEST
- Admin dashboard UI
- Full edit form that preserves existing data/images unless replaced
- Up to 10 colour variants per article
- Available-stock PRINT sheet with product picture + article + colour-wise CTN
- Browser PDF workflow: click DOWNLOAD PDF, then choose "Save as PDF" in the print dialog
- Mobile + desktop responsive
- AEROFLEX-only branding; no AR COLLECTIVE credentials or links

## Important
This package is the complete frontend/admin workflow starter. It currently uses browser localStorage for demo persistence so the UI can be tested immediately.

For production:
1. Create a NEW Supabase project for AEROFLEX (do not use the AR COLLECTIVE project).
2. Add Supabase URL and publishable key in `js/config.js`.
3. Create product/variant tables, storage bucket and RLS policies.
4. Replace demo/localStorage persistence with Supabase CRUD/auth/storage.
5. Put the real AEROFLEX WhatsApp number and social links in `js/config.js`.

Never put a Supabase service-role/secret key in frontend files.
