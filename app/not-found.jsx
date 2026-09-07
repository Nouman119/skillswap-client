import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 text-center">
      {/* ---------------------------------------------------- */}
      {/* SECTION 04: Custom 404 Error Display */}
      {/* ---------------------------------------------------- */}
      <div className="space-y-4 max-w-md">
        <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
          404 Error
        </span>

        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
          Page not found
        </h1>

        <p className="text-sm text-gray-500 leading-relaxed">
          Sorry, the page you are looking for doesn't exist, has been removed, or is temporarily unavailable.
        </p>

        <div className="pt-4 flex items-center justify-center gap-3">
          <Link
            href="/"
            className="rounded-lg bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
          >
            Go to Homepage
          </Link>
          <Link
            href="/tasks"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
          >
            Browse Open Tasks
          </Link>
        </div>
      </div>
    </div>
  );
}