"use client";

import { useEffect, useState } from "react";

export default function ManageUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  // ----------------------------------------------------
  // Fetch all registered users from backend
  // ----------------------------------------------------
  const fetchUsers = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${API_URL}/api/tasks/admin/users`);
      const data = await res.json();

      if (res.ok) {
        setUsers(Array.isArray(data) ? data : []);
      } else {
        setError(data.error || "Failed to load users list");
      }
    } catch (err) {
      setError("Network error occurred while fetching users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ----------------------------------------------------
  // Toggle Block/Unblock Account Status
  // ----------------------------------------------------
  const handleToggleBlock = async (userId, currentBlockedStatus) => {
    const nextStatus = !currentBlockedStatus;
    const confirmMessage = nextStatus
      ? "Block this user? They will lose platform access immediately."
      : "Unblock this user and restore platform permissions?";

    if (!confirm(confirmMessage)) return;

    setUpdatingId(userId);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${API_URL}/api/tasks/admin/users/${userId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isBlocked: nextStatus }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to change user access status");
      }

      setUsers(
        users.map((u) => (u._id === userId ? { ...u, isBlocked: nextStatus } : u))
      );
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Manage Platform Accounts</h1>
        <p className="mt-1 text-sm text-gray-500">Inspect user profiles, verify assigned roles, and toggle platform access.</p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-200">
          {error}
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* Users Management Data Table */}
      {/* ---------------------------------------------------- */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
          <thead className="bg-gray-50 text-gray-600 font-medium">
            <tr>
              <th className="px-6 py-3.5">Name</th>
              <th className="px-6 py-3.5">Email Address</th>
              <th className="px-6 py-3.5">Role</th>
              <th className="px-6 py-3.5">Status</th>
              <th className="px-6 py-3.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-gray-700">
            {users.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-sm text-gray-500">
                  No accounts found.
                </td>
              </tr>
            ) : (
              users.map((account) => (
                <tr key={account._id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {account.name || "N/A"}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {account.email}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-800 uppercase tracking-wide">
                      {account.role || "User"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        account.isBlocked
                          ? "bg-red-50 text-red-700"
                          : "bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      {account.isBlocked ? "Blocked" : "Active"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      disabled={updatingId === account._id}
                      onClick={() => handleToggleBlock(account._id, account.isBlocked)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                        account.isBlocked
                          ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                          : "bg-red-50 text-red-600 hover:bg-red-100"
                      } disabled:opacity-50`}
                    >
                      {updatingId === account._id
                        ? "Updating..."
                        : account.isBlocked
                        ? "Unblock"
                        : "Block"}
                    </button>
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