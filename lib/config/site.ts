import type { HomeStats } from "@/types/dealership";

export const siteConfig = {
  name: "Ocean Motors",
  shortName: "Ocean Motors",
  description:
    "Browse used, imported, and traded-in cars in Mombasa with stronger trust signals, clear pricing, and fast enquiry options.",
  tagline: "Trusted cars. Faster answers. Better buying confidence in Mombasa.",
  phoneDisplay: "+254 700 123 456",
  phoneHref: "tel:+254700123456",
  whatsappNumber: "254700123456",
  whatsappLabel: "Chat on WhatsApp",
  email: "hello@oceanmotors.demo",
  salesEmail: "sales@oceanmotors.demo",
  address: "Kizingo, Mombasa",
  region: "Mombasa, Kenya",
  hoursLabel: "Mon - Sat, 8:00 AM - 6:00 PM",
  socialLinks: {
    facebook: "#",
    instagram: "#",
    x: "#",
  },
  primaryCtaLabel: "Get Today's Price",
  inventorySearchDefaults: {
    sort: "latest",
    pageSize: 9,
  },
  demoAdmin: {
    email: "admin@oceanmotors.demo",
    password: "demo-admin",
  },
} as const;

export const homeStats: HomeStats = {
  inStockCount: 15,
  deliveredCount: 180,
  financePartners: 4,
  responseTime: "10 min",
};

export const navigationLinks = [
  { href: "/", label: "Home" },
  { href: "/inventory", label: "Inventory" },
  { href: "/inventory/new", label: "New Cars" },
  { href: "/inventory/used", label: "Used Cars" },
  { href: "/inventory/imported", label: "Imported Units" },
  { href: "/financing", label: "Financing" },
  { href: "/trade-in", label: "Trade-In" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];
