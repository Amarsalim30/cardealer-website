"use client";

import Image from "next/image";
import { ArrowUp, ImagePlus, Star, Trash2 } from "lucide-react";
import { useActionState, useEffect, useMemo, useRef, useState } from "react";

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
  uploadState?: "uploaded" | "pending_file" | "pending_url";
  sourceUrl?: string | null;
  pendingFileId?: string | null;
  pendingFileOrder?: number | null;
};

type PendingFile = {
  id: string;
  file: File;
  previewUrl: string;
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
    uploadState: "uploaded",
    sourceUrl: null,
    pendingFileId: null,
    pendingFileOrder: null,
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
  const [stockCode, setStockCode] = useState(vehicle?.stockCode || "");
  const filePickerRef = useRef<HTMLInputElement>(null);
  const stagedFilesInputRef = useRef<HTMLInputElement>(null);
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const pendingFilesRef = useRef<PendingFile[]>([]);

  const serializedImages = useMemo(
    () => JSON.stringify(images),
    [images],
  );

  function normalizeImages(nextImages: EditableImage[]) {
    let pendingFileOrder = 0;
    const heroIndex = nextImages.findIndex((image) => image.isHero);
    const resolvedHeroIndex =
      heroIndex >= 0 ? heroIndex : nextImages.length ? 0 : -1;

    return nextImages.map((image, index) => {
      const normalizedImage: EditableImage = {
        ...image,
        sortOrder: index,
        isHero: index === resolvedHeroIndex,
      };

      if (normalizedImage.uploadState === "pending_file") {
        normalizedImage.pendingFileOrder = pendingFileOrder;
        pendingFileOrder += 1;
      } else {
        normalizedImage.pendingFileOrder = null;
      }

      if (!normalizedImage.uploadState) {
        normalizedImage.uploadState = normalizedImage.cloudinaryPublicId
          ? "uploaded"
          : normalizedImage.sourceUrl
            ? "pending_url"
            : "uploaded";
      }

      return normalizedImage;
    });
  }

  function syncStagedFiles(nextImages: EditableImage[], nextPendingFiles: PendingFile[]) {
    if (!stagedFilesInputRef.current || typeof DataTransfer === "undefined") {
      return;
    }

    const transfer = new DataTransfer();
    const pendingFileLookup = new Map(nextPendingFiles.map((item) => [item.id, item]));

    nextImages
      .filter((image) => image.uploadState === "pending_file" && image.pendingFileId)
      .forEach((image) => {
        const pendingFile = image.pendingFileId
          ? pendingFileLookup.get(image.pendingFileId)
          : null;

        if (pendingFile) {
          transfer.items.add(pendingFile.file);
        }
      });

    stagedFilesInputRef.current.files = transfer.files;
  }

  useEffect(() => {
    syncStagedFiles(images, pendingFiles);
  }, [images, pendingFiles]);

  useEffect(() => {
    pendingFilesRef.current = pendingFiles;
  }, [pendingFiles]);

  useEffect(() => {
    return () => {
      pendingFilesRef.current.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, []);

  function addManualImage() {
    const nextUrl = manualImageUrl.trim();

    if (!nextUrl) {
      return;
    }

    setUploadError("");
    setImages((current) =>
      normalizeImages([
        ...current,
        {
          imageUrl: nextUrl,
          sourceUrl: nextUrl,
          sortOrder: current.length,
          isHero: current.length === 0,
          uploadState: "pending_url",
          pendingFileId: null,
          pendingFileOrder: null,
        },
      ]),
    );
    setManualImageUrl("");
  }

  function uploadFiles(files: FileList | null) {
    if (!files?.length) {
      return;
    }
    setUploadError("");

    const nextPendingFiles = Array.from(files).map((file) => {
      const pendingFileId = crypto.randomUUID();

      return {
        id: pendingFileId,
        file,
        previewUrl: URL.createObjectURL(file),
      } satisfies PendingFile;
    });

    setPendingFiles((current) => [...current, ...nextPendingFiles]);
    setImages((current) =>
      normalizeImages([
        ...current,
        ...nextPendingFiles.map((item, index) => ({
          imageUrl: item.previewUrl,
          cloudinaryPublicId: null,
          sortOrder: current.length + index,
          isHero: current.length + index === 0,
          uploadState: "pending_file" as const,
          pendingFileId: item.id,
          pendingFileOrder: null,
          sourceUrl: null,
        })),
      ]),
    );

    if (filePickerRef.current) {
      filePickerRef.current.value = "";
    }
  }

  function removeImage(index: number) {
    setImages((current) => {
      const removedImage = current[index];

      if (removedImage?.uploadState === "pending_file" && removedImage.pendingFileId) {
        setPendingFiles((pendingCurrent) => {
          const target = pendingCurrent.find(
            (item) => item.id === removedImage.pendingFileId,
          );

          if (target) {
            URL.revokeObjectURL(target.previewUrl);
          }

          return pendingCurrent.filter((item) => item.id !== removedImage.pendingFileId);
        });
      }

      return normalizeImages(current.filter((_, item) => item !== index));
    });
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
      normalizeImages(
        current.map((image, item) => ({
          ...image,
          isHero: item === index,
        })),
      ),
    );
  }

  return (
    <Card className="rounded-[28px] p-6">
      <form action={formAction} className="space-y-8">
        <input type="hidden" name="id" value={vehicle?.id || ""} />
        <input type="hidden" name="imagesJson" value={serializedImages} />
        <input ref={stagedFilesInputRef} type="file" name="pendingFiles" multiple className="hidden" />

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
              Add files or URLs now, then they only go to Cloudinary when you
              save the vehicle. Save without images and sync the folder from the
              edit screen afterwards if you prefer.
            </p>
          </div>

          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="flex-1">
              <Label htmlFor="manual-image">Stage image from URL</Label>
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
              Stage URL
            </button>
            <label className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-full bg-stone-900 px-5 text-sm font-semibold text-white">
              <ImagePlus className="size-4" />
              Stage Files
              <input
                ref={filePickerRef}
                type="file"
                multiple
                className="hidden"
                onChange={(event) => uploadFiles(event.target.files)}
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
                    <p className="mt-1 text-xs font-medium uppercase tracking-[0.18em] text-stone-500">
                      {image.uploadState === "pending_file" || image.uploadState === "pending_url"
                        ? "Uploads on save"
                        : "Saved image"}
                    </p>
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
