"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";

export default function ActiveProjectsPage() {
  const { user, loading: authLoading } = useAuth();
  const [projects, setProjects] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [deliverableUrl, setDeliverableUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // ----------------------------------------------------
  // Fetch active and completed projects along with reviews
  // ----------------------------------------------------
  const fetchProjectsAndReviews = useCallback(async () => {
    if (!user?.email) {
      if (!authLoading) setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

      // 1. Fetch freelancer active and completed projects
      const resProjects = await fetch(
        `${API_URL}/api/tasks/freelancer-projects?email=${encodeURIComponent(user.email)}`
      );
      const projectsData = await resProjects.json();

      if (resProjects.ok) {
        setProjects(Array.isArray(projectsData) ? projectsData : []);
      } else {
        setError(projectsData.error || "Failed to load projects");
      }

      // 2. Fetch all reviews received by this freelancer
      try {
        const resReviews = await fetch(
          `${API_URL}/api/reviews?email=${encodeURIComponent(user.email)}`
        );
        if (resReviews.ok) {
          const reviewsData = await resReviews.json();
          setReviews(Array.isArray(reviewsData) ? reviewsData : []);
        }
      } catch (reviewErr) {
        console.error("Failed to fetch project reviews:", reviewErr);
      }
    } catch (err) {
      console.error("Fetch projects error:", err);
      setError("An unexpected error occurred while fetching projects");
    } finally {
      setLoading(false);
    }
  }, [user?.email, authLoading]);

  useEffect(() => {
    if (!authLoading) {
      fetchProjectsAndReviews();
    }
  }, [authLoading, fetchProjectsAndReviews]);

  // ----------------------------------------------------
  // Handle Deliverable Submission & Mark as Completed
  // ----------------------------------------------------
  const handleDeliverableSubmit = async (e) => {
    e.preventDefault();
    if (!deliverableUrl || !selectedProject?._id) return;

    setSubmitting(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

      const res = await fetch(`${API_URL}/api/tasks/${selectedProject._id}/submit-deliverable`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deliverable_url: deliverableUrl,
          deliverableUrl: deliverableUrl,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit deliverable");
      }

      setProjects((prev) =>
        prev.map((p) =>
          p._id === selectedProject._id
            ? { ...p, status: "completed", deliverable_url: deliverableUrl }
            : p
        )
      );

      setSelectedProject(null);
      setDeliverableUrl("");
      alert("Deliverable submitted and project marked as completed!");
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Active & Completed Projects</h1>
        <p className="mt-1 text-sm text-gray-500">
          Track in-progress contracts, submit project deliverables, and review client feedback.
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-200">
          {error}
        </div>
      )}

      {/* Projects List Container */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="divide-y divide-gray-200">
          {projects.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-500">
              No active or completed projects found.
            </div>
          ) : (
            projects.map((project) => {
              // Find matching client review for this project
              const projectReview = reviews.find(
                (r) => String(r.task_id || r.taskId) === String(project._id)
              );

              return (
                <div
                  key={project._id}
                  className="p-6 flex flex-col gap-4 hover:bg-gray-50/40 transition"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-semibold text-gray-900">{project.title}</h3>
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            project.status === "completed"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {project.status === "completed" ? "Completed" : "In Progress"}
                        </span>
                      </div>

                      <p className="text-xs text-gray-500">
                        Client: <span className="font-medium text-gray-700">{project.clientName || project.clientEmail}</span> • Budget: <span className="font-bold text-emerald-600">${project.budget}</span>
                      </p>
                    </div>

                    {/* Submission Action Button */}
                    <div>
                      {project.status === "in-progress" && (
                        <button
                          onClick={() => {
                            setSelectedProject(project);
                            setDeliverableUrl("");
                          }}
                          className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
                        >
                          Submit Deliverable
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Submitted Work Link */}
                  {(project.deliverable_url || project.deliverableUrl) && (
                    <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100 flex items-center gap-2">
                      <span className="font-semibold text-gray-700">Submitted Deliverable:</span>
                      <a
                        href={project.deliverable_url || project.deliverableUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 underline hover:text-indigo-800 truncate"
                      >
                        {project.deliverable_url || project.deliverableUrl}
                      </a>
                    </div>
                  )}

                  {/* ---------------------------------------------------- */}
                  {/* Contextual Client Review & Feedback Badge / Card */}
                  {/* ---------------------------------------------------- */}
                  {project.status === "completed" && (
                    <div className="mt-1 rounded-xl border border-amber-100 bg-amber-50/40 p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                          <span>Client Feedback</span>
                        </span>

                        <div className="flex items-center text-amber-500 text-xs font-bold gap-0.5">
                          {Array.from({ length: 5 }).map((_, starIdx) => (
                            <span key={starIdx}>
                              {starIdx < (Number(projectReview?.rating || 5)) ? "★" : "☆"}
                            </span>
                          ))}
                          <span className="ml-1 text-gray-600 font-semibold">
                            ({Number(projectReview?.rating || 5).toFixed(1)})
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-gray-700 italic">
                        "{projectReview?.comment || "Task completed successfully and approved with satisfaction!"}"
                      </p>

                      <div className="text-[11px] text-gray-400 flex justify-between items-center pt-1 border-t border-amber-100/60">
                        <span>Reviewed by: {projectReview?.reviewer_email || projectReview?.reviewerEmail || project.clientEmail || "Client"}</span>
                        <span>{projectReview?.createdAt ? new Date(projectReview.createdAt).toLocaleDateString() : "Recently"}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* Submit Deliverable Modal Dialog */}
      {/* ---------------------------------------------------- */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Submit Deliverable</h3>
                <p className="text-xs text-gray-500 mt-1">{selectedProject.title}</p>
              </div>
              <button
                onClick={() => setSelectedProject(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleDeliverableSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700">
                  Deliverable URL (GitHub repo, Google Drive, or Live link)
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://github.com/..."
                  value={deliverableUrl}
                  onChange={(e) => setDeliverableUrl(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedProject(null)}
                  className="rounded-md border border-gray-300 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-md bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  {submitting ? "Submitting..." : "Complete Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}