"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronLeft,
  Contact as ContactIcon,
  Mail,
  MessageCircle,
  Pencil,
  Phone,
  Trash2,
} from "lucide-react";
import { useData } from "@/context/DataContext";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { DetailField, DetailGrid } from "@/components/ui/DetailField";
import { MockDataNotice } from "@/components/ui/MockDataNotice";
import {
  ContactFormModal,
  ContactFormValues,
} from "@/components/contacts/ContactFormModal";
import { CommunicationTimeline } from "@/components/communication/CommunicationTimeline";
import { SyncEntityButton } from "@/components/shared/SyncEntityButton";
import {
  CONTACT_CATEGORY_LABEL,
  DATA_SOURCE_LABEL,
  RELATIONSHIP_STRENGTH_LABEL,
  SYNC_STATUS_LABEL,
  formatDate,
  formatDateTime,
} from "@/lib/format";
import {
  CONTACT_CATEGORY_TONE,
  RELATIONSHIP_STRENGTH_TONE,
  SYNC_STATUS_TONE,
} from "@/lib/statusTone";

export default function ContactDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { getContact, updateContact, deleteContact, getClub } = useData();
  const contact = getContact(params.id);
  const [editOpen, setEditOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (!contact) {
    return (
      <div className="mx-auto max-w-3xl">
        <EmptyState
          icon={<ContactIcon className="h-5 w-5" />}
          title="Contact not found"
          description="This contact may have been removed."
          action={
            <Link href="/contacts">
              <Button size="sm" variant="outline">Back to Contacts</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const linkedClub = contact.linkedClubId ? getClub(contact.linkedClubId) : undefined;

  function handleSave(values: ContactFormValues) {
    updateContact(contact!.id, values);
    setEditOpen(false);
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link href="/contacts" className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-700">
        <ChevronLeft className="h-4 w-4" />
        Back to Contacts
      </Link>

      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar name={`${contact.firstName} ${contact.lastName}`} size="lg" />
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              {contact.firstName} {contact.lastName}
            </h2>
            <p className="text-sm text-slate-500">
              {contact.role || "—"}
              {contact.organization ? ` · ${contact.organization}` : ""}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Badge tone={CONTACT_CATEGORY_TONE[contact.category]}>
                {CONTACT_CATEGORY_LABEL[contact.category]}
              </Badge>
              <Badge tone={RELATIONSHIP_STRENGTH_TONE[contact.relationshipStrength]}>
                {RELATIONSHIP_STRENGTH_LABEL[contact.relationshipStrength]}
              </Badge>
              <Badge tone={SYNC_STATUS_TONE[contact.syncStatus]} dot>
                {SYNC_STATUS_LABEL[contact.syncStatus]}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
          <Button variant="danger" size="sm" onClick={() => setConfirmOpen(true)}>
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader
          title="Contact Information"
          action={<SyncEntityButton entityType="contact" entityId={contact.id} entityLabel={`${contact.firstName} ${contact.lastName}`} />}
        />
        <CardBody className="space-y-4">
          <MockDataNotice />
          <DetailGrid>
            <DetailField label="Country" value={contact.country} />
            <DetailField label="League" value={contact.league} />
            <DetailField
              label="Linked Club"
              value={linkedClub ? (
                <Link href={`/clubs/${linkedClub.id}`} className="text-brand-600 hover:underline">{linkedClub.name}</Link>
              ) : undefined}
            />
            <DetailField
              label="Phone"
              value={contact.phone ? (
                <a href={`tel:${contact.phone}`} className="inline-flex items-center gap-1.5 text-brand-600 hover:underline">
                  <Phone className="h-3.5 w-3.5" /> {contact.phone}
                </a>
              ) : undefined}
            />
            <DetailField
              label="Email"
              value={contact.email ? (
                <a href={`mailto:${contact.email}`} className="inline-flex items-center gap-1.5 text-brand-600 hover:underline">
                  <Mail className="h-3.5 w-3.5" /> {contact.email}
                </a>
              ) : undefined}
            />
            <DetailField
              label="WhatsApp"
              value={contact.whatsapp ? (
                <span className="inline-flex items-center gap-1.5">
                  <MessageCircle className="h-3.5 w-3.5 text-emerald-500" /> {contact.whatsapp}
                </span>
              ) : undefined}
            />
            <DetailField label="Last Contact" value={formatDate(contact.lastContact)} />
            <DetailField label="Next Follow-up" value={formatDate(contact.nextFollowUp)} />
            <DetailField label="Data Source" value={DATA_SOURCE_LABEL[contact.dataSource]} />
            <DetailField label="Last Synced" value={formatDateTime(contact.lastSyncedAt)} />
            <DetailField label="Notes" value={contact.notes} className="sm:col-span-2 lg:col-span-3" />
          </DetailGrid>
        </CardBody>
      </Card>

      <CommunicationTimeline
        linkedEntityType="contact"
        linkedEntityId={contact.id}
        linkedEntityLabel={`${contact.firstName} ${contact.lastName}`}
      />

      <ContactFormModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSubmit={handleSave}
        initialValues={contact}
        title={`Edit ${contact.firstName} ${contact.lastName}`}
      />

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          deleteContact(contact.id);
          router.push("/contacts");
        }}
        title={`Delete ${contact.firstName} ${contact.lastName}?`}
        description="This will permanently remove the contact record."
      />
    </div>
  );
}
