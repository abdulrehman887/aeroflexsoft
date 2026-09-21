AEROFLEX FINAL UI/Stock Flow Update

Changes in this build:
- ALL ITEMS article creation has no stock/CTN fields.
- ADD ARTICLE TO STOCK opens the complete ALL ITEMS list; select an article and enter one stock quantity per colour.
- Available Stock shows only colours with stock > 0.
- ALL ITEMS public view does not show CTN/stock quantities.
- Public shop has two large mode buttons and four category buttons.
- Mobile product grid is 2 articles per row; no View All cutoff.
- Existing article photos/colours are preserved during edits unless replaced.
- Secure Supabase Auth login remains enabled.
- AEROFLEX-only Supabase URL/publishable key and WhatsApp number are configured.

Note: product/stock persistence in this starter build remains browser localStorage; production multi-device CRUD/RLS/storage should be connected to the separate AEROFLEX Supabase database before treating this as a production data backend.
