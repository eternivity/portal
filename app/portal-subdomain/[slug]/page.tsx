import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { PortalShell } from "@/components/portal/PortalShell";
import { getPortalDataBySubdomain } from "@/lib/portal";

export default async function SubdomainPortalPage({ params }: { params: { slug: string } }) {
  const subdomain = headers().get("x-freelancer-subdomain");

  if (!subdomain) {
    notFound();
  }

  const data = await getPortalDataBySubdomain(subdomain, params.slug);

  if (!data) {
    notFound();
  }

  return <PortalShell data={data} />;
}
