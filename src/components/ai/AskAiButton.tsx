"use client";

import { useState } from "react";
import Link from "next/link";
import { Copy, Info, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/context/ToastContext";
import { AI_DISCLAIMER } from "@/lib/mockAi";

export function AskAiButton({
  label,
  response,
  contextLabel,
  variant = "outline",
  size = "sm",
}: {
  label: string;
  response: string;
  contextLabel?: string;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "inverse";
  size?: "sm" | "md" | "lg";
}) {
  const [open, setOpen] = useState(false);
  const { showToast } = useToast();

  function copy() {
    navigator.clipboard.writeText(response).catch(() => undefined);
    showToast("Copied to clipboard", { variant: "success" });
  }

  return (
    <>
      <Button type="button" variant={variant} size={size} onClick={() => setOpen(true)}>
        <Sparkles className="h-4 w-4" />
        {label}
      </Button>

      <Modal open={open} onClose={() => setOpen(false)} title={label} description={contextLabel} size="md">
        <div className="space-y-4">
          <div className="flex items-start gap-2.5 rounded-lg border border-violet-100 bg-violet-50/60 px-3.5 py-2.5 text-xs text-violet-800">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-violet-500" />
            <p>{AI_DISCLAIMER}</p>
          </div>
          <div className="whitespace-pre-wrap rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">
            {response}
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={copy}>
              <Copy className="h-4 w-4" />
              Copy
            </Button>
            <Link href="/ai-assistant">
              <Button type="button" size="sm">Open in AI Assistant</Button>
            </Link>
          </div>
        </div>
      </Modal>
    </>
  );
}
