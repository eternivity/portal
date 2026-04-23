export const dashboardStats = [
  { label: "Aktif projeler", value: "12", detail: "3 bu hafta eklendi" },
  { label: "Bekleyen fatura", value: "$8.420", detail: "5 fatura gönderildi" },
  { label: "Okunmamış mesaj", value: "9", detail: "4 müşteriden" },
  { label: "Depolama", value: "7.8 GB", detail: "20 GB limitinden" }
];

export const projects = [
  {
    id: "brand-portal",
    title: "Brand portal yenileme",
    client: "Nova Studio",
    status: "active",
    color: "#534AB7",
    date: "24 May",
    slug: "nova-brand-portal",
    unread: true
  },
  {
    id: "checkout",
    title: "E-ticaret checkout",
    client: "Mavi Market",
    status: "review",
    color: "#1D9E75",
    date: "02 Jun",
    slug: "mavi-checkout",
    unread: false
  },
  {
    id: "onboarding",
    title: "SaaS onboarding",
    client: "Orbit Labs",
    status: "completed",
    color: "#EF9F27",
    date: "12 Jun",
    slug: "orbit-onboarding",
    unread: true
  },
  {
    id: "invoice-system",
    title: "Fatura otomasyonu",
    client: "Atlas Works",
    status: "active",
    color: "#D85A30",
    date: "18 Jun",
    slug: "atlas-invoices",
    unread: false
  }
] as const;

export const clients = [
  { id: "nova", name: "Nova Studio", email: "hello@novastudio.co", company: "Nova Studio", projectCount: 3, createdAt: "12 Nis 2026" },
  { id: "mavi", name: "Mavi Market", email: "team@mavimarket.com", company: "Mavi Market", projectCount: 2, createdAt: "15 Nis 2026" },
  { id: "orbit", name: "Orbit Labs", email: "ops@orbitlabs.dev", company: "Orbit Labs", projectCount: 4, createdAt: "18 Nis 2026" },
  { id: "atlas", name: "Atlas Works", email: "finance@atlas.works", company: "Atlas Works", projectCount: 1, createdAt: "21 Nis 2026" }
];

export type DashboardProject = (typeof projects)[number];
