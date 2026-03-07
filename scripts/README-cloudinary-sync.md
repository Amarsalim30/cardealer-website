# Cloudinary Vehicle Image Sync

This repo includes a server-only script that reads vehicle images from Cloudinary asset folders and syncs them into Supabase `vehicle_images` rows.

## What It Syncs
- Vehicle lookup key: `vehicles.stock_code`
- Cloudinary folder convention: direct asset folder match first, such as `<stock-code>`, with `cars/<stock-code>` supported as a fallback
- Supabase image fields in this repo:
  - `vehicle_id`
  - `image_url`
  - `cloudinary_public_id`
  - `sort_order`
  - `is_hero`

`cloudinary_public_id` and `is_hero` are the repo's equivalents of `public_id` and `is_cover`.

## Prerequisites
1. Apply all SQL migrations in `supabase/migrations/` in order.
2. Ensure the target vehicle already exists in Supabase with a matching `stock_code`.
3. Ensure Cloudinary assets live in an asset folder that matches the stock code, such as `car-001`, `CAR-001`, or `cars/CAR-001`.

## Required Environment Variables
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `NEXT_PUBLIC_SUPABASE_URL` or `SUPABASE_URL`
- `SUPABASE_SECRET_KEY` or `SUPABASE_SERVICE_ROLE_KEY`

## Commands
- Dry run:
  `npm.cmd run cloudinary:sync -- --stock-code CAR-001 --dry-run`
- Real sync:
  `npm.cmd run cloudinary:sync -- --stock-code CAR-001`
- Positional stock code also works:
  `npm.cmd run cloudinary:sync -- CAR-001`

## Behavior
- Uses Cloudinary Admin API `resources_by_asset_folder` with pagination via `next_cursor`
- Retries transient Cloudinary failures with exponential backoff
- Filters to `jpg`, `jpeg`, `png`, and `webp`
- Sorts assets by numeric filename when possible, then by natural filename order
- Tries both direct stock-code folders and `cars/<stock-code>` folders
- Upserts rows into `vehicle_images`
- Deletes stale synced rows for the same vehicle when their `cloudinary_public_id` is no longer in Cloudinary
- Updates `vehicles.hero_image_url` to the first synced image
- Leaves manual image rows with `cloudinary_public_id is null` untouched

## Notes
- `resources_by_asset_folder` only returns assets stored directly inside that asset folder. If you later start using nested subfolders, switch this script to Cloudinary search.
- The admin workflow in this repo is: create or edit the vehicle content first, make sure `stock_code` matches the Cloudinary folder, then sync the folder into the listing gallery.
- The script is designed so you can later extend `scripts/lib/vehicle-image-sync.mjs` with extra Supabase writes without changing the CLI entrypoint.
