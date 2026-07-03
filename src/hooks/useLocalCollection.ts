"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { loadFromStorage, saveToStorage } from "@/lib/storage";

export function useLocalCollection<T>(key: string, seed: T[]) {
  const [items, setItems] = useState<T[]>(seed);
  const hydrated = useRef(false);

  useEffect(() => {
    const stored = loadFromStorage<T[] | null>(key, null);
    if (stored) {
      setItems(stored);
    } else {
      saveToStorage(key, seed);
    }
    hydrated.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    if (!hydrated.current) return;
    saveToStorage(key, items);
  }, [key, items]);

  const reset = useCallback(() => {
    setItems(seed);
    saveToStorage(key, seed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return { items, setItems, reset };
}
