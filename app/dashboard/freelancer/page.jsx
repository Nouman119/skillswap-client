"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRoleRedirect } from "@/hooks/useRoleRedirect";

export default function FreelancerDashboard() {
  const { session } = useRoleRedirect(["freelancer"]);
  const [stats, setStats] = useState({
    totalProposals: 0,
    pendingProposals: 0,
    acceptedProposals: 0,
    totalEarnings: 0,
  });
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    if (session?.user?.email) {
      fetch(`${API_URL}/api/tasks/freelancer-stats?email=${session.user.email}`)
        .then((res) => res.json())
        .then((data) => {
          setStats(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Failed to fetch freelancer stats:", err);
          setLoading(false);
        });
    }
  }, [session, API_URL]);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Freelancer Dashboard</h1>
            <p className="text-gray-600">Welcome back, {session?.user?.name}</p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/dashboard/freelancer/browse-tasks"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Browse Open Tasks
            </Link>
          </div>
        </div>

        {/* Dashboard Main Statistics Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Total Proposals</p>
            <p className="mt-2 text-3xl font-semibold text-gray-900">{stats.totalProposals}</p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Pending Proposals</p>
            <p className="mt-2 text-3xl font-semibold text-yellow-600">{stats.pendingProposals}</p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Accepted Proposals</p>
            <p className="mt-2 text-3xl font-semibold text-indigo-600">{stats.acceptedProposals}</p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Total Earnings (USD)</p>
            <p className="mt-2 text-3xl font-semibold text-emerald-600">${stats.totalEarnings}</p>
          </div>
        </div>
      </div>
    </div>
  );
}