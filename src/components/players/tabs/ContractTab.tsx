import { Info } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { DetailField, DetailGrid } from "@/components/ui/DetailField";
import { Badge } from "@/components/ui/Badge";
import { ContractTimelineList } from "@/components/players/ContractTimelineList";
import { RestrictedNotice } from "@/components/shared/Restricted";
import { Player } from "@/types";
import {
  COMMISSION_PAYMENT_STATUS_LABEL,
  CONTRACT_STATUS_LABEL,
  daysUntil,
  formatCurrency,
  formatDate,
} from "@/lib/format";
import { COMMISSION_PAYMENT_STATUS_TONE, CONTRACT_STATUS_TONE } from "@/lib/statusTone";
import { isJuniorWithoutProContract } from "@/lib/junior";
import { useCurrentUser } from "@/context/CurrentUserContext";
import { hasFinancialAccess } from "@/lib/permissions";

export function ContractTab({ player }: { player: Player }) {
  const { user } = useCurrentUser();
  const financialAccess = hasFinancialAccess(user, player);
  const endDays = daysUntil(player.clubContractEndDate);
  const commission = player.commission;
  const hasCommissionStructure = commission.percentage !== undefined || commission.amount !== undefined;
  const showJuniorNotice = isJuniorWithoutProContract(player);

  return (
    <div className="space-y-6">
      {showJuniorNotice && (
        <div className="flex items-start gap-2.5 rounded-lg border border-violet-100 bg-violet-50/60 px-3.5 py-2.5 text-sm text-violet-800">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-violet-500" />
          <p>
            <strong className="font-semibold">Junior / No pro contract yet.</strong>{" "}
            Salary, contract dates, and commission are intentionally blank below — this player
            is not yet under a professional contract, which is expected at this stage.
          </p>
        </div>
      )}

      <Card>
        <CardHeader
          title="Contract Overview"
          action={
            <div className="flex items-center gap-1.5">
              {showJuniorNotice && <Badge tone="purple">Junior / No pro contract yet</Badge>}
              <Badge tone={CONTRACT_STATUS_TONE[player.contractStatus]}>
                {CONTRACT_STATUS_LABEL[player.contractStatus]}
              </Badge>
            </div>
          }
        />
        <CardBody>
          {financialAccess ? (
            <DetailGrid>
              <DetailField label="Current Contract Amount" value={formatCurrency(player.currentContractAmount, player.currency)} />
              <DetailField label="Annual Salary" value={formatCurrency(player.salary, player.currency)} />
              <DetailField label="Contract Length" value={player.contractLength} />
              <DetailField label="Housing" value={player.housing} />
              <DetailField label="Car" value={player.car} />
              <DetailField label="Club Contact Person" value={player.clubContactPerson} />
              <DetailField
                label="Contract Start"
                value={formatDate(player.clubContractStartDate)}
              />
              <DetailField
                label="Contract End"
                value={
                  player.clubContractEndDate ? (
                    <div className="flex items-center gap-2">
                      {formatDate(player.clubContractEndDate)}
                      {endDays !== null && endDays <= 60 && (
                        <Badge tone={endDays < 0 ? "red" : "amber"}>
                          {endDays < 0 ? "Expired" : `${endDays}d left`}
                        </Badge>
                      )}
                    </div>
                  ) : undefined
                }
              />
              <DetailField label="Bonuses" value={player.bonuses} className="sm:col-span-2 lg:col-span-3" />
            </DetailGrid>
          ) : (
            <RestrictedNotice message="Contract financial details are restricted for your role." />
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Agent Commission"
          action={
            !financialAccess ? undefined : hasCommissionStructure ? (
              <Badge tone={COMMISSION_PAYMENT_STATUS_TONE[commission.paymentStatus]}>
                {COMMISSION_PAYMENT_STATUS_LABEL[commission.paymentStatus]}
              </Badge>
            ) : (
              <Badge tone="slate">Not Applicable</Badge>
            )
          }
        />
        <CardBody>
          {financialAccess ? (
            <DetailGrid>
              <DetailField label="Percentage" value={commission.percentage !== undefined ? `${commission.percentage}%` : undefined} />
              <DetailField label="Amount" value={formatCurrency(commission.amount, commission.currency ?? player.currency)} />
              <DetailField label="Commission Owner" value={commission.owner} />
              <DetailField label="Split With" value={commission.splitWithAgent} />
              <DetailField label="Split %" value={commission.splitPercentage !== undefined ? `${commission.splitPercentage}%` : undefined} />
              <DetailField label="Due Date" value={formatDate(commission.dueDate)} />
              <DetailField label="Notes" value={commission.notes} className="sm:col-span-2 lg:col-span-3" />
            </DetailGrid>
          ) : (
            <RestrictedNotice message="Commission details are restricted for your role." />
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Contract Timeline" description="Full history of clubs, terms, and deals" />
        <CardBody>
          <ContractTimelineList entries={player.contractTimeline} showFinancials={financialAccess} />
        </CardBody>
      </Card>
    </div>
  );
}
