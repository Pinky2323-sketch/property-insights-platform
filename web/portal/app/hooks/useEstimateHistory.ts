"use client";

import { useSyncExternalStore } from "react";
import type { HistoryEntry } from "../estimator/types";

const STORAGE_KEY = "estimator-history";
const MAX_ENTRIES = 50;
const EMPTY: HistoryEntry[] = [];

let current: HistoryEntry[] | null = null;
const listeners = new Set<() => void>();

function load(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : EMPTY;
    return Array.isArray(parsed) ? parsed : EMPTY;
  } catch (err) {
    console.error("Failed to load history from localStorage:", err);
    return EMPTY;
  }
}

function persist(next: HistoryEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch (err) {
    console.error("Failed to save history to localStorage:", err);
  }
}

function emit() {
  listeners.forEach((listener) => listener());
}

function getSnapshot(): HistoryEntry[] {
  if (current === null) current = load();
  return current;
}

function getServerSnapshot(): HistoryEntry[] {
  return EMPTY;
}

function subscribe(listener: () => void) {
  listeners.add(listener);

  function onStorage(event: StorageEvent) {
    if (event.key === STORAGE_KEY || event.key === null) {
      current = load();
      listener();
    }
  }
  window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function setHistory(next: HistoryEntry[]) {
  current = next;
  persist(next);
  emit();
}

function addEntry(entry: HistoryEntry) {
  setHistory([entry, ...getSnapshot()].slice(0, MAX_ENTRIES));
}

function clearHistory() {
  setHistory([]);
}

export function useEstimateHistory() {
  const history = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return { history, addEntry, clearHistory };
}