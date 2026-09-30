"use client";

import { useState } from "react";
import { formatPrice } from "./format";
import type { MarketProperty } from "./types";

const COLUMNS: { key: keyof MarketProperty; label: string }[] = [
  { key: "id", label: "ID" },
  { key: "squareFootage", label: "Sq ft" },
  { key: "bedrooms", label: "Beds" },
  { key: "bathrooms", label: "Baths" },
  { key: "yearBuilt", label: "Year built" },
  { key: "lotSize", label: "Lot size" },
  { key: "distanceToCityCenter", label: "Distance (mi)" },
  { key: "schoolRating", label: "School" },
  { key: "price", label: "Price" },
];

function fileStamp(): string {
  return new Date().toISOString().slice(0, 10);
}

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export default function ExportButtons({ rows }: { rows: MarketProperty[] }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const disabled = rows.length === 0 || busy;

  function exportCsv() {
    setError(null);
    const header = COLUMNS.map((c) => c.label).join(",");
    const lines = rows.map((row) => COLUMNS.map((c) => row[c.key]).join(","));
    const csv = "\uFEFF" + [header, ...lines].join("\r\n");
    download(new Blob([csv], { type: "text/csv;charset=utf-8" }), `properties-${fileStamp()}.csv`);
  }

  async function exportPdf() {
    setError(null);
    setBusy(true);
    try {
      const { default: jsPDF } = await import("jspdf");
      const { default: autoTable } = await import("jspdf-autotable");

      const doc = new jsPDF({ orientation: "landscape" });
      doc.setFontSize(16);
      doc.text("Property Market Analysis", 14, 16);
      doc.setFontSize(10);
      doc.text(`${rows.length} properties - exported ${new Date().toLocaleString()}`, 14, 23);

      autoTable(doc, {
        startY: 28,
        head: [COLUMNS.map((c) => c.label)],
        body: rows.map((row) =>
          COLUMNS.map((c) => (c.key === "price" ? formatPrice(row.price) : String(row[c.key])))
        ),
        styles: { fontSize: 9 },
        headStyles: { fillColor: [37, 99, 235] },
      });

      doc.save(`properties-${fileStamp()}.pdf`);
    } catch (err) {
      console.error("PDF export failed:", err);
      setError("Could not create the PDF. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={exportCsv}
          disabled={disabled}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Export CSV
        </button>
        <button
          type="button"
          onClick={exportPdf}
          disabled={disabled}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? "Creating PDF..." : "Export PDF"}
        </button>
      </div>
      {error && (
        <p role="alert" className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}