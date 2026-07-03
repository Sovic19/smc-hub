import {
  AlertItem,
  Club,
  CommunicationEntry,
  Contact,
  Deal,
  GameRecord,
  Player,
} from "@/types";
import {
  ALERT_TYPE_LABEL,
  DEAL_STATUS_LABEL,
  formatDate,
  relativeDayLabel,
} from "@/lib/format";

export const AI_DISCLAIMER =
  "Pilot AI assistant — no live AI connection yet. Responses below are generated from mock logic and local data, not a real language model.";

export interface AiDataContext {
  players: Player[];
  clubs: Club[];
  contacts: Contact[];
  deals: Deal[];
  games: GameRecord[];
  alerts: AlertItem[];
}

function playerLine(p: Player): string {
  return `${p.firstName} ${p.lastName} (${p.position}, ${p.currentClub || "no club"})`;
}

/** Deterministic, keyword-driven mock "AI" response generator. No real API call. */
export function generateMockAiResponse(prompt: string, ctx: AiDataContext): string {
  const q = prompt.toLowerCase();

  if (q.includes("without a club") || q.includes("no club") || q.includes("no current club")) {
    const list = ctx.players.filter(
      (p) => !p.currentClub || p.currentClub === "Free Agent" || p.status === "free_agent"
    );
    if (list.length === 0) return "Every represented player currently has a club.";
    return `${list.length} player(s) currently have no club: ${list.map(playerLine).join(", ")}.`;
  }

  if (q.includes("expiring") && (q.includes("90") || q.includes("contract"))) {
    const days = q.includes("90") ? 90 : 60;
    const today = new Date();
    const soon = ctx.players.filter((p) => {
      if (!p.clubContractEndDate) return false;
      const diff = Math.round(
        (new Date(p.clubContractEndDate).getTime() - today.getTime()) / 86400000
      );
      return diff >= 0 && diff <= days;
    });
    if (soon.length === 0) return `No club contracts are expiring within ${days} days.`;
    return `${soon.length} contract(s) expiring within ${days} days: ${soon
      .map((p) => `${p.firstName} ${p.lastName} (${formatDate(p.clubContractEndDate)})`)
      .join(", ")}.`;
  }

  if (q.includes("draft eligible")) {
    const year = new Date().getFullYear() + (q.includes("next year") ? 1 : 0);
    const list = ctx.players.filter(
      (p) => p.category === "junior" && p.draftEligibilityYear !== undefined
    );
    if (q.includes("next year")) {
      const filtered = list.filter((p) => p.draftEligibilityYear === year);
      if (filtered.length === 0) {
        return `No junior players are draft-eligible in ${year}. Full junior draft list: ${list
          .map((p) => `${p.firstName} ${p.lastName} (${p.draftEligibilityYear})`)
          .join(", ") || "none on file"}.`;
      }
      return `${filtered.length} player(s) draft-eligible in ${year}: ${filtered
        .map((p) => `${p.firstName} ${p.lastName}`)
        .join(", ")}.`;
    }
    return `Junior draft eligibility on file: ${list
      .map((p) => `${p.firstName} ${p.lastName} — ${p.draftEligibilityYear}`)
      .join(", ") || "no data yet"}.`;
  }

  if (q.includes("performed well") || q.includes("top perform")) {
    const recent = [...ctx.games]
      .filter((g) => {
        const diff = Math.round((Date.now() - new Date(g.date).getTime()) / 86400000);
        return diff <= 7;
      })
      .sort((a, b) => b.points - a.points)
      .slice(0, 5);
    if (recent.length === 0) return "No games recorded in the last 7 days.";
    return `Top performances this week: ${recent
      .map((g) => {
        const p = ctx.players.find((pl) => pl.id === g.playerId);
        return `${p ? `${p.firstName} ${p.lastName}` : "Unknown"} (${g.points} pts vs ${g.opponent})`;
      })
      .join(", ")}.`;
  }

  if (q.includes("which clubs") || (q.includes("club") && q.includes("contact"))) {
    const strongClubs = ctx.clubs
      .filter((c) => c.relationshipStrength === "strong" || c.relationshipStrength === "medium")
      .slice(0, 4);
    return `Clubs worth prioritizing based on relationship strength: ${strongClubs
      .map((c) => `${c.name} (${c.league}, ${c.relationshipStrength} relationship)`)
      .join(", ")}. Consider reaching out via your existing club contacts first.`;
  }

  if (q.includes("email") || q.includes("draft an offer") || q.includes("draft offer")) {
    return (
      "Subject: Availability & Next Steps\n\n" +
      "Hi [Club Contact],\n\n" +
      "Hope you're well. I wanted to follow up regarding our conversation and share the latest " +
      "on the player's availability and recent form. Let me know a good time this week to discuss terms.\n\n" +
      "Best regards,\n[Your Name]\nSMC Hockey Agency\n\n" +
      "(Mock draft — personalize player name, club, and terms before sending.)"
    );
  }

  if (q.includes("next step") || q.includes("suggest")) {
    return (
      "Recommended next step: confirm the counterparty's timeline, prepare a written summary of the " +
      "current terms on the table, and schedule a call within 48 hours to keep momentum. Flag any " +
      "blockers to the responsible agent before the next check-in."
    );
  }

  if (q.includes("summar") && q.includes("communicat")) {
    return (
      "Recent communication has been steady, primarily via phone and WhatsApp, with the most recent " +
      "exchange focused on scheduling and next steps. No unresolved concerns noted — recommend a routine " +
      "follow-up within the next two weeks to keep the relationship warm."
    );
  }

  if (q.includes("scouting") || q.includes("scout")) {
    return (
      "Scouting-style summary: a composed, two-way player with good hockey sense and improving physical " +
      "tools. Shows well in transition and competes hard on both ends of the ice. Projects as a valuable " +
      "contributor at the next level with continued development."
    );
  }

  if (q.includes("summar")) {
    return (
      "Summary: solid recent form, contract situation stable, and no urgent action items outstanding. " +
      "Recommend a routine check-in to maintain the relationship and monitor for any market movement."
    );
  }

  return (
    "Here is a mock response based on the available data. In a future release, this assistant will " +
    "connect to a real AI model and official data sources for richer, live-generated answers."
  );
}

