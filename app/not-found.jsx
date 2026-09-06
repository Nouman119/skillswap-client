import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center bg-gray-50 px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md text-center">
        {/* Visual 404 badge */}
        <p className="text-base font-semibold text-indigo-600">404 Error</p>
        <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
          Page Not Found
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-gray-500">
          Sorry, the page you are looking for doesn't exist, has been removed, or is temporarily unavailable.
        </p>

        {/* Navigation CTAs */}
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="w-full rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 transition sm:w-auto"
          >
            Back to Home
          </Link>
          <Link
            href="/tasks"
            className="w-full rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition sm:w-auto"
          >
            Browse Tasks
          </Link>
        </div>
      </div>
    </div>
  );
}