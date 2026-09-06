"use client";

import { useEffect, useState } from "react";
import { useRoleRedirect } from "@/hooks/useRoleRedirect";

export default function MyTasksPage() {
  const { session } = useRoleRedirect(["client"]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTask, setEditingTask] = useState(null);
  const [error, setError] = useState("");

  const fetchTasks = async () => {
    if (!session?.user?.email) return;
    try {
      const res = await fetch(`http://localhost:5000/api/tasks/my-tasks?email=${session.user.email}`);
      const data = await res.json();
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load tasks", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [session]);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    setError("");

    try {
      const res = await fetch(`http://localhost:5000/api/tasks/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setTasks(tasks.filter((t) => t._id !== id));
      } else {
        setError(data.error || "Cannot delete this task.");
      }
    } catch (err) {
      setError("Failed to delete task.");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError("");

    const updatedData = {
      title: e.target.title.value,
      category: e.target.category.value,
      description: e.target.description.value,
      budget: e.target.budget.value,
      deadline: e.target.deadline.value,
    };

    try {
      const res = await fetch(`http://localhost:5000/api/tasks/${editingTask._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });
      const data = await res.json();
      if (data.success) {
        setEditingTask(null);
        fetchTasks();
      } else {
        setError(data.error || "Failed to update task.");
      }
    } catch (err) {
      setError("An error occurred during update.");
    }
  };

  if (loading) return <div className="p-8 text-center">Loading tasks...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Posted Tasks</h1>

        {error && <div className="mb-4 rounded bg-red-100 p-3 text-sm text-red-700">{error}</div>}

        <div className="overflow-x-auto rounded-xl bg-white shadow-sm border border-gray-100">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Budget</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">No tasks posted yet.</td>
                </tr>
              ) : (
                tasks.map((task) => (
                  <tr key={task._id}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{task.title}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{task.category}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">${task.budget}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        task.status === "open" ? "bg-green-100 text-green-800" :
                        task.status === "in-progress" ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"
                      }`}>
                        {task.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm space-x-2">
                      {task.status === "open" && (
                        <button onClick={() => setEditingTask(task)} className="text-indigo-600 hover:text-indigo-900 font-medium">Edit</button>
                      )}
                      <button onClick={() => handleDelete(task._id)} className="text-red-600 hover:text-red-900 font-medium">Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Edit Modal / Inline Form */}
        {editingTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-lg">
              <h2 className="text-lg font-bold mb-4">Edit Task</h2>
              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700">Title</label>
                  <input name="title" defaultValue={editingTask.title} required className="w-full rounded border px-3 py-1.5 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700">Category</label>
                  <input name="category" defaultValue={editingTask.category} required className="w-full rounded border px-3 py-1.5 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700">Budget ($)</label>
                  <input name="budget" type="number" defaultValue={editingTask.budget} required className="w-full rounded border px-3 py-1.5 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700">Deadline</label>
                  <input name="deadline" type="date" defaultValue={editingTask.deadline} required className="w-full rounded border px-3 py-1.5 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700">Description</label>
                  <textarea name="description" rows="3" defaultValue={editingTask.description} required className="w-full rounded border px-3 py-1.5 text-sm" />
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <button type="button" onClick={() => setEditingTask(null)} className="rounded border px-4 py-1.5 text-sm">Cancel</button>
                  <button type="submit" className="rounded bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white">Save Changes</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}