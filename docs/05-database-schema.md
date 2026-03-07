# Database Schema

## vehicles
- `id` uuid primary key
- `title` text
- `slug` text unique
- `make` text
- `model` text
- `year` integer
- `condition` text
- `price` numeric
- `negotiable` boolean
- `mileage` integer
- `transmission` text
- `fuel_type` text
- `drive_type` text nullable
- `body_type` text nullable
- `engine_capacity` text nullable
- `color` text nullable
- `location_id` uuid nullable
- `featured` boolean
- `status` enum: `draft`, `published`, `sold`, `unpublished`
- `stock_category` enum: `new`, `used`, `imported`, `available_for_importation`, `traded_in`
- `description` text
- `hero_image_url` text nullable
- `created_at` timestamptz
- `updated_at` timestamptz

## vehicle_images
- `id` uuid primary key
- `vehicle_id` uuid foreign key
- `cloudinary_public_id` text nullable
- `image_url` text
- `alt_text` text nullable
- `sort_order` integer
- `is_hero` boolean
- `created_at` timestamptz

## leads
- `id` uuid primary key
- `vehicle_id` uuid nullable
- `lead_type` enum: `quote`, `contact`, `financing`
- `name` text
- `phone` text
- `email` text nullable
- `message` text nullable
- `source` text nullable
- `utm_source` text nullable
- `utm_medium` text nullable
- `utm_campaign` text nullable
- `created_at` timestamptz

## test_drive_requests
- `id` uuid primary key
- `vehicle_id` uuid nullable
- `name` text
- `phone` text
- `email` text nullable
- `preferred_date` date nullable
- `preferred_time` text nullable
- `message` text nullable
- `created_at` timestamptz

## trade_in_requests
- `id` uuid primary key
- `desired_vehicle_id` uuid nullable
- `name` text
- `phone` text
- `email` text nullable
- `current_vehicle_make` text
- `current_vehicle_model` text
- `current_vehicle_year` integer
- `current_vehicle_mileage` integer nullable
- `condition_notes` text nullable
- `message` text nullable
- `created_at` timestamptz

## reviews
- `id` uuid primary key
- `customer_name` text
- `rating` integer
- `quote` text
- `vehicle_label` text nullable
- `featured` boolean
- `sort_order` integer
- `created_at` timestamptz

## locations
- `id` uuid primary key
- `name` text
- `address_line` text
- `city` text
- `phone` text
- `email` text nullable
- `hours` text
- `map_url` text nullable
- `is_primary` boolean
- `created_at` timestamptz

## admin_profiles
- `id` uuid primary key
- `user_id` uuid unique foreign key to `auth.users`
- `full_name` text nullable
- `email` text
- `created_at` timestamptz

## Access Rules
- Public users can read only published vehicles, public reviews, and public locations.
- Public users can insert lead, test drive, and trade-in records.
- Authenticated users listed in `admin_profiles` can manage vehicles, images, locations, reviews, and view leads.
