"use client";

import { useEffect, useState } from "react";
import { useRoleRedirect } from "@/hooks/useRoleRedirect";

export default function BrowseTasksPage() {
  const { session } = useRoleRedirect(["freelancer"]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    fetch(`${API_URL}/api/tasks/open-tasks`)
      .then((res) => res.json())
      .then((data) => {
        setTasks(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch open tasks:", err);
        setLoading(false);
      });
  }, [API_URL]);

  const handleProposalSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback({ type: "", message: "" });

    const proposalData = {
      taskId: selectedTask._id,
      taskTitle: selectedTask.title,
      freelancerEmail: session?.user?.email,
      freelancerName: session?.user?.name,
      budgetPrice: e.target.budgetPrice.value,
      completionDays: e.target.completionDays.value,
      message: e.target.message.value,
    };

    try {
      const res = await fetch(`${API_URL}/api/tasks/submit-proposal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(proposalData),
      });

      const data = await res.json();
      if (data.success) {
        setFeedback({ type: "success", message: "Proposal submitted successfully!" });
        setTimeout(() => {
          setSelectedTask(null);
          setFeedback({ type: "", message: "" });
        }, 1500);
      } else {
        setFeedback({ type: "error", message: data.error || "Submission failed" });
      }
    } catch (err) {
      setFeedback({ type: "error", message: "Failed to submit proposal" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-600">Loading open tasks...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Browse Available Tasks</h1>

        {tasks.length === 0 ? (
          <div className="rounded-xl border border-gray-100 bg-white p-8 text-center text-gray-500">
            No open tasks available at the moment.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tasks.map((task) => (
              <div key={task._id} className="flex flex-col justify-between rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
                      {task.category}
                    </span>
                    <span className="text-sm font-semibold text-emerald-600">${task.budget}</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{task.title}</h3>
                  <p className="mt-2 text-sm text-gray-600 line-clamp-3">{task.description}</p>
                </div>

                <div className="mt-6 border-t border-gray-100 pt-4">
                  <div className="text-xs text-gray-500 space-y-1 mb-4">
                    <p>Client: <span className="font-medium text-gray-800">{task.clientName}</span></p>
                    <p>Deadline: <span className="font-medium text-gray-800">{task.deadline}</span></p>
                  </div>
                  <button
                    onClick={() => setSelectedTask(task)}
                    className="w-full rounded-lg bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                  >
                    Send Proposal
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Submit Proposal Modal */}
        {selectedTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-lg">
              <h2 className="text-xl font-bold text-gray-900 mb-1">Submit Proposal</h2>
              <p className="text-xs text-gray-500 mb-4">Applying for: <span className="font-semibold">{selectedTask.title}</span></p>

              {feedback.message && (
                <div className={`mb-4 rounded p-3 text-sm ${feedback.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                  {feedback.message}
                </div>
              )}

              <form onSubmit={handleProposalSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Proposed Budget ($)</label>
                    <input name="budgetPrice" type="number" required defaultValue={selectedTask.budget} className="w-full rounded border border-gray-300 p-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Est. Days</label>
                    <input name="completionDays" type="number" required placeholder="e.g. 5" className="w-full rounded border border-gray-300 p-2 text-sm" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Cover Note Message</label>
                  <textarea name="message" rows="4" required placeholder="Why are you the best fit for this task?" className="w-full rounded border border-gray-300 p-2 text-sm" />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => { setSelectedTask(null); setFeedback({ type: "", message: "" }); }}
                    className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {submitting ? "Submitting..." : "Send Proposal"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}