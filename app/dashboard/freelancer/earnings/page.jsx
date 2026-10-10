"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function MyEarningsPage() {
  const { user } = useAuth();
  const [completedTasks, setCompletedTasks] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ----------------------------------------------------
  // Fetch finished tasks, earnings, and client reviews
  // ----------------------------------------------------
  useEffect(() => {
    async function fetchEarningsAndReviews() {
      try {
        const userEmail = (user?.email || (typeof window !== "undefined" ? localStorage.getItem("userEmail") : ""))?.trim();
        if (!userEmail) {
          setLoading(false);
          return;
        }

        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

        // 1. Fetch completed tasks and calculate total revenue
        const tasksRes = await fetch(`${API_URL}/api/tasks/freelancer-projects?email=${encodeURIComponent(userEmail)}`);
        const tasksData = await tasksRes.json();

        if (tasksRes.ok) {
          const finished = Array.isArray(tasksData) ? tasksData.filter((t) => t.status === "completed") : [];
          setCompletedTasks(finished);

          const total = finished.reduce((sum, t) => sum + (Number(t.budget) || 0), 0);
          setTotalEarnings(total);
        } else {
          setError(tasksData.error || "Failed to load earnings");
        }

        // 2. Fetch client feedback and reviews for the logged-in freelancer
        try {
          const reviewsRes = await fetch(`${API_URL}/api/reviews?email=${encodeURIComponent(userEmail)}`);
          if (reviewsRes.ok) {
            const reviewsData = await reviewsRes.json();
            setReviews(Array.isArray(reviewsData) ? reviewsData : []);
          }
        } catch (reviewErr) {
          console.error("Failed to load freelancer reviews:", reviewErr);
        }
      } catch (err) {
        setError("An unexpected error occurred while fetching earnings data");
      } finally {
        setLoading(false);
      }
    }

    fetchEarningsAndReviews();
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
      {/* ---------------------------------------------------- */}
      {/* Header and Total Revenue Card */}
      {/* ---------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Earnings</h1>
          <p className="mt-1 text-sm text-gray-500">Complete summary of your completed contracts and payouts.</p>
        </div>
        <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-5 py-3">
          <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">Total Revenue</p>
          <p className="text-2xl font-bold text-emerald-700">${totalEarnings} USD</p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-200">
          {error}
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* Earnings Breakdown Table */}
      {/* ---------------------------------------------------- */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
          <thead className="bg-gray-50 text-gray-600 font-medium">
            <tr>
              <th className="px-6 py-3.5">Task Title</th>
              <th className="px-6 py-3.5">Client Name</th>
              <th className="px-6 py-3.5">Amount Made</th>
              <th className="px-6 py-3.5">Completion Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-gray-700">
            {completedTasks.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-sm text-gray-500">
                  No completed contracts yet.
                </td>
              </tr>
            ) : (
              completedTasks.map((task) => (
                <tr key={task._id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-medium text-gray-900">{task.title}</td>
                  <td className="px-6 py-4 text-gray-600">{task.clientName || task.clientEmail}</td>
                  <td className="px-6 py-4 font-bold text-emerald-600">${task.budget}</td>
                  <td className="px-6 py-4 text-gray-500">
                    {task.completedAt ? new Date(task.completedAt).toLocaleDateString() : "Recently"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ---------------------------------------------------- */}
      {/* Client Feedback & Reviews Section */}
      {/* ---------------------------------------------------- */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-gray-900">Client Reviews & Testimonials</h2>
            <p className="text-xs text-gray-500 mt-0.5">Direct ratings and comments from clients on completed tasks.</p>
          </div>
          <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
            {reviews.length} Received
          </span>
        </div>

        {reviews.length === 0 ? (
          <div className="py-6 text-center text-sm text-gray-400">
            No client reviews received yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {reviews.map((rev, idx) => (
              <div
                key={rev._id || idx}
                className="flex flex-col justify-between rounded-xl border border-gray-100 bg-gray-50/60 p-4 space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-800">
                      {rev.reviewer_email || rev.reviewerEmail || "Client"}
                    </span>
                    <div className="flex items-center text-amber-500 text-xs font-bold gap-0.5">
                      {Array.from({ length: 5 }).map((_, starIndex) => (
                        <span key={starIndex}>
                          {starIndex < (Number(rev.rating) || 5) ? "★" : "☆"}
                        </span>
                      ))}
                      <span className="ml-1 text-gray-600 font-semibold">
                        ({Number(rev.rating || 5).toFixed(1)})
                      </span>
                    </div>
                  </div>

                  <p className="mt-2 text-xs text-gray-600 italic leading-relaxed">
                    "{rev.comment || "Great work and timely submission!"}"
                  </p>
                </div>

                <div className="flex items-center justify-between text-[11px] text-gray-400 pt-2 border-t border-gray-200/50">
                  <span>Task Feedback</span>
                  <span>
                    {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : "Recently"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}