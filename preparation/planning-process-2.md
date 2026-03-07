Place the planning files in the project root, but keep them tight. The mistake is dumping random notes everywhere until the repo becomes unreadable.

Use this structure:

```text
car-dealership/
├─ app/
├─ components/
├─ lib/
├─ public/
├─ styles/
├─ supabase/
├─ docs/
│  ├─ 01-project-scope.md
│  ├─ 02-site-map.md
│  ├─ 03-user-flows.md
│  ├─ 04-tech-stack.md
│  ├─ 05-database-schema.md
│  ├─ 06-content-plan.md
│  ├─ 07-seo-plan.md
│  ├─ 08-ui-ux-rules.md
│  ├─ 09-feature-roadmap.md
│  ├─ 10-deployment-plan.md
│  └─ 11-admin-workflow.md
├─ .env.local
├─ package.json
├─ README.md
└─ PLAN.md
```

## Best approach

Keep only **one master file** at root:

### `PLAN.md`

This is the short command center. It should contain:

* project goal
* target users
* MVP features
* non-goals
* tech stack
* current phase
* next tasks

Then keep details inside `docs/`.

## What each file should contain

### `docs/01-project-scope.md`

Define the real scope so it does not expand endlessly.

Include:

* business goal
* target market
* dealership type
* required pages
* required lead actions
* strict exclusions for phase 1

Example sections:

```md
# Project Scope

## Goal
Build a fast car dealership website focused on lead generation and inventory browsing.

## Core outcomes
- Generate quote requests
- Generate test drive / viewing bookings
- Drive WhatsApp inquiries
- Build trust through testimonials and sold units

## Phase 1 includes
- Home page
- Inventory listing
- Vehicle detail page
- About / Trust page
- Contact page
- Financing info page
- Admin CRUD for vehicles
- Lead capture forms

## Phase 1 excludes
- Full CRM
- Online checkout
- Payment gateway
- Multi-branch staff roles
- Advanced analytics dashboard
```

### `docs/02-site-map.md`

This is the page structure.

```md
# Site Map

- Home
- Inventory
  - New Cars
  - Used Cars
  - Imported Units
  - Traded-in Cars
- Vehicle Detail Page
- Financing
- Trade-In
- About / Trust
- Contact / Locations
- Admin
  - Login
  - Vehicles
  - Leads
```

### `docs/03-user-flows.md`

Put the actual journeys here.

Include:

* home to inventory
* inventory to vehicle detail
* VDP to quote
* VDP to WhatsApp
* VDP to test drive
* admin adds vehicle

You can store your Mermaid diagrams here.

### `docs/04-tech-stack.md`

Be explicit.

```md
# Tech Stack

## Frontend
- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui

## Backend
- Supabase

## Media
- Cloudinary

## Notifications
- Resend

## Hosting
- Cloudflare or Vercel

## Analytics
- Google Analytics 4
- Google Search Console
```

Also include:

* why chosen
* expected cost level
* alternatives rejected

### `docs/05-database-schema.md`

This matters more than people think. Weak schema = messy app.

Start with:

* vehicles
* vehicle_images
* leads
* test_drive_requests
* trade_in_requests
* reviews
* locations
* admins

Example:

```md
# Database Schema

## vehicles
- id
- slug
- title
- make
- model
- year
- condition
- price
- mileage
- transmission
- fuel_type
- drivetrain
- location
- status
- featured
- description
- created_at

## leads
- id
- vehicle_id
- name
- phone
- email
- message
- source
- created_at
```

### `docs/06-content-plan.md`

Most devs ignore content, then the site feels empty.

Include:

* homepage headline options
* CTA wording
* trust section copy
* about page copy
* financing page copy
* contact page fields
* vehicle card text format
* badges like `Available for Importation`, `Sold`, `Negotiable`

### `docs/07-seo-plan.md`

Do not wait until launch.

Include:

* target keywords
* URL structure
* title/meta templates
* local SEO pages
* schema markup targets
* image alt-text rules

Example:

```md
# SEO Plan

## URL patterns
- /inventory
- /inventory/new
- /inventory/used
- /cars/[slug]

## Title template
{Make Model Year} for Sale in {Location} | {Brand}

## Local keywords
- cars for sale in Mombasa
- imported cars in Mombasa
- used cars in Kenya
```

### `docs/08-ui-ux-rules.md`

This prevents design inconsistency.

Include:

* spacing system
* card behavior
* button hierarchy
* CTA placement
* mobile rules
* image ratio rules
* form field rules

Example:

```md
# UI/UX Rules

- Primary CTA color must be consistent across the site
- Every VDP shows primary CTA above the fold
- Max 2 primary actions visible at once on mobile
- Forms must be short: name, phone, email, message
- WhatsApp CTA must remain visible on mobile
```

### `docs/09-feature-roadmap.md`

This stops phase 1 from mutating into phase 9.

Use:

```md
# Feature Roadmap

## Phase 1
- Public website pages
- Inventory listing
- VDP
- Lead forms
- WhatsApp CTA
- Basic admin vehicle management

## Phase 2
- Lead dashboard
- Review management
- Better search filters
- Featured banners
- Sold vehicle management

## Phase 3
- Staff roles
- Import request workflow
- Analytics dashboard
- Financing request pipeline
```

### `docs/10-deployment-plan.md`

You need this early, not after coding.

Include:

* environment variables
* hosting target
* domain setup
* email sending
* image hosting
* analytics setup
* production checklist

### `docs/11-admin-workflow.md`

Very important for dealership websites.

Include:

* how admin adds a car
* how images are uploaded
* how sold cars are marked
* how leads are reviewed
* who receives quote emails
* how WhatsApp number is managed

## Important correction to your assumption

You said you will place all planning files in the project folder. Fine. But do **not** mix planning files with source code files randomly.

Bad:

```text
/app
/components
/database-plan.md
/new-ideas-final-final.md
/testdrive-notes.md
```

Good:

```text
/docs/*
PLAN.md
README.md
```

## Minimum files you actually need

If you want lean and practical, start with just these:

```text
PLAN.md
docs/01-project-scope.md
docs/02-site-map.md
docs/03-user-flows.md
docs/04-tech-stack.md
docs/05-database-schema.md
docs/09-feature-roadmap.md
```

That is enough to begin.

## Best order to write them

Write in this order:

1. `PLAN.md`
2. `01-project-scope.md`
3. `02-site-map.md`
4. `03-user-flows.md`
5. `04-tech-stack.md`
6. `05-database-schema.md`
7. `09-feature-roadmap.md`

Because if scope and flows are weak, the rest becomes fantasy.

## Strong recommendation

Also add a `DECISIONS.md` file for important choices.

Example:

```md
# Decisions Log

## 2026-03-07
Decision: Use Next.js + Supabase instead of Laravel backend
Reason: Lower cost, faster MVP, enough for inventory + leads

## 2026-03-07
Decision: Prioritize WhatsApp and quote forms over user accounts
Reason: Better fit for dealership sales flow
```

That prevents future confusion.

If you want, I can generate the actual starter content for all these files in one clean pack.
