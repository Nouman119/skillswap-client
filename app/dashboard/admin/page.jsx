"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function AdminDashboardOverview() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTasks: 0,
    totalRevenue: 0,
    activeTasks: 0,
  });

  const [usersList, setUsersList] = useState([]);
  const [transactionsList, setTransactionsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [error, setError] = useState("");

  // ----------------------------------------------------
  // Strict RBAC Route Guard: Admin Only Access
  // ----------------------------------------------------
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    const currentRole = (user?.role || "").toLowerCase();
    if (currentRole === "client") {
      router.replace("/dashboard/client");
    } else if (currentRole === "freelancer") {
      router.replace("/dashboard/freelancer");
    }
  }, [user, authLoading, router]);

  // ----------------------------------------------------
  // Fetch overview metrics, users, and Stripe transactions
  // ----------------------------------------------------
  const fetchAdminDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

      // 1. Fetch admin platform metrics
      const resStats = await fetch(`${API_URL}/api/tasks/admin/stats`);
      if (resStats.ok) {
        const statsData = await resStats.json();
        setStats(statsData);
      }

      // 2. Fetch platform users for account auditing
      try {
        const resUsers = await fetch(`${API_URL}/api/users/admin/users`);
        if (resUsers.ok) {
          const usersData = await resUsers.json();
          setUsersList(Array.isArray(usersData) ? usersData : []);
        }
      } catch (uErr) {
        console.error("Failed to load users:", uErr);
      }

      // 3. Fetch Stripe payment transactions history
      try {
        const resTx = await fetch(`${API_URL}/api/payments/transactions`);
        if (resTx.ok) {
          const txData = await resTx.json();
          setTransactionsList(Array.isArray(txData) ? txData : []);
        }
      } catch (txErr) {
        console.error("Failed to load transactions:", txErr);
      }
    } catch (err) {
      setError("Network error occurred while fetching admin dashboard data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && user && (user.role || "").toLowerCase() === "admin") {
      fetchAdminDashboardData();
    }
  }, [user, authLoading, fetchAdminDashboardData]);


// ----------------------------------------------------
  // Toggle Block / Unblock User Status
  // ----------------------------------------------------
  const handleToggleUserStatus = async (targetUser) => {
    const isCurrentlyBlocked = Boolean(targetUser.isBlocked) || (targetUser.status || "").toLowerCase() === "blocked";
    const nextBlockedState = !isCurrentlyBlocked;
    const newStatusString = nextBlockedState ? "blocked" : "active";

    const confirmMsg = `Are you sure you want to ${nextBlockedState ? "BLOCK" : "UNBLOCK"} user ${targetUser.email}?`;
    if (!confirm(confirmMsg)) return;

    setActionLoadingId(targetUser._id);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${API_URL}/api/users/admin/users/${targetUser._id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          isBlocked: nextBlockedState,
          status: newStatusString
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update user access status");
      }

      setUsersList((prev) =>
        prev.map((u) =>
          u._id === targetUser._id
            ? { ...u, isBlocked: nextBlockedState, status: newStatusString }
            : u
        )
      );
      alert(`User status updated to ${newStatusString.toUpperCase()} successfully.`);
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoadingId(null);
    }
  };




  if (authLoading || (loading && user?.role?.toLowerCase() === "admin")) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!user || (user.role || "").toLowerCase() !== "admin") {
    return null;
  }

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Governance & Telemetry</h1>
        <p className="mt-1 text-sm text-gray-500">
          Platform-wide user management, system audit trails, and Stripe ledger logs.
        </p>
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
          <p className="mt-2 text-3xl font-bold text-gray-900">{stats.totalUsers || usersList.length}</p>
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

      {/* ---------------------------------------------------- */}
      {/* Platform Users Audit Table (Block / Unblock Actions) */}
      {/* ---------------------------------------------------- */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900">User Governance & Access Control</h2>
            <p className="text-xs text-gray-500">Inspect user profiles and toggle account status flags.</p>
          </div>
          <span className="rounded-full bg-gray-100 text-gray-700 text-xs px-3 py-1 font-semibold">
            {usersList.length} Accounts
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold border-b border-gray-200">
              <tr>
                <th className="px-6 py-3.5">User</th>
                <th className="px-6 py-3.5">Role</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Access Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {usersList.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-6 text-center text-sm text-gray-400">
                    No user accounts available for audit.
                  </td>
                </tr>
              ) : (
                usersList.map((usr) => {
const isBlocked = Boolean(usr.isBlocked) || (usr.status || "").toLowerCase() === "blocked";                  const isSelf = usr.email === user.email;

                  return (
                    <tr key={usr._id} className="hover:bg-gray-50/50 transition">
                      <td className="px-6 py-4">
                        <div className="text-gray-900 font-semibold">{usr.name || "User"}</div>
                        <div className="text-xs text-gray-500">{usr.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="rounded-md bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700 capitalize">
                          {usr.role || "member"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            isBlocked
                              ? "bg-red-50 text-red-700 border border-red-200"
                              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          }`}
                        >
                          {isBlocked ? "BLOCKED" : "ACTIVE"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {isSelf ? (
                          <span className="text-xs text-gray-400 italic">Current Session</span>
                        ) : (
                          <button
                            onClick={() => handleToggleUserStatus(usr)}
                            disabled={actionLoadingId === usr._id}
                            className={`rounded-lg px-3 py-1.5 text-xs font-semibold shadow-sm transition disabled:opacity-50 ${
                              isBlocked
                                ? "bg-emerald-600 text-white hover:bg-emerald-700"
                                : "bg-red-600 text-white hover:bg-red-700"
                            }`}
                          >
                            {actionLoadingId === usr._id
                              ? "Updating..."
                              : isBlocked
                              ? "Unblock Access"
                              : "Block Access"}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* Stripe Financial Ledger & Audit Trail Table */}
      {/* ---------------------------------------------------- */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Stripe Payment Ledger</h2>
            <p className="text-xs text-gray-500">Audit settled and pending escrow payments.</p>
          </div>
          <span className="rounded-full bg-emerald-50 text-emerald-700 text-xs px-3 py-1 font-semibold border border-emerald-200">
            {transactionsList.length} Records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold border-b border-gray-200">
              <tr>
                <th className="px-6 py-3.5">Transaction / Intent ID</th>
                <th className="px-6 py-3.5">Task / Contract</th>
                <th className="px-6 py-3.5">Client</th>
                <th className="px-6 py-3.5">Amount</th>
                <th className="px-6 py-3.5">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {transactionsList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-6 text-center text-sm text-gray-400">
                    No transactions captured in database yet.
                  </td>
                </tr>
              ) : (
                transactionsList.map((tx, idx) => (
                  <tr key={tx._id || idx} className="hover:bg-gray-50/50 transition">
                    <td className="px-6 py-4 font-mono text-xs text-gray-800">
                      {tx.paymentIntentId || tx.transactionId || tx._id}
                    </td>
                    <td className="px-6 py-4 text-gray-900 font-semibold">
                      {tx.taskTitle || tx.task_title || "Contract Payout"}
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-xs">
                      {tx.clientEmail || tx.payerEmail || "Client"}
                    </td>
                    <td className="px-6 py-4 font-bold text-emerald-600">
                      ${tx.amount || tx.budget || 0} USD
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-xs">
                      {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : "Recent"}
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