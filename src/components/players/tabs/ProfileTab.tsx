import { ExternalLink, Mail, MessageCircle, Phone, Play } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { DetailField, DetailGrid } from "@/components/ui/DetailField";
import { Badge } from "@/components/ui/Badge";
import { Player } from "@/types";
import {
  CONTRACT_SITUATION_LABEL,
  MARITAL_STATUS_LABEL,
  PIPELINE_STAGE_LABEL,
  PLAYER_CATEGORY_LABEL,
  PLAYER_STATUS_LABEL,
  calculateAge,
  formatDate,
  formatHeight,
  formatWeight,
} from "@/lib/format";
import {
  CONTRACT_SITUATION_TONE,
  PIPELINE_STAGE_TONE,
  PLAYER_CATEGORY_TONE,
  PLAYER_STATUS_TONE,
} from "@/lib/statusTone";
import { isJuniorWithoutProContract } from "@/lib/junior";

export function ProfileTab({ player }: { player: Player }) {
  const age = calculateAge(player.dateOfBirth);
  const isJunior = player.category === "junior";
  const showJuniorBadge = isJuniorWithoutProContract(player);

  return (
    <div className="space-y-6">
      <Card>
        <CardBody>
          <DetailGrid>
            <DetailField label="Full Name" value={`${player.firstName} ${player.lastName}`} />
            <DetailField label="Position" value={player.position} />
            <DetailField label="Date of Birth" value={player.dateOfBirth ? `${formatDate(player.dateOfBirth)} (age ${age})` : undefined} />
            <DetailField label="Nationality" value={player.country} />
            <DetailField label="Shoots / Catches" value={player.shoots === "L" ? "Left" : player.shoots === "R" ? "Right" : undefined} />
            <DetailField label="Height" value={formatHeight(player.heightCm)} />
            <DetailField label="Weight" value={formatWeight(player.weightKg)} />
            <DetailField label="Marital Status" value={MARITAL_STATUS_LABEL[player.maritalStatus]} />
            <DetailField label="Current Club" value={player.currentClub} />
            <DetailField label="Current League" value={player.currentLeague} />
            <DetailField label="Season" value={player.season} />
            <DetailField
              label="Countries of Interest"
              value={
                player.countriesOfInterest.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {player.countriesOfInterest.map((c) => (
                      <Badge key={c} tone="slate">{c}</Badge>
                    ))}
                  </div>
                ) : undefined
              }
            />
            <DetailField
              label="Player Status"
              value={<Badge tone={PLAYER_STATUS_TONE[player.status]}>{PLAYER_STATUS_LABEL[player.status]}</Badge>}
            />
            <DetailField
              label="Player Category"
              value={<Badge tone={PLAYER_CATEGORY_TONE[player.category]}>{PLAYER_CATEGORY_LABEL[player.category]}</Badge>}
            />
            <DetailField
              label="Pipeline Stage"
              value={<Badge tone={PIPELINE_STAGE_TONE[player.pipelineStage]}>{PIPELINE_STAGE_LABEL[player.pipelineStage]}</Badge>}
            />
            <DetailField
              label="Contract Situation"
              value={
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge tone={CONTRACT_SITUATION_TONE[player.contractSituation]}>
                    {CONTRACT_SITUATION_LABEL[player.contractSituation]}
                  </Badge>
                  {showJuniorBadge && <Badge tone="purple">Junior / No pro contract yet</Badge>}
                </div>
              }
            />
            <DetailField
              label="EliteProspects"
              value={
                player.eliteProspectsUrl ? (
                  <a href={player.eliteProspectsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-brand-600 hover:underline">
                    View profile <ExternalLink className="h-3 w-3" />
                  </a>
                ) : undefined
              }
            />
          </DetailGrid>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <DetailGrid>
            <DetailField
              label="Phone"
              value={player.phone ? (
                <a href={`tel:${player.phone}`} className="inline-flex items-center gap-1.5 text-brand-600 hover:underline">
                  <Phone className="h-3.5 w-3.5" />{player.phone}
                </a>
              ) : undefined}
            />
            <DetailField
              label="Email"
              value={player.email ? (
                <a href={`mailto:${player.email}`} className="inline-flex items-center gap-1.5 text-brand-600 hover:underline">
                  <Mail className="h-3.5 w-3.5" />{player.email}
                </a>
              ) : undefined}
            />
            <DetailField
              label="WhatsApp"
              value={player.whatsapp ? (
                <span className="inline-flex items-center gap-1.5">
                  <MessageCircle className="h-3.5 w-3.5 text-emerald-500" />{player.whatsapp}
                </span>
              ) : undefined}
            />
            <DetailField label="Family Notes" value={player.familyNotes} className="sm:col-span-2 lg:col-span-3" />
          </DetailGrid>
        </CardBody>
      </Card>

      {isJunior && (
        <Card>
          <CardHeader
            title="Junior Development"
            description="Empty fields here are expected for junior players, not missing data"
          />
          <CardBody>
            <DetailGrid>
              <DetailField label="Junior Team" value={player.juniorTeam} />
              <DetailField label="Youth League" value={player.youthLeague} />
              <DetailField label="Draft Eligibility Year" value={player.draftEligibilityYear} />
              <DetailField label="Guardian Name" value={player.guardianContact?.name} />
              <DetailField label="Guardian Relationship" value={player.guardianContact?.relationship} />
              <DetailField
                label="Guardian Phone"
                value={player.guardianContact?.phone ? (
                  <a href={`tel:${player.guardianContact.phone}`} className="inline-flex items-center gap-1.5 text-brand-600 hover:underline">
                    <Phone className="h-3.5 w-3.5" />{player.guardianContact.phone}
                  </a>
                ) : undefined}
              />
              <DetailField
                label="Guardian Email"
                value={player.guardianContact?.email ? (
                  <a href={`mailto:${player.guardianContact.email}`} className="inline-flex items-center gap-1.5 text-brand-600 hover:underline">
                    <Mail className="h-3.5 w-3.5" />{player.guardianContact.email}
                  </a>
                ) : undefined}
              />
              <DetailField label="School / University Interest" value={player.schoolInterest} className="sm:col-span-2 lg:col-span-3" />
              <DetailField label="Development Notes" value={player.developmentNotes} className="sm:col-span-2 lg:col-span-3" />
            </DetailGrid>
          </CardBody>
        </Card>
      )}

      {player.videoUrls.length > 0 && (
        <Card>
          <CardBody>
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-400">Video / Highlights</p>
            <ul className="space-y-1.5">
              {player.videoUrls.map((url, i) => (
                <li key={i}>
                  <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-brand-600 hover:underline">
                    <Play className="h-3.5 w-3.5" />{url}
                  </a>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
