import { FileText } from "lucide-react";
import { Card } from "@/components/ui/Card";

interface FileCardProps {
  name: string;
  size: string;
  uploadedAt: string;
}

export function FileCard({ name, size, uploadedAt }: FileCardProps) {
  return (
    <Card className="flex items-center gap-3">
      <div className="grid size-10 place-items-center rounded-lg bg-purple-50 text-purple-600">
        <FileText size={18} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{name}</p>
        <p className="text-text-secondary">{size} · {uploadedAt}</p>
      </div>
    </Card>
  );
}
