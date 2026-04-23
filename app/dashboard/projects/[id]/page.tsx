import { notFound } from "next/navigation";
import { ProjectWorkspace } from "@/components/dashboard/ProjectWorkspace";
import { projects } from "@/lib/dashboard-data";

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const project = projects.find((item) => item.id === params.id);

  if (!project) {
    notFound();
  }

  return <ProjectWorkspace project={project} />;
}
