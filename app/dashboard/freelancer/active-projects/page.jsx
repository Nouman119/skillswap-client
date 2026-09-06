"use client";

import { useEffect, useState } from "react";
import { useRoleRedirect } from "@/hooks/useRoleRedirect";

export default function ActiveProjectsPage() {
  const { session } = useRoleRedirect(["freelancer"]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const fetchProjects = async () => {
    if (!session?.user?.email) return;
    try {
      const res = await fetch(`${API_URL}/api/tasks/freelancer-projects?freelancerEmail=${session.user.email}`);
      const data = await res.json();
      setProjects(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load projects:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [session, API_URL]);

  const handleSubmitDeliverable = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const deliverable_url = e.target.deliverable_url.value;

    try {
      const res = await fetch(`${API_URL}/api/tasks/${selectedTask._id}/submit-deliverable`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deliverable_url })
      });

      const data = await res.json();
      if (data.success) {
        setSelectedTask(null);
        fetchProjects();
      } else {
        setError(data.error || "Failed to submit deliverable");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-600">Loading active projects...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Active & Completed Projects</h1>

        {error && <div className="mb-4 rounded bg-red-100 p-3 text-sm text-red-700">{error}</div>}

        <div className="space-y-4">
          {projects.length === 0 ? (
            <div className="rounded-xl border border-gray-100 bg-white p-8 text-center text-gray-500">
              No active or completed projects found.
            </div>
          ) : (
            projects.map((project) => (
              <div key={project._id} className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-gray-900">{project.title}</h3>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        project.status === "completed" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                      }`}>
                        {project.status === "completed" ? "Completed" : "In Progress"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">Client: {project.clientName} | Budget: ${project.budget}</p>
                    {project.deliverable_url && (
                      <p className="text-xs text-indigo-600 font-medium">
                        Deliverable: <a href={project.deliverable_url} target="_blank" rel="noopener noreferrer" className="underline">{project.deliverable_url}</a>
                      </p>
                    )}
                  </div>

                  {project.status === "in-progress" && (
                    <button
                      onClick={() => setSelectedTask(project)}
                      className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                    >
                      Submit Deliverable
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Deliverable Modal */}
        {selectedTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
              <h2 className="text-lg font-bold text-gray-900 mb-2">Submit Project Deliverable</h2>
              <p className="text-xs text-gray-500 mb-4">Task: <span className="font-semibold">{selectedTask.title}</span></p>

              <form onSubmit={handleSubmitDeliverable} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Deliverable URL (GitHub / Live Link / Docs)</label>
                  <input
                    name="deliverable_url"
                    type="url"
                    required
                    placeholder="https://github.com/..."
                    className="w-full rounded border border-gray-300 p-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedTask(null)}
                    className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {submitting ? "Submitting..." : "Mark Completed"}
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