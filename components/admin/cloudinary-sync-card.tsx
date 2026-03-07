"use client";

import { Images } from "lucide-react";
import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { syncVehicleImagesAction } from "@/lib/actions/admin-actions";
import { Card } from "@/components/ui/card";
import { SubmitButton } from "@/components/ui/submit-button";
import type { ActionState } from "@/types/dealership";

const initialState: ActionState = {
  success: false,
  message: "",
};

export function CloudinarySyncCard({
  vehicleId,
  stockCode,
}: {
  vehicleId: string;
  stockCode: string;
}) {
  const router = useRouter();
  const [state, formAction] = useActionState(
    syncVehicleImagesAction,
    initialState,
  );

  useEffect(() => {
    if (state.success) {
      router.refresh();
    }
  }, [router, state.success]);

  return (
    <Card className="rounded-[28px] border border-border bg-stone-50 p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
            Cloudinary folder sync
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-stone-950">
            Pull gallery images from the stock-code folder
          </h2>
          <p className="mt-3 text-sm leading-7 text-stone-600">
            This replaces the current gallery with images from the Cloudinary
            folder that matches the stock code, such as <strong>{stockCode}</strong>{" "}
            or <strong>{stockCode.toLowerCase()}</strong>. Save text changes first,
            then sync the folder when you want the gallery refreshed.
          </p>
        </div>

        <form action={formAction} className="shrink-0">
          <input type="hidden" name="id" value={vehicleId} />
          <SubmitButton>
            <Images className="size-4" />
            Sync Folder Images
          </SubmitButton>
        </form>
      </div>

      {state.message ? (
        <p
          className={`mt-4 text-sm ${
            state.success ? "text-emerald-700" : "text-red-600"
          }`}
        >
          {state.message}
        </p>
      ) : null}
    </Card>
  );
}
