import { LoginForm } from "@/components/admin/login-form";
import { allowDemoAdmin } from "@/lib/env";

export default function AdminLoginPage() {
  return (
    <section className="section-shell">
      <div className="container-shell">
        <LoginForm demoMode={allowDemoAdmin} />
      </div>
    </section>
  );
}
