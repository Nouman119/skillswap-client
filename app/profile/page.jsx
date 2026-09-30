"use client";

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function ProfilePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-20 p-6 bg-white border border-gray-200 rounded-2xl text-center space-y-4">
        <h2 className="text-lg font-bold text-gray-900">Access Denied</h2>
        <p className="text-xs text-gray-500">Please sign in to view your profile details.</p>
        <Link
          href="/login"
          className="inline-block rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm space-y-8">
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-gray-100">
          {user.image ? (
            <img
              src={user.image}
              alt={user.name || "User Avatar"}
              className="h-24 w-24 rounded-full object-cover border-2 border-indigo-100"
            />
          ) : (
            <div className="h-24 w-24 rounded-full bg-indigo-50 flex items-center justify-center text-2xl font-bold text-indigo-600 border-2 border-indigo-100">
              {user.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
          )}

          <div className="text-center sm:text-left space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl font-bold text-gray-900">{user.name || "SkillSwap User"}</h1>
              <span className="inline-flex rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-indigo-700 border border-indigo-200">
                {user.role || "Client"}
              </span>
            </div>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
        </div>

        {/* Account Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-xl bg-gray-50 p-4 border border-gray-100">
            <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">Account Role</span>
            <p className="text-sm font-semibold text-gray-800 capitalize mt-1">{user.role || "Client"}</p>
          </div>

          <div className="rounded-xl bg-gray-50 p-4 border border-gray-100">
            <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">Sign-in Provider</span>
            <p className="text-sm font-semibold text-gray-800 capitalize mt-1">{user.image ? "Google OAuth" : "Email & Password"}</p>
          </div>
        </div>

        {/* Actions based on role */}
        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-end">
          {user.role === "freelancer" ? (
            <Link
              href="/dashboard/freelancer"
              className="rounded-lg bg-indigo-600 px-5 py-2.5 text-center text-xs font-semibold text-white hover:bg-indigo-700 transition"
            >
              Go to Freelancer Dashboard
            </Link>
          ) : user.role === "admin" ? (
            <Link
              href="/dashboard/admin"
              className="rounded-lg bg-indigo-600 px-5 py-2.5 text-center text-xs font-semibold text-white hover:bg-indigo-700 transition"
            >
              Go to Admin Panel
            </Link>
          ) : (
            <>
              <Link
                href="/dashboard/client/post-task"
                className="rounded-lg bg-indigo-600 px-5 py-2.5 text-center text-xs font-semibold text-white hover:bg-indigo-700 transition"
              >
                Post New Task
              </Link>
              <Link
                href="/dashboard/client/my-tasks"
                className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-center text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
              >
                My Posted Tasks
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}