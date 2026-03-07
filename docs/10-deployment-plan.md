# Deployment Plan

## Hosting Target
- Deploy the Next.js application to Vercel.
- Host the database and auth in Supabase.
- Deliver images through Cloudinary.

## Environment Variables
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `RESEND_API_KEY`
- `ADMIN_NOTIFICATION_EMAIL`

## Setup Sequence
1. Create Supabase project and run SQL migration.
2. Seed optional demo content.
3. Create Cloudinary product environment and upload credentials.
4. Create Resend API key and verified sender domain.
5. Add all environment variables to Vercel.
6. Deploy and smoke-test public pages, forms, and admin login.

## Production Checklist
- Domain connected and HTTPS enabled
- Redirects and canonical URL configured
- Admin user inserted into `admin_profiles`
- Email notifications tested
- Vehicle create/edit workflow tested
- Sitemap and robots reachable
- Build, lint, typecheck, and tests passing
