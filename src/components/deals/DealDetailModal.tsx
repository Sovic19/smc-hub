"use client";

import { useState } from "react";
import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Field";
import { DetailField, DetailGrid } from "@/components/ui/DetailField";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { AskAiButton } from "@/components/ai/AskAiButton";
import { suggestDealNextAction } from "@/lib/mockAi";
import { useData } from "@/context/DataContext";
import { Deal, DealStatus } from "@/types";
import {
  COMMISSION_PAYMENT_STATUS_LABEL,
  DEAL_STATUS_LABEL,
  DEAL_TYPE_LABEL,
  RELATIONSHIP_STRENGTH_LABEL,
  formatCurrency,
  formatDate,
} from "@/lib/format";
import {
  COMMISSION_PAYMENT_STATUS_TONE,
  DEAL_STATUS_TONE,
  DEAL_TYPE_TONE,
  RELATIONSHIP_STRENGTH_TONE,
} from "@/lib/statusTone";
import { useCurrentUser } from "@/context/CurrentUserContext";
import { hasFinancialAccess } from "@/lib/permissions";
import { RestrictedValue } from "@/components/shared/Restricted";

export function DealDetailModal({
  deal,
  onClose,
  onEdit,
}: {
  deal: Deal | null;
  onClose: () => void;
  onEdit: (deal: Deal) => void;
}) {
  const { getPlayer, updateDeal, deleteDeal } = useData();
  const { user } = useCurrentUser();
  const [confirmOpen, setConfirmOpen] = useState(false);
  if (!deal) return null;

  const player = getPlayer(deal.playerId);
  const financialAccess = hasFinancialAccess(user, player);
  const sortedTimeline = [...deal.timeline].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <>
      <Modal
        open={!!deal}
        onClose={onClose}
        title={player ? `${player.firstName} ${player.lastName} × ${deal.clubName}` : deal.clubName}
        description={`${deal.league} · ${deal.country}`}
        size="lg"
      >
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={DEAL_STATUS_TONE[deal.status]}>{DEAL_STATUS_LABEL[deal.status]}</Badge>
            <Badge tone={DEAL_TYPE_TONE[deal.dealType]}>{DEAL_TYPE_LABEL[deal.dealType]}</Badge>
            {deal.relationshipStrength && (
              <Badge tone={RELATIONSHIP_STRENGTH_TONE[deal.relationshipStrength]}>
                {RELATIONSHIP_STRENGTH_LABEL[deal.relationshipStrength]} relationship
              </Badge>
            )}
            <Badge tone={COMMISSION_PAYMENT_STATUS_TONE[deal.commission.paymentStatus]}>
              Commission: {COMMISSION_PAYMENT_STATUS_LABEL[deal.commission.paymentStatus]}
            </Badge>
            <div className="ml-auto flex items-center gap-2">
              <span className="text-xs text-slate-400">Move to:</span>
              <Select
                value={deal.status}
                onChange={(e) => updateDeal(deal.id, { status: e.target.value as DealStatus })}
                className="h-8 py-0 text-xs"
              >
                {Object.entries(DEAL_STATUS_LABEL).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </Select>
            </div>
          </div>

          <div className="flex justify-end">
            <AskAiButton
              label="Suggest next step"
              response={suggestDealNextAction(deal)}
              contextLabel={player ? `${player.firstName} ${player.lastName} × ${deal.clubName}` : deal.clubName}
            />
          </div>

          <DetailGrid>
            <DetailField
              label="Player"
              value={player ? <Link href={`/players/${player.id}`} className="text-brand-600 hover:underline">{player.firstName} {player.lastName}</Link> : undefined}
            />
            <DetailField label="Responsible Agent" value={deal.responsibleAgent} />
            <DetailField label="Negotiating Agent" value={deal.negotiatingAgent} />
            <DetailField label="Club Contact" value={deal.clubContact} />
            <DetailField label="Expected Salary" value={financialAccess ? formatCurrency(deal.expectedSalary, deal.currency) : <RestrictedValue />} />
            <DetailField label="Final Salary" value={financialAccess ? formatCurrency(deal.finalSalary, deal.currency) : <RestrictedValue />} />
            <DetailField label="Housing" value={deal.housing} />
            <DetailField label="Car" value={deal.car} />
            <DetailField label="Bonuses" value={financialAccess ? deal.bonuses : <RestrictedValue />} />
            <DetailField label="Contract Start" value={formatDate(deal.contractStartDate)} />
            <DetailField label="Contract End" value={formatDate(deal.contractEndDate)} />
            <DetailField label="Deadline" value={formatDate(deal.deadline)} />
            <DetailField label="Commission %" value={financialAccess ? (deal.commission.percentage !== undefined ? `${deal.commission.percentage}%` : undefined) : <RestrictedValue />} />
            <DetailField label="Commission Amount" value={financialAccess ? formatCurrency(deal.commission.amount, deal.commission.currency ?? deal.currency) : <RestrictedValue />} />
            <DetailField label="Next Action" value={deal.nextAction} className="sm:col-span-2 lg:col-span-3" />
            <DetailField label="Notes" value={deal.notes} className="sm:col-span-2 lg:col-span-3" />
          </DetailGrid>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Deal Timeline</p>
            <ol className="space-y-3 border-l-2 border-slate-100 pl-4">
              {sortedTimeline.map((entry) => (
                <li key={entry.id} className="relative">
                  <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-brand-400" />
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={DEAL_STATUS_TONE[entry.status]}>{DEAL_STATUS_LABEL[entry.status]}</Badge>
                    <span className="text-xs text-slate-400">{formatDate(entry.date)} · {entry.agent}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{entry.note}</p>
                </li>
              ))}
            </ol>
          </div>

          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <Button variant="outline" size="sm" onClick={() => onEdit(deal)}>
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
            <Button variant="danger" size="sm" onClick={() => setConfirmOpen(true)}>
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          deleteDeal(deal.id);
          onClose();
        }}
        title="Delete this deal?"
        description="This will permanently remove the deal record."
      />
    </>
  );
}
