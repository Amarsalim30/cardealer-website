import {
  listAssetsByAssetFolder,
  sortCloudinaryAssets,
} from "./cloudinary-admin.mjs";
import {
  deleteVehicleImagesByIds,
  getVehicleByStockCode,
  listVehicleImages,
  updateVehicleHeroImage,
  upsertVehicleImages,
} from "./supabase-admin.mjs";

function buildAltText(vehicleTitle, stockCode, index) {
  return `${vehicleTitle} ${stockCode} ${
    index === 0 ? "hero image" : `gallery image ${index + 1}`
  }`;
}

function buildAssetFolderCandidates(stockCode, folderPrefix) {
  const normalizedStockCode = stockCode.trim().toUpperCase();
  const lowerStockCode = normalizedStockCode.toLowerCase();

  return [...new Set([
    normalizedStockCode,
    lowerStockCode,
    folderPrefix ? `${folderPrefix}/${normalizedStockCode}` : "",
    folderPrefix ? `${folderPrefix}/${lowerStockCode}` : "",
  ])].filter(Boolean);
}

async function resolveCloudinaryAssets(cloudinaryClient, stockCode, folderPrefix) {
  const candidates = buildAssetFolderCandidates(stockCode, folderPrefix);
  let lastError = null;

  for (const candidate of candidates) {
    try {
      const assets = sortCloudinaryAssets(
        await listAssetsByAssetFolder(cloudinaryClient, candidate),
      );

      if (assets.length) {
        return {
          assetFolder: candidate,
          assets,
        };
      }
    } catch (error) {
      lastError = error;
    }
  }

  const detail = lastError instanceof Error ? ` ${lastError.message}` : "";

  throw new Error(
    `No JPG, JPEG, PNG, or WEBP assets were found for stock code "${stockCode}". Tried folders: ${candidates.join(", ")}.${detail}`,
  );
}

export async function syncVehicleImagesForStockCode({
  cloudinaryClient,
  supabase,
  stockCode,
  folderPrefix = "cars",
  dryRun = false,
}) {
  const normalizedStockCode = stockCode.trim().toUpperCase();
  const vehicle = await getVehicleByStockCode(supabase, normalizedStockCode);
  const { assetFolder, assets } = await resolveCloudinaryAssets(
    cloudinaryClient,
    normalizedStockCode,
    folderPrefix,
  );

  const desiredRows = assets.map((asset, index) => {
    if (!asset.public_id || !asset.secure_url) {
      throw new Error(
        `Cloudinary asset in "${assetFolder}" is missing public_id or secure_url.`,
      );
    }

    return {
      vehicle_id: vehicle.id,
      image_url: asset.secure_url,
      cloudinary_public_id: asset.public_id,
      sort_order: index + 1,
      is_hero: index === 0,
      alt_text: buildAltText(vehicle.title, normalizedStockCode, index),
    };
  });

  const existingRows = await listVehicleImages(supabase, vehicle.id);
  const desiredPublicIds = new Set(
    desiredRows.map((row) => row.cloudinary_public_id),
  );
  const staleImageIds = existingRows
    .filter(
      (row) =>
        row.cloudinary_public_id &&
        !desiredPublicIds.has(row.cloudinary_public_id),
    )
    .map((row) => row.id);

  if (!dryRun) {
    await upsertVehicleImages(supabase, desiredRows);
    await deleteVehicleImagesByIds(supabase, staleImageIds);
    await updateVehicleHeroImage(
      supabase,
      vehicle.id,
      desiredRows[0]?.image_url || null,
    );
  }

  return {
    stockCode: normalizedStockCode,
    vehicleId: vehicle.id,
    vehicleTitle: vehicle.title,
    assetFolder,
    assetsFound: desiredRows.length,
    rowsUpserted: desiredRows.length,
    staleRowsDeleted: staleImageIds.length,
    heroImageUrl: desiredRows[0]?.image_url || null,
    dryRun,
  };
}
