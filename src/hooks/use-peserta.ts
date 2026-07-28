"use client";

import { useCallback, useSyncExternalStore } from "react";

import type { Peserta } from "@/lib/daftar-hadir/peserta";

const STORAGE_KEY = "training-jsa-hiradc:peserta:v1";

const listeners = new Set<() => void>();

// getSnapshot must return a stable reference until the data changes, or
// useSyncExternalStore loops. Cache the parsed value against the raw string.
let cachedRaw: string | null = null;
let cachedValue: Peserta | null = null;

function parse(raw: string | null): Peserta | null {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed === "object" &&
      typeof (parsed as Peserta).email === "string"
    ) {
      return parsed as Peserta;
    }
    return null;
  } catch {
    return null;
  }
}

function getSnapshot(): Peserta | null {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }

  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedValue = parse(raw);
  }
  return cachedValue;
}

/** Prerendered HTML has no storage, so the server always sees no peserta. */
function getServerSnapshot(): Peserta | null {
  return null;
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
}

/**
 * The registered peserta for this device, if the Daftar Hadir has been signed.
 *
 * Their presence is what later unlocks the quiz, so it's read through
 * `useSyncExternalStore` — every screen stays in sync and the prerendered page
 * hydrates without a mismatch (server starts from null). Frontend-first: this
 * stands in for the server session until the Daftar Hadir POST exists; the
 * backend phase persists the record and this becomes a cache of it.
 */
export function usePeserta() {
  const peserta = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const register = useCallback((next: Peserta) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Blocked storage shouldn't break the submit flow.
    }
    listeners.forEach((listener) => listener());
  }, []);

  const clear = useCallback(() => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore — nothing to clear if storage is unavailable.
    }
    listeners.forEach((listener) => listener());
  }, []);

  return { peserta, register, clear };
}
