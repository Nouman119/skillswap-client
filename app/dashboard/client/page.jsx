"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function ClientDashboardOverview() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalTasks: 0,
    openTasks: 0,
    inProgressTasks: 0,
    totalSpent: 0,
  });
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // ----------------------------------------------------
  // Fetch client dashboard statistics and tasks from backend
  // ----------------------------------------------------
  useEffect(() => {
    async function fetchClientDashboard() {
      if (!user?.email) return;
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const res = await fetch(`${API_URL}/api/tasks/client-stats?email=${user.email}`);
        const data = await res.json();

        if (res.ok) {
          setStats({
            totalTasks: data.totalTasks || 0,
            openTasks: data.openTasks || 0,
            inProgressTasks: data.inProgressTasks || 0,
            totalSpent: data.totalSpent || 0,
          });
          setTasks(data.tasks || []);
        }
      } catch (error) {
        console.error("Failed to fetch client dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchClientDashboard();
  }, [user]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Client Dashboard Overview</h1>
        <p className="mt-1 text-sm text-gray-500">Welcome back! Here is a summary of your posted tasks and spending.</p>
      </div>

      {/* Statistics Cards Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Total Tasks</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{stats.totalTasks}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Open Tasks</p>
          <p className="mt-2 text-3xl font-bold text-indigo-600">{stats.openTasks}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Tasks In Progress</p>
          <p className="mt-2 text-3xl font-bold text-amber-600">{stats.inProgressTasks}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Total Spent (USD)</p>
          <p className="mt-2 text-3xl font-bold text-emerald-600">${stats.totalSpent}</p>
        </div>
      </div>

      {/* Recent Tasks Section */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Posted Tasks</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {tasks.length === 0 ? (
            <div className="p-6 text-center text-sm text-gray-500">No tasks posted yet.</div>
          ) : (
            tasks.slice(0, 5).map((task) => (
              <div key={task._id} className="flex items-center justify-between px-6 py-4">
                <div>
                  <h4 className="font-medium text-gray-900">{task.title}</h4>
                  <p className="text-xs text-gray-500">Category: {task.category} • Budget: ${task.budget}</p>
                </div>
                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  task.status === 'open' ? 'bg-indigo-50 text-indigo-700' : 
                  task.status === 'in-progress' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'
                }`}>
                  {task.status}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}