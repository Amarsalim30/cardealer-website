"use client";

import Image from "next/image";
import { ArrowUp, ImagePlus, LoaderCircle, Star, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  cleanupUploadedVehicleImagesAction,
  saveVehicleAction,
} from "@/lib/actions/admin-actions";
import {
  SUPPORTED_IMAGE_MIME_TYPES,
  VEHICLE_IMAGE_UPLOAD_MAX_FILES,
  validateVehicleImageUpload,
} from "@/lib/vehicle-image-upload";
import { buildVehicleDraftIdentifiers } from "@/lib/vehicle-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type {
  ActionState,
  Location,
  Vehicle,
  VehicleImageInput,
} from "@/types/dealership";
import { cn } from "@/lib/utils";

type EditableImage = {
  imageUrl: string;
  altText?: string | null;
  cloudinaryPublicId?: string | null;
  sortOrder: number;
  isHero: boolean;
  uploadState?: "uploaded" | "pending_file" | "pending_url";
  sourceUrl?: string | null;
  pendingFileId?: string | null;
};

type PendingFile = {
  id: string;
  file: File;
  previewUrl: string;
};

type UploadedPendingFile = {
  publicId: string;
  secureUrl: string;
};

type PreparedUploadPayload = {
  allowedFormats: string[];
  apiKey: string;
  assetFolder: string;
  signature: string;
  slug: string;
  stockCode: string;
  timestamp: number;
  uploadUrl: string;
};

const initialState: ActionState = { success: false, message: "" };
const selectClassName =
  "h-12 w-full rounded-2xl border border-border bg-white px-4 text-sm text-stone-900";

const conditionOptions = [
  "Foreign used",
  "Locally used",
  "Brand new",
  "Trade-in unit",
];

const transmissionOptions = ["Automatic", "Manual", "CVT"];
const fuelTypeOptions = ["Petrol", "Diesel", "Hybrid", "Electric"];
const driveTypeOptions = ["2WD", "4WD", "AWD", "RWD", "FWD"];
const bodyTypeOptions = ["SUV", "Sedan", "Pickup", "Hatchback", "Van", "Coupe"];

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
  }));
}

function getImageLabel(imageUrl: string, fallbackIndex: number) {
  try {
    const pathname = new URL(imageUrl).pathname;
    const filename = pathname.split("/").pop();

    return filename || `Image ${fallbackIndex + 1}`;
  } catch {
    return `Image ${fallbackIndex + 1}`;
  }
}

function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4 border-t border-border/70 pt-6 first:border-t-0 first:pt-0">
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-stone-950">{title}</h3>
        <p className="text-sm text-stone-600">{description}</p>
      </div>
      {children}
    </section>
  );
}

