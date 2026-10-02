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

    if (!user) {
      setFeedback({ error: "You must be logged in to submit a proposal.", success: "" });
      setSubmitting(false);
      return;
    }

    if (user.role?.toLowerCase() !== "freelancer") {
      setFeedback({ error: "Only freelancers can submit proposals.", success: "" });
      setSubmitting(false);
      return;
    }

    const form = e.target;
    const proposalData = {
      taskId: task._id,
      taskTitle: task.title,
      clientEmail: task.clientEmail,
      freelancerId: user.id || user._id,
      freelancerEmail: user.email,
      freelancerName: user.name || "Freelancer",
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
        <div className="h-9 w-9 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <p className="text-base font-semibold text-red-600">{error || "Task could not be found."}</p>
        <Link
          href="/browse-tasks"
          className="inline-block rounded-lg bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-indigo-700 transition"
        >
          ← Back to Browse Tasks
        </Link>
      </div>
    );
  }

  // রোল এবং ওনারশিপ যাচাই
  const isFreelancer = user?.role?.toLowerCase() === "freelancer";
  const isOwner = user && (user.email === task.clientEmail);
  const isOpen = (task.status || "open").toLowerCase() === "open";

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back to tasks navigation */}
      <div>
        <Link
          href="/browse-tasks"
          className="text-xs font-semibold text-indigo-600 hover:underline inline-flex items-center gap-1"
        >
          ← Back to Browse Tasks
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
                  isOpen
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-amber-50 text-amber-700"
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
              <p>• Deadline: {task.deadline ? new Date(task.deadline).toLocaleDateString() : "Flexible"}</p>
            </div>
          </div>

          {/* Proposal Action Card (Role Conditioned) */}
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

            {!isOpen ? (
              <div className="p-4 bg-gray-50 rounded-xl text-center text-xs text-gray-500">
                This task is currently <span className="font-semibold text-amber-600">{task.status}</span>. New proposals are not being accepted.
              </div>
            ) : !user ? (
              <div className="p-4 bg-indigo-50/60 rounded-xl text-center space-y-3">
                <p className="text-xs text-gray-600">
                  You need to be logged in as a <strong>Freelancer</strong> to submit a proposal for this task.
                </p>
                <Link
                  href="/login"
                  className="block w-full text-center rounded-lg bg-indigo-600 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
                >
                  Log In to Apply
                </Link>
              </div>
            ) : isOwner ? (
              <div className="p-4 bg-blue-50 rounded-xl text-center text-xs text-blue-700">
                You created this task. You can monitor proposals from your{" "}
                <Link href="/dashboard/client/my-tasks" className="font-bold underline">
                  Client Dashboard
                </Link>.
              </div>
            ) : !isFreelancer ? (
              <div className="p-4 bg-amber-50 rounded-xl text-center text-xs text-amber-700">
                You are currently logged in with a <strong>{user.role || "Client"}</strong> account. Only freelancers can submit project proposals.
              </div>
            ) : (
              <form onSubmit={handleProposalSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700">Bid Amount ($ USD)</label>
                  <input
                    name="budgetPrice"
                    type="number"
                    min="1"
                    required
                    defaultValue={task.budget}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-1.5 text-xs text-gray-800 focus:border-indigo-500 focus:outline-none"
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
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-1.5 text-xs text-gray-800 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700">Cover Note / Strategy</label>
                  <textarea
                    name="message"
                    rows="3"
                    required
                    placeholder="Outline your delivery strategy and relevant skills..."
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-1.5 text-xs text-gray-800 focus:border-indigo-500 focus:outline-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-lg bg-indigo-600 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50 transition"
                >
                  {submitting ? "Sending..." : "Submit Proposal"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}