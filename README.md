## Next.js App Router Course - Starter

This is the starter template for the Next.js App Router Course. It contains the starting code for the dashboard application.

For more information, see the [course curriculum](https://nextjs.org/learn) on the Next.js Website.

### Supabase configuration

This project has been extended to use Supabase for authentication and data storage.

- **Required environment variables** (in `.env.local`):
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- **Database schema**:
  - Run the SQL in `supabase/schema.sql` inside your Supabase project's SQL editor to create the required tables and row-level security (RLS) policies.
