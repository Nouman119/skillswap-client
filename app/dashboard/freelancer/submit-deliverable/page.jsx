"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function SubmitDeliverablePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const taskId = searchParams.get("taskId");
  const { user, loading: authLoading } = useAuth();

  const [deliverableUrl, setDeliverableUrl] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // ----------------------------------------------------
  // RBAC Route Guard & Task Details Fetching
  // ----------------------------------------------------
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    if ((user?.role || "").toLowerCase() !== "freelancer") {
      router.replace("/dashboard/client");
      return;
    }

    if (taskId) {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      fetch(`${API_URL}/api/tasks/${taskId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.title) {
            setTaskTitle(data.title);
          }
        })
        .catch((err) => console.error("Failed to load task details:", err));
    }
  }, [user, authLoading, taskId, router]);

  // ----------------------------------------------------
  // Handle Deliverable Submission
  // ----------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!taskId) {
      setError("No valid Task ID provided for submission.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${API_URL}/api/tasks/${taskId}/submit-deliverable`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deliverable_url: deliverableUrl }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/dashboard/freelancer/active-projects");
        }, 2000);
      } else {
        setError(data.error || "Failed to submit deliverable.");
      }
    } catch (err) {
      setError("Network error occurred during submission.");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-4 sm:px-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm space-y-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900">
            Submit Project Deliverable
          </h1>
          <p className="mt-1 text-xs text-gray-500">
            Provide the final work repository link, live deployment, or documentation URL for client review.
          </p>
        </div>

        {taskTitle && (
          <div className="rounded-lg bg-indigo-50 p-3.5 border border-indigo-100">
            <p className="text-xs text-indigo-700 font-medium">
              Target Task: <span className="font-bold text-indigo-900">{taskTitle}</span>
            </p>
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-xs text-red-700 border border-red-200">
            {error}
          </div>
        )}

        {success ? (
          <div className="rounded-lg bg-emerald-50 p-6 text-center space-y-2 border border-emerald-200">
            <p className="text-sm font-semibold text-emerald-800">
              Deliverable submitted successfully! Status updated to Completed.
            </p>
            <p className="text-xs text-emerald-600">Redirecting to active projects...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Deliverable URL (GitHub, Google Drive, or Live Demo)
              </label>
              <input
                type="url"
                required
                value={deliverableUrl}
                onChange={(e) => setDeliverableUrl(e.target.value)}
                placeholder="https://github.com/username/repository"
                className="w-full rounded-lg border border-gray-300 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4">
              <Link
                href="/dashboard/freelancer/active-projects"
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-emerald-600 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition disabled:opacity-50"
              >
                {submitting ? "Submitting Work..." : "Submit Deliverable"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}