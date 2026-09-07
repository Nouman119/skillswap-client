"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [loading, setLoading] = useState(Boolean(sessionId));

  useEffect(() => {
    if (sessionId) {
      // Small simulated buffer to confirm session sync
      const timer = setTimeout(() => {
        setLoading(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [sessionId]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md w-full rounded-2xl border border-gray-200 bg-white p-8 shadow-sm text-center space-y-6">
        {/* ---------------------------------------------------- */}
        {/* SECTION 04: Stripe Payment Success Badge */}
        {/* ---------------------------------------------------- */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
          <svg
            className="h-8 w-8 text-emerald-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">Payment Successful!</h1>
          <p className="text-xs text-gray-500 leading-relaxed">
            Your transaction has been processed and escrowed safely via Stripe. The task status has been updated.
          </p>
        </div>

        {sessionId && (
          <div className="rounded-lg bg-gray-50 p-3 text-left border border-gray-100">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Session ID</p>
            <p className="text-xs font-mono text-gray-600 truncate mt-0.5">{sessionId}</p>
          </div>
        )}

        <div className="pt-2 flex flex-col gap-2.5">
          <Link
            href="/dashboard/client"
            className="w-full rounded-lg bg-emerald-600 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition"
          >
            Go to Client Dashboard
          </Link>
          <Link
            href="/tasks"
            className="w-full rounded-lg border border-gray-300 bg-white py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
          >
            Browse Open Tasks
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent"></div>
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}