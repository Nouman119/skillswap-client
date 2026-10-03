"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function ClientMyTasksManagementPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Edit task modal states
  const [editingTask, setEditingTask] = useState(null);
  const [updating, setUpdating] = useState(false);

  // Proposal modal states
  const [selectedTaskForProposals, setSelectedTaskForProposals] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [proposalsLoading, setProposalsLoading] = useState(false);
  const [payingProposalId, setPayingProposalId] = useState(null);

  // ----------------------------------------------------
  // Robust RBAC Route Guard: Only Clients can access
  // ----------------------------------------------------
  useEffect(() => {
    // Wait until auth state is completely determined
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
  // Fetch tasks created by this specific client
  // ----------------------------------------------------
  const fetchClientTasks = useCallback(async () => {
    if (!user?.email) return;
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${API_URL}/api/tasks/my-tasks?email=${encodeURIComponent(user.email)}`);
      const data = await res.json();
      
      if (res.ok) {
        setTasks(Array.isArray(data) ? data : []);
      } else {
        setError(data.error || "Failed to load tasks");
      }
    } catch (err) {
      setError("Network error occurred while fetching tasks");
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
  // Delete Task Handler
  // ----------------------------------------------------
  const handleDeleteTask = async (taskId) => {
    if (!confirm("Are you sure you want to delete this task? This action cannot be undone.")) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${API_URL}/api/tasks/${taskId}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setTasks((prev) => prev.filter((t) => t._id !== taskId));
        setSuccess("Task deleted successfully.");
      } else {
        setError(data.error || "Failed to delete task.");
      }
    } catch (err) {
      setError("Network error occurred while deleting task.");
    }
  };

  // ----------------------------------------------------
  // Update Task Handler
  // ----------------------------------------------------
  const handleUpdateTask = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setError("");

    const form = e.target;
    const updatedPayload = {
      title: form.title.value.trim(),
      category: form.category.value,
      budget: Number(form.budget.value),
      deadline: form.deadline.value,
      description: form.description.value.trim(),
    };

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${API_URL}/api/tasks/${editingTask._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedPayload),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setEditingTask(null);
        setSuccess("Task details updated successfully.");
        fetchClientTasks();
      } else {
        setError(data.error || "Failed to update task.");
      }
    } catch (err) {
      setError("Network error occurred during update.");
    } finally {
      setUpdating(false);
    }
  };

  // ----------------------------------------------------
  // View Proposals for a Task
  // ----------------------------------------------------
  const handleOpenProposals = async (task) => {
    setSelectedTaskForProposals(task);
    setProposals([]);
    setProposalsLoading(true);
    setError("");

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${API_URL}/api/tasks/proposals/${task._id}`);
      const data = await res.json();

      if (res.ok) {
        setProposals(Array.isArray(data) ? data : []);
      } else {
        setError(data.error || "Failed to load proposals for this task.");
      }
    } catch (err) {
      setError("Network error occurred while fetching proposals.");
    } finally {
      setProposalsLoading(false);
    }
  };

  // ----------------------------------------------------
  // Accept Proposal & Initialize Stripe Checkout
  // ----------------------------------------------------
  const handleAcceptAndPay = async (proposal) => {
    setPayingProposalId(proposal._id);
    setError("");

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${API_URL}/api/payments/create-checkout-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: selectedTaskForProposals._id,
          proposalId: proposal._id,
          taskTitle: selectedTaskForProposals.title,
          amount: proposal.budgetPrice || selectedTaskForProposals.budget,
          clientEmail: user.email,
          freelancerEmail: proposal.freelancerEmail,
        }),
      });

      const data = await res.json();

      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || "Unable to initiate Stripe payment checkout.");
        setPayingProposalId(null);
      }
    } catch (err) {
      setError("Network error occurred while initiating payment.");
      setPayingProposalId(null);
    }
  };

  // While authenticating, display a centered loader instead of flashing or redirecting
  if (authLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-9 w-9 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  // Prevent UI rendering if user is not authorized as client
  if (!user || (user.role || "").toLowerCase() !== "client") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-9 w-9 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      {/* Top Bar Navigation & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Task & Proposal Management</h1>
          <p className="mt-1 text-xs text-gray-500">
            Monitor bids, review freelancer proposals, manage active tasks, and initiate payments.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/client"
            className="rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition shadow-sm"
          >
            ← Overview
          </Link>
          <Link
            href="/dashboard/client/post-task"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
          >
            + Post New Task
          </Link>
        </div>
      </div>

      {/* Feedback Messages */}
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-xs text-red-700 border border-red-200">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg bg-emerald-50 p-3 text-xs text-emerald-700 border border-emerald-200">
          {success}
        </div>
      )}

      {/* Tasks Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 text-gray-500 text-[11px] uppercase tracking-wider font-semibold">
            <tr>
              <th className="px-6 py-3.5 text-left">Task Details</th>
              <th className="px-6 py-3.5 text-left">Category</th>
              <th className="px-6 py-3.5 text-left">Budget</th>
              <th className="px-6 py-3.5 text-left">Status</th>
              <th className="px-6 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white text-xs">
            {loading ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                  <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent"></div>
                  <p className="mt-2 text-xs">Loading tasks...</p>
                </td>
              </tr>
            ) : tasks.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                  You haven't posted any tasks yet. Click "+ Post New Task" above to publish your first requirement.
                </td>
              </tr>
            ) : (
              tasks.map((task) => {
                const isOpen = (task.status || "open").toLowerCase() === "open";
                return (
                  <tr key={task._id} className="hover:bg-gray-50/60 transition">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{task.title}</div>
                      <div className="text-[11px] text-gray-400 mt-0.5">
                        Deadline: {task.deadline ? new Date(task.deadline).toLocaleDateString() : "Flexible"}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{task.category || "General"}</td>
                    <td className="px-6 py-4 font-semibold text-emerald-600">${task.budget} USD</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                        isOpen
                          ? "bg-indigo-50 text-indigo-700"
                          : task.status === "in-progress"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-emerald-50 text-emerald-700"
                      }`}>
                        {task.status ? task.status.toUpperCase() : "OPEN"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenProposals(task)}
                        className="rounded bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition"
                      >
                        Proposals
                      </button>

                      {isOpen && (
                        <button
                          onClick={() => setEditingTask(task)}
                          className="rounded border border-gray-300 bg-white px-2.5 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
                        >
                          Edit
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteTask(task._id)}
                        className="rounded border border-red-200 bg-white px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 transition"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Proposals Modal */}
      {selectedTaskForProposals && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Proposals for: {selectedTaskForProposals.title}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Allocated Budget: ${selectedTaskForProposals.budget} USD
                </p>
              </div>
              <button
                onClick={() => setSelectedTaskForProposals(null)}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto space-y-3 flex-1 pr-1">
              {proposalsLoading ? (
                <div className="py-12 text-center text-xs text-gray-500">Loading bids...</div>
              ) : proposals.length === 0 ? (
                <div className="py-12 text-center text-xs text-gray-500">
                  No freelancer proposals have been submitted for this task yet.
                </div>
              ) : (
                proposals.map((prop) => (
                  <div
                    key={prop._id}
                    className="rounded-xl border border-gray-200 p-4 space-y-2 hover:border-indigo-200 transition"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">{prop.freelancerName || "Freelancer"}</h4>
                        <p className="text-[11px] text-gray-500">{prop.freelancerEmail}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-base font-bold text-emerald-600">${prop.budgetPrice}</span>
                        <p className="text-[11px] text-gray-400">{prop.completionDays || 3} days delivery</p>
                      </div>
                    </div>

                    <p className="text-xs text-gray-600 bg-gray-50 p-2.5 rounded-lg whitespace-pre-line">
                      "{prop.message}"
                    </p>

                    <div className="flex items-center justify-between pt-2">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        prop.status === "accepted" ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-600"
                      }`}>
                        Status: {prop.status ? prop.status.toUpperCase() : "PENDING"}
                      </span>

                      {selectedTaskForProposals.status === "open" && prop.status !== "accepted" && (
                        <button
                          onClick={() => handleAcceptAndPay(prop)}
                          disabled={payingProposalId === prop._id}
                          className="rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50 transition"
                        >
                          {payingProposalId === prop._id ? "Processing Stripe..." : "Accept & Pay"}
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900">Edit Task Information</h3>
              <button
                onClick={() => setEditingTask(null)}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateTask} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700">Task Title</label>
                <input
                  name="title"
                  type="text"
                  required
                  defaultValue={editingTask.title}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-1.5 text-xs text-gray-900 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700">Category</label>
                  <select
                    name="category"
                    defaultValue={editingTask.category || "Web Development"}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-1.5 text-xs text-gray-900 focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="Web Development">Web Development</option>
                    <option value="UI/UX Design">UI/UX Design</option>
                    <option value="Mobile App Development">Mobile App Development</option>
                    <option value="Digital Marketing">Digital Marketing</option>
                    <option value="Content Writing">Content Writing</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700">Budget ($ USD)</label>
                  <input
                    name="budget"
                    type="number"
                    min="5"
                    required
                    defaultValue={editingTask.budget}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-1.5 text-xs text-gray-900 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700">Delivery Deadline</label>
                <input
                  name="deadline"
                  type="date"
                  required
                  defaultValue={editingTask.deadline ? editingTask.deadline.split("T")[0] : ""}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-1.5 text-xs text-gray-900 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700">Description</label>
                <textarea
                  name="description"
                  rows="3"
                  required
                  defaultValue={editingTask.description}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-1.5 text-xs text-gray-900 focus:border-indigo-500 focus:outline-none"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingTask(null)}
                  className="rounded-lg border border-gray-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50 transition"
                >
                  {updating ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}