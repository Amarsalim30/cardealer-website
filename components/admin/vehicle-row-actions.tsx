"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  deleteVehicleAction,
  setVehicleStatusAction,
  toggleVehicleFeaturedAction,
} from "@/lib/actions/admin-actions";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";
import type { ActionState, VehicleStatus } from "@/types/dealership";

const initialState: ActionState = {
  success: false,
  message: "",
};

export function VehicleRowActions({
  featured,
  status,
  vehicleId,
}: {
  featured: boolean;
  status: VehicleStatus;
  vehicleId: string;
}) {
  const router = useRouter();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [featureState, featureAction] = useActionState(
    toggleVehicleFeaturedAction,
    initialState,
  );
  const [statusState, statusAction] = useActionState(
    setVehicleStatusAction,
    initialState,
  );
  const [deleteState, deleteAction] = useActionState(
    deleteVehicleAction,
    initialState,
  );

  useEffect(() => {
    if (featureState.success || statusState.success || deleteState.success) {
      router.refresh();
    }
  }, [
    deleteState.success,
    featureState.success,
    router,
    statusState.success,
  ]);

  const errorMessage =
    (!deleteState.success && deleteState.message) ||
    (!statusState.success && statusState.message) ||
    (!featureState.success && featureState.message) ||
    "";

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 lg:justify-end">
        <form action={featureAction}>
          <input type="hidden" name="id" value={vehicleId} />
          <SubmitButton
            size="sm"
            variant="ghost"
            onClick={() => setConfirmDelete(false)}
          >
            {featured ? "Unfeature" : "Feature"}
          </SubmitButton>
        </form>

        {status !== "published" ? (
          <form action={statusAction}>
            <input type="hidden" name="id" value={vehicleId} />
            <input type="hidden" name="status" value="published" />
            <SubmitButton
              size="sm"
              variant="secondary"
              onClick={() => setConfirmDelete(false)}
            >
              Publish
            </SubmitButton>
          </form>
        ) : (
          <form action={statusAction}>
            <input type="hidden" name="id" value={vehicleId} />
            <input type="hidden" name="status" value="unpublished" />
            <SubmitButton
              size="sm"
              variant="secondary"
              onClick={() => setConfirmDelete(false)}
            >
              Unpublish
            </SubmitButton>
          </form>
        )}

        {status !== "sold" ? (
          <form action={statusAction}>
            <input type="hidden" name="id" value={vehicleId} />
            <input type="hidden" name="status" value="sold" />
            <SubmitButton
              size="sm"
              variant="ghost"
              onClick={() => setConfirmDelete(false)}
            >
              Mark sold
            </SubmitButton>
          </form>
        ) : null}

        {!confirmDelete ? (
          <Button
            size="sm"
            variant="ghost"
            type="button"
            onClick={() => setConfirmDelete(true)}
          >
            Delete
          </Button>
        ) : (
          <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-3 py-2">
            <span className="text-xs font-medium text-red-700">
              Confirm delete?
            </span>
            <form action={deleteAction}>
              <input type="hidden" name="id" value={vehicleId} />
              <SubmitButton
                size="sm"
                className="bg-red-600 px-3 py-2 hover:bg-red-700"
              >
                Confirm
              </SubmitButton>
            </form>
            <Button
              size="sm"
              variant="ghost"
              type="button"
              onClick={() => setConfirmDelete(false)}
            >
              Cancel
            </Button>
          </div>
        )}
      </div>

      {errorMessage ? (
        <p className="text-sm text-red-600" role="alert">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
