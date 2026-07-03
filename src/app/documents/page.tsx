"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ExternalLink, FileStack, Plus, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input, Select } from "@/components/ui/Field";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { MockDataNotice } from "@/components/ui/MockDataNotice";
import { useData } from "@/context/DataContext";
import {
  DocumentFormModal,
  DocumentFormValues,
} from "@/components/documents/DocumentFormModal";
import { AgencyDocument, DocumentCategory, DocumentStatus } from "@/types";
import {
  DOCUMENT_CATEGORY_LABEL,
  DOCUMENT_STATUS_LABEL,
  formatDate,
} from "@/lib/format";
import { DOCUMENT_STATUS_TONE } from "@/lib/statusTone";
import { useCurrentUser } from "@/context/CurrentUserContext";
import { hasFinancialAccess } from "@/lib/permissions";
import { RestrictedValue } from "@/components/shared/Restricted";

const FINANCIAL_DOC_CATEGORIES: DocumentCategory[] = [
  "club_contract",
  "agency_agreement",
  "invoice",
  "commission_document",
];

export default function DocumentsPage() {
  const { documents, players, clubs, deals, addDocument, deleteDocument } = useData();
  const { user } = useCurrentUser();
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<DocumentCategory | "all">("all");
  const [statusFilter, setStatusFilter] = useState<DocumentStatus | "all">("all");
  const [formOpen, setFormOpen] = useState(false);
  const [deletingDoc, setDeletingDoc] = useState<AgencyDocument | null>(null);

  function linkedLabel(doc: AgencyDocument) {
    if (doc.linkedPlayerId) {
      const p = players.find((pl) => pl.id === doc.linkedPlayerId);
      return p ? { label: `${p.firstName} ${p.lastName}`, href: `/players/${p.id}` } : null;
    }
    if (doc.linkedClubId) {
      const c = clubs.find((cl) => cl.id === doc.linkedClubId);
      return c ? { label: c.name, href: `/clubs/${c.id}` } : null;
    }
    if (doc.linkedDealId) {
      const d = deals.find((dl) => dl.id === doc.linkedDealId);
      return d ? { label: d.clubName, href: "/deals" } : null;
    }
    return null;
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return documents
      .filter((d) => (categoryFilter === "all" ? true : d.category === categoryFilter))
      .filter((d) => (statusFilter === "all" ? true : d.status === statusFilter))
      .filter((d) => (q ? d.title.toLowerCase().includes(q) : true))
      .sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
  }, [documents, query, categoryFilter, statusFilter]);

  function handleCreate(values: DocumentFormValues) {
    addDocument(values);
    setFormOpen(false);
  }

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Documents</h2>
          <p className="mt-1 text-sm text-slate-400">{documents.length} records on file</p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4" />
          Add Document
        </Button>
      </div>

      <MockDataNotice />

      <Card className="space-y-3 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input placeholder="Search documents…" className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:flex lg:w-auto lg:shrink-0">
            <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value as DocumentCategory | "all")} className="lg:w-52">
              <option value="all">All categories</option>
              {Object.entries(DOCUMENT_CATEGORY_LABEL).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </Select>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as DocumentStatus | "all")} className="lg:w-44">
              <option value="all">All statuses</option>
              {Object.entries(DOCUMENT_STATUS_LABEL).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </Select>
          </div>
        </div>
      </Card>

      <Card>
        {filtered.length === 0 ? (
          <div className="p-6">
            <EmptyState icon={<FileStack className="h-5 w-5" />} title="No documents found" description="Try adjusting your filters or add a new document." />
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {filtered.map((doc) => {
              const linked = linkedLabel(doc);
              const isFinancialDoc = FINANCIAL_DOC_CATEGORIES.includes(doc.category);
              const linkedPlayer = doc.linkedPlayerId ? players.find((p) => p.id === doc.linkedPlayerId) : undefined;
              const financialAccess = !isFinancialDoc || hasFinancialAccess(user, linkedPlayer);
              return (
                <li key={doc.id} className="flex flex-col gap-2 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 flex-1">
                    {financialAccess ? (
                      <p className="truncate text-sm font-medium text-slate-800">{doc.title}</p>
                    ) : (
                      <RestrictedValue label="Restricted document" />
                    )}
                    <p className="truncate text-xs text-slate-400">
                      {formatDate(doc.uploadedAt)}
                      {doc.expiryDate && ` · Expires ${formatDate(doc.expiryDate)}`}
                      {linked && financialAccess && (
                        <>
                          {" · "}
                          <Link href={linked.href} className="text-brand-600 hover:underline">{linked.label}</Link>
                        </>
                      )}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge tone="slate">{DOCUMENT_CATEGORY_LABEL[doc.category]}</Badge>
                    <Badge tone={DOCUMENT_STATUS_TONE[doc.status]}>{DOCUMENT_STATUS_LABEL[doc.status]}</Badge>
                    {doc.fileUrl && financialAccess && (
                      <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-brand-600" aria-label="Open file">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                    <button onClick={() => setDeletingDoc(doc)} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600" aria-label="Delete document">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <DocumentFormModal open={formOpen} onClose={() => setFormOpen(false)} onSubmit={handleCreate} title="Add New Document" />

      <ConfirmDialog
        open={!!deletingDoc}
        onClose={() => setDeletingDoc(null)}
        onConfirm={() => {
          if (deletingDoc) deleteDocument(deletingDoc.id);
        }}
        title={`Delete "${deletingDoc?.title}"?`}
        description="This will permanently remove the document record."
      />
    </div>
  );
}
