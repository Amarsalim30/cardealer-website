insert into public.locations (
  id,
  name,
  address_line,
  city,
  phone,
  email,
  hours,
  map_url,
  is_primary
) values
  (
    '11111111-1111-1111-1111-111111111111',
    'Westlands Showroom',
    'Muthithi Road, Westlands',
    'Nairobi',
    '+254700123456',
    'sales@summitdrivemotors.demo',
    'Mon - Sat, 8:00 AM - 6:00 PM',
    'https://maps.google.com/?q=Westlands+Nairobi',
    true
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'Syokimau Yard',
    'Mombasa Road, Syokimau',
    'Nairobi',
    '+254700123456',
    'yard@summitdrivemotors.demo',
    'Mon - Sat, 8:30 AM - 5:30 PM',
    'https://maps.google.com/?q=Syokimau+Nairobi',
    false
  )
on conflict (id) do nothing;

insert into public.vehicles (
  id,
  title,
  slug,
  make,
  model,
  year,
  condition,
  price,
  negotiable,
  mileage,
  transmission,
  fuel_type,
  drive_type,
  body_type,
  engine_capacity,
  color,
  location_id,
  featured,
  status,
  stock_category,
  description,
  hero_image_url
) values
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '2020 Toyota Land Cruiser Prado TX-L',
    '2020-toyota-land-cruiser-prado-tx-l',
    'Toyota',
    'Land Cruiser Prado',
    2020,
    'Foreign used',
    6850000,
    true,
    48200,
    'Automatic',
    'Diesel',
    '4WD',
    'SUV',
    '2800cc',
    'Pearl White',
    '11111111-1111-1111-1111-111111111111',
    true,
    'published',
    'used',
    'A well-kept Prado TX-L with full inspection notes, sharp bodywork, and strong comfort for family or executive use.',
    'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=1200&q=80'
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '2018 Mazda CX-5 Touring',
    '2018-mazda-cx-5-touring',
    'Mazda',
    'CX-5',
    2018,
    'Locally available',
    2895000,
    true,
    71800,
    'Automatic',
    'Petrol',
    'AWD',
    'SUV',
    '2500cc',
    'Machine Gray',
    '11111111-1111-1111-1111-111111111111',
    true,
    'published',
    'used',
    'A polished CX-5 Touring with premium cabin feel, responsive handling, and a clean ownership story.',
    'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1200&q=80'
  ),
  (
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    '2019 Nissan X-Trail 20X 4WD',
    '2019-nissan-x-trail-20x-4wd',
    'Nissan',
    'X-Trail',
    2019,
    'Imported unit',
    3180000,
    false,
    56400,
    'Automatic',
    'Petrol',
    '4WD',
    'SUV',
    '2000cc',
    'Silver',
    '22222222-2222-2222-2222-222222222222',
    false,
    'published',
    'imported',
    'Freshly imported X-Trail with strong practicality and a clean condition report.',
    'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1200&q=80'
  ),
  (
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    '2017 Toyota Fielder Hybrid',
    '2017-toyota-fielder-hybrid',
    'Toyota',
    'Fielder',
    2017,
    'Trade-in verified',
    1795000,
    true,
    90500,
    'Automatic',
    'Hybrid',
    'FWD',
    'Wagon',
    '1500cc',
    'White',
    '11111111-1111-1111-1111-111111111111',
    false,
    'published',
    'traded_in',
    'A clean trade-in Fielder with strong economy and practical cargo room.',
    'https://images.unsplash.com/photo-1551830820-330a71b99659?auto=format&fit=crop&w=1200&q=80'
  )
on conflict (id) do nothing;

insert into public.vehicle_images (
  id,
  vehicle_id,
  image_url,
  alt_text,
  sort_order,
  is_hero
) values
  (
    'aaaaaaaa-0000-0000-0000-000000000001',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=1200&q=80',
    '2020 Toyota Land Cruiser Prado TX-L front view',
    0,
    true
  ),
  (
    'bbbbbbbb-0000-0000-0000-000000000001',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1200&q=80',
    '2018 Mazda CX-5 Touring exterior view',
    0,
    true
  ),
  (
    'cccccccc-0000-0000-0000-000000000001',
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1200&q=80',
    '2019 Nissan X-Trail 20X 4WD hero image',
    0,
    true
  ),
  (
    'dddddddd-0000-0000-0000-000000000001',
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    'https://images.unsplash.com/photo-1551830820-330a71b99659?auto=format&fit=crop&w=1200&q=80',
    '2017 Toyota Fielder Hybrid hero image',
    0,
    true
  )
on conflict (id) do nothing;

insert into public.reviews (
  id,
  customer_name,
  rating,
  quote,
  vehicle_label,
  featured,
  sort_order
) values
  (
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    'David M.',
    5,
    'The team responded quickly on WhatsApp, explained the paperwork clearly, and the CX-5 was exactly as described.',
    'Mazda CX-5',
    true,
    1
  ),
  (
    'ffffffff-ffff-ffff-ffff-ffffffffffff',
    'Janet N.',
    5,
    'I appreciated the honest condition summary and the finance guidance. The viewing process felt organised and professional.',
    'Subaru Forester',
    true,
    2
  ),
  (
    '99999999-9999-9999-9999-999999999999',
    'Eric K.',
    5,
    'Their trade-in conversation was practical, not pushy. I got a fast answer and moved into a better vehicle without unnecessary back and forth.',
    'Toyota Fielder',
    true,
    3
  )
on conflict (id) do nothing;
