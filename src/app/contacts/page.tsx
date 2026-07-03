"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Contact as ContactIcon, Mail, Phone, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Field";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { useData } from "@/context/DataContext";
import {
  ContactFormModal,
  ContactFormValues,
} from "@/components/contacts/ContactFormModal";
import { CONTACT_CATEGORY_LABEL, RELATIONSHIP_STRENGTH_LABEL } from "@/lib/format";
import { CONTACT_CATEGORY_TONE, RELATIONSHIP_STRENGTH_TONE } from "@/lib/statusTone";
import { ContactCategory } from "@/types";
import { cn } from "@/lib/cn";

export default function ContactsPage() {
  const { contacts, addContact } = useData();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<ContactCategory | "all">("all");
  const [formOpen, setFormOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return contacts
      .filter((c) => (category === "all" ? true : c.category === category))
      .filter((c) =>
        q
          ? `${c.firstName} ${c.lastName} ${c.organization ?? ""} ${c.league ?? ""} ${c.country ?? ""} ${c.role ?? ""}`
              .toLowerCase()
              .includes(q)
          : true
      )
      .sort((a, b) => a.lastName.localeCompare(b.lastName));
  }, [contacts, query, category]);

  function handleCreate(values: ContactFormValues) {
    addContact(values);
    setFormOpen(false);
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Contacts</h2>
          <p className="mt-1 text-sm text-slate-400">
            {contacts.length} contacts in the database
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4" />
          Add Contact
        </Button>
      </div>

      <p className="rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-500">
        Contacts can be updated manually now. Future versions may sync coach / manager changes
        from approved external sources such as EliteProspects.
      </p>

      <Card className="space-y-3 p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search by name, club, league, country, or role…"
            className="pl-9"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setCategory("all")}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset transition-colors",
              category === "all"
                ? "bg-brand-600 text-white ring-brand-600"
                : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-50"
            )}
          >
            All
          </button>
          {Object.entries(CONTACT_CATEGORY_LABEL).map(([val, label]) => (
            <button
              key={val}
              onClick={() => setCategory(val as ContactCategory)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset transition-colors",
                category === val
                  ? "bg-brand-600 text-white ring-brand-600"
                  : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-50"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Card className="p-6">
          <EmptyState
            icon={<ContactIcon className="h-5 w-5" />}
            title="No contacts found"
            description="Try a different search or add a new contact."
            action={
              <Button size="sm" onClick={() => setFormOpen(true)}>
                <Plus className="h-4 w-4" />
                Add Contact
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((contact) => (
            <Link key={contact.id} href={`/contacts/${contact.id}`}>
              <Card className="h-full p-5 transition-shadow hover:shadow-md">
                <div className="flex items-start gap-3">
                  <Avatar name={`${contact.firstName} ${contact.lastName}`} size="md" />
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-semibold text-slate-900">
                      {contact.firstName} {contact.lastName}
                    </h3>
                    <p className="truncate text-xs text-slate-500">
                      {contact.role || contact.organization || "—"}
                    </p>
                  </div>
                  <Badge tone={CONTACT_CATEGORY_TONE[contact.category]}>
                    {CONTACT_CATEGORY_LABEL[contact.category]}
                  </Badge>
                </div>
                <div className="mt-3">
                  <Badge tone={RELATIONSHIP_STRENGTH_TONE[contact.relationshipStrength]}>
                    {RELATIONSHIP_STRENGTH_LABEL[contact.relationshipStrength]}
                  </Badge>
                </div>
                <div className="mt-3 flex flex-wrap gap-3 border-t border-slate-100 pt-3 text-xs text-slate-400">
                  {contact.phone && (
                    <span className="inline-flex items-center gap-1">
                      <Phone className="h-3 w-3" /> {contact.phone}
                    </span>
                  )}
                  {contact.email && (
                    <span className="inline-flex items-center gap-1">
                      <Mail className="h-3 w-3" /> {contact.email}
                    </span>
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <ContactFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleCreate}
        title="Add New Contact"
      />
    </div>
  );
}
