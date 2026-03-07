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

  return (
    <div className="space-y-4">
      <div className="relative aspect-[16/11] overflow-hidden rounded-[32px] border border-border bg-white">
        <Image
          src={activeImage?.imageUrl || images[0]?.imageUrl}
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
