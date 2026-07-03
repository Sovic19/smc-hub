"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useLocalCollection } from "@/hooks/useLocalCollection";
import { generateId, nowIso } from "@/lib/storage";
import { generateMockExternalData } from "@/lib/mockImport";
import {
  deletePlayerRow,
  fetchPlayers,
  insertPlayer,
  updatePlayerRow,
} from "@/lib/supabase/players";
import {
  deleteClubRow,
  fetchClubs,
  insertClub,
  updateClubRow,
} from "@/lib/supabase/clubs";
import {
  MOCK_ACTIVITY,
  MOCK_AI_CONVERSATIONS,
  MOCK_ALERTS,
  MOCK_AUDIT_LOG,
  MOCK_COMMUNICATIONS,
  MOCK_CONTACTS,
  MOCK_DEALS,
  MOCK_DOCUMENTS,
  MOCK_GAMES,
  MOCK_OPPORTUNITIES,
  MOCK_SYNC_LOG,
  MOCK_TASKS,
} from "@/lib/mockData";
import {
  ActivityEntry,
  ActivityType,
  AgencyDocument,
  AiConversation,
  AiMessage,
  AlertItem,
  AuditLogEntry,
  Club,
  CommunicationEntry,
  Contact,
  Deal,
  GameRecord,
  Opportunity,
  Player,
  SyncLogEntry,
  TaskItem,
} from "@/types";

interface DataContextValue {
  players: Player[];
  playersLoading: boolean;
  clubs: Club[];
  clubsLoading: boolean;
  contacts: Contact[];
  tasks: TaskItem[];
  deals: Deal[];
  documents: AgencyDocument[];
  communications: CommunicationEntry[];
  activity: ActivityEntry[];

  addPlayer: (player: Omit<Player, "id" | "createdAt" | "updatedAt">) => Promise<Player>;
  updatePlayer: (id: string, updates: Partial<Player>) => void;
  deletePlayer: (id: string) => void;
  getPlayer: (id: string) => Player | undefined;

  addClub: (club: Omit<Club, "id" | "createdAt" | "updatedAt">) => Promise<Club>;
  updateClub: (id: string, updates: Partial<Club>) => void;
  deleteClub: (id: string) => void;
  getClub: (id: string) => Club | undefined;

  addContact: (contact: Omit<Contact, "id" | "createdAt" | "updatedAt">) => Contact;
  updateContact: (id: string, updates: Partial<Contact>) => void;
  deleteContact: (id: string) => void;
  getContact: (id: string) => Contact | undefined;

  addTask: (task: Omit<TaskItem, "id" | "createdAt" | "updatedAt">) => TaskItem;
  updateTask: (id: string, updates: Partial<TaskItem>) => void;
  deleteTask: (id: string) => void;
  getTask: (id: string) => TaskItem | undefined;

  addDeal: (deal: Omit<Deal, "id" | "createdAt" | "updatedAt">) => Deal;
  updateDeal: (id: string, updates: Partial<Deal>) => void;
  deleteDeal: (id: string) => void;
  getDeal: (id: string) => Deal | undefined;

  addDocument: (doc: Omit<AgencyDocument, "id" | "uploadedAt">) => AgencyDocument;
  updateDocument: (id: string, updates: Partial<AgencyDocument>) => void;
  deleteDocument: (id: string) => void;

  addCommunication: (entry: Omit<CommunicationEntry, "id" | "createdAt">) => CommunicationEntry;
  updateCommunication: (id: string, updates: Partial<CommunicationEntry>) => void;
  deleteCommunication: (id: string) => void;

  games: GameRecord[];
  addGame: (game: Omit<GameRecord, "id" | "createdAt" | "updatedAt">) => GameRecord;
  updateGame: (id: string, updates: Partial<GameRecord>) => void;
  deleteGame: (id: string) => void;
  getGame: (id: string) => GameRecord | undefined;

  alerts: AlertItem[];
  addAlert: (alert: Omit<AlertItem, "id" | "createdAt" | "updatedAt">) => AlertItem;
  updateAlert: (id: string, updates: Partial<AlertItem>) => void;
  deleteAlert: (id: string) => void;

  opportunities: Opportunity[];
  addOpportunity: (opp: Omit<Opportunity, "id" | "createdAt" | "updatedAt">) => Opportunity;
  updateOpportunity: (id: string, updates: Partial<Opportunity>) => void;
  deleteOpportunity: (id: string) => void;

