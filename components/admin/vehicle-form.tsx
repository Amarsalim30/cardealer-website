"use client";

import Image from "next/image";
import { ArrowUp, ImagePlus, LoaderCircle, Star, Trash2 } from "lucide-react";
import { useActionState, useMemo, useRef, useState } from "react";

import { saveVehicleAction } from "@/lib/actions/admin-actions";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/ui/submit-button";
import { Textarea } from "@/components/ui/textarea";
import type { ActionState, Location, Vehicle } from "@/types/dealership";

type EditableImage = {
  imageUrl: string;
  altText?: string | null;
  cloudinaryPublicId?: string | null;
  sortOrder: number;
  isHero: boolean;
};

const initialState: ActionState = { success: false, message: "" };

function makeEditableImages(vehicle?: Vehicle | null): EditableImage[] {
  if (!vehicle) {
    return [];
  }

  return vehicle.images.map((image) => ({
    imageUrl: image.imageUrl,
    altText: image.altText,
    cloudinaryPublicId: image.cloudinaryPublicId,
    sortOrder: image.sortOrder,
    isHero: image.isHero,
  }));
}

export function VehicleForm({
  locations,
  vehicle,
}: {
  locations: Location[];
  vehicle?: Vehicle | null;
}) {
  const [state, formAction] = useActionState(saveVehicleAction, initialState);
  const [images, setImages] = useState<EditableImage[]>(() =>
    makeEditableImages(vehicle),
  );
  const [uploadError, setUploadError] = useState("");
  const [manualImageUrl, setManualImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [stockCode, setStockCode] = useState(vehicle?.stockCode || "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const serializedImages = useMemo(
    () => JSON.stringify(images),
    [images],
  );

  function normalizeImages(nextImages: EditableImage[]) {
    return nextImages.map((image, index) => ({
      ...image,
      sortOrder: index,
      isHero: index === 0 ? true : image.isHero,
    }));
  }

  function addManualImage() {
    const nextUrl = manualImageUrl.trim();

    if (!nextUrl) {
      return;
    }

    setImages((current) =>
      normalizeImages([
        ...current,
        {
          imageUrl: nextUrl,
          sortOrder: current.length,
          isHero: current.length === 0,
        },
      ]),
    );
    setManualImageUrl("");
  }

  async function uploadFiles(files: FileList | null) {
    if (!files?.length) {
      return;
    }

    if (!stockCode.trim()) {
      setUploadError(
        "Enter the stock code first so uploads go into the matching Cloudinary folder.",
      );
      return;
    }

    setUploading(true);
    setUploadError("");

    try {
      const uploadedImages: EditableImage[] = [];

      for (const file of Array.from(files)) {
        const payload = new FormData();
        payload.append("file", file);
        payload.append("stockCode", stockCode);

        const response = await fetch("/api/cloudinary/upload", {
          method: "POST",
          body: payload,
        });

        const result = (await response.json()) as {
          success: boolean;
          url?: string;
          publicId?: string;
          message?: string;
        };

        if (!result.success || !result.url) {
          throw new Error(result.message || "Upload failed.");
        }

        uploadedImages.push({
          imageUrl: result.url,
          cloudinaryPublicId: result.publicId,
          sortOrder: images.length + uploadedImages.length,
          isHero: images.length + uploadedImages.length === 0,
        });
      }

      setImages((current) => normalizeImages([...current, ...uploadedImages]));
    } catch (error) {
      setUploadError(
        error instanceof Error
          ? error.message
          : "Image upload failed. Use image URLs if Cloudinary is not configured.",
      );
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  function removeImage(index: number) {
    setImages((current) => normalizeImages(current.filter((_, item) => item !== index)));
  }

  function moveImageUp(index: number) {
    if (index === 0) {
      return;
    }

    setImages((current) => {
      const next = [...current];
      const target = next[index];
      next[index] = next[index - 1];
      next[index - 1] = target;
      return normalizeImages(next);
    });
  }

  function setHero(index: number) {
    setImages((current) =>
      current.map((image, item) => ({
        ...image,
        isHero: item === index,
      })),
    );
  }

  return (
    <Card className="rounded-[28px] p-6">
      <form action={formAction} className="space-y-8">
        <input type="hidden" name="id" value={vehicle?.id || ""} />
        <input type="hidden" name="imagesJson" value={serializedImages} />

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" defaultValue={vehicle?.title} />
          </div>
          <div>
            <Label htmlFor="stockCode">Stock code</Label>
            <Input
              id="stockCode"
              name="stockCode"
              value={stockCode}
              onChange={(event) => setStockCode(event.target.value)}
              placeholder="CAR-001"
            />
            <p className="mt-2 text-xs leading-6 text-stone-500">
              Match this to the Cloudinary asset folder for the car, such as{" "}
              <strong>car-001</strong> or <strong>KDJ-001</strong>. You can save
              the vehicle first and sync the gallery later from the edit page.
            </p>
          </div>
          <div>
            <Label htmlFor="slug">Slug</Label>
            <Input id="slug" name="slug" defaultValue={vehicle?.slug} />
          </div>
          <div>
            <Label htmlFor="make">Make</Label>
            <Input id="make" name="make" defaultValue={vehicle?.make} />
          </div>
          <div>
            <Label htmlFor="model">Model</Label>
            <Input id="model" name="model" defaultValue={vehicle?.model} />
          </div>
          <div>
            <Label htmlFor="year">Year</Label>
            <Input id="year" name="year" type="number" defaultValue={vehicle?.year} />
          </div>
          <div>
            <Label htmlFor="condition">Condition</Label>
            <Input
              id="condition"
              name="condition"
              defaultValue={vehicle?.condition}
              placeholder="Foreign used"
            />
          </div>
          <div>
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              name="price"
              type="number"
              defaultValue={vehicle?.price}
            />
          </div>
          <div>
            <Label htmlFor="mileage">Mileage</Label>
            <Input
              id="mileage"
              name="mileage"
              type="number"
              defaultValue={vehicle?.mileage}
            />
          </div>
          <div>
            <Label htmlFor="transmission">Transmission</Label>
            <Input
              id="transmission"
              name="transmission"
              defaultValue={vehicle?.transmission}
            />
          </div>
          <div>
            <Label htmlFor="fuelType">Fuel type</Label>
            <Input id="fuelType" name="fuelType" defaultValue={vehicle?.fuelType} />
          </div>
          <div>
            <Label htmlFor="driveType">Drive type</Label>
            <Input id="driveType" name="driveType" defaultValue={vehicle?.driveType || ""} />
          </div>
          <div>
            <Label htmlFor="bodyType">Body type</Label>
            <Input id="bodyType" name="bodyType" defaultValue={vehicle?.bodyType || ""} />
          </div>
          <div>
            <Label htmlFor="engineCapacity">Engine capacity</Label>
            <Input
              id="engineCapacity"
              name="engineCapacity"
              defaultValue={vehicle?.engineCapacity || ""}
            />
          </div>
          <div>
            <Label htmlFor="color">Color</Label>
            <Input id="color" name="color" defaultValue={vehicle?.color || ""} />
          </div>
          <div>
            <Label htmlFor="stockCategory">Stock category</Label>
            <select
              id="stockCategory"
              name="stockCategory"
              defaultValue={vehicle?.stockCategory || "used"}
              className="h-12 w-full rounded-2xl border border-border bg-white px-4 text-sm"
            >
              <option value="new">New</option>
              <option value="used">Used</option>
              <option value="imported">Imported</option>
              <option value="available_for_importation">
                Available for importation
              </option>
              <option value="traded_in">Traded-in</option>
            </select>
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              name="status"
              defaultValue={vehicle?.status || "draft"}
              className="h-12 w-full rounded-2xl border border-border bg-white px-4 text-sm"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="sold">Sold</option>
              <option value="unpublished">Unpublished</option>
            </select>
          </div>
          <div>
            <Label htmlFor="locationId">Location</Label>
            <select
              id="locationId"
              name="locationId"
              defaultValue={vehicle?.locationId || ""}
              className="h-12 w-full rounded-2xl border border-border bg-white px-4 text-sm"
            >
              <option value="">Select location</option>
              {locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
            </select>
          </div>
          <label className="flex items-center gap-3 rounded-2xl border border-border bg-stone-50 px-4 py-3 text-sm font-medium text-stone-700">
            <input
              type="checkbox"
              name="featured"
              defaultChecked={vehicle?.featured}
              className="size-4"
            />
            Featured listing
          </label>
          <label className="flex items-center gap-3 rounded-2xl border border-border bg-stone-50 px-4 py-3 text-sm font-medium text-stone-700">
            <input
              type="checkbox"
              name="negotiable"
              defaultChecked={vehicle?.negotiable}
              className="size-4"
            />
            Price negotiable
          </label>
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            defaultValue={vehicle?.description}
            className="min-h-40"
          />
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm font-semibold text-stone-950">Gallery images</p>
            <p className="mt-2 text-sm leading-7 text-stone-600">
              Upload directly into the stock-code Cloudinary folder, add image
              URLs manually, or save without images and sync the folder from the
              edit screen afterwards.
            </p>
          </div>

          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="flex-1">
              <Label htmlFor="manual-image">Add image by URL</Label>
              <Input
                id="manual-image"
                value={manualImageUrl}
                onChange={(event) => setManualImageUrl(event.target.value)}
                placeholder="https://..."
              />
            </div>
            <button
              type="button"
              onClick={addManualImage}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-border px-5 text-sm font-semibold text-stone-700"
            >
              <ImagePlus className="size-4" />
              Add URL
            </button>
            <label className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-full bg-stone-900 px-5 text-sm font-semibold text-white">
              {uploading ? <LoaderCircle className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
              Upload
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(event) => void uploadFiles(event.target.files)}
              />
            </label>
          </div>

          {uploadError ? <p className="text-sm text-red-600">{uploadError}</p> : null}

          {images.length ? (
            <div className="grid gap-4">
              {images.map((image, index) => (
                <div
                  key={`${image.imageUrl}-${index}`}
                  className="flex flex-col gap-4 rounded-3xl border border-border bg-stone-50 p-4 md:flex-row md:items-center"
                >
                  <div className="relative h-24 w-full overflow-hidden rounded-2xl md:w-40">
                    <Image
                      src={image.imageUrl}
                      alt={image.altText || "Vehicle image"}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-stone-800">{image.imageUrl}</p>
                    <Input
                      placeholder="Alt text"
                      value={image.altText || ""}
                      onChange={(event) =>
                        setImages((current) =>
                          current.map((item, itemIndex) =>
                            itemIndex === index
                              ? { ...item, altText: event.target.value }
                              : item,
                          ),
                        )
                      }
                      className="mt-3"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="inline-flex size-10 items-center justify-center rounded-full border border-border"
                      onClick={() => setHero(index)}
                      aria-label="Set hero image"
                    >
                      <Star
                        className={`size-4 ${
                          image.isHero ? "fill-primary text-primary" : "text-stone-500"
                        }`}
                      />
                    </button>
                    <button
                      type="button"
                      className="inline-flex size-10 items-center justify-center rounded-full border border-border"
                      onClick={() => moveImageUp(index)}
                      aria-label="Move image up"
                    >
                      <ArrowUp className="size-4 text-stone-500" />
                    </button>
                    <button
                      type="button"
                      className="inline-flex size-10 items-center justify-center rounded-full border border-border"
                      onClick={() => removeImage(index)}
                      aria-label="Remove image"
                    >
                      <Trash2 className="size-4 text-stone-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-[24px] border border-dashed border-border bg-stone-50 px-5 py-8 text-sm leading-7 text-stone-600">
              No gallery images yet. You can save the vehicle now and sync the
              Cloudinary folder from the edit screen, or upload images after the
              stock code is set.
            </div>
          )}
        </div>

        {state.message ? (
          <p className={`text-sm ${state.success ? "text-emerald-700" : "text-red-600"}`}>
            {state.message}
          </p>
        ) : null}

        <SubmitButton className="w-full sm:w-auto">Save Vehicle</SubmitButton>
      </form>
    </Card>
  );
}
