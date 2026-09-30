"use client";

import { useState, type FormEvent } from "react";
import { formatPrice } from "./format";

const API_URL = process.env.NEXT_PUBLIC_MARKET_API_URL ?? "http://localhost:8002/api";

type Field =
  | "squareFootage"
  | "bedrooms"
  | "bathrooms"
  | "yearBuilt"
  | "lotSize"
  | "distanceToCityCenter"
  | "schoolRating";

type Values = Record<Field, string>;
type Side = "base" | "scenario";
type Errors = Partial<Record<`${Side}.${Field}`, string>>;

interface WhatIfResult {
  basePrice: number;
  scenarioPrice: number;
  difference: number;
  percentChange: number;
}

const FIELDS: { key: Field; label: string }[] = [
  { key: "squareFootage", label: "Square footage" },
  { key: "bedrooms", label: "Bedrooms" },
  { key: "bathrooms", label: "Bathrooms" },
  { key: "yearBuilt", label: "Year built" },
  { key: "lotSize", label: "Lot size (sq ft)" },
  { key: "distanceToCityCenter", label: "Distance to city center (mi)" },
  { key: "schoolRating", label: "School rating (0-10)" },
];

const DEFAULTS: Values = {
  squareFootage: "1850",
  bedrooms: "3",
  bathrooms: "2",
  yearBuilt: "1998",
  lotSize: "7500",
  distanceToCityCenter: "5.6",
  schoolRating: "8.2",
};

function validateSide(values: Values, side: Side, errors: Errors) {
  const set = (field: Field, message: string) => {
    errors[`${side}.${field}`] = message;
  };
  for (const { key } of FIELDS) {
    if (values[key].trim() === "") set(key, "Required");
  }
  const n = (f: Field) => Number(values[f]);

  if (!errors[`${side}.squareFootage`] && !(n("squareFootage") > 0)) set("squareFootage", "Must be above 0");
  if (!errors[`${side}.bedrooms`] && (!Number.isInteger(n("bedrooms")) || n("bedrooms") < 0))
    set("bedrooms", "Whole number, 0 or more");
  if (!errors[`${side}.bathrooms`] && !(n("bathrooms") >= 0)) set("bathrooms", "Cannot be negative");
  if (!errors[`${side}.yearBuilt`] && (!Number.isInteger(n("yearBuilt")) || n("yearBuilt") < 1800 || n("yearBuilt") > 2026))
    set("yearBuilt", "Whole year, 1800-2026");
  if (!errors[`${side}.lotSize`] && !(n("lotSize") > 0)) set("lotSize", "Must be above 0");
  if (!errors[`${side}.distanceToCityCenter`] && !(n("distanceToCityCenter") >= 0))
    set("distanceToCityCenter", "Cannot be negative");
  if (!errors[`${side}.schoolRating`] && !(n("schoolRating") >= 0 && n("schoolRating") <= 10))
    set("schoolRating", "Between 0 and 10");
}

function toPayload(values: Values) {
  return {
    squareFootage: Number(values.squareFootage),
    bedrooms: Number(values.bedrooms),
    bathrooms: Number(values.bathrooms),
    yearBuilt: Number(values.yearBuilt),
    lotSize: Number(values.lotSize),
    distanceToCityCenter: Number(values.distanceToCityCenter),
    schoolRating: Number(values.schoolRating),
  };
}

