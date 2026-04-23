"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

type ClientOption = {
  id: string;
  name: string;
};

export function NewProjectModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [title, setTitle] = useState("");
  const [clientId, setClientId] = useState("");
  const [slug, setSlug] = useState("");
  const [color, setColor] = useState("#534AB7");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    fetch("/api/clients")
      .then((response) => response.json())
      .then((result: { clients?: Array<{ id: string; name: string }> }) => {
        setClients(result.clients ?? []);
        if (!clientId && result.clients?.[0]) setClientId(result.clients[0].id);
      })
      .catch(() => setClients([]));
  }, [open, clientId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const response = await fetch("/api/projects", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title, clientId, slug, color })
    });
    const result = (await response.json().catch(() => null)) as { error?: string; project?: { id: string } } | null;
    setLoading(false);

    if (!response.ok || !result?.project) {
      setError(result?.error ?? "Proje oluşturulamadı.");
      return;
    }

    setOpen(false);
    router.push(`/dashboard/projects/${result.project.id}`);
    router.refresh();
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} className="px-[14px] py-[6px] text-[12px]">
        <Plus size={14} />
        Yeni proje
      </Button>
      {open ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/20 p-4">
          <Card className="w-full max-w-sm p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-[18px] font-medium leading-[1.6]">Yeni proje</h2>
              <button className="grid size-8 place-items-center text-text-secondary" onClick={() => setOpen(false)} aria-label="Kapat">
                <X size={15} />
              </button>
            </div>
            <form className="space-y-3" onSubmit={handleSubmit}>
              <Input placeholder="Proje adı" required value={title} onChange={(event) => setTitle(event.target.value)} />
              <select className="h-10 w-full rounded-lg border bg-bg-surface px-3 text-body text-text-primary outline-none" value={clientId} onChange={(event) => setClientId(event.target.value)} required>
                <option value="" disabled>Müşteri seç</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>{client.name}</option>
                ))}
              </select>
              <Input placeholder="Portal slug" value={slug} onChange={(event) => setSlug(event.target.value)} />
              <Input placeholder="Renk #534AB7" value={color} onChange={(event) => setColor(event.target.value)} />
              {error ? <p className="text-[12px] text-coral-400">{error}</p> : null}
              <Button type="submit" className="w-full" disabled={loading}>{loading ? "Oluşturuluyor" : "Projeyi oluştur"}</Button>
            </form>
          </Card>
        </div>
      ) : null}
    </>
  );
}
