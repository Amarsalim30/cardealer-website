"use client";

import Image from "next/image";
import { useState } from "react";

import type { VehicleImage } from "@/types/dealership";

export function VehicleGallery({
  images,
  title,
}: {
  images: VehicleImage[];
  title: string;
}) {
  const [activeImage, setActiveImage] = useState(images[0]);
  const primaryImage = activeImage?.imageUrl || images[0]?.imageUrl;

  if (!primaryImage) {
    return (
      <div className="rounded-[32px] border border-border bg-[linear-gradient(135deg,#f5f5f4,white)] p-10 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
          Gallery pending
        </p>
        <h2 className="mt-4 text-3xl font-semibold text-stone-950">{title}</h2>
        <p className="mt-4 text-sm leading-7 text-stone-600">
          Images for this vehicle have not been synced yet. Use the admin stock
          code workflow to pull the Cloudinary folder into the listing.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative aspect-[16/11] overflow-hidden rounded-[32px] border border-border bg-white">
        <Image
          src={primaryImage}
          alt={activeImage?.altText || title}
          fill
          className="object-cover"
        />
      </div>

      <div className="grid grid-cols-4 gap-3">
        {images.map((image) => (
          <button
            key={image.id}
            type="button"
            className={`relative aspect-[4/3] overflow-hidden rounded-2xl border ${
              activeImage?.id === image.id
                ? "border-primary"
                : "border-border"
            }`}
            onClick={() => setActiveImage(image)}
          >
            <Image
              src={image.imageUrl}
              alt={image.altText || title}
              fill
              className="object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
