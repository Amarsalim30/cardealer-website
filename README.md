# Cardealer Website

A production-oriented dealership MVP built with Next.js, TypeScript, Tailwind CSS, Supabase, and Cloudinary, with Resend supported as an optional notification layer. The project is designed for fast inventory browsing, strong lead capture, and a minimal admin workflow.

## Stack
- Next.js 16 App Router
- TypeScript
- Tailwind CSS v4
- Supabase
- Cloudinary
- Resend (optional / deferred)
- Vitest

## Local Setup
1. Install dependencies:
   `npm.cmd install`
2. Copy `.env.example` to `.env.local`.
3. Fill in Supabase and Cloudinary credentials. Add Resend only when a sender domain is ready.
4. Start the app:
   `npm.cmd run dev`

## Environment Variables
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `ADMIN_NOTIFICATION_EMAIL`
- `RESEND_API_KEY` (optional)

## Demo Mode
- If Supabase is not configured, the site runs with demo inventory and a demo admin mode.
- Demo admin credentials are documented in the app UI and intended only for local review.
- Demo mode keeps the public site and admin workflow usable without external services, but data is not persistent across process restarts.

## Supabase Setup
1. Create a new Supabase project.
2. Run all SQL migrations in `supabase/migrations/` in order (yes, you do need to run them).
   - Quick option (dashboard): open SQL editor and run:
     - `supabase/migrations/001_initial_schema.sql`
     - `supabase/migrations/002_add_vehicle_stock_code.sql`
     - `supabase/migrations/003_add_lead_inbox_state.sql`
   - CLI option (if you use Supabase CLI): `supabase db push`
3. Optionally run `supabase/seed/001_demo_seed.sql` for starter data.
4. Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and `SUPABASE_SECRET_KEY` in `.env.local`.
5. Create/invite an auth user for the admin in Supabase Auth.
6. Insert that user into `admin_profiles` to grant access, e.g.:
   ```sql
   insert into public.admin_profiles (user_id, email, full_name)
   values ('<auth_user_uuid>', 'admin@example.com', 'Admin Name');
   ```
7. To remove access:
   ```sql
   delete from public.admin_profiles
   where user_id = '<auth_user_uuid>';
   ```

## Supabase Connection Layer
- Browser client: `lib/supabase/client.ts`
- SSR/auth client: `lib/supabase/server.ts`
- Server-only secret client for scripts: `lib/supabase/admin.ts`
- SSR auth refresh proxy: `proxy.ts` and `lib/supabase/middleware.ts`
- Typed database contract: `types/database.ts`

## Supabase Verification
- Read-only connectivity check: `npm.cmd run supabase:check`
- Read + write + cleanup check: `npm.cmd run supabase:check:write`
- The write check inserts a temporary draft vehicle and deletes it immediately after a successful test.

## Cloudinary Setup
- Create a Cloudinary environment.
- Add the cloud name, API key, and API secret to the app environment.
- Vehicle image uploads use Cloudinary when credentials are present.
- Folder-to-Supabase sync script: `scripts/sync-cloudinary-vehicle-images.mjs`
- Usage guide: `scripts/README-cloudinary-sync.md`

## Resend Setup
- Resend is optional for the current deployment.
- If `RESEND_API_KEY` is missing, forms still save successfully and the app skips outbound notification email.
- When a sender domain is ready, add the API key and set `ADMIN_NOTIFICATION_EMAIL` to the sales inbox that should receive lead notifications.

## Verification Commands
- Lint: `npm.cmd run lint`
- Typecheck: `npm.cmd run typecheck`
- Tests: `npm.cmd run test`
- Production build: `npm.cmd run build`

## Deployment
1. Push the repository to a Git provider.
2. Import the project into Vercel.
3. Configure `NEXT_PUBLIC_SITE_URL`, Supabase, and Cloudinary environment variables.
4. Add `ADMIN_NOTIFICATION_EMAIL`, and add `RESEND_API_KEY` only if email delivery is enabled.
5. Run the Supabase migrations and optional seed.
6. Deploy and validate inventory pages, forms, image sync, and admin login.

## Release Smoke Test
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run test`
- `npm.cmd run build`
- `npm.cmd run test:e2e`

## Post-Deploy Checks
- Confirm admin login and protected routes in Vercel.
- Create and edit a vehicle from `/admin/vehicles`.
- Verify row actions and bulk inventory actions update state correctly.
- Confirm Cloudinary gallery images render on `/cars/[slug]` and after image sync.
- Submit a viewing form and verify the lead appears in `/admin/leads`.
- If Resend is still deferred, confirm forms save without email errors.

## Planning Docs
- [PLAN.md](./PLAN.md)
- [DECISIONS.md](./DECISIONS.md)
- [docs/01-project-scope.md](./docs/01-project-scope.md)
- [docs/02-site-map.md](./docs/02-site-map.md)
- [docs/03-user-flows.md](./docs/03-user-flows.md)
- [docs/04-tech-stack.md](./docs/04-tech-stack.md)
- [docs/05-database-schema.md](./docs/05-database-schema.md)
- [docs/06-content-plan.md](./docs/06-content-plan.md)
- [docs/07-seo-plan.md](./docs/07-seo-plan.md)
- [docs/08-ui-ux-rules.md](./docs/08-ui-ux-rules.md)
- [docs/09-feature-roadmap.md](./docs/09-feature-roadmap.md)
- [docs/10-deployment-plan.md](./docs/10-deployment-plan.md)
- [docs/11-admin-workflow.md](./docs/11-admin-workflow.md)
