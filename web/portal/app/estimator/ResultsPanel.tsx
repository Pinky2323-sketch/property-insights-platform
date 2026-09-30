"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { HistoryEntry, PropertyFeatures } from "./types";

const priceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function formatPrice(value: number): string {
  return priceFormatter.format(value);
}

const FIELD_LABELS: Record<keyof PropertyFeatures, string> = {
  square_footage: "Square Footage",
  bedrooms: "Bedrooms",
  bathrooms: "Bathrooms",
  year_built: "Year Built",
  lot_size: "Lot Size (sq ft)",
  distance_to_city_center: "Distance to City Center (miles)",
  school_rating: "School Rating",
};

interface ResultsPanelProps {
  history: HistoryEntry[]; // newest first
}

export default function ResultsPanel({ history }: ResultsPanelProps) {
  const latest = history[0];

  if (!latest) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">Result</h2>
        <p className="mt-4 text-sm text-gray-500">
          Submit the form to see an estimated price.
        </p>
      </div>
    );
  }

  // Chart shows up to the last 10 estimates, oldest on the left.
  const chartData = history
    .slice(0, 10)
    .reverse()
    .map((entry, index) => ({ name: `#${index + 1}`, price: entry.price }));

  const fields = Object.keys(FIELD_LABELS) as (keyof PropertyFeatures)[];

  return (
    <div className="space-y-6 rounded-lg border border-gray-200 bg-white p-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Result</h2>
        <p className="mt-2 text-3xl font-bold text-blue-600" aria-live="polite">
          {formatPrice(latest.price)}
        </p>
      </div>

      <table className="w-full text-sm">
        <caption className="sr-only">Property details for the latest estimate</caption>
        <thead>
          <tr className="border-b border-gray-200 text-left text-gray-500">
            <th scope="col" className="py-2 font-medium">Field</th>
            <th scope="col" className="py-2 text-right font-medium">Value</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {fields.map((field) => (
            <tr key={field}>
              <th scope="row" className="py-2 text-left font-normal text-gray-600">
                {FIELD_LABELS[field]}
              </th>
              <td className="py-2 text-right text-gray-900">{latest.form[field]}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div>
        <h3 className="text-sm font-medium text-gray-700">Estimates this session</h3>
        <div
          className="mt-2 h-56"
          role="img"
          aria-label={`Bar chart of your last ${chartData.length} estimated prices`}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis
                width={70}
                tickFormatter={(value) => `$${Math.round(Number(value) / 1000)}k`}
              />
              <Tooltip formatter={(value) => formatPrice(Number(value))} />
              <Bar dataKey="price" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}