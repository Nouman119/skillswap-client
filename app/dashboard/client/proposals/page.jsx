"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useRoleRedirect } from "@/hooks/useRoleRedirect";

export default function ManageProposalsPage() {
  const { session } = useRoleRedirect(["client"]);
  const router = useRouter();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const fetchProposals = async () => {
    if (!session?.user?.email) return;
    try {
      const res = await fetch(`${API_URL}/api/tasks/client-proposals?email=${session.user.email}`);
      const data = await res.json();
      setProposals(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load proposals:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, [session]);

  const handleReject = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/tasks/proposals/${id}/reject`, { method: "PATCH" });
      const data = await res.json();
      if (data.success) {
        setProposals(proposals.map(p => p._id === id ? { ...p, status: "rejected" } : p));
      }
    } catch (err) {
      setError("Failed to reject proposal.");
    }
  };

  const handleAcceptRedirect = (proposal) => {
    // Redirect to checkout with proposal metadata
    const query = new URLSearchParams({
      proposalId: proposal._id,
      taskId: proposal.taskId,
      amount: proposal.budgetPrice || proposal.price || "0"
    }).toString();

    router.push(`/payment/checkout?${query}`);
  };

  if (loading) return <div className="p-8 text-center text-gray-600">Loading proposals...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Manage Job Proposals</h1>

        {error && <div className="mb-4 rounded bg-red-100 p-3 text-sm text-red-700">{error}</div>}

        <div className="space-y-4">
          {proposals.length === 0 ? (
            <div className="rounded-xl border border-gray-100 bg-white p-8 text-center text-gray-500">
              No proposals submitted yet.
            </div>
          ) : (
            proposals.map((item) => (
              <div key={item._id} className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{item.freelancerName || "Applicant"}</h3>
                    <p className="text-sm text-gray-500">Proposed Budget: ${item.budgetPrice || item.price} | Delivery: {item.completionDays} Days</p>
                    <p className="mt-2 text-sm text-gray-700">{item.message}</p>
                    <div className="mt-2">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        item.status === "accepted" ? "bg-green-100 text-green-800" :
                        item.status === "rejected" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {item.status || "Pending"}
                      </span>
                    </div>
                  </div>

                  {item.status !== "accepted" && item.status !== "rejected" && (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleAcceptRedirect(item)}
                        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                      >
                        Accept & Pay
                      </button>
                      <button
                        onClick={() => handleReject(item._id)}
                        className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}