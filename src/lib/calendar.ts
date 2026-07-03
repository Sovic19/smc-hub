import {
  AgencyDocument,
  CalendarEventType,
  Deal,
  Player,
  TaskItem,
} from "@/types";

export interface CalendarEvent {
  id: string;
  type: CalendarEventType;
  date: string; // ISO date
  title: string;
  agent?: string;
  href?: string;
}

function nextBirthdayOccurrence(dob: string): string | null {
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let next = new Date(today.getFullYear(), d.getMonth(), d.getDate());
  if (next < today) {
    next = new Date(today.getFullYear() + 1, d.getMonth(), d.getDate());
  }
  return next.toISOString().slice(0, 10);
}

function seasonDate(monthDay: string): string {
  const today = new Date();
  const [month, day] = monthDay.split("-").map(Number);
  let year = today.getFullYear();
  const candidate = new Date(year, month - 1, day);
  if (candidate < today) year += 1;
  return new Date(year, month - 1, day).toISOString().slice(0, 10);
}

/** Static placeholder events representing recurring league-calendar dates. */
function staticLeagueEvents(): CalendarEvent[] {
  return [
    {
      id: "static-draft-1",
      type: "draft",
      date: seasonDate("06-27"),
      title: "NHL Entry Draft (placeholder date)",
    },
    {
      id: "static-transfer-1",
      type: "transfer_window",
      date: seasonDate("05-01"),
      title: "European transfer window opens (placeholder date)",
    },
    {
      id: "static-transfer-2",
      type: "transfer_window",
      date: seasonDate("09-15"),
      title: "European transfer window closes (placeholder date)",
    },
  ];
}

export function buildCalendarEvents(
  players: Player[],
  tasks: TaskItem[],
  documents: AgencyDocument[],
  deals: Deal[]
): CalendarEvent[] {
  const events: CalendarEvent[] = [];

  for (const p of players) {
    const name = `${p.firstName} ${p.lastName}`;
    if (p.agencyAgreementEndDate) {
      events.push({
        id: `agree-${p.id}`,
        type: "agency_agreement_expiry",
        date: p.agencyAgreementEndDate,
        title: `Agency agreement expires — ${name}`,
        agent: p.representingAgent,
        href: `/players/${p.id}`,
      });
    }
    if (p.clubContractEndDate) {
      events.push({
        id: `contract-${p.id}`,
        type: "club_contract_expiry",
        date: p.clubContractEndDate,
        title: `Club contract expires — ${name}`,
        agent: p.responsibleAgent,
        href: `/players/${p.id}`,
      });
    }
    if (p.dateOfBirth) {
      const bday = nextBirthdayOccurrence(p.dateOfBirth);
      if (bday) {
        events.push({
          id: `bday-${p.id}`,
          type: "birthday",
          date: bday,
          title: `${name}'s birthday`,
          agent: p.responsibleAgent,
          href: `/players/${p.id}`,
        });
      }
    }
    if (p.nextFollowUp) {
      events.push({
        id: `followup-${p.id}`,
        type: "follow_up",
        date: p.nextFollowUp,
        title: `Follow-up due — ${name}`,
        agent: p.responsibleAgent,
        href: `/players/${p.id}`,
      });
    }
  }

  for (const t of tasks) {
    if (!t.dueDate || t.status === "completed") continue;
    events.push({
      id: `task-${t.id}`,
      type: "task_deadline",
      date: t.dueDate,
      title: `Task due — ${t.title}`,
      agent: t.responsibleAgent,
      href: "/tasks",
    });
  }

  for (const d of documents) {
    if (!d.expiryDate) continue;
    events.push({
      id: `doc-${d.id}`,
      type: "document_expiry",
      date: d.expiryDate,
      title: `Document expires — ${d.title}`,
      href: "/documents",
    });
  }

  for (const deal of deals) {
    if (!deal.deadline) continue;
    events.push({
      id: `deal-${deal.id}`,
      type: "deal_deadline",
      date: deal.deadline,
      title: `Deal deadline — ${deal.clubName}`,
      agent: deal.responsibleAgent,
      href: "/deals",
    });
  }

  return [...events, ...staticLeagueEvents()].sort((a, b) => a.date.localeCompare(b.date));
}
