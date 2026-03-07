import { listCloudinaryVehicleAssets } from "@/lib/cloudinary";
import { sortByNewest } from "@/lib/utils";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  applyInventoryFilters,
  buildFacets,
  createVehicleFromInput,
  paginateVehicles,
} from "@/lib/data/filters";
import { getDemoState } from "@/lib/data/demo-store";
import type {
  InventoryQuery,
  LeadInboxFilter,
  LeadInboxItem,
  LeadInput,
  LeadRecord,
  Location,
  Review,
  TestDriveRequest,
  TestDriveRequestInput,
  TradeInRequest,
  TradeInRequestInput,
  Vehicle,
  VehicleFormInput,
} from "@/types/dealership";

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

type WriteOptions = {
  forceDemo?: boolean;
};

type SupabaseClient =
  | NonNullable<ReturnType<typeof createSupabasePublicClient>>
  | NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>>;

function mapSupabaseVehicleRow(row: Record<string, unknown>): Vehicle {
  const locationRow = row.locations as Record<string, unknown> | null;
  const imageRows = (row.vehicle_images || []) as Array<Record<string, unknown>>;

  return {
    id: String(row.id),
    title: String(row.title),
    stockCode: String(row.stock_code),
    slug: String(row.slug),
    make: String(row.make),
    model: String(row.model),
    year: Number(row.year),
    condition: String(row.condition),
    price: Number(row.price),
    negotiable: Boolean(row.negotiable),
    mileage: Number(row.mileage),
    transmission: String(row.transmission),
    fuelType: String(row.fuel_type),
    driveType: row.drive_type ? String(row.drive_type) : null,
    bodyType: row.body_type ? String(row.body_type) : null,
    engineCapacity: row.engine_capacity ? String(row.engine_capacity) : null,
    color: row.color ? String(row.color) : null,
    locationId: row.location_id ? String(row.location_id) : null,
    location: locationRow
      ? {
          id: String(locationRow.id),
          name: String(locationRow.name),
          addressLine: String(locationRow.address_line),
          city: String(locationRow.city),
          phone: String(locationRow.phone),
          email: locationRow.email ? String(locationRow.email) : null,
          hours: String(locationRow.hours),
          mapUrl: locationRow.map_url ? String(locationRow.map_url) : null,
          isPrimary: Boolean(locationRow.is_primary),
          createdAt: String(locationRow.created_at),
        }
      : null,
    featured: Boolean(row.featured),
    status: row.status as Vehicle["status"],
    stockCategory: row.stock_category as Vehicle["stockCategory"],
    description: String(row.description),
    heroImageUrl: row.hero_image_url ? String(row.hero_image_url) : null,
    images: imageRows
      .map((image) => ({
        id: String(image.id),
        vehicleId: String(image.vehicle_id),
        imageUrl: String(image.image_url),
        altText: image.alt_text ? String(image.alt_text) : null,
        cloudinaryPublicId: image.cloudinary_public_id
          ? String(image.cloudinary_public_id)
          : null,
        sortOrder: Number(image.sort_order),
        isHero: Boolean(image.is_hero),
        createdAt: String(image.created_at),
      }))
      .sort((left, right) => left.sortOrder - right.sortOrder),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

async function selectAllVehicleRows(client: SupabaseClient) {
  const { data, error } = await client
    .from("vehicles")
    .select("*, locations(*), vehicle_images(*)")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data || []) as Array<Record<string, unknown>>;
}

async function selectVehicleRowById(client: SupabaseClient, id: string) {
  const { data, error } = await client
    .from("vehicles")
    .select("*, locations(*), vehicle_images(*)")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as Record<string, unknown> | null;
}

async function selectVehicleRowByStockCode(
  client: SupabaseClient,
  stockCode: string,
) {
  const { data, error } = await client
    .from("vehicles")
    .select("*, locations(*), vehicle_images(*)")
    .eq("stock_code", stockCode)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as Record<string, unknown> | null;
}

function buildSyncedVehicleImages(vehicle: Vehicle, assets: Awaited<ReturnType<typeof listCloudinaryVehicleAssets>>["assets"]) {
  const timestamp = new Date().toISOString();

  return assets.map((asset, index) => ({
    id: `${vehicle.id}-image-${index + 1}`,
    vehicleId: vehicle.id,
    imageUrl: asset.secureUrl,
    altText:
      index === 0
        ? `${vehicle.title} hero image`
        : `${vehicle.title} gallery image ${index + 1}`,
    cloudinaryPublicId: asset.publicId,
    sortOrder: index,
    isHero: index === 0,
    createdAt: timestamp,
  })) satisfies Vehicle["images"];
}

export async function getLocations() {
  const supabase = createSupabasePublicClient();

  if (!supabase) {
    return clone(getDemoState().locations);
  }

  const { data, error } = await supabase
    .from("locations")
    .select("*")
    .order("is_primary", { ascending: false });

  if (error) {
    console.error("[supabase] Failed to fetch locations", error.message);
    return clone(getDemoState().locations);
  }

  return (data || []).map((row) => ({
    id: row.id,
    name: row.name,
    addressLine: row.address_line,
    city: row.city,
    phone: row.phone,
    email: row.email,
    hours: row.hours,
    mapUrl: row.map_url,
    isPrimary: row.is_primary,
    createdAt: row.created_at,
  })) satisfies Location[];
}

export async function getReviews() {
  const supabase = createSupabasePublicClient();

  if (!supabase) {
    return clone(getDemoState().reviews);
  }

  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("featured", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("[supabase] Failed to fetch reviews", error.message);
    return clone(getDemoState().reviews);
  }

  return (data || []).map((row) => ({
    id: row.id,
    customerName: row.customer_name,
    rating: row.rating,
    quote: row.quote,
    vehicleLabel: row.vehicle_label,
    featured: row.featured,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
  })) satisfies Review[];
}

export async function getAllVehicles() {
  const supabase = createSupabasePublicClient();

  if (!supabase) {
    return clone(getDemoState().vehicles);
  }

  try {
    const rows = await selectAllVehicleRows(supabase);
    return rows.map(mapSupabaseVehicleRow);
  } catch (error) {
    console.error(
      "[supabase] Failed to fetch vehicles",
      error instanceof Error ? error.message : error,
    );
    return clone(getDemoState().vehicles);
  }
}

export async function getHomepageCollections() {
  const vehicles = await getAllVehicles();
  const publicVehicles = vehicles.filter((vehicle) => vehicle.status === "published");

  return {
    featured: publicVehicles.filter((vehicle) => vehicle.featured).slice(0, 4),
    latest: sortByNewest(publicVehicles).slice(0, 4),
    imported: publicVehicles
      .filter((vehicle) =>
        ["imported", "available_for_importation"].includes(vehicle.stockCategory),
      )
      .slice(0, 4),
    tradedIn: publicVehicles
      .filter((vehicle) => vehicle.stockCategory === "traded_in")
      .slice(0, 4),
    sold: vehicles.filter((vehicle) => vehicle.status === "sold").slice(0, 3),
  };
}

export async function listInventory(query: InventoryQuery) {
  const vehicles = await getAllVehicles();
  const filtered = applyInventoryFilters(vehicles, query);
  return paginateVehicles(filtered, query);
}

export async function getInventoryFacets() {
  const vehicles = await getAllVehicles();
  const publicVehicles = vehicles.filter((vehicle) => vehicle.status === "published");
  return buildFacets(publicVehicles);
}

export async function getVehicleBySlug(slug: string) {
  const vehicles = await getAllVehicles();
  return (
    vehicles.find(
      (vehicle) => vehicle.slug === slug && vehicle.status === "published",
    ) || null
  );
}

export async function getVehicleById(id: string) {
  const serverClient = await createSupabaseServerClient();

  if (serverClient) {
    try {
      const row = await selectVehicleRowById(serverClient, id);

      if (row) {
        return mapSupabaseVehicleRow(row);
      }
    } catch (error) {
      console.error(
        "[supabase] Failed to fetch vehicle by id",
        error instanceof Error ? error.message : error,
      );
    }
  }

  const vehicles = await getAllVehicles();
  return vehicles.find((vehicle) => vehicle.id === id) || null;
}

export async function getSimilarVehicles(vehicle: Vehicle, limit = 3) {
  const vehicles = await getAllVehicles();

  return vehicles
    .filter(
      (item) =>
        item.id !== vehicle.id &&
        item.status === "published" &&
        (item.make === vehicle.make ||
          item.stockCategory === vehicle.stockCategory),
    )
    .slice(0, limit);
}

export async function getAdminVehicles() {
  const serverClient = await createSupabaseServerClient();

  if (!serverClient) {
    return getAllVehicles();
  }

  try {
    const rows = await selectAllVehicleRows(serverClient);
    return rows.map(mapSupabaseVehicleRow);
  } catch (error) {
    console.error(
      "[supabase] Failed to fetch admin vehicles",
      error instanceof Error ? error.message : error,
    );
    return getAllVehicles();
  }
}

export async function saveVehicle(input: VehicleFormInput, options: WriteOptions = {}) {
  const locations = await getLocations();
  const existing = input.id ? await getVehicleById(input.id) : null;
  const nextVehicle = createVehicleFromInput(input, existing || undefined, locations);
  const serverClient = await createSupabaseServerClient();

  if (options.forceDemo || !serverClient) {
    const state = getDemoState();
    const index = state.vehicles.findIndex((vehicle) => vehicle.id === nextVehicle.id);

    if (index >= 0) {
      state.vehicles[index] = nextVehicle;
    } else {
      state.vehicles.unshift(nextVehicle);
    }

    return nextVehicle;
  }

  const { error: vehicleError } = await serverClient.from("vehicles").upsert({
    id: nextVehicle.id,
    title: nextVehicle.title,
    stock_code: nextVehicle.stockCode,
    slug: nextVehicle.slug,
    make: nextVehicle.make,
    model: nextVehicle.model,
    year: nextVehicle.year,
    condition: nextVehicle.condition,
    price: nextVehicle.price,
    negotiable: nextVehicle.negotiable,
    mileage: nextVehicle.mileage,
    transmission: nextVehicle.transmission,
    fuel_type: nextVehicle.fuelType,
    drive_type: nextVehicle.driveType,
    body_type: nextVehicle.bodyType,
    engine_capacity: nextVehicle.engineCapacity,
    color: nextVehicle.color,
    location_id: nextVehicle.locationId,
    featured: nextVehicle.featured,
    status: nextVehicle.status,
    stock_category: nextVehicle.stockCategory,
    description: nextVehicle.description,
    hero_image_url: nextVehicle.heroImageUrl,
    updated_at: nextVehicle.updatedAt,
  });

  if (vehicleError) {
    throw vehicleError;
  }

  await serverClient.from("vehicle_images").delete().eq("vehicle_id", nextVehicle.id);

  const { error: imagesError } = await serverClient.from("vehicle_images").insert(
    nextVehicle.images.map((image) => ({
      id: image.id,
      vehicle_id: nextVehicle.id,
      cloudinary_public_id: image.cloudinaryPublicId,
      image_url: image.imageUrl,
      alt_text: image.altText,
      sort_order: image.sortOrder,
      is_hero: image.isHero,
      created_at: image.createdAt,
    })),
  );

  if (imagesError) {
    throw imagesError;
  }

  return nextVehicle;
}

export async function getVehicleByStockCode(stockCode: string) {
  const serverClient = await createSupabaseServerClient();

  if (serverClient) {
    try {
      const row = await selectVehicleRowByStockCode(serverClient, stockCode);

      if (row) {
        return mapSupabaseVehicleRow(row);
      }
    } catch (error) {
      console.error(
        "[supabase] Failed to fetch vehicle by stock code",
        error instanceof Error ? error.message : error,
      );
    }
  }

  const vehicles = await getAllVehicles();
  return (
    vehicles.find(
      (vehicle) => vehicle.stockCode.toLowerCase() === stockCode.toLowerCase(),
    ) || null
  );
}

export async function syncVehicleImagesFromCloudinary(
  id: string,
  options: WriteOptions = {},
) {
  const vehicle = await getVehicleById(id);

  if (!vehicle) {
    throw new Error("Vehicle not found.");
  }

  const { assetFolder, assets } = await listCloudinaryVehicleAssets(vehicle.stockCode);
  const syncedImages = buildSyncedVehicleImages(vehicle, assets);
  const heroImageUrl = syncedImages[0]?.imageUrl || null;
  const updatedAt = new Date().toISOString();
  const serverClient = await createSupabaseServerClient();

  if (options.forceDemo || !serverClient) {
    const state = getDemoState();
    const target = state.vehicles.find((item) => item.id === id);

    if (!target) {
      throw new Error("Vehicle not found in demo state.");
    }

    target.images = syncedImages;
    target.heroImageUrl = heroImageUrl;
    target.updatedAt = updatedAt;

    return {
      vehicle: clone(target),
      assetFolder,
      syncedCount: syncedImages.length,
    };
  }

  const { error: deleteError } = await serverClient
    .from("vehicle_images")
    .delete()
    .eq("vehicle_id", vehicle.id);

  if (deleteError) {
    throw deleteError;
  }

  const { error: insertError } = await serverClient.from("vehicle_images").insert(
    syncedImages.map((image) => ({
      vehicle_id: vehicle.id,
      cloudinary_public_id: image.cloudinaryPublicId,
      image_url: image.imageUrl,
      alt_text: image.altText,
      sort_order: image.sortOrder,
      is_hero: image.isHero,
      created_at: image.createdAt,
    })),
  );

  if (insertError) {
    throw insertError;
  }

  const { error: updateError } = await serverClient
    .from("vehicles")
    .update({
      hero_image_url: heroImageUrl,
      updated_at: updatedAt,
    })
    .eq("id", vehicle.id);

  if (updateError) {
    throw updateError;
  }

  return {
    vehicle:
      (await getVehicleById(id)) || {
        ...vehicle,
        images: syncedImages,
        heroImageUrl,
        updatedAt,
      },
    assetFolder,
    syncedCount: syncedImages.length,
  };
}

export async function updateVehicleStatus(
  id: string,
  status: Vehicle["status"],
  options: WriteOptions = {},
) {
  const serverClient = await createSupabaseServerClient();

  if (options.forceDemo || !serverClient) {
    const state = getDemoState();
    const vehicle = state.vehicles.find((item) => item.id === id);

    if (vehicle) {
      vehicle.status = status;
      vehicle.updatedAt = new Date().toISOString();
    }

    return vehicle || null;
  }

  await serverClient
    .from("vehicles")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);

  return getVehicleById(id);
}