export default function WhatIfForm() {
  const [base, setBase] = useState<Values>(DEFAULTS);
  const [scenario, setScenario] = useState<Values>(DEFAULTS);
  const [errors, setErrors] = useState<Errors>({});
  const [result, setResult] = useState<WhatIfResult | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function update(side: Side, field: Field, value: string) {
    const setter = side === "base" ? setBase : setScenario;
    setter((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    const found: Errors = {};
    validateSide(base, "base", found);
    validateSide(scenario, "scenario", found);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/what-if`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base: toPayload(base), scenario: toPayload(scenario) }),
      });
      if (!res.ok) {
        let message = `Server responded with ${res.status}`;
        try {
          const body = await res.json();
          if (body?.message) message = body.message;
          else if (body?.error) message = body.error;
        } catch {
          // Body was not JSON: keep the status message.
        }
        throw new Error(message);
      }
      setResult(await res.json());
    } catch (err) {
      console.error("What-if request failed:", err);
      setResult(null);
      setSubmitError(
        err instanceof TypeError
          ? "Cannot reach the market analysis service. Is it running?"
          : err instanceof Error
            ? err.message
            : "Something went wrong."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function renderInput(side: Side, field: Field) {
    const id = `${side}-${field}`;
    const error = errors[`${side}.${field}`];
    const values = side === "base" ? base : scenario;
    return (
      <div>
        <input
          id={id}
          type="number"
          step="any"
          value={values[field]}
          onChange={(e) => update(side, field, e.target.value)}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 ${
            error ? "border-red-300 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
          }`}
        />
        {error && (
          <p id={`${id}-error`} className="mt-1 text-xs text-red-600">
            {error}
          </p>
        )}
      </div>
    );
  }

  const up = result ? result.difference >= 0 : true;

  return (
    <div className="mt-8 rounded-lg border border-gray-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-gray-900">What-if analysis</h2>
      <p className="mt-1 text-sm text-gray-500">
        Change values in the Scenario column and compare the estimated price with the Base property.
      </p>

      <form onSubmit={handleSubmit} noValidate className="mt-4">
        <div className="grid grid-cols-[1fr_1fr_1fr] items-start gap-x-4 gap-y-3 sm:grid-cols-[1.4fr_1fr_1fr]">
          <div className="text-sm font-medium text-gray-500">Field</div>
          <div className="text-sm font-medium text-gray-500">Base</div>
          <div className="text-sm font-medium text-gray-500">Scenario</div>

          {FIELDS.map(({ key, label }) => (
            <div key={key} className="contents">
              <label htmlFor={`scenario-${key}`} className="pt-2 text-sm text-gray-700">
                {label}
              </label>
              {renderInput("base", key)}
              {renderInput("scenario", key)}
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? "Calculating..." : "Compare prices"}
          </button>
          <button
            type="button"
            onClick={() => {
              setBase(DEFAULTS);
              setScenario(DEFAULTS);
              setErrors({});
              setResult(null);
              setSubmitError(null);
            }}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            Reset
          </button>
        </div>
      </form>

      {submitError && (
        <div role="alert" className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
          {submitError}
        </div>
      )}

      {result && (
        <dl className="mt-6 grid gap-4 sm:grid-cols-4" aria-live="polite">
          <div className="rounded-lg border border-gray-200 p-4">
            <dt className="text-sm text-gray-500">Base price</dt>
            <dd className="mt-1 text-xl font-semibold text-gray-900">{formatPrice(result.basePrice)}</dd>
          </div>
          <div className="rounded-lg border border-gray-200 p-4">
            <dt className="text-sm text-gray-500">Scenario price</dt>
            <dd className="mt-1 text-xl font-semibold text-gray-900">{formatPrice(result.scenarioPrice)}</dd>
          </div>
          <div className="rounded-lg border border-gray-200 p-4">
            <dt className="text-sm text-gray-500">Difference</dt>
            <dd className={`mt-1 text-xl font-semibold ${up ? "text-green-700" : "text-red-700"}`}>
              {up ? "+" : "-"}
              {formatPrice(Math.abs(result.difference))}
            </dd>
          </div>
          <div className="rounded-lg border border-gray-200 p-4">
            <dt className="text-sm text-gray-500">Change</dt>
            <dd className={`mt-1 text-xl font-semibold ${up ? "text-green-700" : "text-red-700"}`}>
              {up ? "+" : ""}
              {result.percentChange}%
            </dd>
          </div>
        </dl>
      )}
    </div>
  );
}