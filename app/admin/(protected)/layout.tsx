import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdminSession } from "@/lib/auth";

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdminSession();

  return (
    <AdminShell
      session={session}
      title="Admin workspace"
      description="Manage vehicle listings, publishing state, featured inventory, and incoming leads from one lean dashboard."
    >
      {children}
    </AdminShell>
  );
}
