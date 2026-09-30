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
import { formatPrice } from "./format";
import type { GroupStat } from "./types";

function PriceChart({ title, rows }: { title: string; rows: GroupStat[] }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      <div
        className="mt-4 h-64"
        role="img"
        aria-label={`Bar chart: ${title}. ${rows
          .map((r) => `${r.label} ${formatPrice(r.avgPrice)}`)
          .join(", ")}`}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" />
            <YAxis
              width={70}
              tickFormatter={(v) => `$${Math.round(Number(v) / 1000)}k`}
            />
            <Tooltip formatter={(v) => formatPrice(Number(v))} />
            <Bar dataKey="avgPrice" name="Average price" fill="#2563eb" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

interface MarketChartsProps {
  byBedrooms: GroupStat[];
  byAgeBand: GroupStat[];
}

export default function MarketCharts({ byBedrooms, byAgeBand }: MarketChartsProps) {
  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-2">
      <PriceChart title="Average price by bedrooms" rows={byBedrooms} />
      <PriceChart title="Average price by year built" rows={byAgeBand} />
    </div>
  );
}