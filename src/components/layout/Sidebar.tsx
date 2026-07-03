"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, X } from "lucide-react";
import { NAV_GROUPS, SECONDARY_NAV_ITEMS } from "./nav";
import { cn } from "@/lib/cn";
import { useCurrentUser } from "@/context/CurrentUserContext";
import { isModuleVisible } from "@/lib/permissions";

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

function NavLink({
  href,
  label,
  Icon,
  active,
  onNavigate,
}: {
  href: string;
  label: string;
  Icon: (typeof SECONDARY_NAV_ITEMS)[number]["icon"];
  active: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-white text-brand-700 shadow-sm"
          : "text-brand-100 hover:bg-brand-800/60 hover:text-white"
      )}
    >
      <Icon className="h-[18px] w-[18px]" />
      {label}
    </Link>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { user } = useCurrentUser();

  const visibleGroups = NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => isModuleVisible(user, item.moduleKey)),
  })).filter((group) => group.items.length > 0);

  const visibleSecondary = SECONDARY_NAV_ITEMS.filter((item) => isModuleVisible(user, item.moduleKey));

  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 items-center gap-2.5 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white shadow-sm">
          <Shield className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-bold leading-tight text-white">SMC Hub</p>
          <p className="text-[11px] leading-tight text-brand-200">
            SMC Hockey Agency
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-4 overflow-y-auto px-3 py-2">
        {visibleGroups.map((group) => (
          <div key={group.label}>
            <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-brand-400">
              {group.label}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => (
                <NavLink
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  Icon={item.icon}
                  active={isActive(pathname, item.href)}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="shrink-0 space-y-1 px-3 pb-2 pt-2">
        {visibleSecondary.map((item) => (
          <NavLink
            key={item.href}
            href={item.href}
            label={item.label}
            Icon={item.icon}
            active={isActive(pathname, item.href)}
            onNavigate={onNavigate}
          />
        ))}
      </div>

      <div className="mx-3 mb-4 shrink-0 rounded-lg bg-brand-800/60 px-3 py-3">
        <p className="text-xs text-brand-200">All data is stored locally</p>
        <p className="mt-0.5 text-[11px] text-brand-300">
          No backend connected — frontend prototype
        </p>
      </div>
    </div>
  );
}

export function DesktopSidebar() {
  return (
    <aside className="hidden w-64 shrink-0 bg-brand-900 lg:flex lg:flex-col">
      <SidebarContent />
    </aside>
  );
}

export function MobileSidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <div
      className={cn(
        "fixed inset-0 z-50 lg:hidden",
        open ? "pointer-events-auto" : "pointer-events-none"
      )}
    >
      <div
        className={cn(
          "absolute inset-0 bg-slate-900/50 transition-opacity",
          open ? "opacity-100" : "opacity-0"
        )}
        onClick={onClose}
      />
      <div
        className={cn(
          "absolute inset-y-0 left-0 w-72 max-w-[80%] bg-brand-900 shadow-xl transition-transform duration-200",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <button
          onClick={onClose}
          className="absolute right-3 top-4 rounded-lg p-1.5 text-brand-200 hover:bg-brand-800"
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
        <SidebarContent onNavigate={onClose} />
      </div>
    </div>
  );
}
