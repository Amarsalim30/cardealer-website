# Tech Stack

## Frontend
- Next.js 16 App Router
- TypeScript
- Tailwind CSS v4
- shadcn-style UI primitives for buttons, inputs, badges, cards, and layout consistency

## Backend and Data
- Supabase PostgreSQL for production data
- Supabase Auth for admin login
- SQL migrations and seed files stored in `supabase/`

## Media and Messaging
- Cloudinary for vehicle image uploads and delivery
- Resend for lead notification emails

## Testing
- Vitest
- Testing Library

## Hosting
- Vercel for the Next.js app
- Supabase hosted project for database and auth

## Why This Stack
- Keeps the MVP lean without splitting into separate frontend and backend projects.
- Minimizes maintenance overhead for a budget-conscious dealership.
- Provides enough flexibility for future content or workflow expansion.

## Cost Level
- Low to medium monthly cost for the MVP.
- Costs scale mainly with image bandwidth, email volume, and Supabase usage.

## Alternatives Rejected
- Full custom backend or CRM: unnecessary for the requested scope.
- Heavy WordPress theme stack: faster to start, but less maintainable for typed inventory workflows.
- Complex design systems or animation libraries: not aligned with speed and conversion goals.
