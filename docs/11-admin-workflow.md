# Admin Workflow

## Login
- Admin signs in using Supabase email/password in production.
- Local demo mode is available when Supabase is not configured so the workflow can still be reviewed.

## Add or Edit Vehicle
1. Open the admin vehicles page.
2. Create a new vehicle or edit an existing one.
3. Enter a stock code that matches the Cloudinary asset folder for the car, for example `CAR-001` for folder `car-001`.
4. Save the vehicle content first so title, pricing, description, and status exist even before the gallery is final.
5. Sync the Cloudinary folder from the vehicle edit page to pull the matching gallery into the listing.
6. Reorder images, choose a hero image, or upload additional images from admin when needed.

## Publish Workflow
- Save as draft while preparing a vehicle.
- Publish when the listing is ready for public visibility.
- Unpublish when stock should be hidden.
- Mark sold to keep historical proof while removing it from active inventory views.

## Lead Review
- Leads inbox shows quote, contact, financing, test drive, and trade-in submissions together.
- Admin can filter by source type and review newest leads first.
- Follow-up still happens outside the system by phone, WhatsApp, or email.

## Operational Notes
- `vehicles.stock_code` is the image-matching key between Supabase and Cloudinary.
- Preferred workflow: create or edit the vehicle text first, then sync the stock-code folder into `vehicle_images`.
- Keep hero images sharp and consistent.
- Use featured status only on priority stock.
- Keep phone and WhatsApp contact details current in site config.
- Review unpublished or sold stock regularly to keep public inventory accurate.
