import { notFound } from "next/navigation";
import { PortalShell } from "@/components/portal/PortalShell";
import { getPortalData } from "@/lib/portal";

export default async function PortalPage({ params }: { params: { slug: string } }) {
  const data = await getPortalData(params.slug);

  if (!data) {
    notFound();
  }

  return <PortalShell data={data} />;
}
