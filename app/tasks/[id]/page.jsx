"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function TaskDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ error: "", success: "" });

  // ----------------------------------------------------
  // Fetch single task details by ID
  // ----------------------------------------------------
  useEffect(() => {
    async function fetchTask() {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const res = await fetch(`${API_URL}/api/tasks/${id}`);
        const data = await res.json();

        if (res.ok) {
          setTask(data);
        } else {
          setError(data.error || "Task not found");
        }
      } catch (err) {
        setError("Network error occurred while fetching task details");
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchTask();
    }
  }, [id]);

  // ----------------------------------------------------
  // Handle Proposal Submission directly from details view
  // ----------------------------------------------------
  const handleProposalSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback({ error: "", success: "" });

    const form = e.target;
    const proposalData = {
      taskId: task._id,
      freelancerEmail: user?.email || "freelancer@skillswap.com",
      freelancerName: user?.name || "Freelancer",
      budgetPrice: Number(form.budgetPrice.value),
      completionDays: Number(form.completionDays.value),
      message: form.message.value,
    };

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${API_URL}/api/tasks/proposals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(proposalData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit proposal");
      }

      setFeedback({ error: "", success: "Your proposal has been submitted successfully!" });
      form.reset();
    } catch (err) {
      setFeedback({ error: err.message, success: "" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <p className="text-base font-semibold text-red-600">{error || "Task could not be found."}</p>
        <Link
          href="/tasks"
          className="inline-block rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition"
        >
          Back to Browse Tasks
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back to tasks navigation */}
      <div>
        <Link
          href="/tasks"
          className="text-xs font-semibold text-indigo-600 hover:underline inline-flex items-center gap-1"
        >
          ← Back to all tasks
        </Link>
      </div>

      {/* Main Task Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                {task.category || "General"}
              </span>
              <span
                className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  task.status === "open"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {task.status ? task.status.toUpperCase() : "OPEN"}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-snug">
              {task.title}
            </h1>

            <div className="text-xs text-gray-500 border-b border-gray-100 pb-4">
              Posted by: <span className="font-medium text-gray-700">{task.clientName || task.clientEmail}</span>
            </div>

            <div className="space-y-2 pt-2">
              <h2 className="text-sm font-semibold text-gray-900">Project Description</h2>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {task.description}
              </p>
            </div>
          </div>
        </div>

        {/* Task Metadata & Proposal Action Box */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Estimated Budget</p>
              <p className="text-3xl font-bold text-emerald-600 mt-1">${task.budget} USD</p>
            </div>

            <div className="border-t border-gray-100 pt-4 text-xs text-gray-500 space-y-2">
              <p>• Fixed-price contract format</p>
              <p>• Verified platform client</p>
              <p>• Escrow payment guarantee</p>
            </div>
          </div>

          {/* Proposal Form for Logged-in Freelancers */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-gray-900">Submit an Offer</h2>

            {feedback.error && (
              <div className="rounded-lg bg-red-50 p-3 text-xs text-red-700 border border-red-200">
                {feedback.error}
              </div>
            )}

            {feedback.success && (
              <div className="rounded-lg bg-emerald-50 p-3 text-xs text-emerald-700 border border-emerald-200">
                {feedback.success}
              </div>
            )}

            <form onSubmit={handleProposalSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700">Bid Amount ($)</label>
                <input
                  name="budgetPrice"
                  type="number"
                  min="1"
                  required
                  defaultValue={task.budget}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-1.5 text-xs focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700">Delivery Timeline (Days)</label>
                <input
                  name="completionDays"
                  type="number"
                  min="1"
                  required
                  defaultValue="3"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-1.5 text-xs focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700">Cover Note</label>
                <textarea
                  name="message"
                  rows="3"
                  required
                  placeholder="Outline your delivery strategy..."
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-1.5 text-xs focus:border-indigo-500 focus:outline-none"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-lg bg-indigo-600 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50 transition"
              >
                {submitting ? "Sending..." : "Submit Proposal"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}