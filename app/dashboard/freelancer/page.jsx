"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function FreelancerDashboardOverview() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalProposals: 0,
    pendingProposals: 0,
    acceptedProposals: 0,
    totalEarnings: 0,
  });
  const [loading, setLoading] = useState(true);

  // ----------------------------------------------------
  // Fetch freelancer main metrics from backend
  // ----------------------------------------------------
  useEffect(() => {
    async function fetchStats() {
      try {
        const freelancerEmail = user?.email || "freelancer@skillswap.com";
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const res = await fetch(`${API_URL}/api/tasks/freelancer-stats?email=${freelancerEmail}`);
        const data = await res.json();

        if (res.ok) {
          setStats(data);
        }
      } catch (error) {
        console.error("Failed to load freelancer overview stats:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [user]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Freelancer Overview</h1>
        <p className="mt-1 text-sm text-gray-500">Track your application performance, project status, and total revenue.</p>
      </div>

      {/* ---------------------------------------------------- */}
      {/* 4 Dashboard Main Statistics Cards */}
      {/* ---------------------------------------------------- */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Total Proposals</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{stats.totalProposals}</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Pending Proposals</p>
          <p className="mt-2 text-3xl font-bold text-amber-600">{stats.pendingProposals}</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Accepted Proposals</p>
          <p className="mt-2 text-3xl font-bold text-indigo-600">{stats.acceptedProposals}</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Total Earnings (USD)</p>
          <p className="mt-2 text-3xl font-bold text-emerald-600">${stats.totalEarnings}</p>
        </div>
      </div>

      {/* Quick Action Navigation Card */}
      <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-indigo-900">Looking for new opportunities?</h3>
          <p className="text-sm text-indigo-700 mt-0.5">Explore the task feed and send competitive bids on relevant client jobs.</p>
        </div>
        <Link
          href="/dashboard/freelancer/browse"
          className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition shrink-0"
        >
          Browse Tasks
        </Link>
      </div>
    </div>
  );
}