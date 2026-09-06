"use client";

import { useEffect, useState } from "react";
import { useRoleRedirect } from "@/hooks/useRoleRedirect";

export default function MyEarningsPage() {
  const { session } = useRoleRedirect(["freelancer"]);
  const [earnings, setEarnings] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    if (session?.user?.email) {
      fetch(`${API_URL}/api/tasks/my-earnings?freelancerEmail=${session.user.email}`)
        .then((res) => res.json())
        .then((data) => {
          setEarnings(Array.isArray(data) ? data : []);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Failed to fetch earnings:", err);
          setLoading(false);
        });
    }
  }, [session, API_URL]);

  const totalSum = earnings.reduce((acc, curr) => acc + Number(curr.budget || 0), 0);

  if (loading) return <div className="p-8 text-center text-gray-600">Loading earnings...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Earnings Breakdown</h1>
          <span className="rounded-lg bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
            Total Earned: ${totalSum}
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Task Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Client Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Amount Made</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase text-gray-500">Completion Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {earnings.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-6 text-center text-sm text-gray-500">
                    No completed project earnings recorded yet.
                  </td>
                </tr>
              ) : (
                earnings.map((task) => (
                  <tr key={task._id}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{task.title}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{task.clientName}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-emerald-600">${task.budget}</td>
                    <td className="px-6 py-4 text-right text-sm text-gray-500">
                      {task.completedAt ? new Date(task.completedAt).toLocaleDateString() : "Completed"}
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