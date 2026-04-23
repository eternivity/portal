import { createSupabaseServerClient } from "@/lib/supabase/server";

export type DashboardStat = {
  label: string;
  value: string;
  detail: string;
};

export type DashboardProject = {
  id: string;
  title: string;
  client: string;
  clientId: string;
  status: "active" | "review" | "completed";
  color: string;
  date: string;
  slug: string;
  unread: boolean;
};

export type DashboardClient = {
  id: string;
  name: string;
  email: string;
  company: string;
  projectCount: number;
  createdAt: string;
};

export type DashboardProjectFile = {
  id: string;
  file_name: string;
  file_url: string;
  file_size: number | null;
  file_type: string | null;
  approval_status: "pending" | "approved" | "changes_requested";
};

export type DashboardProjectDetail = DashboardProject & {
  freelancerName: string;
  subdomain: string | null;
  files: DashboardProjectFile[];
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "short"
  }).format(new Date(value));
}

function formatLongDate(value: string) {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(value));
}

function formatCompactCurrency(value: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(value);
}

function formatStorage(bytes: number) {
  const gb = bytes / 1024 / 1024 / 1024;
  return `${gb.toFixed(1)} GB`;
}

function storageLimitForPlan(plan: string | null) {
  if (plan === "starter") return 5;
  if (plan === "pro") return 10;
  return 50;
}

async function getAuthenticatedUser() {
  const supabase = createSupabaseServerClient();
  const [{ data: authData }, { data: profile }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from("profiles").select("id,full_name,subdomain,plan").maybeSingle()
  ]);

  return {
    supabase,
    userId: authData.user?.id ?? profile?.id ?? null,
    profile
  };
}

export async function getDashboardProjects() {
  const { supabase, userId } = await getAuthenticatedUser();
  if (!userId) return [] as DashboardProject[];

  const { data: projectsData } = await supabase
    .from("projects")
    .select("id,title,status,color,slug,created_at,client_id,clients(name)")
    .eq("freelancer_id", userId)
    .order("created_at", { ascending: false });

  const projectIds = (projectsData ?? []).map((project) => project.id);
  const { data: messages } = projectIds.length
    ? await supabase.from("messages").select("project_id,sender_role").in("project_id", projectIds).eq("sender_role", "client")
    : { data: [] };

  const unreadMap = new Set((messages ?? []).map((message) => message.project_id));

  return (projectsData ?? []).map((project) => {
    const client = Array.isArray(project.clients) ? project.clients[0] : project.clients;
    return {
      id: project.id,
      title: project.title,
      client: client?.name ?? "Müşteri",
      clientId: project.client_id,
      status: (project.status ?? "active") as DashboardProject["status"],
      color: project.color ?? "#534AB7",
      date: formatDate(project.created_at),
      slug: project.slug,
      unread: unreadMap.has(project.id)
    };
  });
}

export async function getDashboardStats() {
  const { supabase, userId, profile } = await getAuthenticatedUser();
  if (!userId) return [] as DashboardStat[];

  const [{ data: projects }, { data: invoices }, { data: messages }, { data: files }] = await Promise.all([
    supabase.from("projects").select("id,status,created_at,client_id").eq("freelancer_id", userId),
    supabase.from("invoices").select("id,status,total,currency").eq("freelancer_id", userId),
    supabase
      .from("messages")
      .select("id,project_id,sender_role,projects!inner(freelancer_id,client_id)")
      .eq("sender_role", "client")
      .eq("projects.freelancer_id", userId),
    supabase
      .from("files")
      .select("file_size,projects!inner(freelancer_id)")
      .eq("projects.freelancer_id", userId)
  ]);

  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(now.getDate() - 7);

  const activeProjects = (projects ?? []).filter((project) => project.status !== "archived");
  const addedThisWeek = (projects ?? []).filter((project) => new Date(project.created_at) >= weekAgo).length;
  const pendingInvoices = (invoices ?? []).filter((invoice) => invoice.status !== "paid");
  const pendingTotal = pendingInvoices.reduce((sum, invoice) => sum + Number(invoice.total ?? 0), 0);
  const sentCount = (invoices ?? []).filter((invoice) => invoice.status !== "draft").length;
  const unreadMessages = messages?.length ?? 0;
  const uniqueClientProjects = new Set((messages ?? []).map((message) => message.project_id)).size;
  const storageBytes = (files ?? []).reduce((sum, file) => sum + Number(file.file_size ?? 0), 0);
  const storageLimit = storageLimitForPlan(profile?.plan ?? "starter");

  return [
    { label: "Aktif projeler", value: String(activeProjects.length), detail: `${addedThisWeek} bu hafta eklendi` },
    { label: "Bekleyen fatura", value: formatCompactCurrency(pendingTotal), detail: `${sentCount} fatura gönderildi` },
    { label: "Okunmamış mesaj", value: String(unreadMessages), detail: `${uniqueClientProjects} müşteriden` },
    { label: "Depolama", value: formatStorage(storageBytes), detail: `${storageLimit} GB limitinden` }
  ] satisfies DashboardStat[];
}

export async function getDashboardClients() {
  const { supabase, userId } = await getAuthenticatedUser();
  if (!userId) return [] as DashboardClient[];

  const { data: clientsData } = await supabase
    .from("clients")
    .select("id,name,email,company,created_at")
    .eq("freelancer_id", userId)
    .order("created_at", { ascending: false });

  const clientIds = (clientsData ?? []).map((client) => client.id);
  const { data: projects } = clientIds.length
    ? await supabase.from("projects").select("id,client_id").in("client_id", clientIds).eq("freelancer_id", userId)
    : { data: [] };

  return (clientsData ?? []).map((client) => ({
    id: client.id,
    name: client.name,
    email: client.email,
    company: client.company ?? "-",
    projectCount: (projects ?? []).filter((project) => project.client_id === client.id).length,
    createdAt: formatLongDate(client.created_at)
  }));
}

export async function getDashboardProjectById(projectId: string) {
  const { supabase, userId, profile } = await getAuthenticatedUser();
  if (!userId) return null;

  const { data: project } = await supabase
    .from("projects")
    .select("id,title,status,color,slug,created_at,client_id,clients(name)")
    .eq("freelancer_id", userId)
    .eq("id", projectId)
    .maybeSingle();

  if (!project) return null;

  const [{ data: messages }, { data: files }] = await Promise.all([
    supabase.from("messages").select("project_id,sender_role").eq("project_id", project.id).eq("sender_role", "client"),
    supabase
      .from("files")
      .select("id,file_name,file_url,file_size,file_type,approval_status")
      .eq("project_id", project.id)
      .order("created_at", { ascending: false })
  ]);

  const client = Array.isArray(project.clients) ? project.clients[0] : project.clients;

  return {
    id: project.id,
    title: project.title,
    client: client?.name ?? "Müşteri",
    clientId: project.client_id,
    status: (project.status ?? "active") as DashboardProject["status"],
    color: project.color ?? "#534AB7",
    date: formatDate(project.created_at),
    slug: project.slug,
    unread: Boolean(messages?.length),
    freelancerName: profile?.full_name ?? "Freelancer",
    subdomain: profile?.subdomain ?? null,
    files: (files ?? []) as DashboardProjectFile[]
  } satisfies DashboardProjectDetail;
}
