import { NewProjectModal } from "@/components/dashboard/NewProjectModal";
import { Topbar } from "@/components/dashboard/Topbar";
import { projects } from "@/lib/dashboard-data";
import Link from "next/link";

export default function ProjectsPage() {
  return (
    <>
      <Topbar title="Projeler" action={<NewProjectModal />} />
      <div className="grid gap-[10px]">
        {projects.map((project) => (
          <Link key={project.id} href={`/dashboard/projects/${project.id}`} className="rounded-xl border bg-white p-[14px] hover:border-black/20">
            <div className="flex items-center gap-3">
              <span className="size-2 rounded-full" style={{ backgroundColor: project.color }} />
              <p className="text-[13px] font-medium">{project.title}</p>
              <p className="ml-auto text-[12px] text-text-secondary">{project.client}</p>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
