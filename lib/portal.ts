import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { PortalContract, PortalData, PortalFile, PortalInvoice, PortalMessage } from "@/lib/portal-types";

export const fallbackPortalData: PortalData = {
  project: {
    id: "demo-project",
    title: "Client portal build",
    slug: "demo-project",
    status: "active"
  },
  freelancer: {
    full_name: "Ali Yılmaz",
    brand_color: "#534AB7",
    avatar_url: null
  },
  files: [
    { id: "file-1", file_name: "homepage-wireframe.pdf", file_url: "", file_size: 2480000, file_type: "pdf", approval_status: "pending" },
    { id: "file-2", file_name: "brand-preview.png", file_url: "", file_size: 980000, file_type: "png", approval_status: "approved" },
    { id: "file-3", file_name: "launch-assets.zip", file_url: "", file_size: 12800000, file_type: "zip", approval_status: "pending" }
  ],
  invoices: [
    {
      id: "invoice-1",
      invoice_number: "INV-2026-004",
      line_items: [
        { description: "Client portal design", quantity: 1, unit_price: 2400 },
        { description: "Supabase integration", quantity: 1, unit_price: 1800 }
      ],
      subtotal: 4200,
      tax_rate: 0,
      total: 4200,
      currency: "USD",
      status: "sent",
      due_date: "2026-05-08",
      stripe_payment_link: "https://stripe.com"
    }
  ],
  messages: [
    { id: "message-1", sender_role: "freelancer", sender_name: "Ali Yılmaz", content: "Yeni dosyaları portala ekledim.", created_at: new Date().toISOString() },
    { id: "message-2", sender_role: "client", sender_name: "Siz", content: "Harika, bugün inceleyeceğim.", created_at: new Date().toISOString() }
  ],
  contract: {
    id: "contract-1",
    content_html: "<h2>Hizmet Sözleşmesi</h2><p>Bu sözleşme proje kapsamını, teslimleri ve ödeme koşullarını içerir.</p>",
    client_signed_at: null,
    client_signature_name: null
  }
};

export async function getPortalData(slug: string): Promise<PortalData | null> {
  try {
    const supabase = createSupabaseAdminClient();
    const { data: project } = await supabase
      .from("projects")
      .select("id,title,slug,status,profiles(full_name,brand_color,avatar_url)")
      .eq("slug", slug)
      .maybeSingle();

    if (!project) {
      return slug === "demo-project" ? fallbackPortalData : null;
    }

    const [filesResult, invoicesResult, messagesResult, contractResult] = await Promise.all([
      supabase.from("files").select("id,file_name,file_url,file_size,file_type,approval_status").eq("project_id", project.id).order("created_at", { ascending: false }),
      supabase.from("invoices").select("id,invoice_number,line_items,subtotal,tax_rate,total,currency,status,due_date,stripe_payment_link").eq("project_id", project.id).order("created_at", { ascending: false }),
      supabase.from("messages").select("id,sender_role,sender_name,content,created_at").eq("project_id", project.id).order("created_at", { ascending: true }),
      supabase.from("contracts").select("id,content_html,client_signed_at,client_signature_name").eq("project_id", project.id).maybeSingle()
    ]);

    const profile = Array.isArray(project.profiles) ? project.profiles[0] : project.profiles;

    return {
      project: {
        id: project.id,
        title: project.title,
        slug: project.slug,
        status: project.status
      },
      freelancer: {
        full_name: profile?.full_name ?? "Ali Yılmaz",
        brand_color: profile?.brand_color ?? "#534AB7",
        avatar_url: profile?.avatar_url ?? null
      },
      files: (filesResult.data ?? []) as PortalFile[],
      invoices: (invoicesResult.data ?? []) as PortalInvoice[],
      messages: (messagesResult.data ?? []) as PortalMessage[],
      contract: (contractResult.data as PortalContract | null) ?? null
    };
  } catch {
    return fallbackPortalData;
  }
}

export async function getPortalDataBySubdomain(subdomain: string, slug: string): Promise<PortalData | null> {
  try {
    const supabase = createSupabaseAdminClient();
    const { data: freelancer } = await supabase
      .from("profiles")
      .select("id,full_name,brand_color,avatar_url")
      .eq("subdomain", subdomain)
      .maybeSingle();

    if (!freelancer) {
      return null;
    }

    const { data: project } = await supabase
      .from("projects")
      .select("id,title,slug,status")
      .eq("freelancer_id", freelancer.id)
      .eq("slug", slug)
      .maybeSingle();

    if (!project) {
      return null;
    }

    const [filesResult, invoicesResult, messagesResult, contractResult] = await Promise.all([
      supabase.from("files").select("id,file_name,file_url,file_size,file_type,approval_status").eq("project_id", project.id).order("created_at", { ascending: false }),
      supabase.from("invoices").select("id,invoice_number,line_items,subtotal,tax_rate,total,currency,status,due_date,stripe_payment_link").eq("project_id", project.id).order("created_at", { ascending: false }),
      supabase.from("messages").select("id,sender_role,sender_name,content,created_at").eq("project_id", project.id).order("created_at", { ascending: true }),
      supabase.from("contracts").select("id,content_html,client_signed_at,client_signature_name").eq("project_id", project.id).maybeSingle()
    ]);

    return {
      project: {
        id: project.id,
        title: project.title,
        slug: project.slug,
        status: project.status
      },
      freelancer: {
        full_name: freelancer.full_name ?? "Ali Yılmaz",
        brand_color: freelancer.brand_color ?? "#534AB7",
        avatar_url: freelancer.avatar_url ?? null
      },
      files: (filesResult.data ?? []) as PortalFile[],
      invoices: (invoicesResult.data ?? []) as PortalInvoice[],
      messages: (messagesResult.data ?? []) as PortalMessage[],
      contract: (contractResult.data as PortalContract | null) ?? null
    };
  } catch {
    return null;
  }
}
