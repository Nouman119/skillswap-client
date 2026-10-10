"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function ClientTasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [reviewModalTask, setReviewModalTask] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewedTaskIds, setReviewedTaskIds] = useState([]);

  // ----------------------------------------------------
  // Fetch client tasks and cross-check submitted reviews
  // ----------------------------------------------------
  const fetchMyTasks = useCallback(async () => {
    if (!user?.email) return;
    try {
      setLoading(true);
      setError("");
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

      // 1. Fetch all client tasks
      const res = await fetch(`${API_URL}/api/tasks/my-tasks?email=${encodeURIComponent(user.email)}`);
      const tasksData = await res.json();

      let taskList = [];
      if (res.ok) {
        taskList = Array.isArray(tasksData) ? tasksData : [];
        setTasks(taskList);
      } else {
        setError(tasksData.error || "Failed to fetch tasks");
      }

      // 2. Fetch existing reviews written by this client to persist reviewed status across refreshes
      try {
        const revRes = await fetch(`${API_URL}/api/reviews?email=${encodeURIComponent(user.email)}`);
        if (revRes.ok) {
          const revData = await revRes.json();
          if (Array.isArray(revData)) {
            const alreadyReviewedIds = revData
              .map((r) => String(r.task_id || r.taskId || ""))
              .filter(Boolean);
            setReviewedTaskIds(alreadyReviewedIds);
          }
        }
      } catch (revErr) {
        console.error("Failed to fetch existing client reviews:", revErr);
      }
    } catch (err) {
      setError("An unexpected error occurred while fetching tasks");
    } finally {
      setLoading(false);
    }
  }, [user?.email]);

  useEffect(() => {
    fetchMyTasks();
  }, [fetchMyTasks]);

  // ----------------------------------------------------
  // Handle task deletion
  // ----------------------------------------------------
  const handleDeleteTask = async (taskId) => {
    if (!confirm("Are you sure you want to delete this task?")) return;

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${API_URL}/api/tasks/${taskId}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (res.ok) {
        setTasks((prev) => prev.filter((t) => t._id !== taskId));
      } else {
        alert(data.error || "Cannot delete this task");
      }
    } catch (err) {
      alert("Failed to delete task");
    }
  };

  // ----------------------------------------------------
  // Handle Review Submission (1 to 5 Stars + Comment)
  // ----------------------------------------------------
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewModalTask) return;

    const freelancerEmail =
      reviewModalTask.assignedFreelancerEmail ||
      reviewModalTask.freelancerEmail ||
      reviewModalTask.freelancer_email;

    if (!freelancerEmail) {
      alert("Freelancer email not found for this task.");
      return;
    }

    setSubmittingReview(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

      const reviewPayload = {
        taskId: reviewModalTask._id,
        task_id: reviewModalTask._id,
        reviewerEmail: user?.email,
        reviewer_email: user?.email,
        revieweeEmail: freelancerEmail,
        reviewee_email: freelancerEmail,
        rating: Number(rating),
        comment: comment.trim(),
      };

      const res = await fetch(`${API_URL}/api/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reviewPayload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit review");
      }

      alert("Thank you! Review submitted successfully.");

      // Update both reviewedTaskIds state and local task property
      setReviewedTaskIds((prev) => [...prev, String(reviewModalTask._id)]);
      setTasks((prev) =>
        prev.map((t) =>
          t._id === reviewModalTask._id ? { ...t, hasReviewed: true } : t
        )
      );

      setReviewModalTask(null);
      setComment("");
      setRating(5);
    } catch (err) {
      alert(err.message || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Posted Tasks</h1>
          <p className="mt-1 text-sm text-gray-500">Manage, edit, or delete your job listings.</p>
        </div>
        <Link
          href="/dashboard/client/post-task"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
        >
          Post New Task
        </Link>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-200">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="divide-y divide-gray-200">
          {tasks.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-500">
              You haven't posted any tasks yet.
            </div>
          ) : (
            tasks.map((task) => {
              const isCompleted = (task.status || "").toLowerCase() === "completed";
              const isAlreadyReviewed =
                Boolean(task.hasReviewed) ||
                reviewedTaskIds.includes(String(task._id));

              return (
                <div
                  key={task._id}
                  className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-gray-50/40 transition"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          task.status === "open"
                            ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                            : task.status === "in-progress"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        }`}
                      >
                        {task.status ? task.status.toUpperCase() : "OPEN"}
                      </span>
                    </div>

                    <p className="text-sm text-gray-500 line-clamp-1">{task.description}</p>
                    <p className="text-xs text-gray-400">
                      Category: {task.category || "General"} • Budget: ${task.budget} • Deadline:{" "}
                      {task.deadline ? new Date(task.deadline).toLocaleDateString() : "Flexible"}
                    </p>

                    {/* Submitted deliverable link */}
                    {isCompleted && (task.deliverable_url || task.deliverableUrl) && (
                      <div className="pt-1 text-xs">
                        <span className="font-semibold text-gray-700">Deliverable Work: </span>
                        <a
                          href={task.deliverable_url || task.deliverableUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 underline font-medium hover:text-indigo-800"
                        >
                          {task.deliverable_url || task.deliverableUrl}
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {/* Dynamic Review Action Button or Static Reviewed Badge */}
                    {isCompleted && (
                      isAlreadyReviewed ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200 shadow-sm">
                          ✓ Reviewed
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            setReviewModalTask(task);
                            setRating(5);
                            setComment("");
                          }}
                          className="rounded-lg bg-amber-500 hover:bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition"
                        >
                          Review Freelancer
                        </button>
                      )
                    )}

                    {task.status === "open" && (
                      <Link
                        href={`/dashboard/client/tasks/edit/${task._id}`}
                        className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition"
                      >
                        Edit
                      </Link>
                    )}

                    <button
                      onClick={() => handleDeleteTask(task._id)}
                      className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* Review Freelancer Modal Dialog */}
      {/* ---------------------------------------------------- */}
      {reviewModalTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-start border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-gray-900">Review & Rate Freelancer</h3>
                <p className="text-xs text-gray-500 mt-0.5">{reviewModalTask.title}</p>
              </div>
              <button
                onClick={() => setReviewModalTask(null)}
                className="text-gray-400 hover:text-gray-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Star Rating (1 to 5)
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="text-2xl focus:outline-none transition-transform hover:scale-110"
                    >
                      {star <= rating ? "⭐" : "☆"}
                    </button>
                  ))}
                  <span className="text-xs font-semibold text-amber-600 ml-2">
                    {rating} out of 5
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700">
                  Feedback Comment
                </label>
                <textarea
                  required
                  rows="3"
                  placeholder="Share your experience working with this freelancer..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-xs text-gray-800 focus:border-indigo-500 focus:outline-none"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setReviewModalTask(null)}
                  className="rounded-md border border-gray-300 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="rounded-md bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 transition"
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