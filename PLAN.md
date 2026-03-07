# Project Plan

## Goal
Build a fast, conversion-oriented dealership website MVP for a Nairobi-first car dealer focused on inventory browsing, trust-building, and lead capture.

## Target Users
- Kenyan car buyers comparing used, imported, and traded-in stock on mobile.
- Shoppers who want quick answers on price, availability, financing, and trade-in options.
- Internal dealership staff managing inventory and reviewing leads.

## MVP Features
- Public marketing site with homepage, category pages, inventory listing, vehicle detail pages, financing, trade-in, about, and contact pages.
- Structured vehicle data with featured listings, category filtering, vehicle specs, pricing, and trust signals.
- Lead capture for quote requests, contact enquiries, financing questions, test drives, and trade-in submissions.
- Minimal admin workflow for vehicle CRUD, publish control, sold state, featured status, images, and leads inbox.
- SEO baseline with metadata, structured data, sitemap, robots, and clean URLs.

## Non-Goals
- CRM or pipeline management beyond a simple leads inbox.
- Online payments, checkout, or reservation deposits.
- Multi-role staff permissions and advanced analytics dashboards.
- Multilingual content in phase 1.

## Tech Stack
- Next.js 16 App Router
- TypeScript
- Tailwind CSS v4
- shadcn-style UI primitives where useful
- Supabase for auth and persistent data
- Cloudinary for vehicle media
- Resend for lead notifications
- Vitest for essential tests

## Current Phase
Implementation in progress: foundation, docs, and app architecture.

## Next Tasks
1. Finish shared types, demo data, data repository, and environment helpers.
2. Implement public routes and lead forms.
3. Implement admin authentication, vehicle management, and leads inbox.
4. Add Supabase SQL schema, tests, and deployment documentation.
5. Verify lint, typecheck, tests, and production build.
