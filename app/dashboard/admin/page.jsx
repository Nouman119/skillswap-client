"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminDashboardOverview() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTasks: 0,
    totalRevenue: 0,
    activeTasks: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ----------------------------------------------------
  // Fetch overview metrics for administrator
  // ----------------------------------------------------
  useEffect(() => {
    async function fetchAdminStats() {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const res = await fetch(`${API_URL}/api/tasks/admin/stats`);
        const data = await res.json();

        if (res.ok) {
          setStats(data);
        } else {
          setError(data.error || "Failed to load dashboard metrics");
        }
      } catch (err) {
        setError("Network error occurred while fetching admin stats");
      } finally {
        setLoading(false);
      }
    }

    fetchAdminStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">System Overview</h1>
        <p className="mt-1 text-sm text-gray-500">Live platform telemetry, user adoption, and financial aggregates.</p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-200">
          {error}
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 4 Core Administration Metrics Cards */}
      {/* ---------------------------------------------------- */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Total Users</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Total Tasks</p>
          <p className="mt-2 text-3xl font-bold text-indigo-600">{stats.totalTasks}</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Total Revenue (USD)</p>
          <p className="mt-2 text-3xl font-bold text-emerald-600">${stats.totalRevenue}</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Active Tasks</p>
          <p className="mt-2 text-3xl font-bold text-amber-600">{stats.activeTasks}</p>
        </div>
      </div>

      {/* Quick Navigation Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
          <h3 className="text-base font-semibold text-gray-900">User Account Audits</h3>
          <p className="text-sm text-gray-500">
            Inspect platform users, verify permissions, and toggle access blocks for violation of community standards.
          </p>
          <Link
            href="/dashboard/admin/users"
            className="inline-block rounded-lg bg-gray-900 px-4 py-2 text-xs font-semibold text-white hover:bg-gray-800 transition"
          >
            Manage Accounts
          </Link>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
          <h3 className="text-base font-semibold text-gray-900">Financial Ledger</h3>
          <p className="text-sm text-gray-500">
            Review live and past Stripe transactions processed between platform clients and freelancers.
          </p>
          <Link
            href="/dashboard/admin/transactions"
            className="inline-block rounded-lg bg-gray-900 px-4 py-2 text-xs font-semibold text-white hover:bg-gray-800 transition"
          >
            View Transactions
          </Link>
        </div>
      </div>
    </div>
  );
}