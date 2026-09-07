"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function MyProposalsPage() {
  const { user } = useAuth();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ----------------------------------------------------
  // Fetch proposals submitted by logged-in freelancer
  // ----------------------------------------------------
  useEffect(() => {
    async function fetchMyProposals() {
      try {
        const email = user?.email || "freelancer@skillswap.com";
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const res = await fetch(`${API_URL}/api/tasks/my-proposals?freelancerEmail=${email}`);
        const data = await res.json();

        if (res.ok) {
          setProposals(Array.isArray(data) ? data : []);
        } else {
          setError(data.error || "Failed to load proposals");
        }
      } catch (err) {
        setError("An unexpected error occurred while fetching proposals");
      } finally {
        setLoading(false);
      }
    }

    fetchMyProposals();
  }, [user]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Submitted Proposals</h1>
        <p className="mt-1 text-sm text-gray-500">Track all your sent applications and their current evaluation status.</p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-200">
          {error}
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* Proposals Data Table */}
      {/* ---------------------------------------------------- */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
          <thead className="bg-gray-50 text-gray-600 font-medium">
            <tr>
              <th className="px-6 py-3.5">Task Title</th>
              <th className="px-6 py-3.5">Budget Bid</th>
              <th className="px-6 py-3.5">Date Sent</th>
              <th className="px-6 py-3.5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-gray-700">
            {proposals.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-sm text-gray-500">
                  You haven't submitted any proposals yet.
                </td>
              </tr>
            ) : (
              proposals.map((proposal) => (
                <tr key={proposal._id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {proposal.taskTitle || "Job Application"}
                  </td>
                  <td className="px-6 py-4 font-semibold text-emerald-600">
                    ${proposal.budgetPrice}
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {proposal.createdAt ? new Date(proposal.createdAt).toLocaleDateString() : "N/A"}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        proposal.status === "accepted"
                          ? "bg-emerald-50 text-emerald-700"
                          : proposal.status === "rejected"
                          ? "bg-red-50 text-red-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {proposal.status ? proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1) : "Pending"}
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