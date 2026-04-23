import { Card } from "@/components/ui/Card";

interface StatCardProps {
  label: string;
  value: string;
  detail: string;
}

export function StatCard({ label, value, detail }: StatCardProps) {
  return (
    <Card className="bg-bg-secondary">
      <p className="label text-text-hint">{label}</p>
      <p className="mt-3 text-2xl font-medium leading-tight">{value}</p>
      <p className="mt-1 text-body text-text-secondary">{detail}</p>
    </Card>
  );
}
