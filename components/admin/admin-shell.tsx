import Link from "next/link";

import { logoutAdminAction } from "@/lib/actions/admin-actions";
import { Button } from "@/components/ui/button";
import type { AdminSession } from "@/types/dealership";

const adminLinks = [
  { href: "/admin/vehicles", label: "Vehicles" },
  { href: "/admin/vehicles/new", label: "Add Vehicle" },
  { href: "/admin/leads", label: "Leads" },
];

export function AdminShell({
  session,
  title,
  description,
  children,
}: {
  session: AdminSession;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="container-shell section-shell">
      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="surface-card rounded-[28px] border border-border bg-white/95 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
            Admin
          </p>
          <h1 className="mt-3 display-font text-3xl text-stone-950">
            Summit Drive
          </h1>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            Signed in as {session.name} ({session.mode})
          </p>

          <nav className="mt-8 grid gap-2">
            {adminLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-2xl px-4 py-3 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-100"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <form action={logoutAdminAction} className="mt-8">
            <Button variant="secondary" className="w-full">
              Sign out
            </Button>
          </form>
        </aside>

        <section className="space-y-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
              Dashboard
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-stone-950">{title}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-stone-600">
              {description}
            </p>
          </div>
          {children}
        </section>
      </div>
    </div>
  );
}
