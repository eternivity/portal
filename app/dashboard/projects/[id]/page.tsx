import { notFound } from "next/navigation";
import { ProjectWorkspace } from "@/components/dashboard/ProjectWorkspace";
import { getDashboardProjectById } from "@/lib/dashboard-data";

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const project = await getDashboardProjectById(params.id);

  if (!project) {
    notFound();
  }

  return <ProjectWorkspace project={project} />;
}
