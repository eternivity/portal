"use client";

import { ChangeEvent, DragEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/helpers";
import { createSupabaseBrowserClient } from "@/lib/supabase";

const swatches = ["#534AB7", "#1D9E75", "#EF9F27", "#D85A30", "#378ADD", "#D4537E"];
const subdomainPattern = /^[a-z0-9](?:[a-z0-9-]{1,61}[a-z0-9])$/;
type Availability = "idle" | "checking" | "available" | "taken" | "invalid";

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [userId, setUserId] = useState("");
  const [step, setStep] = useState(1);
  const [subdomain, setSubdomain] = useState("");
  const [availability, setAvailability] = useState<Availability>("idle");
  const [brandColor, setBrandColor] = useState("#534AB7");
  const [avatarPath, setAvatarPath] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientCompany, setClientCompany] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace("/auth/login");
        return;
      }
      setUserId(data.user.id);
    });
  }, [router, supabase]);

  useEffect(() => {
    const slug = subdomain.trim().toLowerCase();
    if (!slug) {
      setAvailability("idle");
      return;
    }
    if (!subdomainPattern.test(slug)) {
      setAvailability("invalid");
      return;
    }
    setAvailability("checking");
    const timeout = window.setTimeout(async () => {
      const response = await fetch(`/api/check-subdomain?slug=${encodeURIComponent(slug)}`);
      const result = (await response.json()) as { available: boolean; valid: boolean };
      setAvailability(result.valid ? (result.available ? "available" : "taken") : "invalid");
    }, 400);
    return () => window.clearTimeout(timeout);
  }, [subdomain]);

  async function saveSubdomain() {
    if (availability !== "available" || !userId) return;
    setLoading(true);
    setError("");
    const { error: updateError } = await supabase.from("profiles").update({ subdomain: subdomain.trim().toLowerCase() }).eq("id", userId);
    setLoading(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setStep(2);
  }

  async function uploadAvatar(file: File) {
    if (!userId) return;
    setLoading(true);
    setError("");
    const extension = file.name.split(".").pop() ?? "png";
    const path = `avatars/${userId}/avatar.${extension}`;
    const { error: uploadError } = await supabase.storage.from("portal-files").upload(path, file, { cacheControl: "3600", upsert: true });
    if (uploadError) {
      setError(uploadError.message);
      setLoading(false);
      return;
    }
    setAvatarPath(path);
    await supabase.from("profiles").update({ avatar_url: path }).eq("id", userId);
    setLoading(false);
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) void uploadAvatar(file);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) void uploadAvatar(file);
  }

  async function saveProfile() {
    if (!userId) return;
    setLoading(true);
    setError("");
    const { error: updateError } = await supabase.from("profiles").update({ brand_color: brandColor }).eq("id", userId);
    setLoading(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setStep(3);
  }

  async function finishOnboarding(addClient: boolean) {
    if (!userId) return;
    setLoading(true);
    setError("");
    if (addClient && clientName && clientEmail) {
      const { error: clientError } = await supabase.from("clients").insert({
        freelancer_id: userId,
        name: clientName,
        email: clientEmail,
        company: clientCompany || null
      });
      if (clientError) {
        setError(clientError.message);
        setLoading(false);
        return;
      }
    }
    const { error: profileError } = await supabase.from("profiles").update({ onboarding_complete: true }).eq("id", userId);
    if (profileError) {
      setError(profileError.message);
      setLoading(false);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="grid min-h-screen place-items-center bg-bg-page p-6">
      <Card className="w-full max-w-sm p-6">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex items-center gap-3">
            <div className="size-[22px] rounded-md bg-purple-600" />
            <span className="text-[15px] font-medium leading-[1.6]">PortalKit</span>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3].map((item) => (
              <span key={item} className={cn("size-2 rounded-full", step === item ? "bg-purple-600" : "bg-gray-200")} />
            ))}
          </div>
        </div>

        {step === 1 ? (
          <section>
            <h1 className="mb-4 text-[18px] font-medium leading-[1.6]">Subdomain seç</h1>
            <Input value={subdomain} onChange={(event) => setSubdomain(event.target.value.toLowerCase())} placeholder="ali" />
            {availability === "checking" ? (
              <p className="mt-2 flex items-center gap-2 text-[12px] leading-[1.6] text-text-secondary">
                <Loader2 size={12} className="animate-spin" /> Kontrol ediliyor...
              </p>
            ) : null}
            {availability === "available" ? (
              <p className="mt-2 flex items-center gap-2 text-[12px] leading-[1.6] text-teal-600">
                <span className="size-[6px] rounded-full bg-teal-400" /> {subdomain}.portalkit.app kullanılabilir
              </p>
            ) : null}
            {availability === "taken" ? (
              <p className="mt-2 flex items-center gap-2 text-[12px] leading-[1.6] text-coral-600">
                <span className="size-[6px] rounded-full bg-coral-400" /> Bu subdomain alınmış
              </p>
            ) : null}
            {availability === "invalid" ? <p className="mt-2 text-[12px] leading-[1.6] text-coral-400">Geçerli bir subdomain gir.</p> : null}
            {error ? <p className="mt-2 text-[12px] leading-[1.6] text-coral-400">{error}</p> : null}
            <Button className="mt-5 w-full" disabled={availability !== "available" || loading} onClick={saveSubdomain}>
              Devam et
            </Button>
          </section>
        ) : null}

        {step === 2 ? (
          <section>
            <h1 className="mb-4 text-[18px] font-medium leading-[1.6]">Profil özelleştir</h1>
            <div role="button" tabIndex={0} onClick={() => fileInputRef.current?.click()} onDragOver={(event) => event.preventDefault()} onDrop={handleDrop} className="flex cursor-pointer flex-col items-center justify-center rounded-xl border bg-bg-secondary px-4 py-6 text-center">
              <Upload size={18} className="mb-2 text-purple-600" />
              <p className="font-medium">{avatarPath ? "Logo yüklendi" : "Logo yükle"}</p>
              <p className="text-[12px] leading-[1.6] text-text-secondary">PNG veya JPG</p>
              <input ref={fileInputRef} type="file" accept="image/png,image/jpeg" hidden onChange={handleFileChange} />
            </div>
            <div className="mt-5">
              <p className="label mb-2 text-text-hint">Brand color</p>
              <div className="flex flex-wrap gap-2">
                {swatches.map((color) => (
                  <button key={color} type="button" aria-label={color} onClick={() => setBrandColor(color)} className={cn("size-8 rounded-full border", brandColor === color && "ring-2 ring-purple-600 ring-offset-2")} style={{ backgroundColor: color }} />
                ))}
              </div>
              <Input value={brandColor} onChange={(event) => setBrandColor(event.target.value)} className="mt-3" />
            </div>
            <div className="mt-5 rounded-xl border bg-bg-surface p-4">
              <div className="mb-4 h-2 rounded-full" style={{ backgroundColor: brandColor }} />
              <p className="label text-text-hint">Portal preview</p>
              <p className="mt-1 font-medium">Müşteri portalı</p>
            </div>
            {error ? <p className="mt-2 text-[12px] leading-[1.6] text-coral-400">{error}</p> : null}
            <Button className="mt-5 w-full" disabled={loading} onClick={saveProfile}>Devam et</Button>
          </section>
        ) : null}

        {step === 3 ? (
          <section>
            <h1 className="mb-4 text-[18px] font-medium leading-[1.6]">İlk müşteriyi ekle</h1>
            <form className="space-y-3" onSubmit={(event: FormEvent) => event.preventDefault()}>
              <Input value={clientName} onChange={(event) => setClientName(event.target.value)} placeholder="Name" />
              <Input type="email" value={clientEmail} onChange={(event) => setClientEmail(event.target.value)} placeholder="Email" />
              <Input value={clientCompany} onChange={(event) => setClientCompany(event.target.value)} placeholder="Company" />
              {error ? <p className="text-[12px] leading-[1.6] text-coral-400">{error}</p> : null}
              <Button className="w-full" disabled={loading || !clientName || !clientEmail} onClick={() => finishOnboarding(true)}>Müşteriyi ekle ve başla</Button>
              <Button variant="secondary" className="w-full" disabled={loading} onClick={() => finishOnboarding(false)}>Atla, sonra eklerim</Button>
            </form>
          </section>
        ) : null}
      </Card>
    </main>
  );
}
