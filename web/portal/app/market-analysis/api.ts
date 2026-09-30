import type { GroupStat, MarketProperty, MarketSummary } from "./types";

const BASE = process.env.MARKET_API_URL ?? "http://localhost:8002/api";

export interface Filters {
  minPrice?: string;
  maxPrice?: string;
  bedrooms?: string;
  minSqft?: string;
  maxSqft?: string;
}

function toQuery(filters: Filters): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value) params.set(key, value);
  }
  const query = params.toString();
  return query ? `?${query}` : "";
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Market API responded with ${res.status}`);
  }
  return res.json();
}

export const getSummary = (f: Filters = {}) =>
  get<MarketSummary>(`/market/summary${toQuery(f)}`);
export const getByBedrooms = (f: Filters = {}) =>
  get<GroupStat[]>(`/market/by-bedrooms${toQuery(f)}`);
export const getByAgeBand = (f: Filters = {}) =>
  get<GroupStat[]>(`/market/by-age-band${toQuery(f)}`);
export const getProperties = (f: Filters = {}) =>
  get<MarketProperty[]>(`/market/properties${toQuery(f)}`);