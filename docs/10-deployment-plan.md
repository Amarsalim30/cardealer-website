# Deployment Plan

## Hosting Target
- Deploy the Next.js application to Vercel.
- Host the database and auth in Supabase.
- Deliver images through Cloudinary.

## Environment Variables
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `ADMIN_NOTIFICATION_EMAIL`
- `RESEND_API_KEY` (optional until the sender domain is ready)

## Setup Sequence
1. Create Supabase project and run SQL migration.
2. Seed optional demo content.
3. Create Cloudinary product environment and upload credentials.
4. Add Supabase and Cloudinary credentials to Vercel.
5. Add `ADMIN_NOTIFICATION_EMAIL`.
6. Add `RESEND_API_KEY` only when a sender domain is available.
7. Deploy and smoke-test public pages, forms, admin login, and inventory workflows.

## Production Checklist
- Domain connected and HTTPS enabled
- Redirects and canonical URL configured
- Admin user inserted into `admin_profiles`
- Public forms save successfully with or without Resend configured
- Resend notifications tested after sender domain setup
- Cloudinary gallery rendering and sync verified
- Vehicle create/edit workflow tested
- Inventory row actions and bulk actions tested
- Lead inbox triage and workflow transitions tested
- Sitemap and robots reachable
- Build, lint, typecheck, and tests passing

## Verified Release Gates
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run test`
- `npm.cmd run build`
- `npm.cmd run test:e2e`
