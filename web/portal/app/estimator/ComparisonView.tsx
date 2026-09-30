import { formatPrice } from "./ResultsPanel";
import type { HistoryEntry, PropertyFeatures } from "./types";

const FIELD_LABELS: Record<keyof PropertyFeatures, string> = {
  square_footage: "Square Footage",
  bedrooms: "Bedrooms",
  bathrooms: "Bathrooms",
  year_built: "Year Built",
  lot_size: "Lot Size (sq ft)",
  distance_to_city_center: "Distance to City Center (miles)",
  school_rating: "School Rating",
};

const FIELDS = Object.keys(FIELD_LABELS) as (keyof PropertyFeatures)[];

interface ComparisonViewProps {
  entries: HistoryEntry[];
}

export default function ComparisonView({ entries }: ComparisonViewProps) {
  
  function isDifferent(field: keyof PropertyFeatures): boolean {
    return new Set(entries.map((e) => e.form[field])).size > 1;
  }

  const prices = entries.map((e) => e.price);
  const highest = Math.max(...prices);
  const lowest = Math.min(...prices);

  return (
    <div className="mt-8 rounded-lg border border-gray-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-gray-900">Comparison</h2>
      <p className="mt-1 text-sm text-gray-500">
        Highlighted rows are where the properties differ.
      </p>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[480px] text-sm">
          <caption className="sr-only">Side-by-side comparison of selected properties</caption>
          <thead>
            <tr className="border-b border-gray-200 text-left text-gray-500">
              <th scope="col" className="py-2 pr-4 font-medium">Field</th>
              {entries.map((entry, index) => (
                <th key={entry.id} scope="col" className="py-2 pr-4 text-right font-medium">
                  Property {index + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {FIELDS.map((field) => (
              <tr key={field} className={isDifferent(field) ? "bg-amber-50" : ""}>
                <th scope="row" className="py-2 pr-4 text-left font-normal text-gray-600">
                  {FIELD_LABELS[field]}
                </th>
                {entries.map((entry) => (
                  <td key={entry.id} className="py-2 pr-4 text-right text-gray-900">
                    {entry.form[field]}
                  </td>
                ))}
              </tr>
            ))}
            <tr className="border-t-2 border-gray-200 font-semibold">
              <th scope="row" className="py-3 pr-4 text-left">Estimated Price</th>
              {entries.map((entry) => (
                <td
                  key={entry.id}
                  className={`py-3 pr-4 text-right ${
                    entry.price === highest && highest !== lowest
                      ? "text-green-700"
                      : entry.price === lowest && highest !== lowest
                        ? "text-red-700"
                        : "text-gray-900"
                  }`}
                >
                  {formatPrice(entry.price)}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}