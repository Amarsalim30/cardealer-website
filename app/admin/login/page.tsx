import { LoginForm } from "@/components/admin/login-form";
import { hasSupabaseConfig } from "@/lib/env";

export default function AdminLoginPage() {
  return (
    <section className="section-shell">
      <div className="container-shell">
        <LoginForm demoMode={!hasSupabaseConfig} />
      </div>
    </section>
  );
}
