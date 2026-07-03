"use client";

import Link from "next/link";
import { Mail, MessageCircle, MessagesSquare, Phone, StickyNote, Users } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { useData } from "@/context/DataContext";
import { CommunicationType, LinkedEntityType } from "@/types";
import { timeAgo } from "@/lib/format";
import { cn } from "@/lib/cn";

const TYPE_ICON: Record<CommunicationType, typeof Phone> = {
  phone: Phone,
  whatsapp: MessageCircle,
  email: Mail,
  meeting: Users,
  video_call: MessagesSquare,
  note: StickyNote,
};

const TYPE_TONE: Record<CommunicationType, string> = {
  phone: "bg-brand-50 text-brand-600",
  whatsapp: "bg-emerald-50 text-emerald-600",
  email: "bg-violet-50 text-violet-600",
  meeting: "bg-amber-50 text-amber-600",
  video_call: "bg-cyan-50 text-cyan-600",
  note: "bg-slate-100 text-slate-600",
};

const ENTITY_HREF: Record<LinkedEntityType, string> = {
  player: "/players",
  club: "/clubs",
  contact: "/contacts",
  deal: "/deals",
};

export function LatestCommunicationWidget() {
  const { communications } = useData();
  const latest = [...communications]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 6);

  return (
    <Card>
      <CardHeader
        title="Latest Communication"
        description="Most recent interactions logged"
        action={
          <Link href="/communication" className="text-xs font-medium text-brand-600 hover:text-brand-700">
            View all
          </Link>
        }
      />
      <div className="divide-y divide-slate-100">
        {latest.length === 0 ? (
          <div className="p-5">
            <EmptyState icon={<MessagesSquare className="h-5 w-5" />} title="No communication logged yet" />
          </div>
        ) : (
          latest.map((entry) => {
            const Icon = TYPE_ICON[entry.type];
            return (
              <Link
                key={entry.id}
                href={`${ENTITY_HREF[entry.linkedEntityType]}/${entry.linkedEntityId}`}
                className="flex items-start gap-3 px-5 py-3 transition-colors hover:bg-slate-50"
              >
                <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full", TYPE_TONE[entry.type])}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-slate-700">{entry.summary}</p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {entry.linkedEntityLabel} · {timeAgo(entry.createdAt)}
                  </p>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </Card>
  );
}
