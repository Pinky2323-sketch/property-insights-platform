"use client";

import { useMemo, useState } from "react";
import ExportButtons from "./ExportButtons";
import { formatPrice } from "./format";
import type { MarketProperty } from "./types";

type SortKey = keyof MarketProperty;
type SortDir = "asc" | "desc";

const COLUMNS: { key: SortKey; label: string; format?: (v: number) => string }[] = [
  { key: "id", label: "ID" },
  { key: "squareFootage", label: "Sq ft" },
  { key: "bedrooms", label: "Beds" },
  { key: "bathrooms", label: "Baths" },
  { key: "yearBuilt", label: "Year built" },
  { key: "lotSize", label: "Lot size" },
  { key: "distanceToCityCenter", label: "Distance (mi)" },
  { key: "schoolRating", label: "School" },
  { key: "price", label: "Price", format: formatPrice },
];

const SCROLL_BOX =
  "mt-4 max-h-[28rem] overflow-auto [scrollbar-gutter:stable] " +
  "[&::-webkit-scrollbar]:h-3 [&::-webkit-scrollbar]:w-3 " +
  "[&::-webkit-scrollbar-track]:bg-gray-100 " +
  "[&::-webkit-scrollbar-thumb]:rounded-md [&::-webkit-scrollbar-thumb]:bg-gray-400";

export default function PropertyTable({ rows }: { rows: MarketProperty[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("id");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [query, setQuery] = useState("");

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? rows.filter((r) => Object.values(r).some((v) => String(v).toLowerCase().includes(q)))
      : rows;
    const sorted = [...filtered].sort((a, b) => a[sortKey] - b[sortKey]);
    return sortDir === "asc" ? sorted : sorted.reverse();
  }, [rows, query, sortKey, sortDir]);

  return (
    <div className="mt-8 rounded-lg border border-gray-200 bg-white p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Properties</h2>
          <p className="mt-1 text-sm text-gray-500" aria-live="polite">
            Showing {visible.length} of {rows.length}. Click a column heading to sort.
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label htmlFor="table-search" className="block text-sm font-medium text-gray-700">
              Search table
            </label>
            <input
              id="table-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. 1998 or 3"
              className="mt-1 block w-48 rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <ExportButtons rows={visible} />
        </div>
      </div>

      <div
        className={SCROLL_BOX}
        tabIndex={0}
        role="region"
        aria-label="Properties table, scrollable"
      >
        <table className="w-full min-w-[860px] text-sm">
          <caption className="sr-only">Properties in the housing dataset</caption>
          <thead className="sticky top-0 bg-white">
            <tr className="border-b border-gray-200 text-gray-500">
              {COLUMNS.map((col) => {
                const active = col.key === sortKey;
                return (
                  <th
                    key={col.key}
                    scope="col"
                    aria-sort={active ? (sortDir === "asc" ? "ascending" : "descending") : "none"}
                    className="px-3 py-2 text-right font-medium first:text-left last:pr-6"
                  >
                    <button
                      type="button"
                      onClick={() => handleSort(col.key)}
                      className="rounded px-1 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {col.label}
                      {active ? (sortDir === "asc" ? " ▲" : " ▼") : ""}
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {visible.map((row) => (
              <tr key={row.id}>
                {COLUMNS.map((col) => (
                  <td
                    key={col.key}
                    className="px-3 py-2 text-right text-gray-700 first:text-left last:pr-6"
                  >
                    {col.format ? col.format(row[col.key]) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {visible.length === 0 && (
          <p className="py-6 text-center text-sm text-gray-500">No rows match your search.</p>
        )}
      </div>
    </div>
  );
}