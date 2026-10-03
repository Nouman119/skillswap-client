"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function ClientDashboardOverview() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  const [stats, setStats] = useState({
    totalTasks: 0,
    openTasks: 0,
    inProgressTasks: 0,
    totalSpent: 0,
  });
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // ----------------------------------------------------
  // Authentication & RBAC Route Guard
  // ----------------------------------------------------
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login");
        return;
      }

      const role = (user.role || "").toLowerCase();
      if (role === "freelancer") {
        router.push("/dashboard/freelancer");
      } else if (role === "admin") {
        router.push("/dashboard/admin");
      }
    }
  }, [user, authLoading, router]);

  // ----------------------------------------------------
  // Fetch client dashboard statistics and tasks from backend
  // ----------------------------------------------------
  useEffect(() => {
    async function fetchClientDashboard() {
      if (!user?.email) return;
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const res = await fetch(`${API_URL}/api/tasks/client-stats?email=${encodeURIComponent(user.email)}`);
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

    if (user && user.role?.toLowerCase() === "client") {
      fetchClientDashboard();
    }
  }, [user]);

  // Initial Auth verification or data loading state
  if (authLoading || (loading && user?.role?.toLowerCase() === "client")) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  // Prevent UI flash if unauthorized
  if (!user || user.role?.toLowerCase() !== "client") {
    return null;
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Header and Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Client Dashboard Overview</h1>
          <p className="mt-1 text-sm text-gray-500">
            Welcome back, <span className="font-semibold text-gray-700">{user.name || "Client"}</span>! Here is a summary of your posted tasks and spending.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/client/post-task"
            className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
          >
            + Post New Task
          </Link>
          <Link
            href="/dashboard/client/my-tasks"
            className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition shadow-sm"
          >
            Manage Tasks
          </Link>
        </div>
      </div>

      {/* Statistics Cards Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Tasks</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{stats.totalTasks}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Open Tasks</p>
          <p className="mt-2 text-3xl font-bold text-indigo-600">{stats.openTasks}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">In Progress</p>
          <p className="mt-2 text-3xl font-bold text-amber-600">{stats.inProgressTasks}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Spent</p>
          <p className="mt-2 text-3xl font-bold text-emerald-600">${stats.totalSpent} USD</p>
        </div>
      </div>

      {/* Recent Tasks Section */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h3 className="text-base font-semibold text-gray-900">Recent Posted Tasks</h3>
          <Link
            href="/dashboard/client/my-tasks"
            className="text-xs font-semibold text-indigo-600 hover:underline"
          >
            View all tasks →
          </Link>
        </div>
        <div className="divide-y divide-gray-100">
          {tasks.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-500">
              You haven't posted any tasks yet. Get started by clicking "Post New Task".
            </div>
          ) : (
            tasks.slice(0, 5).map((task) => (
              <div key={task._id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-6 py-4 gap-2 hover:bg-gray-50/50 transition">
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">{task.title}</h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Category: <span className="font-medium text-gray-700">{task.category || "General"}</span> • Budget: <span className="font-medium text-emerald-600">${task.budget}</span> • Deadline: {task.deadline ? new Date(task.deadline).toLocaleDateString() : "Flexible"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    task.status === 'open' ? 'bg-indigo-50 text-indigo-700' : 
                    task.status === 'in-progress' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'
                  }`}>
                    {task.status ? task.status.toUpperCase() : "OPEN"}
                  </span>
                  <Link
                    href={`/tasks/${task._id}`}
                    className="text-xs font-medium text-indigo-600 hover:underline"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}