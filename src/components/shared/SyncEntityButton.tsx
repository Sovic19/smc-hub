"use client";

import { useState } from "react";
import { RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useData } from "@/context/DataContext";
import { useToast } from "@/context/ToastContext";

export function SyncEntityButton({
  entityType,
  entityId,
  entityLabel,
  variant = "outline",
  size = "sm",
}: {
  entityType: "club" | "contact";
  entityId: string;
  entityLabel: string;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "inverse";
  size?: "sm" | "md" | "lg";
}) {
  const { syncClubOrContact } = useData();
  const { showToast } = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);

  function handleConfirm() {
    setSyncing(true);
    setTimeout(() => {
      syncClubOrContact(entityType, entityId);
      setSyncing(false);
      setConfirmOpen(false);
      showToast(`${entityLabel} synced`, {
        description: "Mock data was used for this pilot sync.",
        variant: "success",
      });
    }, 500);
  }

  return (
    <>
      <Button type="button" variant={variant} size={size} onClick={() => setConfirmOpen(true)}>
        <RefreshCw className="h-4 w-4" />
        Sync from EliteProspects
      </Button>

      <Modal
        open={confirmOpen}
        onClose={() => {
          if (!syncing) setConfirmOpen(false);
        }}
        title="Sync from EliteProspects"
        size="sm"
      >
        <p className="text-sm text-slate-600">
          This will refresh available {entityType} data from EliteProspects. In this pilot
          version, mock data will be used.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => setConfirmOpen(false)} disabled={syncing}>
            Cancel
          </Button>
          <Button type="button" onClick={handleConfirm} disabled={syncing}>
            {syncing ? (
              <span className="inline-flex items-center gap-1.5">
                <Loader2 className="h-4 w-4 animate-spin" /> Syncing…
              </span>
            ) : (
              "Sync Now"
            )}
          </Button>
        </div>
      </Modal>
    </>
  );
}
