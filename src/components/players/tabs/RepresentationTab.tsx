import { Card, CardBody } from "@/components/ui/Card";
import { DetailField, DetailGrid } from "@/components/ui/DetailField";
import { Badge } from "@/components/ui/Badge";
import { Player } from "@/types";
import { daysUntil, formatDate } from "@/lib/format";

export function RepresentationTab({ player }: { player: Player }) {
  const agreementDays = daysUntil(player.agencyAgreementEndDate);

  return (
    <Card>
      <CardBody>
        <DetailGrid>
          <DetailField label="Representing SMC Agent" value={player.representingAgent} />
          <DetailField label="Agent Who Arranged Current Club Contract" value={player.contractNegotiatedBy} />
          <DetailField label="Person Who Led Negotiations" value={player.negotiationsLeadBy} />
          <DetailField label="Agency Agreement Start Date" value={formatDate(player.agencyAgreementStartDate)} />
          <DetailField
            label="Agency Agreement End Date"
            value={
              player.agencyAgreementEndDate ? (
                <div className="flex items-center gap-2">
                  {formatDate(player.agencyAgreementEndDate)}
                  {agreementDays !== null && agreementDays <= 60 && (
                    <Badge tone={agreementDays < 0 ? "red" : "amber"}>
                      {agreementDays < 0 ? "Expired" : `${agreementDays}d left`}
                    </Badge>
                  )}
                </div>
              ) : undefined
            }
          />
          <DetailField label="Cooperation Notes" value={player.cooperationNotes} className="sm:col-span-2 lg:col-span-3" />
        </DetailGrid>
      </CardBody>
    </Card>
  );
}
