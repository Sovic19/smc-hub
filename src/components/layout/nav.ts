import {
  LayoutDashboard,
  Users,
  Building2,
  Contact,
  ListChecks,
  Settings,
  Handshake,
  FolderKanban,
  CalendarDays,
  FileStack,
  MessagesSquare,
  BarChart3,
  Activity,
  AlertTriangle,
  Sparkles,
  Compass,
  LucideIcon,
} from "lucide-react";
import { MODULE_KEYS } from "@/lib/permissions";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  moduleKey: string;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Overview",
    items: [{ label: "Dashboard", href: "/", icon: LayoutDashboard, moduleKey: MODULE_KEYS.dashboard }],
  },
  {
    label: "CRM",
    items: [
      { label: "Players", href: "/players", icon: Users, moduleKey: MODULE_KEYS.players },
      { label: "Clubs", href: "/clubs", icon: Building2, moduleKey: MODULE_KEYS.clubs },
      { label: "Contacts", href: "/contacts", icon: Contact, moduleKey: MODULE_KEYS.contacts },
    ],
  },
  {
    label: "Pipeline",
    items: [
      { label: "Player Pipeline", href: "/pipeline", icon: FolderKanban, moduleKey: MODULE_KEYS.pipeline },
      { label: "Deals", href: "/deals", icon: Handshake, moduleKey: MODULE_KEYS.deals },
    ],
  },
  {
    label: "Operations",
    items: [
      { label: "Tasks", href: "/tasks", icon: ListChecks, moduleKey: MODULE_KEYS.tasks },
      { label: "Calendar", href: "/calendar", icon: CalendarDays, moduleKey: MODULE_KEYS.calendar },
      { label: "Documents", href: "/documents", icon: FileStack, moduleKey: MODULE_KEYS.documents },
      { label: "Communication", href: "/communication", icon: MessagesSquare, moduleKey: MODULE_KEYS.communication },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { label: "Game Tracker", href: "/game-tracker", icon: Activity, moduleKey: MODULE_KEYS.gametracker },
      { label: "Alerts", href: "/alerts", icon: AlertTriangle, moduleKey: MODULE_KEYS.alerts },
      { label: "Opportunities", href: "/opportunities", icon: Compass, moduleKey: MODULE_KEYS.opportunities },
      { label: "AI Assistant", href: "/ai-assistant", icon: Sparkles, moduleKey: MODULE_KEYS.aiassistant },
    ],
  },
  {
    label: "Insights",
    items: [{ label: "Agent Statistics", href: "/agents", icon: BarChart3, moduleKey: MODULE_KEYS.agents }],
  },
];

export const NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((g) => g.items);

export const SECONDARY_NAV_ITEMS: NavItem[] = [
  { label: "Settings", href: "/settings", icon: Settings, moduleKey: MODULE_KEYS.settings },
];
