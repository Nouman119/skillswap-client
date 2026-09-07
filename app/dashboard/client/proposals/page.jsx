"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function ManageProposalsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ----------------------------------------------------
  // Fetch proposals submitted for client tasks
  // ----------------------------------------------------
  const fetchProposals = async () => {
    if (!user?.email) return;
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${API_URL}/api/tasks/client-proposals?email=${user.email}`);
      const data = await res.json();
      if (res.ok) {
        setProposals(data);
      } else {
        setError(data.error || "Failed to fetch proposals");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, [user]);

  // ----------------------------------------------------
  // Handle Accept Proposal (Redirects to Stripe Dummy Checkout)
  // ----------------------------------------------------
  const handleAcceptProposal = (proposalId, amount) => {
    router.push(`/payment/checkout?proposalId=${proposalId}&amount=${amount}`);
  };

  // ----------------------------------------------------
  // Handle Reject Proposal
  // ----------------------------------------------------
  const handleRejectProposal = async (proposalId) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${API_URL}/api/tasks/proposals/${proposalId}/reject`, {
        method: "PATCH",
      });

      if (res.ok) {
        setProposals(
          proposals.map((p) => (p._id === proposalId ? { ...p, status: "rejected" } : p))
        );
      } else {
        alert("Failed to reject proposal");
      }
    } catch (err) {
      alert("An unexpected error occurred");
    }
  };

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
        <h1 className="text-2xl font-bold text-gray-900">Manage Proposals</h1>
        <p className="mt-1 text-sm text-gray-500">Review applications and proposals submitted by freelancers.</p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-200">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="divide-y divide-gray-200">
          {proposals.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-500">No proposals received yet.</div>
          ) : (
            proposals.map((proposal) => (
              <div key={proposal._id} className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-gray-900">{proposal.taskTitle || "Job Application"}</h3>
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      proposal.status === 'accepted' ? 'bg-emerald-50 text-emerald-700' : 
                      proposal.status === 'rejected' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {proposal.status}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-indigo-600">Freelancer: {proposal.freelancerName} ({proposal.freelancerEmail})</p>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">{proposal.message}</p>
                  <p className="text-xs text-gray-400">Proposed Price: ${proposal.budgetPrice} • Completion Time: {proposal.completionDays} Days</p>
                </div>

                {proposal.status === 'pending' && (
                  <div className="flex items-center gap-2 self-end md:self-center">
                    <button
                      onClick={() => handleAcceptProposal(proposal._id, proposal.budgetPrice)}
                      className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition"
                    >
                      Accept & Pay
                    </button>
                    <button
                      onClick={() => handleRejectProposal(proposal._id)}
                      className="rounded-lg bg-red-50 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 transition"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}