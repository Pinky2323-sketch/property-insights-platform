import { Suspense } from "react";
import { getByAgeBand, getByBedrooms, getProperties, getSummary, type Filters } from "./api";
import FilterBar from "./FilterBar";
import { formatPrice } from "./format";
import MarketCharts from "./MarketCharts";
import PropertyTable from "./PropertyTable";
import WhatIfForm from "./WhatIfForm";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function readFilters(params: Record<string, string | string[] | undefined>): Filters {
  const pick = (key: string) => {
    const value = params[key];
    return Array.isArray(value) ? value[0] : value;
  };
  return {
    minPrice: pick("minPrice"),
    maxPrice: pick("maxPrice"),
    bedrooms: pick("bedrooms"),
    minSqft: pick("minSqft"),
    maxSqft: pick("maxSqft"),
  };
}

export default async function MarketAnalysisPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const filters = readFilters(await searchParams);

  const [summary, byBedrooms, byAgeBand, properties] = await Promise.all([
    getSummary(filters),
    getByBedrooms(filters),
    getByAgeBand(filters),
    getProperties(filters),
  ]);

  const hasResults = summary.count > 0;

  const cards = [
    { label: "Properties", value: String(summary.count) },
    { label: "Average price", value: formatPrice(summary.avgPrice) },
    { label: "Median price", value: formatPrice(summary.medianPrice) },
    { label: "Average price per sq ft", value: `$${summary.avgPricePerSqft}` },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-900">Property Market Analysis</h1>
      <p className="mt-2 text-gray-600">Aggregate statistics from the housing dataset.</p>

      <Suspense fallback={null}>
        <FilterBar />
      </Suspense>

      {!hasResults ? (
        <div
          role="status"
          className="mt-8 rounded-lg border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800"
        >
          No properties match these filters. Try widening the ranges, or click Reset.
        </div>
      ) : (
        <>
          <dl className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map((card) => (
              <div key={card.label} className="rounded-lg border border-gray-200 bg-white p-4">
                <dt className="text-sm text-gray-500">{card.label}</dt>
                <dd className="mt-1 text-2xl font-semibold text-gray-900">{card.value}</dd>
              </div>
            ))}
          </dl>

          <MarketCharts byBedrooms={byBedrooms} byAgeBand={byAgeBand} />

          <div className="mt-8 grid gap-8 lg:grid-cols-2">
            {[
              { title: "By bedrooms", rows: byBedrooms },
              { title: "By year built", rows: byAgeBand },
            ].map((group) => (
              <div key={group.title} className="rounded-lg border border-gray-200 bg-white p-6">
                <h2 className="text-lg font-semibold text-gray-900">{group.title}</h2>
                <table className="mt-4 w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-left text-gray-500">
                      <th scope="col" className="py-2 font-medium">Group</th>
                      <th scope="col" className="py-2 text-right font-medium">Count</th>
                      <th scope="col" className="py-2 text-right font-medium">Avg price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {group.rows.map((row) => (
                      <tr key={row.label}>
                        <th scope="row" className="py-2 text-left font-normal text-gray-700">
                          {row.label}
                        </th>
                        <td className="py-2 text-right text-gray-600">{row.count}</td>
                        <td className="py-2 text-right text-gray-900">{formatPrice(row.avgPrice)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>

          <PropertyTable rows={properties} />
        </>
      )}

      <WhatIfForm />
    </div>
  );
}