"use client";

export default function EstimatorError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="rounded-md bg-red-50 p-4">
        <h2 className="text-sm font-medium text-red-800">
          Something went wrong loading the estimator
        </h2>
        <p className="mt-1 text-sm text-red-700">{error.message}</p>
        <button
          onClick={reset}
          className="mt-3 rounded-md bg-red-100 px-3 py-1.5 text-sm font-medium text-red-800 hover:bg-red-200"
        >
          Try again
        </button>
      </div>
    </div>
  );
}