  auditLog: AuditLogEntry[];
  addAuditLogEntry: (entry: Omit<AuditLogEntry, "id" | "timestamp">) => void;

  aiConversations: AiConversation[];
  createAiConversation: (
    conversation: Omit<AiConversation, "id" | "createdAt" | "updatedAt">
  ) => AiConversation;
  appendAiMessage: (conversationId: string, message: Omit<AiMessage, "id">) => void;
  deleteAiConversation: (id: string) => void;

  syncLog: SyncLogEntry[];
  importFromEliteProspects: (playerId: string) => Player | undefined;
  syncClubOrContact: (entityType: "club" | "contact", id: string) => void;

  logActivity: (entry: Omit<ActivityEntry, "id" | "timestamp">) => void;
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  // Hráči už nejsou v localStorage, ale v Supabase (Postgres) — viz src/lib/supabase/players.ts.
  const [players, setPlayers] = useState<Player[]>([]);
  const [playersLoading, setPlayersLoading] = useState(true);

  useEffect(() => {
    fetchPlayers()
      .then(setPlayers)
      .catch((err) => console.error("Nepodařilo se načíst hráče ze Supabase:", err))
      .finally(() => setPlayersLoading(false));
  }, []);

  // Kluby už také nejsou v localStorage, ale v Supabase — viz src/lib/supabase/clubs.ts.
  const [clubs, setClubs] = useState<Club[]>([]);
  const [clubsLoading, setClubsLoading] = useState(true);

  useEffect(() => {
    fetchClubs()
      .then(setClubs)
      .catch((err) => console.error("Nepodařilo se načíst kluby ze Supabase:", err))
      .finally(() => setClubsLoading(false));
  }, []);

  const { items: contacts, setItems: setContacts } = useLocalCollection<Contact>(
    "contacts",
    MOCK_CONTACTS
  );
  const { items: tasks, setItems: setTasks } = useLocalCollection<TaskItem>(
    "tasks",
    MOCK_TASKS
  );
  const { items: deals, setItems: setDeals } = useLocalCollection<Deal>(
    "deals",
    MOCK_DEALS
  );
  const { items: documents, setItems: setDocuments } = useLocalCollection<AgencyDocument>(
    "documents",
    MOCK_DOCUMENTS
  );
  const { items: communications, setItems: setCommunications } = useLocalCollection<CommunicationEntry>(
    "communications",
    MOCK_COMMUNICATIONS
  );
  const { items: activity, setItems: setActivity } = useLocalCollection<ActivityEntry>(
    "activity",
    MOCK_ACTIVITY
  );
  const { items: syncLog, setItems: setSyncLog } = useLocalCollection<SyncLogEntry>(
    "syncLog",
    MOCK_SYNC_LOG
  );
  const { items: games, setItems: setGames } = useLocalCollection<GameRecord>(
    "games",
    MOCK_GAMES
  );
  const { items: alerts, setItems: setAlerts } = useLocalCollection<AlertItem>(
    "alerts",
    MOCK_ALERTS
  );
  const { items: opportunities, setItems: setOpportunities } = useLocalCollection<Opportunity>(
    "opportunities",
    MOCK_OPPORTUNITIES
  );
  const { items: auditLog, setItems: setAuditLog } = useLocalCollection<AuditLogEntry>(
    "auditLog",
    MOCK_AUDIT_LOG
  );
  const { items: aiConversations, setItems: setAiConversations } = useLocalCollection<AiConversation>(
    "aiConversations",
    MOCK_AI_CONVERSATIONS
  );

  const logActivity = useCallback(
    (entry: Omit<ActivityEntry, "id" | "timestamp">) => {
      const newEntry: ActivityEntry = {
        ...entry,
        id: generateId("act"),
        timestamp: nowIso(),
      };
      setActivity((prev) => [newEntry, ...prev].slice(0, 50));
    },
    [setActivity]
  );

  // --- Players ---------------------------------------------------------

  const addPlayer = useCallback<DataContextValue["addPlayer"]>(
    async (player) => {
      const created = await insertPlayer(player);
      setPlayers((prev) => [created, ...prev]);
      logActivity({
        type: "player_added" as ActivityType,
        message: `Added new player ${created.firstName} ${created.lastName}`,
        entityId: created.id,
        entityLabel: `${created.firstName} ${created.lastName}`,
        agent: created.responsibleAgent || created.representingAgent,
      });
      return created;
    },
    [logActivity]
  );