export function explainAlert(alert: AlertItem): string {
  const typeLabel = ALERT_TYPE_LABEL[alert.type];
  return (
    `This is a "${typeLabel}" alert at ${alert.priority} priority. ${alert.description} ` +
    (alert.recommendedAction ? `Recommended action: ${alert.recommendedAction}` : "")
  );
}

export function summarizeGame(game: GameRecord, player?: Player): string {
  const name = player ? `${player.firstName} ${player.lastName}` : "The player";
  if (game.goalieStats) {
    const gs = game.goalieStats;
    return `${name} made ${gs.saves} saves on ${gs.saves + gs.goalsAgainst} shots (${gs.savePercentage}%) in a ${game.result} ${game.homeAway === "home" ? "home" : "away"} game vs ${game.opponent}${gs.shutout ? " — a shutout." : "."}`;
  }
  return `${name} recorded ${game.points} point(s) (${game.goals}G, ${game.assists}A) in a ${game.result} ${game.homeAway === "home" ? "home" : "away"} game vs ${game.opponent}, finishing ${game.plusMinus >= 0 ? "+" : ""}${game.plusMinus} with ${game.shots} shots on goal.`;
}

export function suggestDealNextAction(deal: Deal): string {
  const statusLabel = DEAL_STATUS_LABEL[deal.status];
  const deadline = deal.deadline ? ` Deadline is ${relativeDayLabel(deal.deadline).toLowerCase()}.` : "";
  return `Deal is currently at "${statusLabel}" stage with ${deal.clubName}.${deadline} ${deal.nextAction ? `Suggested action: ${deal.nextAction}` : "Suggested action: confirm next step with the responsible agent."}`;
}

export function draftOfferEmail(club: Club, playerName = "[Player Name]"): string {
  return (
    `Subject: ${playerName} — Availability & Introduction\n\n` +
    `Hi ${club.gm || club.manager || "there"},\n\n` +
    `I wanted to introduce ${playerName}, a player I represent who I believe could be a strong fit for ${club.name}. ` +
    `Happy to share full statistics, video, and contract expectations at your convenience.\n\n` +
    `Best regards,\nSMC Hockey Agency\n\n(Mock draft — personalize before sending.)`
  );
}

export function summarizeCommunication(entries: CommunicationEntry[], label: string): string {
  if (entries.length === 0) return `No communication has been logged with ${label} yet.`;
  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date));
  const latest = sorted[0];
  const typeCounts = entries.reduce<Record<string, number>>((acc, e) => {
    acc[e.type] = (acc[e.type] ?? 0) + 1;
    return acc;
  }, {});
  const typeSummary = Object.entries(typeCounts)
    .map(([type, count]) => `${count} ${type}`)
    .join(", ");
  return `${entries.length} communication entr${entries.length === 1 ? "y" : "ies"} logged with ${label} (${typeSummary}). Most recent: ${formatDate(latest.date)} via ${latest.type} — "${latest.summary}"${latest.nextFollowUp ? ` Next follow-up: ${formatDate(latest.nextFollowUp)}.` : ""}`;
}

export function generatePlayerSummary(player: Player): string {
  return (
    `${player.firstName} ${player.lastName} (${player.position}, ${player.country}) currently plays for ` +
    `${player.currentClub || "no club"} in ${player.currentLeague || "—"}. Contract status: ${player.contractStatus.replace(/_/g, " ")}. ` +
    `${player.cooperationNotes || "No cooperation notes on file."} Represented by ${player.representingAgent}.`
  );
}

export const QUICK_PROMPTS: string[] = [
  "Find all players without a club.",
  "Show players with contracts expiring in 90 days.",
  "Summarize this player.",
  "Generate an email to a club.",
  "Suggest next step for this deal.",
  "Summarize latest communication with this contact.",
  "Which junior players are draft eligible next year?",
  "Which players performed well this week?",
  "Which clubs should we contact for this player?",
  "Create a scouting-style player summary.",
];
