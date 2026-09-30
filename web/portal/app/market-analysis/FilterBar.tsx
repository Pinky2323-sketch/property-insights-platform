"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition, type FormEvent } from "react";

const FIELDS = [
  { name: "minPrice", label: "Min price ($)" },
  { name: "maxPrice", label: "Max price ($)" },
  { name: "bedrooms", label: "Bedrooms" },
  { name: "minSqft", label: "Min sq ft" },
  { name: "maxSqft", label: "Max sq ft" },
];

export default function FilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function apply(params: URLSearchParams) {
    const query = params.toString();
    startTransition(() => {
      router.push(query ? `${pathname}?${query}` : pathname);
    });
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const params = new URLSearchParams();
    for (const field of FIELDS) {
      const value = String(data.get(field.name) ?? "").trim();
      if (value) params.set(field.name, value);
    }
    apply(params);
  }

  return (
    <form
      key={searchParams.toString()}
      onSubmit={handleSubmit}
      aria-label="Filter properties"
      className="mt-8 rounded-lg border border-gray-200 bg-white p-4"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {FIELDS.map((field) => (
          <div key={field.name}>
            <label htmlFor={field.name} className="block text-sm font-medium text-gray-700">
              {field.label}
            </label>
            <input
              id={field.name}
              name={field.name}
              type="number"
              min="0"
              step="any"
              defaultValue={searchParams.get(field.name) ?? ""}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isPending ? "Applying..." : "Apply filters"}
        </button>
        <button
          type="button"
          onClick={() => apply(new URLSearchParams())}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
        >
          Reset
        </button>
      </div>
    </form>
  );
}