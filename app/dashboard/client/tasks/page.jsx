"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function ClientTasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch client tasks from backend
  const fetchMyTasks = async () => {
    if (!user?.email) return;
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${API_URL}/api/tasks/my-tasks?email=${user.email}`);
      const data = await res.json();
      if (res.ok) {
        setTasks(data);
      } else {
        setError(data.error || "Failed to fetch tasks");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyTasks();
  }, [user]);

  // Handle task deletion
  const handleDeleteTask = async (taskId) => {
    if (!confirm("Are you sure you want to delete this task?")) return;

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${API_URL}/api/tasks/${taskId}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (res.ok) {
        setTasks(tasks.filter((t) => t._id !== taskId));
      } else {
        alert(data.error || "Cannot delete this task");
      }
    } catch (err) {
      alert("Failed to delete task");
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
          href="/dashboard/client/add-task"
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
            <div className="p-8 text-center text-sm text-gray-500">You haven't posted any tasks yet.</div>
          ) : (
            tasks.map((task) => (
              <div key={task._id} className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      task.status === 'open' ? 'bg-indigo-50 text-indigo-700' : 
                      task.status === 'in-progress' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'
                    }`}>
                      {task.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-1">{task.description}</p>
                  <p className="text-xs text-gray-400">Category: {task.category} • Budget: ${task.budget} • Deadline: {task.deadline}</p>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {task.status === 'open' && (
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
            ))
          )}
        </div>
      </div>
    </div>
  );
}