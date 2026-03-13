import type { Metadata } from "next";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminUnavailableState } from "@/components/admin/admin-unavailable-state";
import { ManageAdminsPanel } from "@/components/admin/manage-admins-panel";
import { Card } from "@/components/ui/card";
import { requireOwnerSession } from "@/lib/auth";
import { hasSupabaseSecretConfig } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AdminProfile } from "@/types/dealership";

export const metadata: Metadata = {
  title: "Manage admins",
  description: "Owner-only controls for granting and revoking admin workspace access.",
};

export default async function AdminsPage() {
  const session = await requireOwnerSession();

  if (session.mode !== "supabase" || !hasSupabaseSecretConfig) {
    return (
      <div className="space-y-6">
        <AdminPageHeader
          eyebrow="Owner controls"
          title="Manage admins"
          description="Only the master account can grant or revoke admin workspace access."
        />
        <AdminUnavailableState
          title="Admin management is not available"
          description="This page needs Supabase auth plus the server-side secret key before owner controls can create or revoke admins."
          retryHref="/admin/admins"
        />
      </div>
    );
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase || !session.userId) {
    return (
      <div className="space-y-6">
        <AdminPageHeader
          eyebrow="Owner controls"
          title="Manage admins"
          description="Only the master account can grant or revoke admin workspace access."
        />
        <AdminUnavailableState
          title="Admin management is not available"
          description="The current Supabase admin session is not ready yet."
          retryHref="/admin/admins"
        />
      </div>
    );
  }

  const { data, error } = await supabase
    .from("admin_profiles")
    .select("id, user_id, email, full_name, role, created_at")
    .order("created_at", { ascending: true });

  if (error) {
    return (
      <div className="space-y-6">
        <AdminPageHeader
          eyebrow="Owner controls"
          title="Manage admins"
          description="Only the master account can grant or revoke admin workspace access."
        />
        <AdminUnavailableState
          title="Admin profiles could not be loaded"
          description={error.message}
          retryHref="/admin/admins"
        />
      </div>
    );
  }

  const admins: AdminProfile[] = (data || [])
    .map((row) => ({
      id: row.id,
      userId: row.user_id,
      email: row.email,
      fullName: row.full_name,
      role: row.role,
      createdAt: row.created_at,
    }))
    .sort((left, right) => {
      if (left.role === right.role) {
        return new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime();
      }

      return left.role === "owner" ? -1 : 1;
    });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Owner controls"
        title="Manage admins"
        description="Grant workspace access to trusted staff, and remove access when someone should no longer reach inventory, leads, or publishing tools."
      />

      <Card className="rounded-[30px] border border-border/70 bg-white/95 px-5 py-4 shadow-[0_18px_42px_rgba(15,23,42,0.05)] sm:px-6">
        <p className="text-sm leading-7 text-stone-600">
          The owner account stays locked on this page. Removing access here revokes
          admin workspace permissions but does not delete the underlying Supabase user.
        </p>
      </Card>

      <ManageAdminsPanel admins={admins} currentUserId={session.userId} />
    </div>
  );
}
