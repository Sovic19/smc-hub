"use client";

import { useMemo, useRef, useState } from "react";
import { File, Trash2, Upload } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { useData } from "@/context/DataContext";
import { Player, DocumentCategory } from "@/types";
import { DOCUMENT_CATEGORY_LABEL, DOCUMENT_STATUS_LABEL, formatDate } from "@/lib/format";
import { DOCUMENT_STATUS_TONE } from "@/lib/statusTone";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DocumentsTab({ player }: { player: Player }) {
  const { documents, addDocument, deleteDocument } = useData();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingCategory, setPendingCategory] = useState<DocumentCategory>("other");

  const playerDocs = useMemo(
    () => documents.filter((d) => d.linkedPlayerId === player.id),
    [documents, player.id]
  );

  function handleFileSelected(files: FileList | null) {
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file) => {
      addDocument({
        title: file.name,
        category: pendingCategory,
        linkedPlayerId: player.id,
        status: "valid",
        sizeLabel: formatBytes(file.size),
      });
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <Card>
      <CardHeader
        title="Documents"
        description="Metadata only — no real file storage in this pilot"
        action={
          <div className="flex items-center gap-2">
            <select
              value={pendingCategory}
              onChange={(e) => setPendingCategory(e.target.value as DocumentCategory)}
              className="h-9 rounded-lg border border-slate-300 bg-white px-2 text-xs text-slate-700 focus:border-brand-500 focus:outline-none"
            >
              {Object.entries(DOCUMENT_CATEGORY_LABEL).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
            <Button size="sm" onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-4 w-4" />
              Upload
            </Button>
            <input ref={fileInputRef} type="file" multiple className="hidden" onChange={(e) => handleFileSelected(e.target.files)} />
          </div>
        }
      />
      <CardBody>
        {playerDocs.length === 0 ? (
          <EmptyState icon={<File className="h-5 w-5" />} title="No documents on file" description="Upload a contract, passport, or supporting file." />
        ) : (
          <ul className="divide-y divide-slate-100">
            {playerDocs.map((doc) => (
              <li key={doc.id} className="flex items-center gap-3 py-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                  <File className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-800">{doc.title}</p>
                  <p className="text-xs text-slate-400">
                    {formatDate(doc.uploadedAt)}
                    {doc.sizeLabel ? ` · ${doc.sizeLabel}` : ""}
                    {doc.expiryDate ? ` · Expires ${formatDate(doc.expiryDate)}` : ""}
                  </p>
                </div>
                <Badge tone="slate">{DOCUMENT_CATEGORY_LABEL[doc.category]}</Badge>
                <Badge tone={DOCUMENT_STATUS_TONE[doc.status]}>{DOCUMENT_STATUS_LABEL[doc.status]}</Badge>
                <button
                  onClick={() => deleteDocument(doc.id)}
                  className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                  aria-label="Remove document"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}