export async function toggleVehicleFeatured(id: string, options: WriteOptions = {}) {
  const existing = await getVehicleById(id);
  if (!existing) {
    return null;
  }

  const nextFeatured = !existing.featured;
  const serverClient = await createSupabaseServerClient();

  if (options.forceDemo || !serverClient) {
    const state = getDemoState();
    const vehicle = state.vehicles.find((item) => item.id === id);

    if (vehicle) {
      vehicle.featured = nextFeatured;
      vehicle.updatedAt = new Date().toISOString();
    }

    return vehicle || null;
  }

  await serverClient
    .from("vehicles")
    .update({ featured: nextFeatured, updated_at: new Date().toISOString() })
    .eq("id", id);

  return getVehicleById(id);
}

export async function deleteVehicle(id: string, options: WriteOptions = {}) {
  const serverClient = await createSupabaseServerClient();

  if (options.forceDemo || !serverClient) {
    const state = getDemoState();
    state.vehicles = state.vehicles.filter((vehicle) => vehicle.id !== id);
    return;
  }

  await serverClient.from("vehicle_images").delete().eq("vehicle_id", id);
  await serverClient.from("vehicles").delete().eq("id", id);
}

export async function saveLead(input: LeadInput) {
  const record: LeadRecord = {
    ...input,
    id: `lead-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };

  const serverClient = await createSupabaseServerClient();

  if (!serverClient) {
    getDemoState().leads.unshift(record);
    return record;
  }

  const { error } = await serverClient.from("leads").insert({
    vehicle_id: input.vehicleId || null,
    lead_type: input.leadType,
    name: input.name,
    phone: input.phone,
    email: input.email || null,
    message: input.message || null,
    source: input.source || null,
    utm_source: input.utmSource || null,
    utm_medium: input.utmMedium || null,
    utm_campaign: input.utmCampaign || null,
  });

  if (error) {
    throw error;
  }

  return record;
}

export async function saveTestDriveRequest(input: TestDriveRequestInput) {
  const record: TestDriveRequest = {
    ...input,
    id: `test-drive-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };

  const serverClient = await createSupabaseServerClient();

  if (!serverClient) {
    getDemoState().testDriveRequests.unshift(record);
    return record;
  }

  const { error } = await serverClient.from("test_drive_requests").insert({
    vehicle_id: input.vehicleId || null,
    name: input.name,
    phone: input.phone,
    email: input.email || null,
    preferred_date: input.preferredDate || null,
    preferred_time: input.preferredTime || null,
    message: input.message || null,
  });

  if (error) {
    throw error;
  }

  return record;
}

