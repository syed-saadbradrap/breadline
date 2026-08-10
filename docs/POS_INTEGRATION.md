# Website → POS online orders

## Flow

1. Customer places order on Breadline website
2. Website saves order (`pending`) via `/api/orders`
3. POS polls `/api/pos/orders?status=pending` every ~12 seconds
4. POS imports order into local SQLite (kitchen queue)
5. POS marks remote order `accepted`
6. All further handling (kitchen, payment, delivery) stays inside POS

## Website setup (Vercel)

1. Create a free [Supabase](https://supabase.com) project
2. Run SQL from `supabase/online_orders.sql` in Supabase SQL Editor
3. In Vercel project env vars, set:

```env
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
POS_API_KEY=a-long-random-secret
```

4. Redeploy the website

Local/dev without Supabase still accepts orders in memory (process-only). Use Supabase for production.

## POS setup

1. Open **Online** in the left menu
2. Website URL = your live site, e.g. `https://breadline-....vercel.app`
3. POS API Key = same value as website `POS_API_KEY`
4. Keep **Auto-import** enabled
5. Click **Save connection**, then **Sync now**

## Notes

- Menu item names must match between website and POS (Cheese Burst / Brust is auto-normalized)
- COD / cash-at-restaurant orders import as unpaid + sent to kitchen
- Cashier completes payment later in POS
