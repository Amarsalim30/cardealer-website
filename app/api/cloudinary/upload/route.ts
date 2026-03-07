import { NextResponse } from "next/server";

import { uploadVehicleImage } from "@/lib/cloudinary";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");
  const stockCode = String(formData.get("stockCode") || "").trim();

  if (!(file instanceof File)) {
    return NextResponse.json(
      { success: false, message: "No file uploaded." },
      { status: 400 },
    );
  }

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
    const result = await uploadVehicleImage(file, { stockCode });

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
