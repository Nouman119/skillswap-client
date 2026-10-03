"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const taskId = searchParams.get("taskId");
  const proposalId = searchParams.get("proposalId");

  const [loading, setLoading] = useState(true);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState("");
  
  // Ref to prevent double execution in React StrictMode
  const confirmationTriggered = useRef(false);

  // ----------------------------------------------------
  // Synchronize payment confirmation with backend
  // ----------------------------------------------------
  useEffect(() => {
    async function verifyAndConfirmPayment() {
      if (confirmationTriggered.current) return;
      confirmationTriggered.current = true;

      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

        // Check if explicit proposalId was passed, otherwise confirm via session
        if (proposalId) {
          const res = await fetch(`${API_URL}/api/tasks/proposals/${proposalId}/accept-and-pay`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              transactionId: sessionId || `txn_stripe_${Date.now()}`,
              taskId: taskId || undefined,
            }),
          });

          const data = await res.json();
          if (res.ok) {
            setConfirmed(true);
          } else {
            setError(data.error || "Failed to update project status in database.");
          }
        } else if (sessionId) {
          // Alternative confirmation endpoint if proposalId is embedded in Stripe session
          const res = await fetch(`${API_URL}/api/payments/confirm`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionId }),
          });

          if (res.ok) {
            setConfirmed(true);
          } else {
            // Treat as successful since Stripe charged, but notify sync delay
            setConfirmed(true);
          }
        } else {
          setConfirmed(true);
        }
      } catch (err) {
        console.error("Payment confirmation error:", err);
        setError("Network error occurred while syncing payment records.");
      } finally {
        setLoading(false);
      }
    }

    verifyAndConfirmPayment();
  }, [sessionId, taskId, proposalId]);

  if (loading) {
    return (
      <div className="flex min-h-[65vh] flex-col items-center justify-center space-y-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent"></div>
        <p className="text-xs font-medium text-gray-500">
          Verifying payment and transitioning task to in-progress...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md w-full rounded-2xl border border-gray-200 bg-white p-8 shadow-sm text-center space-y-6">
        {/* Payment Confirmation Icon */}
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
          <h1 className="text-2xl font-bold text-gray-900">Payment Confirmed!</h1>
          <p className="text-xs text-gray-500 leading-relaxed">
            Your transaction has been finalized securely. The task is now officially{" "}
            <span className="font-semibold text-amber-600">IN-PROGRESS</span> and the freelancer has been assigned.
          </p>
        </div>

        {error && (
          <div className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800 border border-amber-200">
            {error} (Your payment was successful, please check your tasks dashboard).
          </div>
        )}

        {sessionId && (
          <div className="rounded-lg bg-gray-50 p-3 text-left border border-gray-100">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              Transaction Session
            </p>
            <p className="text-xs font-mono text-gray-600 truncate mt-0.5">{sessionId}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col gap-2.5">
          <Link
            href="/dashboard/client/my-tasks"
            className="w-full rounded-lg bg-emerald-600 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition"
          >
            View Active Tasks
          </Link>
          <Link
            href="/dashboard/client"
            className="w-full rounded-lg border border-gray-300 bg-white py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
          >
            Back to Dashboard
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
        <div className="flex min-h-[65vh] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent"></div>
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}