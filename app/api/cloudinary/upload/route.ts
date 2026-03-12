import { NextResponse } from "next/server";

import { uploadVehicleImage, uploadVehicleImageFromUrl } from "@/lib/cloudinary";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");
  const sourceUrl = String(formData.get("sourceUrl") || "").trim();
  const stockCode = String(formData.get("stockCode") || "").trim();

  if (!stockCode) {
    return NextResponse.json(
      {
        success: false,
        message: "Add the stock code first so the upload goes into the correct Cloudinary folder.",
      },
      { status: 400 },
    );
  }

  try {
    const result =
      file instanceof File
        ? await uploadVehicleImage(file, { stockCode })
        : sourceUrl
          ? await uploadVehicleImageFromUrl(sourceUrl, { stockCode })
          : null;

    if (!result) {
      return NextResponse.json(
        { success: false, message: "Add a file or image URL first." },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      url: result.secureUrl,
      publicId: result.publicId,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Image upload failed.",
      },
      { status: 500 },
    );
  }
}
