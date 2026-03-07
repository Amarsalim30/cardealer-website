import Link from "next/link";

import {
  deleteVehicleAction,
  setVehicleStatusAction,
  toggleVehicleFeaturedAction,
} from "@/lib/actions/admin-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getAdminVehicles } from "@/lib/data/repository";
import { formatCurrency, humanizeStatus } from "@/lib/utils";

export default async function AdminVehiclesPage() {
  const vehicles = await getAdminVehicles();

  return (
    <Card className="overflow-hidden rounded-[28px]">
      <div className="flex flex-col gap-4 border-b border-border bg-stone-50 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xl font-semibold text-stone-950">Vehicles</h3>
          <p className="mt-1 text-sm text-stone-600">
            Create, edit, publish, mark sold, and highlight vehicles.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/vehicles/new">Add Vehicle</Link>
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-stone-100 text-stone-600">
            <tr>
              <th className="px-6 py-4 font-semibold">Vehicle</th>
              <th className="px-6 py-4 font-semibold">Category</th>
              <th className="px-6 py-4 font-semibold">Price</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((vehicle) => (
              <tr key={vehicle.id} className="border-t border-border/70 align-top">
                <td className="px-6 py-5">
                  <p className="font-semibold text-stone-950">{vehicle.title}</p>
                  <p className="mt-1 text-stone-600">{vehicle.location?.name || "No location"}</p>
                </td>
                <td className="px-6 py-5 text-stone-700">
                  <Badge variant="accent">{vehicle.stockCategory.replaceAll("_", " ")}</Badge>
                </td>
                <td className="px-6 py-5 text-stone-700">
                  {formatCurrency(vehicle.price)}
                </td>
                <td className="px-6 py-5 text-stone-700">
                  {humanizeStatus(vehicle.status)}
                  {vehicle.featured ? (
                    <Badge variant="muted" className="mt-3">
                      Featured
                    </Badge>
                  ) : null}
                </td>
                <td className="px-6 py-5">
                  <div className="flex flex-wrap gap-2">
                    <Button asChild size="sm" variant="secondary">
                      <Link href={`/admin/vehicles/${vehicle.id}`}>Edit</Link>
                    </Button>
                    <form action={toggleVehicleFeaturedAction}>
                      <input type="hidden" name="id" value={vehicle.id} />
                      <Button size="sm" variant="secondary">
                        {vehicle.featured ? "Unfeature" : "Feature"}
                      </Button>
                    </form>
                    {vehicle.status !== "published" ? (
                      <form action={setVehicleStatusAction}>
                        <input type="hidden" name="id" value={vehicle.id} />
                        <input type="hidden" name="status" value="published" />
                        <Button size="sm">Publish</Button>
                      </form>
                    ) : (
                      <form action={setVehicleStatusAction}>
                        <input type="hidden" name="id" value={vehicle.id} />
                        <input type="hidden" name="status" value="unpublished" />
                        <Button size="sm" variant="secondary">
                          Unpublish
                        </Button>
                      </form>
                    )}
                    {vehicle.status !== "sold" ? (
                      <form action={setVehicleStatusAction}>
                        <input type="hidden" name="id" value={vehicle.id} />
                        <input type="hidden" name="status" value="sold" />
                        <Button size="sm" variant="secondary">
                          Mark Sold
                        </Button>
                      </form>
                    ) : null}
                    <form action={deleteVehicleAction}>
                      <input type="hidden" name="id" value={vehicle.id} />
                      <Button size="sm" variant="secondary">
                        Delete
                      </Button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
