import { Badge } from "@/components/ui/Badge";
import type { ProjectStatus } from "@/types";

interface ProjectRowProps {
  name: string;
  client: string;
  dueDate: string;
  progress: number;
  status: ProjectStatus;
}

const statusMap: Record<ProjectStatus, { label: string; tone: "success" | "warning" | "muted" }> = {
  active: { label: "Aktif", tone: "success" },
  review: { label: "Incelemede", tone: "warning" },
  completed: { label: "Tamamlandi", tone: "muted" }
};

export function ProjectRow({ name, client, dueDate, progress, status }: ProjectRowProps) {
  const state = statusMap[status];

  return (
    <div className="grid grid-cols-[1fr_140px_120px_96px] items-center gap-4 border-b px-4 py-3 last:border-b-0">
      <div className="min-w-0">
        <p className="truncate font-medium">{name}</p>
        <p className="truncate text-text-secondary">{client}</p>
      </div>
      <Badge tone={state.tone}>{state.label}</Badge>
      <div className="text-text-secondary">{dueDate}</div>
      <div>
        <div className="h-2 rounded-full bg-gray-50">
          <div className="h-2 rounded-full bg-purple-600" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
}
