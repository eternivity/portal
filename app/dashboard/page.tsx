import Link from "next/link";
import { NewProjectModal } from "@/components/dashboard/NewProjectModal";
import { Topbar } from "@/components/dashboard/Topbar";
import { getDashboardProjects, getDashboardStats } from "@/lib/dashboard-data";
import { cn } from "@/lib/helpers";

const statusStyles = {
  active: "bg-teal-50 text-teal-600",
  review: "bg-amber-50 text-amber-600",
  completed: "bg-gray-50 text-gray-600"
};

const statusLabels = {
  active: "Aktif",
  review: "İnceleme",
  completed: "Tamamlandı"
};

export default async function DashboardPage() {
  const [stats, projects] = await Promise.all([getDashboardStats(), getDashboardProjects()]);

  return (
    <>
      <Topbar title="Dashboard" action={<NewProjectModal />} />

      <section className="mb-6 grid grid-cols-1 gap-[10px] sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border bg-white p-[14px]">
            <p className="mb-[6px] text-[11px] leading-[1.6] text-text-secondary">{stat.label}</p>
            <p className="text-[22px] font-medium leading-tight text-text-primary">{stat.value}</p>
            <p className="mt-[3px] text-[11px] leading-[1.6] text-text-secondary">{stat.detail}</p>
          </div>
        ))}
      </section>

      <section>
        <p className="mb-3 text-[12px] font-medium uppercase leading-[1.6] tracking-[0.06em] text-text-secondary">Projeler</p>
        <div className="space-y-[10px]">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/dashboard/projects/${project.id}`}
              className="flex cursor-pointer items-center gap-3 rounded-xl border bg-white px-[14px] py-3 hover:border-black/20"
            >
              <span className="size-2 rounded-full" style={{ backgroundColor: project.color }} />
              <span className="min-w-0 flex-1 truncate text-[13px] font-medium">{project.title}</span>
              <span className="w-[110px] truncate text-[12px] text-text-secondary">{project.client}</span>
              <span className={cn("rounded-full px-2 py-1 text-[10px] font-medium leading-[1.6]", statusStyles[project.status])}>
                {statusLabels[project.status]}
              </span>
              <span className="w-[70px] text-right text-[11px] text-text-secondary">{project.date}</span>
              <span className={cn("size-[6px] rounded-full", project.unread ? "bg-coral-400" : "bg-transparent")} />
            </Link>
          ))}
          {!projects.length ? <div className="rounded-xl border bg-white p-6 text-[13px] text-text-secondary">Henüz proje yok.</div> : null}
        </div>
      </section>
    </>
  );
}