export async function saveTradeInRequest(input: TradeInRequestInput) {
  const record: TradeInRequest = {
    ...input,
    id: `trade-in-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };

  const serverClient = await createSupabaseServerClient();

  if (!serverClient) {
    getDemoState().tradeInRequests.unshift(record);
    return record;
  }

  const { error } = await serverClient.from("trade_in_requests").insert({
    desired_vehicle_id: input.desiredVehicleId || null,
    name: input.name,
    phone: input.phone,
    email: input.email || null,
    current_vehicle_make: input.currentVehicleMake,
    current_vehicle_model: input.currentVehicleModel,
    current_vehicle_year: input.currentVehicleYear,
    current_vehicle_mileage: input.currentVehicleMileage || null,
    condition_notes: input.conditionNotes || null,
    message: input.message || null,
  });

  if (error) {
    throw error;
  }

  return record;
}

function toLeadInboxItems(
  leads: LeadRecord[],
  testDriveRequests: TestDriveRequest[],
  tradeInRequests: TradeInRequest[],
) {
  const leadItems: LeadInboxItem[] = leads.map((item) => ({
    id: item.id,
    type: item.leadType,
    name: item.name,
    phone: item.phone,
    email: item.email,
    message: item.message,
    vehicleTitle: item.vehicleTitle,
    source: item.source,
    createdAt: item.createdAt,
    meta: {
      leadType: item.leadType,
      pageSource: item.source,
    },
  }));

  const testDriveItems: LeadInboxItem[] = testDriveRequests.map((item) => ({
    id: item.id,
    type: "test_drive",
    name: item.name,
    phone: item.phone,
    email: item.email,
    message: item.message,
    vehicleTitle: item.vehicleTitle,
    source: item.source,
    createdAt: item.createdAt,
    meta: {
      preferredDate: item.preferredDate,
      preferredTime: item.preferredTime,
    },
  }));

  const tradeInItems: LeadInboxItem[] = tradeInRequests.map((item) => ({
    id: item.id,
    type: "trade_in",
    name: item.name,
    phone: item.phone,
    email: item.email,
    message: item.message,
    vehicleTitle: item.desiredVehicleTitle,
    source: item.source,
    createdAt: item.createdAt,
    meta: {
      currentVehicle: `${item.currentVehicleYear} ${item.currentVehicleMake} ${item.currentVehicleModel}`,
      mileage: item.currentVehicleMileage,
      notes: item.conditionNotes,
    },
  }));

  return [...leadItems, ...testDriveItems, ...tradeInItems].sort(
    (left, right) =>
      new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  );
}

async function fetchLeadTables() {
  const serverClient = await createSupabaseServerClient();
  if (!serverClient) {
    const state = getDemoState();
    return {
      leads: clone(state.leads),
      testDriveRequests: clone(state.testDriveRequests),
      tradeInRequests: clone(state.tradeInRequests),
    };
  }

  const [leadsResult, testDriveResult, tradeInResult, vehicles] = await Promise.all([
    serverClient.from("leads").select("*").order("created_at", { ascending: false }),
    serverClient
      .from("test_drive_requests")
      .select("*")
      .order("created_at", { ascending: false }),
    serverClient
      .from("trade_in_requests")
      .select("*")
      .order("created_at", { ascending: false }),
    getAdminVehicles(),
  ]);

  const vehicleLookup = new Map(vehicles.map((vehicle) => [vehicle.id, vehicle.title]));

  return {
    leads: ((leadsResult.data || []) as Array<Record<string, unknown>>).map(
      (row) => ({
        id: String(row.id),
        vehicleId: row.vehicle_id ? String(row.vehicle_id) : undefined,
        vehicleTitle: row.vehicle_id
          ? vehicleLookup.get(String(row.vehicle_id))
          : undefined,
        leadType: row.lead_type as LeadRecord["leadType"],
        name: String(row.name),
        phone: String(row.phone),
        email: row.email ? String(row.email) : undefined,
        message: row.message ? String(row.message) : undefined,
        source: row.source ? String(row.source) : undefined,
        utmSource: row.utm_source ? String(row.utm_source) : undefined,
        utmMedium: row.utm_medium ? String(row.utm_medium) : undefined,
        utmCampaign: row.utm_campaign ? String(row.utm_campaign) : undefined,
        createdAt: String(row.created_at),
      }),
    ),
    testDriveRequests: (
      (testDriveResult.data || []) as Array<Record<string, unknown>>
    ).map((row) => ({
      id: String(row.id),
      vehicleId: row.vehicle_id ? String(row.vehicle_id) : undefined,
      vehicleTitle: row.vehicle_id
        ? vehicleLookup.get(String(row.vehicle_id))
        : undefined,
      name: String(row.name),
      phone: String(row.phone),
      email: row.email ? String(row.email) : undefined,
      preferredDate: row.preferred_date ? String(row.preferred_date) : undefined,
      preferredTime: row.preferred_time ? String(row.preferred_time) : undefined,
      message: row.message ? String(row.message) : undefined,
      source: "Admin inbox",
      createdAt: String(row.created_at),
    })),
    tradeInRequests: (
      (tradeInResult.data || []) as Array<Record<string, unknown>>
    ).map((row) => ({
      id: String(row.id),
      desiredVehicleId: row.desired_vehicle_id
        ? String(row.desired_vehicle_id)
        : undefined,
      desiredVehicleTitle: row.desired_vehicle_id
        ? vehicleLookup.get(String(row.desired_vehicle_id))
        : undefined,
      name: String(row.name),
      phone: String(row.phone),
      email: row.email ? String(row.email) : undefined,
      currentVehicleMake: String(row.current_vehicle_make),
      currentVehicleModel: String(row.current_vehicle_model),
      currentVehicleYear: Number(row.current_vehicle_year),
      currentVehicleMileage: row.current_vehicle_mileage
        ? Number(row.current_vehicle_mileage)
        : undefined,
      conditionNotes: row.condition_notes ? String(row.condition_notes) : undefined,
      message: row.message ? String(row.message) : undefined,
      source: "Admin inbox",
      createdAt: String(row.created_at),
    })),
  };
}

export async function getLeadInbox(filter: LeadInboxFilter = "all") {
  const tables = await fetchLeadTables();
  const items = toLeadInboxItems(
    tables.leads,
    tables.testDriveRequests,
    tables.tradeInRequests,
  );

  if (filter === "all") {
    return items;
  }

  return items.filter((item) => item.type === filter);
}
