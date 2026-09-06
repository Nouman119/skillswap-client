"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [loading, setLoading] = useState(true);
  const [paymentData, setPaymentData] = useState(null);
  const [error, setError] = useState("");

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    if (sessionId) {
      fetch(`${API_URL}/api/payments/confirm-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setPaymentData(data);
          } else {
            setError(data.error || "Payment verification failed");
          }
          setLoading(false);
        })
        .catch((err) => {
          console.error("Verification error:", err);
          setError("Failed to verify payment session");
          setLoading(false);
        });
    } else {
      setError("No session ID found");
      setLoading(false);
    }
  }, [sessionId, API_URL]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-600 font-medium">Verifying your payment securely...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-sm text-center">
          <h1 className="text-xl font-bold text-red-600 mb-2">Payment Verification Failed</h1>
          <p className="text-sm text-gray-600 mb-6">{error}</p>
          <Link
            href="/dashboard/client"
            className="inline-block rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-sm text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          ✓
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Payment Successful!</h1>
        <p className="text-sm text-gray-500 mb-6">Your transaction has been securely processed and verified.</p>

        <div className="mb-6 rounded-lg bg-gray-50 p-4 text-left space-y-2 text-sm border border-gray-100">
          <p className="text-gray-700">
            <span className="font-semibold text-gray-900">Task Title:</span> {paymentData?.taskTitle}
          </p>
          <p className="text-gray-700">
            <span className="font-semibold text-gray-900">Assigned Worker:</span> {paymentData?.freelancerName}
          </p>
          <p className="text-gray-700">
            <span className="font-semibold text-gray-900">Amount Paid:</span> ${paymentData?.amount} USD
          </p>
        </div>

        <Link
          href="/dashboard/client"
          className="inline-block w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}