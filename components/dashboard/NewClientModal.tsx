"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

export function NewClientModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const response = await fetch("/api/clients", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, email, company })
    });

    const result = (await response.json().catch(() => null)) as { error?: string } | null;
    setLoading(false);

    if (!response.ok) {
      setError(result?.error ?? "Müşteri oluşturulamadı.");
      return;
    }

    setOpen(false);
    setName("");
    setEmail("");
    setCompany("");
    router.refresh();
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} className="px-[14px] py-[6px] text-[12px]">
        <Plus size={14} />
        Müşteri ekle
      </Button>
      {open ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/20 p-4">
          <Card className="w-full max-w-sm p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-[18px] font-medium leading-[1.6]">Müşteri ekle</h2>
              <button className="grid size-8 place-items-center text-text-secondary" onClick={() => setOpen(false)} aria-label="Kapat">
                <X size={15} />
              </button>
            </div>
            <form className="space-y-3" onSubmit={handleSubmit}>
              <Input placeholder="Ad" required value={name} onChange={(event) => setName(event.target.value)} />
              <Input type="email" placeholder="E-posta" required value={email} onChange={(event) => setEmail(event.target.value)} />
              <Input placeholder="Şirket" value={company} onChange={(event) => setCompany(event.target.value)} />
              {error ? <p className="text-[12px] text-coral-400">{error}</p> : null}
              <Button type="submit" className="w-full" disabled={loading}>{loading ? "Kaydediliyor" : "Müşteriyi ekle"}</Button>
            </form>
          </Card>
        </div>
      ) : null}
    </>
  );
}
