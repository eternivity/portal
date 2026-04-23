import { cn } from "@/lib/helpers";

interface ChatBubbleProps {
  body: string;
  fromClient?: boolean;
}

export function ChatBubble({ body, fromClient = false }: ChatBubbleProps) {
  return (
    <div className={cn("flex", fromClient ? "justify-start" : "justify-end")}>
      <div
        className={cn(
          "max-w-[75%] rounded-xl border px-4 py-3",
          fromClient ? "bg-bg-surface text-text-primary" : "bg-purple-600 text-purple-50"
        )}
      >
        {body}
      </div>
    </div>
  );
}
