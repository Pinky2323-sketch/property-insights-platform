"use client";

import { useState } from "react";
import type { PropertyFeatures, FormErrors, EstimateResult } from "./types";

type FormValues = Record<keyof PropertyFeatures, string>;

const FIELDS: (keyof PropertyFeatures)[] = [
  "square_footage",
  "bedrooms",
  "bathrooms",
  "year_built",
  "lot_size",
  "distance_to_city_center",
  "school_rating",
];

const EMPTY_FORM: FormValues = {
  square_footage: "",
  bedrooms: "",
  bathrooms: "",
  year_built: "",
  lot_size: "",
  distance_to_city_center: "",
  school_rating: "",
};

const FIELD_LABELS: Record<keyof PropertyFeatures, string> = {
  square_footage: "Square Footage",
  bedrooms: "Bedrooms",
  bathrooms: "Bathrooms",
  year_built: "Year Built",
  lot_size: "Lot Size (sq ft)",
  distance_to_city_center: "Distance to City Center (miles)",
  school_rating: "School Rating (0-10)",
};

function validate(form: FormValues): FormErrors {
  const errors: FormErrors = {};

  for (const field of FIELDS) {
    if (form[field].trim() === "") {
      errors[field] = "This field is required";
    }
  }

  const num = (field: keyof PropertyFeatures) => Number(form[field]);

  if (!errors.square_footage && !(num("square_footage") > 0))
    errors.square_footage = "Must be greater than 0";

  if (!errors.bedrooms) {
    if (!Number.isInteger(num("bedrooms"))) errors.bedrooms = "Must be a whole number";
    else if (num("bedrooms") < 0) errors.bedrooms = "Cannot be negative";
  }

  if (!errors.bathrooms && !(num("bathrooms") >= 0))
    errors.bathrooms = "Cannot be negative";

  if (!errors.year_built) {
    if (!Number.isInteger(num("year_built"))) errors.year_built = "Must be a whole number";
    else if (num("year_built") < 1800 || num("year_built") > 2026)
      errors.year_built = "Must be between 1800 and 2026";
  }

  if (!errors.lot_size && !(num("lot_size") > 0))
    errors.lot_size = "Must be greater than 0";

  if (!errors.distance_to_city_center && !(num("distance_to_city_center") >= 0))
    errors.distance_to_city_center = "Cannot be negative";

  if (!errors.school_rating && !(num("school_rating") >= 0 && num("school_rating") <= 10))
    errors.school_rating = "Must be between 0 and 10";

  return errors;
}

interface PropertyFormProps {
  onResult: (result: EstimateResult, submittedForm: PropertyFeatures) => void;
}

export default function PropertyForm({ onResult }: PropertyFormProps) {
  const [form, setForm] = useState<FormValues>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function handleChange(field: keyof PropertyFeatures, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    const validationErrors = validate(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    const payload: PropertyFeatures = {
      square_footage: Number(form.square_footage),
      bedrooms: Number(form.bedrooms),
      bathrooms: Number(form.bathrooms),
      year_built: Number(form.year_built),
      lot_size: Number(form.lot_size),
      distance_to_city_center: Number(form.distance_to_city_center),
      school_rating: Number(form.school_rating),
    };

    setIsSubmitting(true);
    try {
      const res = await fetch("http://localhost:8001/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Server responded with ${res.status}`);
      }

      const result: EstimateResult = await res.json();
      onResult(result, payload);
    } catch (err) {
      console.error("Estimate request failed:", err);
      setSubmitError(
        err instanceof Error ? err.message : "Failed to get estimate. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="space-y-4 rounded-lg border border-gray-200 bg-white p-6"
    >
      {FIELDS.map((field) => (
        <div key={field}>
          <label htmlFor={field} className="block text-sm font-medium text-gray-700">
            {FIELD_LABELS[field]}
          </label>
          <input
            id={field}
            type="number"
            step="any"
            value={form[field]}
            onChange={(e) => handleChange(field, e.target.value)}
            aria-invalid={!!errors[field]}
            aria-describedby={errors[field] ? `${field}-error` : undefined}
            className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 ${
              errors[field]
                ? "border-red-300 focus:ring-red-500"
                : "border-gray-300 focus:ring-blue-500"
            }`}
          />
          {errors[field] && (
            <p id={`${field}-error`} className="mt-1 text-sm text-red-600">
              {errors[field]}
            </p>
          )}
        </div>
      ))}

      {submitError && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{submitError}</div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? "Estimating..." : "Get Estimate"}
      </button>
    </form>
  );
}