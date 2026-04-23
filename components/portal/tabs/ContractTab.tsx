"use client";

import { useState } from "react";
import type { PortalContract } from "@/lib/portal-types";

export function ContractTab({ contract, brandColor }: { contract: PortalContract | null; brandColor: string }) {
  const [name, setName] = useState("");
  const [signedAt, setSignedAt] = useState(contract?.client_signed_at ?? null);
  const [signatureName, setSignatureName] = useState(contract?.client_signature_name ?? "");

  if (!contract) {
    return <div className="rounded-xl border bg-white p-[14px] text-[13px] text-text-secondary">Sozlesme bulunamadi.</div>;
  }

  const currentContract = contract;

  async function sign() {
    if (!name.trim()) return;
    const nextDate = new Date().toISOString();
    setSignedAt(nextDate);
    setSignatureName(name);
    await fetch(`/api/contracts/${currentContract.id}/sign`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name })
    });
  }

  return (
    <div className="pb-32">
      {signedAt ? (
        <div className="mb-4 inline-flex rounded-full bg-teal-50 px-3 py-1 text-[11px] font-medium text-teal-600">
          Imzalandi - {new Intl.DateTimeFormat("tr-TR").format(new Date(signedAt))} · {signatureName}
        </div>
      ) : null}
      <article
        className="max-w-prose rounded-xl border bg-white p-4 text-[13px] leading-[1.7] text-text-primary sm:p-6 [&_h1]:mb-3 [&_h1]:text-[22px] [&_h2]:mb-3 [&_h2]:text-[18px] [&_p]:mb-3"
        dangerouslySetInnerHTML={{ __html: currentContract.content_html }}
      />

      {!signedAt ? (
        <div className="fixed bottom-0 left-0 right-0 z-40 flex flex-col gap-3 border-t bg-white p-4 md:flex-row md:items-center md:justify-between">
          <p className="text-[13px] text-text-secondary">Sozlesmeyi imzalamak icin adinizi yazin:</p>
          <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center">
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-[13px] outline-none md:w-48"
              placeholder="Ad soyad"
            />
            <button className="rounded-lg px-4 py-2 text-[13px] font-medium text-white" style={{ backgroundColor: brandColor }} onClick={sign}>
              Imzala ve onayla
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
