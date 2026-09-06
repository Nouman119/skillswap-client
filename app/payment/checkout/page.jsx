"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const proposalId = searchParams.get("proposalId");
  const amount = searchParams.get("amount");

  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const handleDummyPayment = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/api/tasks/proposals/${proposalId}/accept-and-pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transactionId: `CARD_SIM_${Date.now()}`
        })
      });

      const data = await res.json();
      if (data.success) {
        router.push("/dashboard/client");
      } else {
        setError(data.error || "Payment verification failed");
      }
    } catch (err) {
      setError("An error occurred during transaction processing");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Stripe Card Checkout</h2>
        <p className="text-sm text-gray-500 mb-6">Total Charge: <span className="font-semibold text-gray-900">${amount || "0"}</span></p>

        {error && <div className="mb-4 rounded bg-red-100 p-3 text-sm text-red-700">{error}</div>}

        <form onSubmit={handleDummyPayment} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Card Number</label>
            <input type="text" placeholder="4242 •••• •••• 4242" defaultValue="4242424242424242" required className="w-full rounded-md border border-gray-300 p-2 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Expiry Date</label>
              <input type="text" placeholder="MM/YY" defaultValue="12/28" required className="w-full rounded-md border border-gray-300 p-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">CVC</label>
              <input type="text" placeholder="123" defaultValue="123" required className="w-full rounded-md border border-gray-300 p-2 text-sm" />
            </div>
          </div>

          <button
            type="submit"
            disabled={processing}
            className="w-full rounded-md bg-emerald-600 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {processing ? "Processing Payment..." : `Pay $${amount || "0"}`}
          </button>
        </form>
      </div>
    </div>
  );
}