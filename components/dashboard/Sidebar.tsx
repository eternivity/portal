"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/helpers";

const navItems = [
  { label: "Dashboard", href: "/dashboard", color: "#AFA9EC" },
  { label: "Projeler", href: "/dashboard/projects", color: "#5DCAA5" },
  { label: "Müşteriler", href: "/dashboard/clients", color: "#EF9F27" },
  { label: "Faturalar", href: "/dashboard/invoices", color: "#F0997B" },
  { label: "Dosyalar", href: "/dashboard/files", color: "#85B7EB" },
  { label: "Mesajlar", href: "/dashboard/messages", color: "#ED93B1", unread: 4 },
  { label: "Ayarlar", href: "/dashboard/settings", color: "#DAD8D1" }
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 flex w-[200px] flex-col border-r bg-bg-surface">
      <div className="mb-5 p-4">
        <div className="flex items-center gap-2">
          <span className="inline-block h-[22px] w-[22px] rounded-md bg-purple-600" />
          <span className="text-[15px] font-medium">PortalKit</span>
        </div>
      </div>

      <nav>
        {navItems.map((item) => {
          const active = item.href === "/dashboard" ? pathname === item.href : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex cursor-pointer items-center gap-[9px] px-4 py-[7px] text-[13px] text-text-secondary hover:bg-bg-secondary",
                active && "bg-bg-secondary font-medium text-text-primary"
              )}
            >
              <span className="h-[15px] w-[15px] flex-shrink-0 rounded-sm" style={{ background: item.color }} />
              <span className="truncate">{item.label}</span>
              {item.unread ? (
                <span className="ml-auto rounded-full bg-coral-400 px-[6px] py-[1px] text-[10px] font-medium leading-[1.6] text-coral-50">
                  {item.unread}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t px-4 py-3">
        <div className="flex items-center gap-3">
          <Avatar name="Emre Aydin" />
          <div className="min-w-0">
            <p className="truncate text-[12px] font-medium leading-[1.6]">Emre Aydin</p>
            <p className="truncate text-[11px] leading-[1.6] text-text-secondary">Pro plan</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
