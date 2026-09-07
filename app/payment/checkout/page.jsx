"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function StripeDummyCheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const proposalId = searchParams.get("proposalId");
  const amount = searchParams.get("amount") || "100";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ----------------------------------------------------
  // Handle dummy payment submission and update task status
  // ----------------------------------------------------
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const transactionId = `txn_dummy_${Math.random().toString(36).substring(2, 12)}`;

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${API_URL}/api/tasks/proposals/${proposalId}/accept-and-pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Payment processing failed");
      }

      alert("Payment Successful! Task is now In-Progress.");
      router.push("/dashboard/client/proposals");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-md">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Stripe Secure Checkout
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Dummy Payment Gateway • Amount to Pay: <span className="font-bold text-emerald-600">${amount} USD</span>
          </p>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-200">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handlePaymentSubmit}>
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label className="block text-sm font-medium text-gray-700">Cardholder Name</label>
              <input
                type="text"
                required
                defaultValue="John Doe"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Card Number</label>
              <input
                type="text"
                required
                placeholder="4242 •••• •••• 4242"
                defaultValue="4242424242424242"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Expiration Date</label>
                <input
                  type="text"
                  required
                  placeholder="MM/YY"
                  defaultValue="12/28"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">CVC / CVV</label>
                <input
                  type="password"
                  required
                  placeholder="123"
                  defaultValue="123"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 text-sm"
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-indigo-600 px-4 py-2.5 font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition"
            >
              {loading ? "Processing Payment..." : `Pay $${amount} USD`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}