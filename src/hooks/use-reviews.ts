"use client";

import { useCallback, useSyncExternalStore } from "react";

import type { UploadStatus } from "@/lib/upload/types";

const STORAGE_KEY = "training-jsa-hiradc:reviews:v1";

export interface ReviewEntry {
  status: UploadStatus;
  comment: string;
}

export type ReviewMap = Record<string, ReviewEntry>;

const EMPTY: ReviewMap = {};
const VALID_STATUS: UploadStatus[] = [
  "Pending",
  "Disetujui",
  "Perlu Revisi",
  "Ditolak",
];

const listeners = new Set<() => void>();
let cachedRaw: string | null = null;
let cachedValue: ReviewMap = EMPTY;

function parse(raw: string | null): ReviewMap {
  if (!raw) return EMPTY;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return EMPTY;
    const out: ReviewMap = {};
    for (const [id, value] of Object.entries(parsed as Record<string, unknown>)) {
      if (value && typeof value === "object") {
        const entry = value as Partial<ReviewEntry>;
        if (
          typeof entry.status === "string" &&
          VALID_STATUS.includes(entry.status as UploadStatus)
        ) {
          out[id] = {
            status: entry.status as UploadStatus,
            comment: typeof entry.comment === "string" ? entry.comment : "",
          };
        }
      }
    }
    return out;
  } catch {
    return EMPTY;
  }
}

function getSnapshot(): ReviewMap {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return EMPTY;
  }
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedValue = parse(raw);
  }
  return cachedValue;
}

function getServerSnapshot(): ReviewMap {
  return EMPTY;
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
}

/**
 * Admin review decisions (status + comment) per upload, persisted per device.
 *
 * Lets the review list and the detail page share one source, so a decision saved
 * on the detail page shows on the list without a round-trip. localStorage read
 * through `useSyncExternalStore` (same pattern as the peserta store). Stands in
 * for the review API until the backend phase.
 */
export function useReviews() {
  const reviews = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const saveReview = useCallback((id: string, entry: ReviewEntry) => {
    const next: ReviewMap = { ...getSnapshot(), [id]: entry };
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Blocked storage shouldn't break the save flow.
    }
    listeners.forEach((listener) => listener());
  }, []);

  return { reviews, saveReview };
}
