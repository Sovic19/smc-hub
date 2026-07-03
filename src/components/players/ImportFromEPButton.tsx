"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useData } from "@/context/DataContext";
import { useToast } from "@/context/ToastContext";

export function ImportFromEPButton({
  playerId,
  playerName,
  variant = "outline",
  size = "sm",
  label = "Import from EliteProspects",
  className,
}: {
  playerId: string;
  playerName: string;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "inverse";
  size?: "sm" | "md" | "lg";
  label?: string;
  className?: string;
}) {
  const { importFromEliteProspects } = useData();
  const { showToast } = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [importing, setImporting] = useState(false);

  function handleConfirm() {
    setImporting(true);
    // Simulated network delay for a realistic pilot-import feel.
    setTimeout(() => {
      const updated = importFromEliteProspects(playerId);
      setImporting(false);
      setConfirmOpen(false);
      if (updated) {
        showToast(`EliteProspects data imported for ${playerName}`, {
          description: "Mock data was used for this pilot import.",
          variant: "success",
        });
      } else {
        showToast("Import failed", {
          description: "Could not find the player record.",
          variant: "error",
        });
      }
    }, 600);
  }

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        className={className}
        onClick={() => setConfirmOpen(true)}
      >
        <Download className="h-4 w-4" />
        {label}
      </Button>

      <Modal
        open={confirmOpen}
        onClose={() => {
          if (!importing) setConfirmOpen(false);
        }}
        title="Import from EliteProspects"
        size="sm"
      >
        <p className="text-sm text-slate-600">
          This will import available player profile data from EliteProspects.
          In this pilot version, mock data will be used.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setConfirmOpen(false)}
            disabled={importing}
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleConfirm} disabled={importing}>
            {importing ? (
              <span className="inline-flex items-center gap-1.5">
                <Loader2 className="h-4 w-4 animate-spin" /> Importing…
              </span>
            ) : (
              "Import Data"
            )}
          </Button>
        </div>
      </Modal>
    </>
  );
}
