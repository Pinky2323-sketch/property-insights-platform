import Link from "next/link";

const APPS = [
  {
    href: "/estimator",
    title: "Property Value Estimator",
    description:
      "Enter a property's details to get an estimated price. Keep a history of estimates and compare them side by side.",
    backend: "Python / FastAPI",
  },
  {
    href: "/market-analysis",
    title: "Property Market Analysis",
    description:
      "Explore market statistics, filter by segment, run what-if comparisons and export the data as CSV or PDF.",
    backend: "Java 21 / Spring Boot",
  },
];

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900">Realty Insights Portal</h1>
      <p className="mt-2 max-w-2xl text-gray-600">
        Two independent applications, each with its own backend, sharing one housing price model.
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {APPS.map((app) => (
          <Link
            key={app.href}
            href={app.href}
            className="group rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <h2 className="text-xl font-semibold text-gray-900 group-hover:text-blue-700">
              {app.title}
            </h2>
            <p className="mt-2 text-sm text-gray-600">{app.description}</p>
            <p className="mt-4 text-xs font-medium uppercase tracking-wide text-gray-500">
              Backend: {app.backend}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}