  const updatePlayer = useCallback<DataContextValue["updatePlayer"]>(
    (id, updates) => {
      // Optimistické promítnutí do UI hned, zápis do Supabase běží na pozadí.
      setPlayers((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, ...updates, updatedAt: nowIso() } : p
        )
      );
      updatePlayerRow(id, updates).catch((err) =>
        console.error("Nepodařilo se uložit změnu hráče do Supabase:", err)
      );
    },
    []
  );

  const deletePlayer = useCallback<DataContextValue["deletePlayer"]>(
    (id) => {
      setPlayers((prev) => prev.filter((p) => p.id !== id));
      deletePlayerRow(id).catch((err) =>
        console.error("Nepodařilo se smazat hráče v Supabase:", err)
      );
    },
    []
  );

  const getPlayer = useCallback(
    (id: string) => players.find((p) => p.id === id),
    [players]
  );

  // --- Clubs -------------------------------------------------------------

  const addClub = useCallback<DataContextValue["addClub"]>(
    async (club) => {
      const created = await insertClub(club);
      setClubs((prev) => [created, ...prev]);
      logActivity({
        type: "club_added",
        message: `Added new club ${created.name}`,
        entityId: created.id,
        entityLabel: created.name,
        agent: "System",
      });
      return created;
    },
    [logActivity]
  );

  const updateClub = useCallback<DataContextValue["updateClub"]>(
    (id, updates) => {
      setClubs((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, ...updates, updatedAt: nowIso() } : c
        )
      );
      updateClubRow(id, updates).catch((err) =>
        console.error("Nepodařilo se uložit změnu klubu do Supabase:", err)
      );
    },
    []
  );

  const deleteClub = useCallback<DataContextValue["deleteClub"]>(
    (id) => {
      setClubs((prev) => prev.filter((c) => c.id !== id));
      deleteClubRow(id).catch((err) =>
        console.error("Nepodařilo se smazat klub v Supabase:", err)
      );
    },
    []
  );

  const getClub = useCallback(
    (id: string) => clubs.find((c) => c.id === id),
    [clubs]
  );

  // --- Contacts ------------------------------------------------------------

  const addContact = useCallback<DataContextValue["addContact"]>(
    (contact) => {
      const created: Contact = {
        ...contact,
        id: generateId("contact"),
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };
      setContacts((prev) => [created, ...prev]);
      logActivity({
        type: "contact_added",
        message: `Added new contact ${created.firstName} ${created.lastName}`,
        entityId: created.id,
        entityLabel: `${created.firstName} ${created.lastName}`,
        agent: "System",
      });
      return created;
    },
    [setContacts, logActivity]
  );

  const updateContact = useCallback<DataContextValue["updateContact"]>(
    (id, updates) => {
      setContacts((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, ...updates, updatedAt: nowIso() } : c
        )
      );
    },
    [setContacts]
  );

  const deleteContact = useCallback<DataContextValue["deleteContact"]>(
    (id) => {
      setContacts((prev) => prev.filter((c) => c.id !== id));
    },
    [setContacts]
  );

  const getContact = useCallback(
    (id: string) => contacts.find((c) => c.id === id),
    [contacts]
  );

  // --- Tasks -----------------------------------------------------------

  const addTask = useCallback<DataContextValue["addTask"]>(
    (task) => {
      const created: TaskItem = {
        ...task,
        id: generateId("task"),
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };
      setTasks((prev) => [created, ...prev]);
      return created;
    },
    [setTasks]
  );

  const updateTask = useCallback<DataContextValue["updateTask"]>(
    (id, updates) => {
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id !== id) return t;
          const updated = { ...t, ...updates, updatedAt: nowIso() };
          if (updates.status === "completed" && t.status !== "completed") {
            logActivity({
              type: "task_completed",
              message: `Completed task: ${updated.title}`,
              entityId: updated.playerId,
              entityLabel: updated.title,
              agent: updated.responsibleAgent,
            });
          }
          return updated;
        })
      );
    },
    [setTasks, logActivity]
  );

  const deleteTask = useCallback<DataContextValue["deleteTask"]>(
    (id) => {
      setTasks((prev) => prev.filter((t) => t.id !== id));
    },
    [setTasks]
  );

  const getTask = useCallback(
    (id: string) => tasks.find((t) => t.id === id),
    [tasks]
  );

  // --- Deals -----------------------------------------------------------

  const addDeal = useCallback<DataContextValue["addDeal"]>(
    (deal) => {
      const created: Deal = {
        ...deal,
        id: generateId("deal"),
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };
      setDeals((prev) => [created, ...prev]);
      logActivity({
        type: "deal_updated",
        message: `Added new deal: ${created.clubName}`,
        entityId: created.id,
        entityLabel: created.clubName,
        agent: created.responsibleAgent,
      });
      return created;
    },
    [setDeals, logActivity]
  );

  const updateDeal = useCallback<DataContextValue["updateDeal"]>(
    (id, updates) => {
      setDeals((prev) =>
        prev.map((d) => {
          if (d.id !== id) return d;
          const statusChanged = !!updates.status && updates.status !== d.status;
          const updated = {
            ...d,
            ...updates,
            timeline: statusChanged
              ? [
                  ...d.timeline,
                  {
                    id: generateId("dt"),
                    date: nowIso().slice(0, 10),
                    status: updates.status as Deal["status"],
                    note: `Status changed to ${updates.status}.`,
                    agent: updates.responsibleAgent ?? d.responsibleAgent,
                  },
                ]
              : d.timeline,
            updatedAt: nowIso(),
          };
          if (statusChanged) {
            logActivity({
              type: "deal_updated",
              message: `Deal for ${updated.clubName} moved to ${updates.status}`,
              entityId: updated.id,
              entityLabel: updated.clubName,
              agent: updated.responsibleAgent,
            });
          }
          return updated;
        })
      );
    },
    [setDeals, logActivity]
  );

  const deleteDeal = useCallback<DataContextValue["deleteDeal"]>(
    (id) => {
      setDeals((prev) => prev.filter((d) => d.id !== id));
    },
    [setDeals]
  );

  const getDeal = useCallback(
    (id: string) => deals.find((d) => d.id === id),
    [deals]
  );

  // --- Documents ---------------------------------------------------------

  const addDocument = useCallback<DataContextValue["addDocument"]>(
    (doc) => {
      const created: AgencyDocument = {
        ...doc,
        id: generateId("doc"),
        uploadedAt: nowIso(),
      };
      setDocuments((prev) => [created, ...prev]);
      logActivity({
        type: "document_added",
        message: `Added document: ${created.title}`,
        entityId: created.id,
        entityLabel: created.title,
        agent: "System",
      });
      return created;
    },
    [setDocuments, logActivity]
  );

  const updateDocument = useCallback<DataContextValue["updateDocument"]>(
    (id, updates) => {
      setDocuments((prev) =>
        prev.map((d) => (d.id === id ? { ...d, ...updates } : d))
      );
    },
    [setDocuments]
  );

  const deleteDocument = useCallback<DataContextValue["deleteDocument"]>(
    (id) => {
      setDocuments((prev) => prev.filter((d) => d.id !== id));
    },
    [setDocuments]
  );

  // --- Communications ------------------------------------------------------

  const addCommunication = useCallback<DataContextValue["addCommunication"]>(
    (entry) => {
      const created: CommunicationEntry = {
        ...entry,
        id: generateId("comm"),
        createdAt: nowIso(),
      };
      setCommunications((prev) => [created, ...prev]);
      logActivity({
        type: "communication_logged",
        message: `Logged ${entry.type} with ${entry.linkedEntityLabel}`,
        entityId: created.linkedEntityId,
        entityLabel: created.linkedEntityLabel,
        agent: created.responsibleAgent,
      });
      return created;
    },
    [setCommunications, logActivity]
  );

  const updateCommunication = useCallback<DataContextValue["updateCommunication"]>(
    (id, updates) => {
      setCommunications((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
      );
    },
    [setCommunications]
  );

  const deleteCommunication = useCallback<DataContextValue["deleteCommunication"]>(
    (id) => {
      setCommunications((prev) => prev.filter((c) => c.id !== id));
    },
    [setCommunications]
  );

  // --- Game Tracker --------------------------------------------------------

  const addGame = useCallback<DataContextValue["addGame"]>(
    (game) => {
      const created: GameRecord = {
        ...game,
        id: generateId("game"),
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };
      setGames((prev) => [created, ...prev]);
      return created;
    },
    [setGames]
  );

  const updateGame = useCallback<DataContextValue["updateGame"]>(
    (id, updates) => {
      setGames((prev) =>
        prev.map((g) => (g.id === id ? { ...g, ...updates, updatedAt: nowIso() } : g))
      );
    },
    [setGames]
  );

  const deleteGame = useCallback<DataContextValue["deleteGame"]>(
    (id) => {
      setGames((prev) => prev.filter((g) => g.id !== id));
    },
    [setGames]
  );

  const getGame = useCallback((id: string) => games.find((g) => g.id === id), [games]);

  // --- Alerts & Intelligence -----------------------------------------------

  const addAlert = useCallback<DataContextValue["addAlert"]>(
    (alert) => {
      const created: AlertItem = {
        ...alert,
        id: generateId("alert"),
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };
      setAlerts((prev) => [created, ...prev]);
      return created;
    },
    [setAlerts]
  );

  const updateAlert = useCallback<DataContextValue["updateAlert"]>(
    (id, updates) => {
      setAlerts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, ...updates, updatedAt: nowIso() } : a))
      );
    },
    [setAlerts]
  );

  const deleteAlert = useCallback<DataContextValue["deleteAlert"]>(
    (id) => {
      setAlerts((prev) => prev.filter((a) => a.id !== id));
    },
    [setAlerts]
  );

  // --- Opportunity Finder ----------------------------------------------------

  const addOpportunity = useCallback<DataContextValue["addOpportunity"]>(
    (opp) => {
      const created: Opportunity = {
        ...opp,
        id: generateId("opp"),
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };
      setOpportunities((prev) => [created, ...prev]);
      return created;
    },
    [setOpportunities]
  );

  const updateOpportunity = useCallback<DataContextValue["updateOpportunity"]>(
    (id, updates) => {
      setOpportunities((prev) =>
        prev.map((o) => (o.id === id ? { ...o, ...updates, updatedAt: nowIso() } : o))
      );
    },
    [setOpportunities]
  );

  const deleteOpportunity = useCallback<DataContextValue["deleteOpportunity"]>(
    (id) => {
      setOpportunities((prev) => prev.filter((o) => o.id !== id));
    },
    [setOpportunities]
  );

  // --- Audit log -------------------------------------------------------------

  const addAuditLogEntry = useCallback<DataContextValue["addAuditLogEntry"]>(
    (entry) => {
      const created: AuditLogEntry = {
        ...entry,
        id: generateId("audit"),
        timestamp: nowIso(),
      };
      setAuditLog((prev) => [created, ...prev].slice(0, 200));
    },
    [setAuditLog]
  );

  // --- SMC AI Assistant (mock conversations) --------------------------------

  const createAiConversation = useCallback<DataContextValue["createAiConversation"]>(
    (conversation) => {
      const created: AiConversation = {
        ...conversation,
        id: generateId("ai-conv"),
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };
      setAiConversations((prev) => [created, ...prev]);
      return created;
    },
    [setAiConversations]
  );

  const appendAiMessage = useCallback<DataContextValue["appendAiMessage"]>(
    (conversationId, message) => {
      const created: AiMessage = { ...message, id: generateId("ai-msg") };
      setAiConversations((prev) =>
        prev.map((c) =>
          c.id === conversationId
            ? { ...c, messages: [...c.messages, created], updatedAt: nowIso() }
            : c
        )
      );
    },
    [setAiConversations]
  );

  const deleteAiConversation = useCallback<DataContextValue["deleteAiConversation"]>(
    (id) => {
      setAiConversations((prev) => prev.filter((c) => c.id !== id));
    },
    [setAiConversations]
  );

  // --- EliteProspects pilot sync ------------------------------------------

  const importFromEliteProspects = useCallback<DataContextValue["importFromEliteProspects"]>(
    (id) => {
      const player = players.find((p) => p.id === id);
      if (!player) return undefined;

      const externalData = generateMockExternalData(player);
      const timestamp = nowIso();
      const updated: Player = {
        ...player,
        externalData,
        syncStatus: "synced",
        dataSource: "eliteprospects",
        lastSyncedAt: timestamp,
        updatedAt: timestamp,
      };

      setPlayers((prev) => prev.map((p) => (p.id === id ? updated : p)));
      updatePlayerRow(id, {
        externalData,
        syncStatus: "synced",
        dataSource: "eliteprospects",
        lastSyncedAt: timestamp,
      }).catch((err) => console.error("Nepodařilo se uložit import do Supabase:", err));

      setSyncLog((prev) => [
        {
          id: generateId("sync"),
          entityType: "player",
          entityId: id,
          entityLabel: `${player.firstName} ${player.lastName}`,
          status: "synced",
          message: "Profile data imported successfully (mock).",
          timestamp,
        },
        ...prev,
      ]);

      logActivity({
        type: "player_updated",
        message: `Imported EliteProspects data for ${player.firstName} ${player.lastName}`,
        entityId: id,
        entityLabel: `${player.firstName} ${player.lastName}`,
        agent: player.responsibleAgent || player.representingAgent,
      });

      return updated;
    },
    [players, setPlayers, setSyncLog, logActivity]
  );

  const syncClubOrContact = useCallback<DataContextValue["syncClubOrContact"]>(
    (entityType, id) => {
      const timestamp = nowIso();
      if (entityType === "club") {
        const club = clubs.find((c) => c.id === id);
        if (!club) return;
        setClubs((prev) =>
          prev.map((c) =>
            c.id === id
              ? { ...c, syncStatus: "synced", dataSource: "eliteprospects", lastSyncedAt: timestamp, updatedAt: timestamp }
              : c
          )
        );
        updateClubRow(id, { syncStatus: "synced", dataSource: "eliteprospects", lastSyncedAt: timestamp }).catch(
          (err) => console.error("Nepodařilo se uložit sync klubu do Supabase:", err)
        );
        setSyncLog((prev) => [
          { id: generateId("sync"), entityType: "club", entityId: id, entityLabel: club.name, status: "synced", message: "Club staff data refreshed (mock).", timestamp },
          ...prev,
        ]);
      } else {
        const contact = contacts.find((c) => c.id === id);
        if (!contact) return;
        setContacts((prev) =>
          prev.map((c) =>
            c.id === id
              ? { ...c, syncStatus: "synced", dataSource: "eliteprospects", lastSyncedAt: timestamp, updatedAt: timestamp }
              : c
          )
        );
        setSyncLog((prev) => [
          { id: generateId("sync"), entityType: "contact", entityId: id, entityLabel: `${contact.firstName} ${contact.lastName}`, status: "synced", message: "Contact data refreshed (mock).", timestamp },
          ...prev,
        ]);
      }
    },
    [clubs, contacts, setClubs, setContacts, setSyncLog]
  );

  const value = useMemo<DataContextValue>(
    () => ({
      players,
      playersLoading,
      clubs,
      clubsLoading,
      contacts,
      tasks,
      deals,
      documents,
      communications,
      activity,
      addPlayer,
      updatePlayer,
      deletePlayer,
      getPlayer,
      addClub,
      updateClub,
      deleteClub,
      getClub,
      addContact,
      updateContact,
      deleteContact,
      getContact,
      addTask,
      updateTask,
      deleteTask,
      getTask,
      addDeal,
      updateDeal,
      deleteDeal,
      getDeal,
      addDocument,
      updateDocument,
      deleteDocument,
      addCommunication,
      updateCommunication,
      deleteCommunication,
      games,
      addGame,
      updateGame,
      deleteGame,
      getGame,
      alerts,
      addAlert,
      updateAlert,
      deleteAlert,
      opportunities,
      addOpportunity,
      updateOpportunity,
      deleteOpportunity,
      auditLog,
      addAuditLogEntry,
      aiConversations,
      createAiConversation,
      appendAiMessage,
      deleteAiConversation,
      syncLog,
      importFromEliteProspects,
      syncClubOrContact,
      logActivity,
}),
    [
      players,
      playersLoading,
      clubs,
      clubsLoading,
      contacts,
      tasks,
      deals,
      documents,
      communications,
      activity,
      addPlayer,
      updatePlayer,
      deletePlayer,
      getPlayer,
      addClub,
      updateClub,
      deleteClub,
      getClub,
      addContact,
      updateContact,
      deleteContact,
      getContact,
      addTask,
      updateTask,
      deleteTask,
      getTask,
      addDeal,
      updateDeal,
      deleteDeal,
      getDeal,
      addDocument,
      updateDocument,
      deleteDocument,
      addCommunication,
      updateCommunication,
      deleteCommunication,
      games,
      addGame,
      updateGame,
      deleteGame,
      getGame,
      alerts,
      addAlert,
      updateAlert,
      deleteAlert,
      opportunities,
      addOpportunity,
      updateOpportunity,
      deleteOpportunity,
      auditLog,
      addAuditLogEntry,
      aiConversations,
      createAiConversation,
      appendAiMessage,
      deleteAiConversation,
      syncLog,
      importFromEliteProspects,
      syncClubOrContact,
      logActivity,
]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) {
    throw new Error("useData must be used within a DataProvider");
  }
  return ctx;
}
