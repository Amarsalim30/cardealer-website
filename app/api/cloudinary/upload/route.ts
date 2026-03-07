import { NextResponse } from "next/server";

import { uploadVehicleImage } from "@/lib/cloudinary";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json(
      { success: false, message: "No file uploaded." },
      { status: 400 },
    );
  }

  try {
    const result = await uploadVehicleImage(file);

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
