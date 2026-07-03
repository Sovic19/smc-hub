"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Check, ChevronDown, Menu, Search, Bell, Building2, Contact as ContactIcon, Users } from "lucide-react";
import { NAV_ITEMS, SECONDARY_NAV_ITEMS } from "./nav";
import { useData } from "@/context/DataContext";
import { Avatar } from "@/components/ui/Avatar";
import { useOnClickOutside } from "@/hooks/useOnClickOutside";
import { useCurrentUser } from "@/context/CurrentUserContext";
import { ROLE_PERMISSIONS } from "@/lib/permissions";

function pageTitle(pathname: string): string {
  if (pathname === "/") return "Dashboard";
  const match = [...NAV_ITEMS, ...SECONDARY_NAV_ITEMS].find(
    (item) => item.href !== "/" && pathname.startsWith(item.href)
  );
  if (match) {
    if (pathname !== match.href) {
      if (pathname.endsWith("/new")) return `New ${match.label.replace(/s$/, "")}`;
      return match.label.replace(/s$/, "") + " Details";
    }
    return match.label;
  }
  return "SMC Hub";
}

export function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const pathname = usePathname();
  const { players, clubs, contacts } = useData();
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(boxRef, () => setFocused(false));

  const { user: currentUser, users, setCurrentUserId } = useCurrentUser();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(userMenuRef, () => setUserMenuOpen(false));

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    const playerResults = players
      .filter((p) =>
        `${p.firstName} ${p.lastName} ${p.currentClub}`.toLowerCase().includes(q)
      )
      .slice(0, 4)
      .map((p) => ({
        id: p.id,
        label: `${p.firstName} ${p.lastName}`,
        sub: p.currentClub,
        href: `/players/${p.id}`,
        icon: Users,
      }));
    const clubResults = clubs
      .filter((c) => `${c.name} ${c.league}`.toLowerCase().includes(q))
      .slice(0, 3)
      .map((c) => ({
        id: c.id,
        label: c.name,
        sub: c.league,
        href: `/clubs/${c.id}`,
        icon: Building2,
      }));
    const contactResults = contacts
      .filter((c) =>
        `${c.firstName} ${c.lastName} ${c.organization ?? ""}`
          .toLowerCase()
          .includes(q)
      )
      .slice(0, 3)
      .map((c) => ({
        id: c.id,
        label: `${c.firstName} ${c.lastName}`,
        sub: c.organization,
        href: `/contacts/${c.id}`,
        icon: ContactIcon,
      }));
    return [...playerResults, ...clubResults, ...contactResults];
  }, [query, players, clubs, contacts]);

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6">
      <button
        onClick={onMenuClick}
        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <h1 className="hidden text-lg font-semibold text-slate-900 sm:block">
        {pageTitle(pathname)}
      </h1>

      <div ref={boxRef} className="relative ml-auto w-full max-w-sm">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            placeholder="Search players, clubs, contacts…"
            className="w-full rounded-lg border border-slate-300 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </div>
        {focused && results && (
          <div className="absolute right-0 top-full z-40 mt-1.5 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
            {results.length === 0 ? (
              <p className="px-4 py-3 text-sm text-slate-400">No results found</p>
            ) : (
              <ul className="max-h-80 overflow-y-auto py-1">
                {results.map((r) => {
                  const Icon = r.icon;
                  return (
                    <li key={`${r.href}-${r.id}`}>
                      <Link
                        href={r.href}
                        onClick={() => {
                          setFocused(false);
                          setQuery("");
                        }}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm hover:bg-slate-50"
                      >
                        <Icon className="h-4 w-4 text-slate-400" />
                        <span className="font-medium text-slate-800">{r.label}</span>
                        {r.sub && (
                          <span className="ml-auto truncate text-xs text-slate-400">
                            {r.sub}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </div>

      <button
        className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-brand-500 ring-2 ring-white" />
      </button>

      <div ref={userMenuRef} className="relative border-l border-slate-200 pl-3">
        <button
          onClick={() => setUserMenuOpen((v) => !v)}
          className="flex items-center gap-2 rounded-lg py-1 pr-1 hover:bg-slate-50"
        >
          <Avatar name={currentUser.name} size="sm" />
          <div className="hidden text-left sm:block">
            <p className="text-sm font-medium leading-tight text-slate-800">
              {currentUser.name}
            </p>
            <p className="text-xs leading-tight text-slate-400">{ROLE_PERMISSIONS[currentUser.role].label}</p>
          </div>
          <ChevronDown className="hidden h-3.5 w-3.5 text-slate-400 sm:block" />
        </button>
        {userMenuOpen && (
          <div className="absolute right-0 top-full z-40 mt-1.5 w-64 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
            <p className="border-b border-slate-100 px-3.5 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Switch mock user
            </p>
            <ul className="max-h-80 overflow-y-auto py-1">
              {users.map((u) => (
                <li key={u.id}>
                  <button
                    onClick={() => {
                      setCurrentUserId(u.id);
                      setUserMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm hover:bg-slate-50"
                  >
                    <Avatar name={u.name} size="sm" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium text-slate-800">{u.name}</span>
                      <span className="block truncate text-xs text-slate-400">{ROLE_PERMISSIONS[u.role].label}</span>
                    </span>
                    {u.id === currentUser.id && <Check className="h-4 w-4 shrink-0 text-brand-600" />}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </header>
  );
}
