import { v2 as cloudinary } from "cloudinary";

import { env, hasCloudinaryConfig } from "@/lib/env";

if (hasCloudinaryConfig) {
  cloudinary.config({
    cloud_name: env.cloudinaryCloudName,
    api_key: env.cloudinaryApiKey,
    api_secret: env.cloudinaryApiSecret,
  });
}

export async function uploadVehicleImage(file: File) {
  if (!hasCloudinaryConfig) {
    throw new Error("Cloudinary is not configured.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  return new Promise<{ secureUrl: string; publicId: string }>(
    (resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "summit-drive-motors/vehicles",
          resource_type: "image",
        },
        (error, result) => {
          if (error || !result) {
            reject(error || new Error("Upload failed."));
            return;
          }

          resolve({
            secureUrl: result.secure_url,
            publicId: result.public_id,
          });
        },
      );

      stream.end(buffer);
    },
  );
}
