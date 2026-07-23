"use client";

import { useEffect, useState, type Dispatch, type SetStateAction } from "react";

/**
 * State that persists to localStorage. SSR-safe: renders the initial value on
 * the server and first client paint (so hydration matches), then hydrates from
 * storage after mount. Writes are debounced to the value effect.
 */
export function useLocalStorage<T>(
  key: string,
  initial: T
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(initial);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw != null) setValue(JSON.parse(raw) as T);
    } catch {
      /* ignore malformed / unavailable storage */
    }
    setLoaded(true);
  }, [key]);

  useEffect(() => {
    if (!loaded) return; // don't overwrite stored data with the default
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* storage full or blocked — ignore */
    }
  }, [key, value, loaded]);

  return [value, setValue];
}
