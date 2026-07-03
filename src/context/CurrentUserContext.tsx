"use client";

import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { MOCK_USERS } from "@/lib/mockData";
import { getPermissions, ROLE_PERMISSIONS } from "@/lib/permissions";
import { loadFromStorage, saveToStorage } from "@/lib/storage";
import { MockUser, RolePermissions } from "@/types";

const DEFAULT_USER_ID = "user-owner";
const STORAGE_KEY = "currentUserId";

interface CurrentUserContextValue {
  user: MockUser;
  users: MockUser[];
  permissions: RolePermissions;
  setCurrentUserId: (id: string) => void;
}

const CurrentUserContext = createContext<CurrentUserContextValue | null>(null);

export function CurrentUserProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string>(DEFAULT_USER_ID);

  useEffect(() => {
    const stored = loadFromStorage<string | null>(STORAGE_KEY, null);
    if (stored && MOCK_USERS.some((u) => u.id === stored)) {
      setUserId(stored);
    }
  }, []);

  function setCurrentUserId(id: string) {
    setUserId(id);
    saveToStorage(STORAGE_KEY, id);
  }

  const user = useMemo(
    () => MOCK_USERS.find((u) => u.id === userId) ?? MOCK_USERS[0],
    [userId]
  );
  const permissions = useMemo(() => getPermissions(user.role), [user.role]);

  const value = useMemo<CurrentUserContextValue>(
    () => ({ user, users: MOCK_USERS, permissions, setCurrentUserId }),
    [user, permissions]
  );

  return (
    <CurrentUserContext.Provider value={value}>
      {children}
    </CurrentUserContext.Provider>
  );
}

export function useCurrentUser(): CurrentUserContextValue {
  const ctx = useContext(CurrentUserContext);
  if (!ctx) {
    throw new Error("useCurrentUser must be used within a CurrentUserProvider");
  }
  return ctx;
}

export { ROLE_PERMISSIONS };
