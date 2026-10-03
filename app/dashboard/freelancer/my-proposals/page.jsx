"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function MyProposalsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ----------------------------------------------------
  // RBAC Route Guard: Freelancer Role Validation
  // ----------------------------------------------------
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    const currentRole = (user?.role || "").toLowerCase();
    if (currentRole === "client") {
      router.replace("/dashboard/client");
    } else if (currentRole === "admin") {
      router.replace("/dashboard/admin");
    }
  }, [user, authLoading, router]);

  // ----------------------------------------------------
  // Fetch proposals submitted by this freelancer
  // ----------------------------------------------------
  const fetchProposals = useCallback(async () => {
    if (!user?.email) return;

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(
        `${API_URL}/api/tasks/freelancer-proposals?email=${encodeURIComponent(user.email)}`
      );
      const data = await res.json();

      if (res.ok) {
        setProposals(Array.isArray(data) ? data : []);
      } else {
        setError(data.error || "Failed to load sent proposals.");
      }
    } catch (err) {
      setError("Network error occurred while fetching proposals.");
    } finally {
      setLoading(false);
    }
  }, [user?.email]);

  useEffect(() => {
    if (!authLoading && user && (user.role || "").toLowerCase() === "freelancer") {
      fetchProposals();
    }
  }, [user, authLoading, fetchProposals]);

  if (authLoading || (loading && user?.role?.toLowerCase() === "freelancer")) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center space-x-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
        <span className="text-xs font-medium text-gray-500">Loading sent proposals...</span>
      </div>
    );
  }

  if (!user || (user.role || "").toLowerCase() !== "freelancer") {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            My Sent Proposals
          </h1>
          <p className="mt-1 text-xs text-gray-500">
            Monitor the status of all bids you have submitted to client tasks.
          </p>
        </div>
        <div>
          <Link
            href="/dashboard/freelancer"
            className="rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition shadow-sm"
          >
            ← Back to Overview
          </Link>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-xs text-red-700 border border-red-200">
          {error}
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 text-gray-500 text-[11px] uppercase tracking-wider font-semibold">
            <tr>
              <th className="px-6 py-3.5 text-left">Task Title</th>
              <th className="px-6 py-3.5 text-left">Budget Bid</th>
              <th className="px-6 py-3.5 text-left">Date Sent</th>
              <th className="px-6 py-3.5 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white text-xs">
            {proposals.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                  No proposals submitted yet. Head over to{" "}
                  <Link href="/browse-tasks" className="text-indigo-600 font-semibold hover:underline">
                    Browse Tasks
                  </Link>{" "}
                  to start bidding.
                </td>
              </tr>
            ) : (
              proposals.map((item) => {
                const status = (item.status || "pending").toLowerCase();
                return (
                  <tr key={item._id} className="hover:bg-gray-50/50 transition">
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {item.taskTitle || "Task Proposal"}
                    </td>
                    <td className="px-6 py-4 font-semibold text-emerald-600">
                      ${item.budgetPrice} USD
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "N/A"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                          status === "accepted"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : status === "rejected"
                            ? "bg-red-50 text-red-700 border border-red-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}