export function VehicleForm({
  locations,
  vehicle,
}: {
  locations: Location[];
  vehicle?: Vehicle | null;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [isSubmitting, startSubmitting] = useTransition();
  const [state, setState] = useState<ActionState>(initialState);
  const [images, setImages] = useState<EditableImage[]>(() =>
    makeEditableImages(vehicle),
  );
  const [uploadError, setUploadError] = useState("");
  const [manualImageUrl, setManualImageUrl] = useState("");
  const [title, setTitle] = useState(vehicle?.title || "");
  const [make, setMake] = useState(vehicle?.make || "");
  const [model, setModel] = useState(vehicle?.model || "");
  const [year, setYear] = useState(vehicle?.year ? String(vehicle.year) : "");
  const filePickerRef = useRef<HTMLInputElement>(null);
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const pendingFilesRef = useRef<PendingFile[]>([]);
  const normalizedImages = useMemo(() => normalizeImages(images), [images]);

  function normalizeImages(nextImages: EditableImage[]) {
    const heroIndex = nextImages.findIndex((image) => image.isHero);
    const resolvedHeroIndex =
      heroIndex >= 0 ? heroIndex : nextImages.length ? 0 : -1;

    return nextImages.map((image, index) => {
      const normalizedImage: EditableImage = {
        ...image,
        sortOrder: index,
        isHero: index === resolvedHeroIndex,
      };

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

  useEffect(() => {
    pendingFilesRef.current = pendingFiles;
  }, [pendingFiles]);

  useEffect(() => {
    return () => {
      pendingFilesRef.current.forEach((item) =>
        URL.revokeObjectURL(item.previewUrl),
      );
    };
  }, []);

  function getFieldError(name: string) {
    return state.fieldErrors?.[name]?.[0];
  }

  function getFieldErrorId(name: string) {
    return `${name}-error`;
  }

  function getFieldProps(name: string) {
    const error = getFieldError(name);

    return {
      "aria-describedby": error ? getFieldErrorId(name) : undefined,
      "aria-invalid": error ? true : undefined,
      className: error ? "border-red-500 focus:border-red-600" : undefined,
    };
  }

  function openFilePicker() {
    filePickerRef.current?.click();
  }

  function setGlobalError(message: string) {
    setState((current) => ({
      ...current,
      message,
      success: false,
    }));
  }

  function ensureImageLimit(nextCount: number) {
    if (nextCount > VEHICLE_IMAGE_UPLOAD_MAX_FILES) {
      throw new Error(
        `Each vehicle can include up to ${VEHICLE_IMAGE_UPLOAD_MAX_FILES} images.`,
      );
    }
  }

  async function prepareCloudinaryUpload() {
    const response = await fetch("/api/admin/cloudinary/sign", {
      body: JSON.stringify({
        id: vehicle?.id || undefined,
        make,
        model,
        title,
        year: Number(year) || 0,
      }),
      headers: {
        "content-type": "application/json",
      },
      method: "POST",
    });
    const data = (await response.json().catch(() => null)) as
      | ({ message?: string } & Partial<PreparedUploadPayload>)
      | null;

    if (!response.ok || !data) {
      throw new Error(
        data?.message || "We could not prepare the Cloudinary upload.",
      );
    }

    return data as PreparedUploadPayload;
  }

  async function uploadFileToCloudinary(
    file: File,
    payload: PreparedUploadPayload,
  ) {
    const cloudinaryFormData = new FormData();
    cloudinaryFormData.set("allowed_formats", payload.allowedFormats.join(","));
    cloudinaryFormData.set("api_key", payload.apiKey);
    cloudinaryFormData.set("asset_folder", payload.assetFolder);
    cloudinaryFormData.set("file", file);
    cloudinaryFormData.set("signature", payload.signature);
    cloudinaryFormData.set("timestamp", String(payload.timestamp));
    cloudinaryFormData.set("unique_filename", "true");
    cloudinaryFormData.set("use_filename", "true");

    const response = await fetch(payload.uploadUrl, {
      body: cloudinaryFormData,
      method: "POST",
    });
    const data = (await response.json().catch(() => null)) as
      | {
          error?: { message?: string };
          public_id?: string;
          secure_url?: string;
        }
      | null;

    if (!response.ok || !data?.public_id || !data.secure_url) {
      throw new Error(data?.error?.message || "Image upload failed.");
    }

    return {
      publicId: data.public_id,
      secureUrl: data.secure_url,
    } satisfies UploadedPendingFile;
  }

  async function uploadPendingFiles() {
    const pendingImages = normalizedImages.filter(
      (image): image is EditableImage & { uploadState: "pending_file"; pendingFileId: string } =>
        image.uploadState === "pending_file" && Boolean(image.pendingFileId),
    );

    if (!pendingImages.length) {
      return {
        newUploadPublicIds: [] as string[],
        preparedUpload: null as PreparedUploadPayload | null,
        uploadedByPendingId: new Map<string, UploadedPendingFile>(),
      };
    }

    const preparedUpload = await prepareCloudinaryUpload();
    const pendingFileLookup = new Map(
      pendingFilesRef.current.map((item) => [item.id, item]),
    );
    const uploadedByPendingId = new Map<string, UploadedPendingFile>();
    const newUploadPublicIds: string[] = [];

    try {
      for (const image of pendingImages) {
        const pendingFile = pendingFileLookup.get(image.pendingFileId);

        if (!pendingFile) {
          throw new Error("One staged file is missing. Add it again and save.");
        }

        validateVehicleImageUpload(pendingFile.file);
        const uploaded = await uploadFileToCloudinary(
          pendingFile.file,
          preparedUpload,
        );
        uploadedByPendingId.set(image.pendingFileId, uploaded);
        newUploadPublicIds.push(uploaded.publicId);
      }
    } catch (error) {
      if (newUploadPublicIds.length) {
        await cleanupUploadedVehicleImagesAction(newUploadPublicIds);
      }

      throw error;
    }

    return {
      newUploadPublicIds,
      preparedUpload,
      uploadedByPendingId,
    };
  }

  function buildSubmissionImages(
    uploadedByPendingId: Map<string, UploadedPendingFile>,
  ): VehicleImageInput[] {
    return normalizedImages.map((image) => {
      if (image.uploadState === "pending_file") {
        const uploaded = image.pendingFileId
          ? uploadedByPendingId.get(image.pendingFileId)
          : null;

        if (!uploaded) {
          throw new Error("One staged file is missing. Add it again and save.");
        }

        return {
          altText: image.altText,
          cloudinaryPublicId: uploaded.publicId,
          imageUrl: uploaded.secureUrl,
          isHero: image.isHero,
          sortOrder: image.sortOrder,
          sourceUrl: null,
          uploadState: "uploaded",
        } satisfies VehicleImageInput;
      }

      if (image.uploadState === "pending_url") {
        return {
          altText: image.altText,
          cloudinaryPublicId: image.cloudinaryPublicId || null,
          imageUrl: image.imageUrl,
          isHero: image.isHero,
          sortOrder: image.sortOrder,
          sourceUrl: image.sourceUrl || image.imageUrl,
          uploadState: "pending_url",
        } satisfies VehicleImageInput;
      }

      return {
        altText: image.altText,
        cloudinaryPublicId: image.cloudinaryPublicId || null,
        imageUrl: image.imageUrl,
        isHero: image.isHero,
        sortOrder: image.sortOrder,
        sourceUrl: null,
        uploadState: "uploaded",
      } satisfies VehicleImageInput;
    });
  }

  async function submitVehicleForm() {
    if (!formRef.current) {
      return;
    }

    setUploadError("");
    setState(initialState);

    try {
      const draftIdentifiers = buildVehicleDraftIdentifiers({
        make,
        model,
        title,
        year: Number(year) || 0,
      });
      const {
        newUploadPublicIds,
        preparedUpload,
        uploadedByPendingId,
      } = await uploadPendingFiles();
      const formData = new FormData(formRef.current);
      formData.set(
        "imagesJson",
        JSON.stringify(buildSubmissionImages(uploadedByPendingId)),
      );
      formData.set("newUploadPublicIdsJson", JSON.stringify(newUploadPublicIds));

      if (preparedUpload) {
        formData.set("resolvedStockCode", preparedUpload.stockCode);
        formData.set("resolvedSlug", preparedUpload.slug);
      } else {
        formData.set("resolvedStockCode", draftIdentifiers.stockCode);
        if (draftIdentifiers.slug) {
          formData.set("resolvedSlug", draftIdentifiers.slug);
        }
      }

      const result = await saveVehicleAction(initialState, formData);
      setState(result);

      if (result.success && result.redirectTo) {
        router.push(result.redirectTo);
        router.refresh();
      }
    } catch (error) {
      setGlobalError(
        error instanceof Error
          ? error.message
          : "We could not save the vehicle right now.",
      );
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startSubmitting(() => {
      void submitVehicleForm();
    });
  }

  function addManualImage() {
    const nextUrl = manualImageUrl.trim();

    if (!nextUrl) {
      return;
    }

    try {
      ensureImageLimit(normalizedImages.length + 1);
      const parsedUrl = new URL(nextUrl);

      if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        throw new Error("Use an http or https image URL.");
      }
    } catch (error) {
      setUploadError(
        error instanceof Error
          ? error.message
          : "Use a valid image URL before staging it.",
      );
      return;
    }

    setUploadError("");
    setState(initialState);
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
        },
      ]),
    );
    setManualImageUrl("");
  }

  function uploadFiles(files: FileList | null) {
    if (!files?.length) {
      return;
    }

    try {
      ensureImageLimit(normalizedImages.length + files.length);

      const nextPendingFiles = Array.from(files).map((file) => {
        validateVehicleImageUpload(file);
        const pendingFileId = crypto.randomUUID();

        return {
          id: pendingFileId,
          file,
          previewUrl: URL.createObjectURL(file),
        } satisfies PendingFile;
      });

      setUploadError("");
      setState(initialState);
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
            sourceUrl: null,
          })),
        ]),
      );
    } catch (error) {
      setUploadError(
        error instanceof Error
          ? error.message
          : "We could not stage the selected image files.",
      );
    }

    if (filePickerRef.current) {
      filePickerRef.current.value = "";
    }
  }

  function removeImage(index: number) {
    setImages((current) => {
      const removedImage = current[index];

      if (
        removedImage?.uploadState === "pending_file" &&
        removedImage.pendingFileId
      ) {
        setPendingFiles((pendingCurrent) => {
          const target = pendingCurrent.find(
            (item) => item.id === removedImage.pendingFileId,
          );

          if (target) {
            URL.revokeObjectURL(target.previewUrl);
          }

          return pendingCurrent.filter(
            (item) => item.id !== removedImage.pendingFileId,
          );
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
    <Card className="rounded-[28px] p-5 sm:p-6">
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-7">
        <input type="hidden" name="id" value={vehicle?.id || ""} />

        <FormSection
          title="Basics"
          description="Keep the key listing fields fast to fill. The reference code and vehicle URL are managed automatically."
        >
          <div className="grid gap-4 xl:grid-cols-3">
            <div className="xl:col-span-2">
              <Label htmlFor="title">Listing title</Label>
              <Input
                id="title"
                name="title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="2018 Range Rover Vogue"
                {...getFieldProps("title")}
              />
              <FieldError
                id={getFieldErrorId("title")}
                error={getFieldError("title")}
              />
            </div>
            <div>
              <Label htmlFor="year">Year</Label>
              <Input
                id="year"
                name="year"
                type="number"
                value={year}
                onChange={(event) => setYear(event.target.value)}
                placeholder="2018"
                {...getFieldProps("year")}
              />
              <FieldError
                id={getFieldErrorId("year")}
                error={getFieldError("year")}
              />
            </div>
            <div>
              <Label htmlFor="make">Make</Label>
              <Input
                id="make"
                name="make"
                value={make}
                onChange={(event) => setMake(event.target.value)}
                placeholder="Toyota"
                {...getFieldProps("make")}
              />
              <FieldError
                id={getFieldErrorId("make")}
                error={getFieldError("make")}
              />
            </div>
            <div>
              <Label htmlFor="model">Model</Label>
              <Input
                id="model"
                name="model"
                value={model}
                onChange={(event) => setModel(event.target.value)}
                placeholder="Land Cruiser V8"
                {...getFieldProps("model")}
              />
              <FieldError
                id={getFieldErrorId("model")}
                error={getFieldError("model")}
              />
            </div>
            <div className="rounded-3xl border border-dashed border-border/70 bg-stone-50 px-4 py-3 text-sm text-stone-600 xl:col-span-3">
              The system keeps the stock code and public vehicle URL in sync
              automatically when you save this listing.
            </div>
          </div>
        </FormSection>

        <FormSection
          title="Listing setup"
          description="These fields control how the vehicle appears in admin and on the live site."
        >
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div>
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                name="price"
                type="number"
                defaultValue={vehicle?.price}
                {...getFieldProps("price")}
              />
              <FieldError
                id={getFieldErrorId("price")}
                error={getFieldError("price")}
              />
            </div>
            <div>
              <Label htmlFor="condition">Condition</Label>
              <Input
                id="condition"
                name="condition"
                defaultValue={vehicle?.condition}
                list="vehicle-condition-options"
                placeholder="Foreign used"
                {...getFieldProps("condition")}
              />
              <FieldError
                id={getFieldErrorId("condition")}
                error={getFieldError("condition")}
              />
            </div>
            <div>
              <Label htmlFor="locationId">Location</Label>
              <select
                id="locationId"
                name="locationId"
                defaultValue={vehicle?.locationId || ""}
                className={cn(selectClassName, getFieldProps("locationId").className)}
                aria-invalid={getFieldProps("locationId")["aria-invalid"]}
                aria-describedby={getFieldProps("locationId")["aria-describedby"]}
              >
                <option value="">Select location</option>
                {locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </select>
              <FieldError
                id={getFieldErrorId("locationId")}
                error={getFieldError("locationId")}
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                name="status"
                defaultValue={vehicle?.status || "draft"}
                className={cn(selectClassName, getFieldProps("status").className)}
                aria-invalid={getFieldProps("status")["aria-invalid"]}
                aria-describedby={getFieldProps("status")["aria-describedby"]}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="sold">Sold</option>
                <option value="unpublished">Unpublished</option>
              </select>
              <FieldError
                id={getFieldErrorId("status")}
                error={getFieldError("status")}
              />
            </div>
            <div>
              <Label htmlFor="stockCategory">Stock category</Label>
              <select
                id="stockCategory"
                name="stockCategory"
                defaultValue={vehicle?.stockCategory || "used"}
                className={cn(
                  selectClassName,
                  getFieldProps("stockCategory").className,
                )}
                aria-invalid={getFieldProps("stockCategory")["aria-invalid"]}
                aria-describedby={getFieldProps("stockCategory")["aria-describedby"]}
              >
                <option value="new">New</option>
                <option value="used">Used</option>
                <option value="imported">Imported</option>
                <option value="available_for_importation">
                  Available for importation
                </option>
                <option value="traded_in">Traded-in</option>
              </select>
              <FieldError
                id={getFieldErrorId("stockCategory")}
                error={getFieldError("stockCategory")}
              />
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
        </FormSection>

        <FormSection
          title="Vehicle details"
          description="Use the common options for speed, but keep the fields open for custom entries when needed."
        >
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div>
              <Label htmlFor="mileage">Mileage</Label>
              <Input
                id="mileage"
                name="mileage"
                type="number"
                defaultValue={vehicle?.mileage}
                {...getFieldProps("mileage")}
              />
              <FieldError
                id={getFieldErrorId("mileage")}
                error={getFieldError("mileage")}
              />
            </div>
            <div>
              <Label htmlFor="transmission">Transmission</Label>
              <Input
                id="transmission"
                name="transmission"
                defaultValue={vehicle?.transmission}
                list="vehicle-transmission-options"
                placeholder="Automatic"
                {...getFieldProps("transmission")}
              />
              <FieldError
                id={getFieldErrorId("transmission")}
                error={getFieldError("transmission")}
              />
            </div>
            <div>
              <Label htmlFor="fuelType">Fuel type</Label>
              <Input
                id="fuelType"
                name="fuelType"
                defaultValue={vehicle?.fuelType}
                list="vehicle-fuel-options"
                placeholder="Petrol"
                {...getFieldProps("fuelType")}
              />
              <FieldError
                id={getFieldErrorId("fuelType")}
                error={getFieldError("fuelType")}
              />
            </div>
            <div>
              <Label htmlFor="driveType">Drive type</Label>
              <Input
                id="driveType"
                name="driveType"
                defaultValue={vehicle?.driveType || ""}
                list="vehicle-drive-options"
                placeholder="4WD"
              />
            </div>
            <div>
              <Label htmlFor="bodyType">Body type</Label>
              <Input
                id="bodyType"
                name="bodyType"
                defaultValue={vehicle?.bodyType || ""}
                list="vehicle-body-options"
                placeholder="SUV"
              />
            </div>
            <div>
              <Label htmlFor="engineCapacity">Engine capacity</Label>
              <Input
                id="engineCapacity"
                name="engineCapacity"
                defaultValue={vehicle?.engineCapacity || ""}
                placeholder="4700cc"
              />
            </div>
            <div>
              <Label htmlFor="color">Color</Label>
              <Input
                id="color"
                name="color"
                defaultValue={vehicle?.color || ""}
                placeholder="White"
              />
            </div>
          </div>
        </FormSection>

        <FormSection
          title="Description"
          description="Keep the copy short and sales-led so the website reads cleanly."
        >
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            defaultValue={vehicle?.description}
            className={cn("min-h-32", getFieldProps("description").className)}
            placeholder="Highlight condition, standout features, viewing location, and the strongest reason to enquire."
            aria-invalid={getFieldProps("description")["aria-invalid"]}
            aria-describedby={getFieldProps("description")["aria-describedby"]}
          />
          <FieldError
            id={getFieldErrorId("description")}
            error={getFieldError("description")}
          />
        </FormSection>

        <FormSection
          title="Gallery"
          description="Stage files or URLs here. Files upload directly to Cloudinary when you save the vehicle."
        >
          <input
            ref={filePickerRef}
            type="file"
            multiple
            accept={SUPPORTED_IMAGE_MIME_TYPES.join(",")}
            className="hidden"
            onChange={(event) => uploadFiles(event.target.files)}
          />

          <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
            <div className="flex-1">
              <Label htmlFor="manual-image">Stage image from URL</Label>
              <Input
                id="manual-image"
                value={manualImageUrl}
                onChange={(event) => setManualImageUrl(event.target.value)}
                placeholder="https://..."
                aria-describedby={
                  uploadError || getFieldError("images")
                    ? "vehicle-gallery-error"
                    : undefined
                }
                aria-invalid={uploadError || getFieldError("images") ? true : undefined}
              />
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={addManualImage}
            >
              <ImagePlus className="size-4" />
              Stage URL
            </Button>
            <Button type="button" variant="dark" onClick={openFilePicker}>
              <ImagePlus className="size-4" />
              Stage Files
            </Button>
          </div>

          <FieldError
            id="vehicle-gallery-error"
            error={uploadError || getFieldError("images")}
            className="text-sm text-red-600"
          />

          {normalizedImages.length ? (
            <div className="grid gap-3">
              {normalizedImages.map((image, index) => {
                const isPending =
                  image.uploadState === "pending_file" ||
                  image.uploadState === "pending_url";

                return (
                  <div
                    key={`${image.imageUrl}-${index}`}
                    className="grid gap-3 rounded-[24px] border border-border bg-white p-3 md:grid-cols-[112px_minmax(0,1fr)_auto] md:items-center"
                  >
                    <div className="relative h-20 overflow-hidden rounded-2xl bg-stone-100">
                      <Image
                        src={image.imageUrl}
                        alt={image.altText || "Vehicle image"}
                        fill
                        sizes="(max-width: 767px) 100vw, 112px"
                        className="object-cover"
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-semibold text-stone-900">
                          {getImageLabel(image.imageUrl, index)}
                        </p>
                        {image.isHero ? <Badge variant="accent">Hero</Badge> : null}
                        <Badge variant={isPending ? "muted" : "success"}>
                          {image.uploadState === "pending_url"
                            ? "Imports on save"
                            : isPending
                              ? "Uploads on save"
                              : "Saved"}
                        </Badge>
                      </div>
                      <p className="mt-1 truncate text-xs text-stone-500">
                        {image.imageUrl}
                      </p>
                      <Input
                        aria-label={`Alt text for image ${index + 1}`}
                        placeholder="Alt text"
                        value={image.altText || ""}
                        onChange={(event) =>
                          setImages((current) =>
                            normalizeImages(
                              current.map((item, itemIndex) =>
                                itemIndex === index
                                  ? { ...item, altText: event.target.value }
                                  : item,
                              ),
                            ),
                          )
                        }
                        className="mt-3 h-10"
                      />
                    </div>

                    <div className="flex items-center gap-2 md:justify-end">
                      <button
                        type="button"
                        className="inline-flex size-10 items-center justify-center rounded-full border border-border"
                        onClick={() => setHero(index)}
                        aria-label="Set hero image"
                      >
                        <Star
                          className={`size-4 ${
                            image.isHero
                              ? "fill-primary text-primary"
                              : "text-stone-500"
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
                );
              })}
            </div>
          ) : (
            <div className="rounded-[24px] border border-dashed border-border bg-stone-50 px-5 py-7 text-sm leading-7 text-stone-600">
              No gallery images yet. You can save the vehicle first, then pull
              the Cloudinary folder later, or stage images now and upload them
              with the save action.
            </div>
          )}
        </FormSection>

        {state.message ? (
          <p
            className={cn(
              "text-sm",
              state.success ? "text-emerald-700" : "text-red-600",
            )}
            role={state.success ? undefined : "alert"}
          >
            {state.message}
          </p>
        ) : null}

        <div className="flex flex-col gap-3 border-t border-border/70 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-stone-600">
            Save once when the listing copy and gallery are ready.
          </p>
          <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting}>
            {isSubmitting ? <LoaderCircle className="size-4 animate-spin" /> : null}
            Save Vehicle
          </Button>
        </div>

        <datalist id="vehicle-condition-options">
          {conditionOptions.map((option) => (
            <option key={option} value={option} />
          ))}
        </datalist>
        <datalist id="vehicle-transmission-options">
          {transmissionOptions.map((option) => (
            <option key={option} value={option} />
          ))}
        </datalist>
        <datalist id="vehicle-fuel-options">
          {fuelTypeOptions.map((option) => (
            <option key={option} value={option} />
          ))}
        </datalist>
        <datalist id="vehicle-drive-options">
          {driveTypeOptions.map((option) => (
            <option key={option} value={option} />
          ))}
        </datalist>
        <datalist id="vehicle-body-options">
          {bodyTypeOptions.map((option) => (
            <option key={option} value={option} />
          ))}
        </datalist>
      </form>
    </Card>
  );
}
