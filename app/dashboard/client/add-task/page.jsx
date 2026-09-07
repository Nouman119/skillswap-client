"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function PostTaskPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ----------------------------------------------------
  // Handle task submission form
  // ----------------------------------------------------
  const handleSubmitTask = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const form = e.target;
    const taskData = {
      title: form.title.value,
      category: form.category.value,
      description: form.description.value,
      budget: Number(form.budget.value),
      deadline: form.deadline.value,
      clientEmail: user?.email || "client@skillswap.com",
      clientName: user?.name || "Client",
    };

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${API_URL}/api/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(taskData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to post task");
      }

      setSuccess("Task posted successfully!");
      form.reset();
      setTimeout(() => {
        router.push("/dashboard/client/tasks");
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Post a New Task</h1>
        <p className="mt-1 text-sm text-gray-500">Fill out the form below to publish your project and attract top freelancers.</p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-200">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg bg-emerald-50 p-4 text-sm text-emerald-700 border border-emerald-200">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmitTask} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Task Title</label>
          <input
            name="title"
            type="text"
            required
            placeholder="e.g. Build a Responsive Landing Page with Next.js"
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select
              name="category"
              required
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm bg-white"
            >
              <option value="Design">Design</option>
              <option value="Writing">Writing</option>
              <option value="Development">Development</option>
              <option value="Marketing">Marketing</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Budget (USD)</label>
            <input
              name="budget"
              type="number"
              min="1"
              required
              placeholder="e.g. 250"
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            name="description"
            rows="4"
            required
            placeholder="Provide detailed requirements, deliverables, and expectations..."
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
          ></textarea>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Deadline Date</label>
          <input
            name="deadline"
            type="date"
            required
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
          />
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus:outline-none disabled:opacity-50 transition"
          >
            {loading ? "Publishing..." : "Publish Task"}
          </button>
        </div>
      </form>
    </div>
  );
}