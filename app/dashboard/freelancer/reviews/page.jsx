"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function FreelancerReviewsPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // ----------------------------------------------------
  // Fetch client reviews for logged-in freelancer
  // ----------------------------------------------------
  useEffect(() => {
    async function fetchReviews() {
      const userEmail = (user?.email || (typeof window !== "undefined" ? localStorage.getItem("userEmail") : ""))?.trim();
      if (!userEmail) {
        setLoading(false);
        return;
      }

      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const res = await fetch(`${API_URL}/api/reviews?email=${encodeURIComponent(userEmail)}`);
        if (res.ok) {
          const data = await res.json();
          setReviews(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Failed to load reviews:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchReviews();
  }, [user]);

  // ----------------------------------------------------
  // Compute analytics & breakdown
  // ----------------------------------------------------
  const totalReviews = reviews.length;
  const averageRating =
    totalReviews > 0
      ? (
          reviews.reduce((acc, curr) => acc + (Number(curr.rating) || 0), 0) /
          totalReviews
        ).toFixed(1)
      : "5.0";

  // Calculate 5-star to 1-star counts
  const starCounts = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => Math.round(Number(r.rating) || 0) === star).length;
    const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
    return { star, count, percentage };
  });

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Client Reviews & Reputation</h1>
        <p className="mt-1 text-sm text-gray-500">
          Monitor your customer satisfaction scores, feedback, and project testimonials.
        </p>
      </div>

      {/* Ratings Overview Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-gray-100 pb-6 md:pb-0">
          <p className="text-5xl font-extrabold text-amber-500">★ {averageRating}</p>
          <div className="mt-2 flex text-amber-400 text-lg">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i}>
                {i < Math.round(Number(averageRating)) ? "★" : "☆"}
              </span>
            ))}
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Based on {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
          </p>
        </div>

        {/* Star Rating Breakdown Bars */}
        <div className="md:col-span-2 space-y-2 py-1">
          {starCounts.map(({ star, count, percentage }) => (
            <div key={star} className="flex items-center gap-3 text-xs text-gray-600">
              <span className="w-12 font-medium">{star} Stars</span>
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full"
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
              <span className="w-8 text-right font-medium text-gray-500">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews List */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">All Client Testimonials</h2>
          <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full">
            {totalReviews} Total
          </span>
        </div>

        {reviews.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-400">
            No client reviews posted yet. Delivered and approved tasks will show testimonials here.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {reviews.map((rev, idx) => (
              <div key={rev._id || idx} className="p-6 space-y-3 hover:bg-gray-50/50 transition">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <div>
                    <span className="text-sm font-semibold text-gray-900">
                      {rev.reviewer_email || rev.reviewerEmail || "Client"}
                    </span>
                    <span className="ml-2 text-xs text-emerald-600 font-medium">Verified Contract</span>
                  </div>

                  <div className="flex items-center text-amber-400 text-xs gap-0.5">
                    {Array.from({ length: 5 }).map((_, starIdx) => (
                      <span key={starIdx}>
                        {starIdx < (Number(rev.rating) || 5) ? "★" : "☆"}
                      </span>
                    ))}
                    <span className="ml-1 text-gray-600 font-semibold">
                      ({Number(rev.rating || 5).toFixed(1)})
                    </span>
                  </div>
                </div>

                <p className="text-sm text-gray-600 leading-relaxed italic">
                  "{rev.comment || "Delivered exceptional work on schedule!"}"
                </p>

                <div className="text-[11px] text-gray-400">
                  Reviewed on: {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : "Recent"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}