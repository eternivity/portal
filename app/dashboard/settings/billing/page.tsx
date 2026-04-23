import { Button } from "@/components/ui/Button";

const plans = [
  {
    key: "starter",
    name: "Starter",
    price: "$9",
    limit: "3 aktif proje",
    storage: "5GB depolama",
    features: ["3 aktif proje", "5GB depolama", "Temel portal"],
    active: true
  },
  {
    key: "pro",
    name: "Pro",
    price: "$29",
    limit: "Sınırsız proje",
    storage: "10GB depolama",
    features: ["Sınırsız proje", "10GB depolama", "Stripe faturalar"]
  },
  {
    key: "agency",
    name: "Agency",
    price: "$59",
    limit: "Sınırsız + ekip",
    storage: "White-label portal",
    features: ["Ekip üyeleri", "White-label portal", "Öncelikli destek"]
  }
];

function UsageBar({ label, value, detail }: { label: string; value: number; detail: string }) {
  return (
    <div>
      <div className="mb-2 flex justify-between text-[12px]">
        <span className="text-text-secondary">{label}</span>
        <span className="font-medium">{detail}</span>
      </div>
      <div className="h-2 rounded-full bg-purple-100">
        <div className="h-2 rounded-full bg-purple-600" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export default function BillingPage() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-[18px] font-medium">Billing</h1>
        <form action="/api/billing/portal" method="post">
          <Button type="submit">Billing portal</Button>
        </form>
      </div>

      <section className="mb-6 rounded-xl border bg-white p-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-[12px] text-text-secondary">Current plan</p>
            <h2 className="mt-1 text-[18px] font-medium">Starter</h2>
          </div>
          <span className="rounded-full bg-purple-50 px-3 py-1 text-[11px] font-medium text-purple-600">$9/month · Next billing May 23, 2026</span>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <UsageBar label="Projects used" value={100} detail="3/3" />
          <UsageBar label="Storage used" value={64} detail="3.2/5 GB" />
        </div>
      </section>

      <section className="grid grid-cols-3 gap-4">
        {plans.map((plan) => (
          <div key={plan.key} className={`rounded-xl border bg-white p-4 ${plan.active ? "border-purple-600" : ""}`}>
            <h3 className="text-[16px] font-medium">{plan.name}</h3>
            <p className="mt-2 text-[22px] font-medium">{plan.price}<span className="text-[12px] text-text-secondary">/month</span></p>
            <ul className="my-4 space-y-2">
              {plan.features.map((feature) => (
                <li key={feature} className="text-[12px] text-text-secondary">{feature}</li>
              ))}
            </ul>
            <Button disabled={plan.active} variant={plan.active ? "secondary" : "primary"} className="w-full">
              {plan.active ? "Mevcut plan" : "Planı seç"}
            </Button>
          </div>
        ))}
      </section>
    </div>
  );
}
