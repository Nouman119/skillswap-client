"use client";

import { useEffect, useState } from "react";

export default function TransactionsHistoryPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ----------------------------------------------------
  // Fetch platform Stripe payment records
  // ----------------------------------------------------
  useEffect(() => {
    async function fetchTransactions() {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const res = await fetch(`${API_URL}/api/tasks/admin/transactions`);
        const data = await res.json();

        if (res.ok) {
          setTransactions(Array.isArray(data) ? data : []);
        } else {
          setError(data.error || "Failed to load transactions");
        }
      } catch (err) {
        setError("Network error occurred while fetching payment logs");
      } finally {
        setLoading(false);
      }
    }

    fetchTransactions();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Transactions History</h1>
        <p className="mt-1 text-sm text-gray-500">
          Complete audit ledger of Stripe payments processed across contracts.
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-200">
          {error}
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* Stripe Payment Ledger Table */}
      {/* ---------------------------------------------------- */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
          <thead className="bg-gray-50 text-gray-600 font-medium">
            <tr>
              <th className="px-6 py-3.5">Client Email</th>
              <th className="px-6 py-3.5">Freelancer Email</th>
              <th className="px-6 py-3.5">Payout Size</th>
              <th className="px-6 py-3.5">Payment Date</th>
              <th className="px-6 py-3.5">Payment Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-gray-700">
            {transactions.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-sm text-gray-500">
                  No payment records found.
                </td>
              </tr>
            ) : (
              transactions.map((tx) => (
                <tr key={tx._id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {tx.clientEmail || "client@skillswap.com"}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {tx.freelancerEmail || "freelancer@skillswap.com"}
                  </td>
                  <td className="px-6 py-4 font-bold text-emerald-600">
                    ${tx.amount} USD
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : "Recently"}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                      {tx.status ? tx.status.toUpperCase() : "PAID"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}