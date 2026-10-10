"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const taskId = searchParams.get("taskId");
  const clientEmail = searchParams.get("clientEmail");
  const freelancerEmail = searchParams.get("freelancerEmail");
  const amount = searchParams.get("amount");
  const taskTitle = searchParams.get("taskTitle");
  const freelancerName = searchParams.get("freelancerName");

  const [loading, setLoading] = useState(true);
  const [successData, setSuccessData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const confirmAndVerifyPayment = async () => {
      if (!sessionId || !taskId) {
        setLoading(false);
        return;
      }

      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const res = await fetch(`${API_URL}/api/tasks/confirm-session`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId,
            taskId,
            clientEmail,
            freelancerEmail,
            amount,
          }),
        });
        const data = await res.json();
        if (res.ok) {
          setSuccessData(data);
        } else {
          setError(data.error || "Payment verification failed.");
        }
      } catch (err) {
        console.error("Payment confirmation error:", err);
        setError("Network error during payment verification.");
      } finally {
        setLoading(false);
      }
    };

    confirmAndVerifyPayment();
  }, [sessionId, taskId, clientEmail, freelancerEmail, amount]);

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

        {/* Success Icon Badge */}
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

        {/* Clear Confirmation Message */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">Payment Successful!</h1>
          <p className="text-xs text-gray-500 leading-relaxed">
            Your transaction has been processed securely via Stripe. The task has been successfully moved to In-Progress.
          </p>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-xs text-red-600 border border-red-200">
            {error}
          </div>
        )}

        {/* Paid Task Details Display (Title, Worker Name, Price) */}
        <div className="rounded-xl bg-gray-50 p-4 text-left border border-gray-100 space-y-2.5">
          <div className="flex justify-between items-center text-xs border-b border-gray-200 pb-2">
            <span className="font-semibold text-gray-500">Task Title:</span>
            <span className="font-medium text-gray-800 text-right truncate max-w-[180px]">{taskTitle ? decodeURIComponent(taskTitle) : "Task Payment"}</span>          </div>
          <div className="flex justify-between items-center text-xs border-b border-gray-200 pb-2">
            <span className="font-semibold text-gray-500">Worker Name:</span>
            <span className="font-medium text-gray-800">{freelancerName || freelancerEmail || "Assigned Worker"}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-gray-500">Paid Amount:</span>
            <span className="font-bold text-emerald-600 text-sm">${amount || "0.00"}</span>
          </div>
        </div>

        {sessionId && (
          <div className="rounded-lg bg-gray-50 p-3 text-left border border-gray-100">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Transaction Session ID</p>
            <p className="text-xs font-mono text-gray-600 truncate mt-0.5">{sessionId}</p>
          </div>
        )}

        {/* Go to Dashboard Button */}
        <div className="pt-2 flex flex-col gap-2.5">
          <Link
            href="/dashboard/client"
            className="w-full rounded-lg bg-emerald-600 py-3 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition flex items-center justify-center gap-2"
          >
            Go to Dashboard
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