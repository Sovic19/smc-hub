import { Deal, Player, TaskItem } from "@/types";
import { daysUntil } from "@/lib/format";

export interface AgentStats {
  agent: string;
  representedPlayers: number;
  signedContracts: number;
  totalContractValue: number;
  estimatedCommission: number;
  openDeals: number;
  completedTasks: number;
  overdueTasks: number;
  upcomingFollowUps: number;
  playersWithoutClub: number;
}

export function computeAgentStats(
  agent: string,
  players: Player[],
  deals: Deal[],
  tasks: TaskItem[]
): AgentStats {
  const agentPlayers = players.filter((p) => p.representingAgent === agent);
  const signedContracts = agentPlayers.filter((p) => p.contractStatus === "signed").length;
  const totalContractValue = agentPlayers.reduce(
    (sum, p) => sum + (p.contractStatus === "signed" ? p.currentContractAmount ?? 0 : 0),
    0
  );
  const estimatedCommission = agentPlayers.reduce(
    (sum, p) => sum + (p.commission.owner === agent ? p.commission.amount ?? 0 : 0),
    0
  );
  const agentDeals = deals.filter((d) => d.responsibleAgent === agent);
  const openDeals = agentDeals.filter(
    (d) => !["signed", "rejected", "cancelled", "finished"].includes(d.status)
  ).length;
  const agentTasks = tasks.filter((t) => t.responsibleAgent === agent);
  const completedTasks = agentTasks.filter((t) => t.status === "completed").length;
  const overdueTasks = agentTasks.filter((t) => {
    if (t.status === "completed") return false;
    const d = daysUntil(t.dueDate);
    return d !== null && d < 0;
  }).length;
  const upcomingFollowUps = agentPlayers.filter((p) => {
    const d = daysUntil(p.nextFollowUp);
    return d !== null && d >= 0 && d <= 14;
  }).length;
  const playersWithoutClub = agentPlayers.filter(
    (p) => !p.currentClub || p.currentClub === "Free Agent" || p.status === "free_agent"
  ).length;

  return {
    agent,
    representedPlayers: agentPlayers.length,
    signedContracts,
    totalContractValue,
    estimatedCommission,
    openDeals,
    completedTasks,
    overdueTasks,
    upcomingFollowUps,
    playersWithoutClub,
  };
}
