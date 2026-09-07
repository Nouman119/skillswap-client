"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function BrowseTasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ error: "", success: "" });

  // ----------------------------------------------------
  // Fetch all open tasks available on the platform
  // ----------------------------------------------------
  useEffect(() => {
    async function fetchOpenTasks() {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const res = await fetch(`${API_URL}/api/tasks`);
        const data = await res.json();

        if (res.ok) {
          const openList = Array.isArray(data)
            ? data.filter((t) => t.status === "open")
            : [];
          setTasks(openList);
        }
      } catch (err) {
        console.error("Failed to load tasks:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchOpenTasks();
  }, []);

  // ----------------------------------------------------
  // Handle Submit Proposal Form
  // ----------------------------------------------------
  const handleProposalSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback({ error: "", success: "" });

    const form = e.target;
    const proposalData = {
      taskId: selectedTask._id,
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

      setFeedback({ error: "", success: "Proposal submitted successfully!" });
      setTimeout(() => {
        setSelectedTask(null);
        setFeedback({ error: "", success: "" });
      }, 1500);
    } catch (err) {
      setFeedback({ error: err.message, success: "" });
    } finally {
      setSubmitting(false);
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Browse Open Tasks</h1>
        <p className="mt-1 text-sm text-gray-500">Find client projects matching your skill set and submit competitive proposals.</p>
      </div>

      {/* Task Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tasks.length === 0 ? (
          <div className="col-span-full p-8 text-center text-sm text-gray-500 bg-white rounded-xl border border-gray-200">
            No open tasks available at the moment.
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task._id}
              className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col justify-between hover:border-indigo-300 transition"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="inline-flex rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
                    {task.category}
                  </span>
                  <span className="text-sm font-bold text-emerald-600">${task.budget}</span>
                </div>
                <h3 className="text-base font-semibold text-gray-900 line-clamp-1">{task.title}</h3>
                <p className="text-xs text-gray-500 line-clamp-3">{task.description}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400">Client</p>
                  <p className="text-xs font-medium text-gray-700 truncate max-w-30">{task.clientName || task.clientEmail}</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedTask(task);
                    setFeedback({ error: "", success: "" });
                  }}
                  className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 transition"
                >
                  Apply Now
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ---------------------------------------------------- */}
      {/* Proposal Submission Modal Dialog */}
      {/* ---------------------------------------------------- */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Submit Proposal</h2>
                <p className="text-xs text-gray-500 mt-1">{selectedTask.title}</p>
              </div>
              <button
                onClick={() => setSelectedTask(null)}
                className="text-gray-400 hover:text-gray-600 text-lg"
              >
                ✕
              </button>
            </div>

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

            <form onSubmit={handleProposalSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700">Task ID</label>
                <input
                  type="text"
                  disabled
                  value={selectedTask._id}
                  className="mt-1 block w-full rounded-md border border-gray-200 bg-gray-100 px-3 py-2 text-xs text-gray-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700">Freelancer Email</label>
                <input
                  type="text"
                  disabled
                  value={user?.email || "freelancer@skillswap.com"}
                  className="mt-1 block w-full rounded-md border border-gray-200 bg-gray-100 px-3 py-2 text-xs text-gray-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700">Proposed Budget (USD)</label>
                  <input
                    name="budgetPrice"
                    type="number"
                    min="1"
                    required
                    defaultValue={selectedTask.budget}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700">Estimated Days</label>
                  <input
                    name="completionDays"
                    type="number"
                    min="1"
                    required
                    defaultValue="3"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700">Cover Note Message</label>
                <textarea
                  name="message"
                  rows="4"
                  required
                  placeholder="Explain why you are the best fit for this project and describe your relevant experience..."
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedTask(null)}
                  className="rounded-md border border-gray-300 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-md bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  {submitting ? "Submitting..." : "Send Proposal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}