"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import type { RealtimePostgresInsertPayload } from "@supabase/supabase-js";
import type { PortalMessage } from "@/lib/portal-types";
import { createSupabaseBrowserClient } from "@/lib/supabase";

function timeLabel(value: string) {
  return new Intl.DateTimeFormat("tr-TR", { hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

export function MessagesTab({
  projectId,
  brandColor,
  initialMessages
}: {
  projectId: string;
  brandColor: string;
  initialMessages: PortalMessage[];
}) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [messages, setMessages] = useState(initialMessages);
  const [content, setContent] = useState("");

  useEffect(() => {
    const channel = supabase
      .channel(`portal-messages-${projectId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `project_id=eq.${projectId}` },
        (payload: RealtimePostgresInsertPayload<PortalMessage>) => {
          setMessages((current) => [...current, payload.new]);
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [projectId, supabase]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!content.trim()) {
      return;
    }

    const pendingContent = content;
    setMessages((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        sender_role: "client",
        sender_name: "Siz",
        content: pendingContent,
        created_at: new Date().toISOString()
      }
    ]);
    setContent("");
    await fetch("/api/portal/messages", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ projectId, content: pendingContent, senderName: "Client" })
    });
  }

  return (
    <div className="rounded-xl border bg-white p-[14px]">
      <div className="flex flex-col gap-[10px]">
        {messages.map((message) => {
          const client = message.sender_role === "client";

          return (
            <div key={message.id} className={client ? "flex flex-col items-end" : "flex flex-col items-start"}>
              <div
                className="max-w-[75%] px-3 py-2 text-[12px] leading-[1.6]"
                style={{
                  backgroundColor: client ? brandColor : "#F1EFE8",
                  color: client ? "white" : "#1A1A1A",
                  borderRadius: client ? "12px 0 12px 12px" : "0 12px 12px 12px"
                }}
              >
                {message.content}
              </div>
              <p className={`mt-1 text-[10px] leading-[1.6] text-text-secondary ${client ? "text-right" : ""}`}>
                {client ? "Siz" : message.sender_name ?? "Freelancer"} · {timeLabel(message.created_at)}
              </p>
            </div>
          );
        })}
      </div>

      <form className="mt-1 flex gap-2 pt-3" onSubmit={handleSubmit}>
        <input
          value={content}
          onChange={(event) => setContent(event.target.value)}
          className="flex-1 rounded-lg border bg-gray-50 px-3 py-[7px] text-[12px] outline-none placeholder:text-text-hint"
          placeholder="Mesaj yaz"
        />
        <button className="rounded-lg px-[14px] py-[7px] text-[12px] font-medium text-white" style={{ backgroundColor: brandColor }}>
          Gönder
        </button>
      </form>
    </div>
  );
}
