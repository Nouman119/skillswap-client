"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/utils/auth-client";
import { useRoleRedirect } from "@/hooks/useRoleRedirect";

export default function ClientDashboard() {
  const { session } = useRoleRedirect(["client"]);
  const [stats, setStats] = useState({
    totalTasks: 0,
    openTasks: 0,
    inProgressTasks: 0,
    totalSpent: 0,
    tasks: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.email) {
      fetch(`http://localhost:5000/api/tasks/client-stats?email=${session.user.email}`)
        .then((res) => res.json())
        .then((data) => {
          setStats(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Failed to fetch client stats:", err);
          setLoading(false);
        });
    }
  }, [session]);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Client Dashboard</h1>
          <p className="text-gray-600">Welcome back, {session?.user?.name}</p>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
            <p className="text-sm font-medium text-gray-500">Total Tasks</p>
            <p className="mt-2 text-3xl font-semibold text-gray-900">{stats.totalTasks}</p>
          </div>
          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
            <p className="text-sm font-medium text-gray-500">Open Tasks</p>
            <p className="mt-2 text-3xl font-semibold text-indigo-600">{stats.openTasks}</p>
          </div>
          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
            <p className="text-sm font-medium text-gray-500">Tasks In Progress</p>
            <p className="mt-2 text-3xl font-semibold text-amber-600">{stats.inProgressTasks}</p>
          </div>
          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
            <p className="text-sm font-medium text-gray-500">Total Spent (USD)</p>
            <p className="mt-2 text-3xl font-semibold text-emerald-600">${stats.totalSpent}</p>
          </div>
        </div>
      </div>
    </div>
  );
}