import type { Metadata } from "next";

import { LoginForm } from "@/components/admin/login-form";
import { allowDemoAdmin } from "@/lib/env";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Secure admin access for Ocean Motors inventory and lead operations.",
};

export default function AdminLoginPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl items-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid w-full gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-center">
        <section className="rounded-[36px] border border-white/70 bg-[linear-gradient(160deg,_rgba(16,24,40,0.98),_rgba(28,37,54,0.94))] p-7 text-stone-100 shadow-[0_28px_70px_rgba(15,23,42,0.18)] sm:p-8 lg:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-300">
            Ocean Motors admin
          </p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight text-white sm:text-5xl">
            Run listings and enquiries from one focused workspace.
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-7 text-stone-300">
            Keep stock live, react to new customer intent faster, and avoid the
            distraction of the public storefront while you work.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              "Inventory publishing",
              "Lead triage",
              "Media and listing control",
            ].map((item) => (
              <div
                key={item}
                className="rounded-[24px] border border-white/10 bg-white/5 px-4 py-4 text-sm font-medium text-stone-100"
              >
                {item}
              </div>
            ))}
          </div>
        </section>

        <div className="lg:justify-self-end lg:w-full lg:max-w-xl">
          <LoginForm demoMode={allowDemoAdmin} />
        </div>
      </div>
    </main>
  );
}
