# Cardealer Website

A production-oriented dealership MVP built with Next.js, TypeScript, Tailwind CSS, Supabase, Cloudinary, and Resend. The project is designed for fast inventory browsing, strong lead capture, and a minimal admin workflow.

## Stack
- Next.js 16 App Router
- TypeScript
- Tailwind CSS v4
- Supabase
- Cloudinary
- Resend
- Vitest

## Local Setup
1. Install dependencies:
   `npm.cmd install`
2. Copy `.env.example` to `.env.local`.
3. Fill in Supabase, Cloudinary, and Resend credentials as available.
4. Start the app:
   `npm.cmd run dev`

## Environment Variables
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `RESEND_API_KEY`
- `ADMIN_NOTIFICATION_EMAIL`

## Demo Mode
- If Supabase is not configured, the site runs with demo inventory and a demo admin mode.
- Demo admin credentials are documented in the app UI and intended only for local review.
- Demo mode keeps the public site and admin workflow usable without external services, but data is not persistent across process restarts.

## Supabase Setup
1. Create a new Supabase project.
2. Run the SQL migration in `supabase/migrations/001_initial_schema.sql`.
3. Optionally run `supabase/seed/001_demo_seed.sql` for starter data.
4. Create an auth user for the admin.
5. Insert that user into `admin_profiles`.

## Cloudinary Setup
- Create a Cloudinary environment.
- Add the cloud name, API key, and API secret to the app environment.
- Vehicle image uploads use Cloudinary when credentials are present.

## Resend Setup
- Create a Resend API key.
- Verify a sender domain or use a valid test sender.
- Set `ADMIN_NOTIFICATION_EMAIL` to the sales inbox that should receive lead notifications.

## Verification Commands
- Lint: `npm.cmd run lint`
- Typecheck: `npm.cmd run typecheck`
- Tests: `npm.cmd run test`
- Production build: `npm.cmd run build`

## Deployment
1. Push the repository to a Git provider.
2. Import the project into Vercel.
3. Configure the environment variables.
4. Run the Supabase migration and seed.
5. Deploy and validate inventory pages, forms, and admin login.

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
