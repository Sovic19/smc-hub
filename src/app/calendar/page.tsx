"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Select } from "@/components/ui/Field";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { useData } from "@/context/DataContext";
import { buildCalendarEvents, CalendarEvent } from "@/lib/calendar";
import { AGENTS, CalendarEventType } from "@/types";
import { CALENDAR_EVENT_TYPE_LABEL, formatDate, formatMonthYearLabel } from "@/lib/format";
import { CALENDAR_EVENT_TYPE_TONE } from "@/lib/statusTone";
import { BadgeTone } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const EVENT_DOT_CLASSES: Record<BadgeTone, string> = {
  brand: "bg-brand-50 text-brand-700",
  green: "bg-emerald-50 text-emerald-700",
  amber: "bg-amber-50 text-amber-700",
  red: "bg-red-50 text-red-700",
  slate: "bg-slate-100 text-slate-600",
  purple: "bg-violet-50 text-violet-700",
};

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function buildMonthGrid(anchor: Date): Date[] {
  const first = startOfMonth(anchor);
  const startOffset = (first.getDay() + 6) % 7; // Monday-first
  const gridStart = new Date(first);
  gridStart.setDate(first.getDate() - startOffset);
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    return d;
  });
}

export default function CalendarPage() {
  const { players, tasks, documents, deals } = useData();
  const [anchor, setAnchor] = useState(() => new Date());
  const [typeFilter, setTypeFilter] = useState<CalendarEventType | "all">("all");
  const [agentFilter, setAgentFilter] = useState<string>("all");

  const allEvents = useMemo(
    () => buildCalendarEvents(players, tasks, documents, deals),
    [players, tasks, documents, deals]
  );

  const filteredEvents = useMemo(
    () =>
      allEvents
        .filter((e) => (typeFilter === "all" ? true : e.type === typeFilter))
        .filter((e) => (agentFilter === "all" ? true : e.agent === agentFilter)),
    [allEvents, typeFilter, agentFilter]
  );

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const e of filteredEvents) {
      const list = map.get(e.date) ?? [];
      list.push(e);
      map.set(e.date, list);
    }
    return map;
  }, [filteredEvents]);

  const monthGrid = useMemo(() => buildMonthGrid(anchor), [anchor]);
  const monthLabel = formatMonthYearLabel(anchor);
  const todayStr = new Date().toISOString().slice(0, 10);

  const upcoming = useMemo(
    () =>
      filteredEvents
        .filter((e) => e.date >= todayStr)
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(0, 20),
    [filteredEvents, todayStr]
  );

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Calendar</h2>
          <p className="mt-1 text-sm text-slate-400">
            Contract expiries, agreements, birthdays, follow-ups, deadlines, and league dates
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as CalendarEventType | "all")} className="sm:w-52">
            <option value="all">All event types</option>
            {Object.entries(CALENDAR_EVENT_TYPE_LABEL).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </Select>
          <Select value={agentFilter} onChange={(e) => setAgentFilter(e.target.value)} className="sm:w-44">
            <option value="all">All agents</option>
            {AGENTS.map((a) => <option key={a} value={a}>{a}</option>)}
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader
            title={monthLabel}
            action={
              <div className="flex gap-1">
                <button onClick={() => setAnchor(new Date(anchor.getFullYear(), anchor.getMonth() - 1, 1))} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100" aria-label="Previous month">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button onClick={() => setAnchor(new Date())} className="rounded-lg px-2 text-xs font-medium text-slate-500 hover:bg-slate-100">
                  Today
                </button>
                <button onClick={() => setAnchor(new Date(anchor.getFullYear(), anchor.getMonth() + 1, 1))} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100" aria-label="Next month">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            }
          />
          <div className="p-3 sm:p-4">
            <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium uppercase tracking-wide text-slate-400">
              {WEEKDAYS.map((d) => <div key={d} className="py-1">{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {monthGrid.map((day) => {
                const dateStr = day.toISOString().slice(0, 10);
                const inMonth = day.getMonth() === anchor.getMonth();
                const dayEvents = eventsByDate.get(dateStr) ?? [];
                const isToday = dateStr === todayStr;
                return (
                  <div
                    key={dateStr}
                    className={cn(
                      "min-h-[76px] rounded-lg border p-1.5 text-left",
                      inMonth ? "border-slate-100 bg-white" : "border-transparent bg-slate-50/50",
                      isToday && "ring-2 ring-brand-400"
                    )}
                  >
                    <p className={cn("text-xs font-medium", inMonth ? "text-slate-600" : "text-slate-300")}>{day.getDate()}</p>
                    <div className="mt-1 space-y-0.5">
                      {dayEvents.slice(0, 2).map((e) => (
                        <div key={e.id} className={cn("truncate rounded px-1 py-0.5 text-[10px] font-medium", EVENT_DOT_CLASSES[CALENDAR_EVENT_TYPE_TONE[e.type]])}>
                          {e.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <p className="text-[10px] text-slate-400">+{dayEvents.length - 2} more</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Upcoming Events" description="Next 20 events, soonest first" />
          <div className="max-h-[560px] overflow-y-auto divide-y divide-slate-100">
            {upcoming.length === 0 ? (
              <div className="p-6">
                <EmptyState icon={<CalendarDays className="h-5 w-5" />} title="No upcoming events" />
              </div>
            ) : (
              upcoming.map((e) => {
                const content = (
                  <div className="flex items-start gap-3 px-5 py-3">
                    <div className="flex flex-col items-center">
                      <p className="text-xs font-semibold text-slate-800">{formatDate(e.date)}</p>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-slate-700">{e.title}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <Badge tone={CALENDAR_EVENT_TYPE_TONE[e.type]}>{CALENDAR_EVENT_TYPE_LABEL[e.type]}</Badge>
                        {e.agent && <span className="text-xs text-slate-400">{e.agent}</span>}
                      </div>
                    </div>
                  </div>
                );
                return e.href ? (
                  <Link key={e.id} href={e.href} className="block transition-colors hover:bg-slate-50">
                    {content}
                  </Link>
                ) : (
                  <div key={e.id}>{content}</div>
                );
              })
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
