import { NewClientModal } from "@/components/dashboard/NewClientModal";
import { Topbar } from "@/components/dashboard/Topbar";
import { getDashboardClients } from "@/lib/dashboard-data";

export default async function ClientsPage() {
  const clients = await getDashboardClients();

  return (
    <>
      <Topbar title="Müşteriler" action={<NewClientModal />} />

      <div className="overflow-hidden rounded-xl border bg-white">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b bg-bg-secondary">
              {["Ad", "E-posta", "Şirket", "Proje sayısı", "Eklenme tarihi"].map((column) => (
                <th key={column} className="px-[14px] py-3 text-[11px] font-medium uppercase tracking-[0.06em] text-text-secondary">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr key={client.id} className="border-b text-[13px] last:border-b-0 hover:bg-bg-secondary">
                <td className="px-[14px] py-3 font-medium">{client.name}</td>
                <td className="px-[14px] py-3 text-text-secondary">{client.email}</td>
                <td className="px-[14px] py-3 text-text-secondary">{client.company}</td>
                <td className="px-[14px] py-3 text-text-secondary">{client.projectCount}</td>
                <td className="px-[14px] py-3 text-text-secondary">{client.createdAt}</td>
              </tr>
            ))}
            {!clients.length ? (
              <tr>
                <td colSpan={5} className="px-[14px] py-6 text-[13px] text-text-secondary">Henüz müşteri yok.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </>
  );
}
