import { supabase } from "@/lib/supabase/client";
import { Contact } from "@/types";

interface ContactRow {
  id: string;
  first_name: string;
  last_name: string;
  category: string;
  role: string | null;
  organization: string | null;
  linked_club_id: string | null;
  country: string | null;
  league: string | null;
  phone: string | null;
  email: string | null;
  whatsapp: string | null;
  relationship_strength: string;
  last_contact: string | null;
  next_follow_up: string | null;
  notes: string | null;
  data_source: string;
  sync_status: string;
  last_synced_at: string | null;
  manual_override: boolean;
  sync_notes: string | null;
  created_at: string;
  updated_at: string;
}

function rowToContact(row: ContactRow): Contact {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    category: row.category as Contact["category"],
    role: row.role ?? undefined,
    organization: row.organization ?? undefined,
    linkedClubId: row.linked_club_id ?? undefined,
    country: row.country ?? undefined,
    league: row.league ?? undefined,
    phone: row.phone ?? undefined,
    email: row.email ?? undefined,
    whatsapp: row.whatsapp ?? undefined,
    relationshipStrength: row.relationship_strength as Contact["relationshipStrength"],
    lastContact: row.last_contact ?? undefined,
    nextFollowUp: row.next_follow_up ?? undefined,
    notes: row.notes ?? undefined,
    dataSource: row.data_source as Contact["dataSource"],
    syncStatus: row.sync_status as Contact["syncStatus"],
    lastSyncedAt: row.last_synced_at ?? undefined,
    manualOverride: row.manual_override,
    syncNotes: row.sync_notes ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function contactToRow(contact: Partial<Contact>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (contact.firstName !== undefined) row.first_name = contact.firstName;
  if (contact.lastName !== undefined) row.last_name = contact.lastName;
  if (contact.category !== undefined) row.category = contact.category;
  if (contact.role !== undefined) row.role = contact.role || null;
  if (contact.organization !== undefined) row.organization = contact.organization || null;
  if (contact.linkedClubId !== undefined) row.linked_club_id = contact.linkedClubId || null;
  if (contact.country !== undefined) row.country = contact.country || null;
  if (contact.league !== undefined) row.league = contact.league || null;
  if (contact.phone !== undefined) row.phone = contact.phone || null;
  if (contact.email !== undefined) row.email = contact.email || null;
  if (contact.whatsapp !== undefined) row.whatsapp = contact.whatsapp || null;
  if (contact.relationshipStrength !== undefined) row.relationship_strength = contact.relationshipStrength;
  if (contact.lastContact !== undefined) row.last_contact = contact.lastContact || null;
  if (contact.nextFollowUp !== undefined) row.next_follow_up = contact.nextFollowUp || null;
  if (contact.notes !== undefined) row.notes = contact.notes || null;
  if (contact.dataSource !== undefined) row.data_source = contact.dataSource;
  if (contact.syncStatus !== undefined) row.sync_status = contact.syncStatus;
  if (contact.lastSyncedAt !== undefined) row.last_synced_at = contact.lastSyncedAt || null;
  if (contact.manualOverride !== undefined) row.manual_override = contact.manualOverride;
  if (contact.syncNotes !== undefined) row.sync_notes = contact.syncNotes || null;
  return row;
}

export async function fetchContacts(): Promise<Contact[]> {
  const { data, error } = await supabase.from("contacts").select("*").order("last_name");
  if (error) throw error;
  return (data as ContactRow[]).map(rowToContact);
}

export async function insertContact(contact: Omit<Contact, "id" | "createdAt" | "updatedAt">): Promise<Contact> {
  const { data, error } = await supabase.from("contacts").insert(contactToRow(contact)).select("*").single();
  if (error) throw error;
  return rowToContact(data as ContactRow);
}

export async function updateContactRow(id: string, updates: Partial<Contact>): Promise<void> {
  const row = contactToRow(updates);
  if (Object.keys(row).length === 0) return;
  const { error } = await supabase.from("contacts").update(row).eq("id", id);
  if (error) throw error;
}

export async function deleteContactRow(id: string): Promise<void> {
  const { error } = await supabase.from("contacts").delete().eq("id", id);
  if (error) throw error;
}
