"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function MyEarningsPage() {
  const { user } = useAuth();
  const [completedTasks, setCompletedTasks] = useState([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ----------------------------------------------------
  // Fetch finished tasks and earnings details
  // ----------------------------------------------------
  useEffect(() => {
    async function fetchEarnings() {
      try {
        const email = user?.email || "freelancer@skillswap.com";
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const res = await fetch(`${API_URL}/api/tasks/freelancer-projects?email=${email}`);
        const data = await res.json();

        if (res.ok) {
          const finished = Array.isArray(data) ? data.filter((t) => t.status === "completed") : [];
          setCompletedTasks(finished);

          const total = finished.reduce((sum, t) => sum + (Number(t.budget) || 0), 0);
          setTotalEarnings(total);
        } else {
          setError(data.error || "Failed to load earnings");
        }
      } catch (err) {
        setError("An unexpected error occurred while fetching earnings data");
      } finally {
        setLoading(false);
      }
    }

    fetchEarnings();
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Earnings</h1>
          <p className="mt-1 text-sm text-gray-500">Complete summary of your completed contracts and payouts.</p>
        </div>
        <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-5 py-3">
          <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">Total Revenue</p>
          <p className="text-2xl font-bold text-emerald-700">${totalEarnings} USD</p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-200">
          {error}
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* Earnings Breakdown Table */}
      {/* ---------------------------------------------------- */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
          <thead className="bg-gray-50 text-gray-600 font-medium">
            <tr>
              <th className="px-6 py-3.5">Task Title</th>
              <th className="px-6 py-3.5">Client Name</th>
              <th className="px-6 py-3.5">Amount Made</th>
              <th className="px-6 py-3.5">Completion Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-gray-700">
            {completedTasks.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-sm text-gray-500">
                  No completed contracts yet.
                </td>
              </tr>
            ) : (
              completedTasks.map((task) => (
                <tr key={task._id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-medium text-gray-900">{task.title}</td>
                  <td className="px-6 py-4 text-gray-600">{task.clientName || task.clientEmail}</td>
                  <td className="px-6 py-4 font-bold text-emerald-600">${task.budget}</td>
                  <td className="px-6 py-4 text-gray-500">
                    {task.completedAt ? new Date(task.completedAt).toLocaleDateString() : "Recently"}
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