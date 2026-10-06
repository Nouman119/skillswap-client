"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function ClientCompletedTasksPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Modal state for review & rating
  const [selectedTask, setSelectedTask] = useState(null);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

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
    }
  }, [user, authLoading, router]);

  // ----------------------------------------------------
  // Fetch Client's Completed Tasks
  // ----------------------------------------------------
  const fetchClientTasks = useCallback(async () => {
    if (!user?.email) return;

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${API_URL}/api/tasks/client-tasks?email=${encodeURIComponent(user.email)}`);
      const data = await res.json();

      if (res.ok) {
        // Filter tasks that are completed or submitted by freelancers
        const completedList = Array.isArray(data)
          ? data.filter((t) => (t.status || "").toLowerCase() === "completed")
          : [];
        setTasks(completedList);
      } else {
        setError(data.error || "Failed to load completed tasks.");
      }
    } catch (err) {
      setError("Network error occurred while fetching tasks.");
    } finally {
      setLoading(false);
    }
  }, [user?.email]);

  useEffect(() => {
    if (!authLoading && user && (user.role || "").toLowerCase() === "client") {
      fetchClientTasks();
    }
  }, [user, authLoading, fetchClientTasks]);

  // ----------------------------------------------------
  // Handle Review & Rating Submission
  // ----------------------------------------------------
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTask) return;

    setSubmittingReview(true);
    setError("");
    setSuccessMsg("");

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${API_URL}/api/tasks/${selectedTask._id}/review`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: Number(rating),
          review: reviewText,
          clientEmail: user.email,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMsg("Review and rating submitted successfully!");
        setTimeout(() => {
          setSelectedTask(null);
          setReviewText("");
          setRating(5);
          setSuccessMsg("");
          fetchClientTasks();
        }, 1500);
      } else {
        setError(data.error || "Failed to submit review.");
      }
    } catch (err) {
      setError("Network error occurred during review submission.");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (authLoading || (loading && user?.role?.toLowerCase() === "client")) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center space-x-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
        <span className="text-xs font-medium text-gray-500">Loading completed deliverables...</span>
      </div>
    );
  }

  if (!user || (user.role || "").toLowerCase() !== "client") {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      {/* Header and Back Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Completed Tasks & Reviews
          </h1>
          <p className="mt-1 text-xs text-gray-500">
            Review submitted deliverables from freelancers and provide feedback ratings.
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

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-xs text-red-700 border border-red-200">
          {error}
        </div>
      )}

      {/* Tasks Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 text-gray-500 text-[11px] uppercase tracking-wider font-semibold">
            <tr>
              <th className="px-6 py-3.5 text-left">Task Title</th>
              <th className="px-6 py-3.5 text-left">Assigned Freelancer</th>
              <th className="px-6 py-3.5 text-left">Deliverable Link</th>
              <th className="px-6 py-3.5 text-right">Action / Review</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white text-xs">
            {tasks.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                  No completed tasks or deliverables found at the moment.
                </td>
              </tr>
            ) : (
              tasks.map((task) => (
                <tr key={task._id} className="hover:bg-gray-50/50 transition">
                  <td className="px-6 py-4 font-semibold text-gray-900">
                    {task.title || "Untitled Task"}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {task.assignedFreelancerEmail || "N/A"}
                  </td>
                  <td className="px-6 py-4">
                    {task.deliverable_url ? (
                      <a
                        href={task.deliverable_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 font-medium underline hover:text-indigo-800"
                      >
                        Visit Deliverable →
                      </a>
                    ) : (
                      <span className="text-gray-400">No link provided</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {task.reviewed ? (
                      <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
                        Reviewed ({task.rating}★)
                      </span>
                    ) : (
                      <button
                        onClick={() => setSelectedTask(task)}
                        className="rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 transition shadow-sm"
                      >
                        Give Review
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Review Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-gray-900">
              Rate & Review Freelancer
            </h3>
            <p className="text-xs text-gray-500">
              Task: <span className="font-semibold text-gray-800">{selectedTask.title}</span>
            </p>

            {successMsg && (
              <div className="rounded-lg bg-emerald-50 p-3 text-xs text-emerald-700 border border-emerald-200">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Rating (1 to 5 Stars)
                </label>
                <select
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="5">⭐⭐⭐⭐⭐ (5 - Excellent)</option>
                  <option value="4">⭐⭐⭐⭐ (4 - Very Good)</option>
                  <option value="3">⭐⭐⭐ (3 - Average)</option>
                  <option value="2">⭐⭐ (2 - Below Expectations)</option>
                  <option value="1">⭐ (1 - Poor)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Written Feedback / Review
                </label>
                <textarea
                  rows="3"
                  required
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share your experience working with this freelancer..."
                  className="w-full rounded-lg border border-gray-300 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedTask(null)}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  {submittingReview ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}