"use client";

import { useEffect, useState } from "react";
import { useRoleRedirect } from "@/hooks/useRoleRedirect";

export default function MyProposalsPage() {
  const { session } = useRoleRedirect(["freelancer"]);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    if (session?.user?.email) {
      fetch(`${API_URL}/api/tasks/my-proposals?freelancerEmail=${session.user.email}`)
        .then((res) => res.json())
        .then((data) => {
          setProposals(Array.isArray(data) ? data : []);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Failed to fetch proposals:", err);
          setLoading(false);
        });
    }
  }, [session, API_URL]);

  if (loading) return <div className="p-8 text-center text-gray-600">Loading sent proposals...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Sent Proposals</h1>

        <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Task Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Budget Bid</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Date Sent</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {proposals.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-6 text-center text-sm text-gray-500">
                    No proposals submitted yet.
                  </td>
                </tr>
              ) : (
                proposals.map((item) => (
                  <tr key={item._id}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {item.taskTitle || "Task Proposal"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">${item.budgetPrice}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "N/A"}
                    </td>
                    <td className="px-6 py-4 text-right text-sm">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                          item.status === "accepted"
                            ? "bg-green-100 text-green-800"
                            : item.status === "rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {item.status || "Pending"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}