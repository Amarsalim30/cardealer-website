import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Admin",
    template: "%s | Ocean Motors Admin",
  },
  description: "Operations workspace for inventory, leads, and listing management.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(24,24,27,0.08),_transparent_28%),linear-gradient(180deg,_#f5f7fa,_#e9eef4_56%,_#eff3f8)] text-stone-950">
      {children}
    </div>
  );
}
