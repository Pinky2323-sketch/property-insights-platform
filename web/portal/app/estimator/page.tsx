"use client";

import { useState } from "react";
import { useEstimateHistory } from "../hooks/useEstimateHistory";
import ComparisonView from "./ComparisonView";
import PropertyForm from "./PropertyForm";
import ResultsPanel, { formatPrice } from "./ResultsPanel";
import type { EstimateResult, HistoryEntry, PropertyFeatures } from "./types";

const MAX_COMPARE = 4;

export default function EstimatorPage() {
  const { history, addEntry, clearHistory } = useEstimateHistory();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  function handleResult(result: EstimateResult, submittedForm: PropertyFeatures) {
    const entry: HistoryEntry = {
      id: crypto.randomUUID(),
      form: submittedForm,
      price: result.predictions[0],
      timestamp: new Date().toLocaleString(),
    };
    addEntry(entry);
  }

  function handleClear() {
    clearHistory();
    setSelectedIds([]);
  }

  function toggleSelected(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : prev.length < MAX_COMPARE
          ? [...prev, id]
          : prev
    );
  }

  const selectedEntries = history.filter((e) => selectedIds.includes(e.id));

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-900">Property Value Estimator</h1>
      <p className="mt-2 text-gray-600">
        Enter property details to get an estimated market value.
      </p>

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-2">
        <PropertyForm onResult={handleResult} />
        <ResultsPanel history={history} />
      </div>

      {history.length > 0 && (
        <div className="mt-8 rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">History</h2>
              <p className="mt-1 text-sm text-gray-500">
                Tick 2 to {MAX_COMPARE} estimates to compare them side by side.
              </p>
            </div>
            <button
              type="button"
              onClick={handleClear}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
            >
              Clear history
            </button>
          </div>
          <ul className="mt-4 divide-y divide-gray-100">
            {history.map((entry) => {
              const checked = selectedIds.includes(entry.id);
              const limitReached = !checked && selectedIds.length >= MAX_COMPARE;
              return (
                <li key={entry.id} className="flex items-center gap-3 py-3 text-sm">
                  <input
                    type="checkbox"
                    id={`compare-${entry.id}`}
                    checked={checked}
                    disabled={limitReached}
                    onChange={() => toggleSelected(entry.id)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <label
                    htmlFor={`compare-${entry.id}`}
                    className="flex flex-1 justify-between gap-4"
                  >
                    <span className="text-gray-600">
                      {entry.form.square_footage} sqft, {entry.form.bedrooms}bd/
                      {entry.form.bathrooms}ba, built {entry.form.year_built} — {entry.timestamp}
                    </span>
                    <span className="font-medium text-gray-900">{formatPrice(entry.price)}</span>
                  </label>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {selectedEntries.length >= 2 && <ComparisonView entries={selectedEntries} />}
    </div>
  );
}