"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function ClientProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading, updateProfile } = useAuth();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [bio, setBio] = useState("");
  const [updating, setUpdating] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");

  // ----------------------------------------------------
  // RBAC Route Guard: Client Only Access
  // ----------------------------------------------------
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    const currentRole = (user?.role || "").toLowerCase();
    if (currentRole === "freelancer") {
      router.replace("/dashboard/freelancer");
    } else if (currentRole === "admin") {
      router.replace("/dashboard/admin");
    } else {
      // Pre-fill form fields when user data is available
      setName(user.name || "");
      setPhone(user.phone || "");
      setCompany(user.company || "");
      setBio(user.bio || "");
    }
  }, [user, authLoading, router]);

  // ----------------------------------------------------
  // Handle Profile Update Submission
  // ----------------------------------------------------
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setError("");
    setSuccessMessage("");

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${API_URL}/api/users/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          name,
          phone,
          company,
          bio,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMessage("Profile updated successfully!");
        if (updateProfile && typeof updateProfile === "function") {
          updateProfile({ ...user, name, phone, company, bio });
        }
      } else {
        setError(data.error || "Failed to update profile.");
      }
    } catch (err) {
      setError("Network error occurred while updating profile.");
    } finally {
      setUpdating(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!user || (user.role || "").toLowerCase() !== "client") {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Client Profile & Settings
          </h1>
          <p className="mt-1 text-xs text-gray-500">
            Manage your personal details, company information, and account preferences.
          </p>
        </div>
        <div>
          <Link
            href="/dashboard/client"
            className="rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition shadow-sm"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-xs text-red-700 border border-red-200">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="rounded-lg bg-emerald-50 p-3 text-xs text-emerald-700 border border-emerald-200">
          {successMessage}
        </div>
      )}

      {/* Profile Form Card */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <form onSubmit={handleUpdateProfile} className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-gray-300 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Email Address (Read-only)
              </label>
              <input
                type="email"
                disabled
                value={user.email || ""}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 p-2.5 text-xs text-gray-500 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-lg border border-gray-300 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="+8801XXXXXXXXX"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Company / Organization Name
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full rounded-lg border border-gray-300 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g. Tech Solutions Ltd."
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Short Bio / Description
            </label>
            <textarea
              rows="3"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full rounded-lg border border-gray-300 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Tell freelancers a bit about yourself or your business..."
            ></textarea>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={updating}
              className="rounded-lg bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {updating ? "Saving Changes..." : "Save Profile Settings"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}