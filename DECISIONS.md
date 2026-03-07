# Decisions Log

## 2026-03-07
Decision: Use a generic Nairobi-first placeholder dealership brand for the MVP.
Reason: The repository does not include real business content yet, and the build must remain usable while keeping future replacement low-cost.

## 2026-03-07
Decision: Prioritize a balanced inventory mix across used cars, imported units, and traded-in stock.
Reason: This best matches the requested business model without over-optimizing the site toward only one stock source.

## 2026-03-07
Decision: Build on Next.js, TypeScript, Tailwind CSS, Supabase, Cloudinary, and Resend.
Reason: This stack is fast to ship, easy to maintain, and sufficient for a lean dealership MVP.

## 2026-03-07
Decision: Use Supabase email/password auth for production admin access and a documented demo-admin fallback when Supabase is not configured locally.
Reason: The production workflow needs real authentication, but local implementation and review must still be possible without blocking on external credentials.

## 2026-03-07
Decision: Keep the admin scope limited to vehicle management and a unified leads inbox.
Reason: The requested MVP is a high-conversion website, not a CRM or ERP.

## 2026-03-07
Decision: Keep the MVP English-only and mobile-first.
Reason: This lowers implementation cost while matching the conversion priorities and content needs for launch.

## 2026-03-07
Decision: Target Vercel-first deployment.
Reason: It aligns naturally with the Next.js stack and minimizes operational overhead for a small dealership site.
