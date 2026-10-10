"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function FreelancerDashboardOverview() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [stats, setStats] = useState({
    totalProposals: 0,
    pendingProposals: 0,
    acceptedProposals: 0,
    totalEarnings: 0,
    averageRating: "5.0",
    totalReviews: 0,
  });
  const [recentProposals, setRecentProposals] = useState([]);
  const [recentReviews, setRecentReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // ----------------------------------------------------
  // RBAC Route Guard: Only Freelancers can access
  // ----------------------------------------------------
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    const currentRole = (user?.role || "").toLowerCase();
    if (currentRole === "client") {
      router.replace("/dashboard/client");
    } else if (currentRole === "admin") {
      router.replace("/dashboard/admin");
    }
  }, [user, authLoading, router]);

  // ----------------------------------------------------
  // Fetch freelancer metrics, recent proposals, and client reviews
  // ----------------------------------------------------
  const fetchFreelancerData = useCallback(async () => {
    if (!user?.email) return;

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

      // 1. Fetch metrics stats
      const resStats = await fetch(
        `${API_URL}/api/tasks/freelancer-stats?email=${encodeURIComponent(user.email)}`
      );
      let statsData = {};
      if (resStats.ok) {
        statsData = await resStats.json();
      }

      // 2. Fetch reviews to compute actual rating and feed
      let reviewsList = [];
      try {
        const resReviews = await fetch(
          `${API_URL}/api/reviews?email=${encodeURIComponent(user.email)}`
        );
        if (resReviews.ok) {
          const reviewsData = await resReviews.json();
          reviewsList = Array.isArray(reviewsData) ? reviewsData : [];
          setRecentReviews(reviewsList.slice(0, 3));
        }
      } catch (err) {
        console.error("Failed to load freelancer reviews:", err);
      }

      // Compute dynamic average rating
      const totalReviewsCount = reviewsList.length;
      const computedAverage =
        totalReviewsCount > 0
          ? (
              reviewsList.reduce((acc, curr) => acc + (Number(curr.rating) || 0), 0) /
              totalReviewsCount
            ).toFixed(1)
          : statsData.rating || "5.0";

      setStats({
        totalProposals: statsData.totalProposals || 0,
        pendingProposals: statsData.pendingProposals || 0,
        acceptedProposals: statsData.acceptedProposals || 0,
        totalEarnings: statsData.totalEarnings || 0,
        averageRating: computedAverage,
        totalReviews: totalReviewsCount,
      });

      // 3. Fetch proposals list using freelancer-proposals endpoint
      const resProposals = await fetch(
        `${API_URL}/api/tasks/freelancer-proposals?email=${encodeURIComponent(user.email)}`
      );
      
      if (resProposals.ok) {
        const proposalsData = await resProposals.json();
        setRecentProposals(Array.isArray(proposalsData) ? proposalsData.slice(0, 5) : []);
      } else {
        // Fallback endpoint if primary fails
        const fallbackRes = await fetch(
          `${API_URL}/api/proposals/my-proposals?email=${encodeURIComponent(user.email)}`
        );
        if (fallbackRes.ok) {
          const fallbackData = await fallbackRes.json();
          setRecentProposals(Array.isArray(fallbackData) ? fallbackData.slice(0, 5) : []);
        }
      }
    } catch (error) {
      console.error("Failed to load freelancer dashboard metrics:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.email]);

  useEffect(() => {
    if (!authLoading && user && (user.role || "").toLowerCase() === "freelancer") {
      fetchFreelancerData();
    }
  }, [user, authLoading, fetchFreelancerData]);

  if (authLoading || (loading && user?.role?.toLowerCase() === "freelancer")) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-9 w-9 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!user || (user.role || "").toLowerCase() !== "freelancer") {
    return null;
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Header and Fast Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Freelancer Overview
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Welcome back, <span className="font-semibold text-gray-700">{user.name || "Freelancer"}</span>! Track your proposals, project milestones, and client reviews.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/browse-tasks"
            className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
          >
            Explore Open Tasks
          </Link>
          <Link
            href="/dashboard/freelancer/my-proposals"
            className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition shadow-sm"
          >
            My Proposals
          </Link>
        </div>
      </div>

      {/* 5 Statistics Metric Cards Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Total Proposals
          </p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {stats.totalProposals}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Pending Bids
          </p>
          <p className="mt-2 text-3xl font-bold text-amber-600">
            {stats.pendingProposals}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Accepted Projects
          </p>
          <p className="mt-2 text-3xl font-bold text-indigo-600">
            {stats.acceptedProposals}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Total Revenue
          </p>
          <p className="mt-2 text-3xl font-bold text-emerald-600">
            ${stats.totalEarnings} USD
          </p>
        </div>

        <div className="rounded-xl border border-amber-100 bg-amber-50/40 p-6 shadow-sm">
          <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
            Average Rating
          </p>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-3xl font-bold text-amber-600">★ {stats.averageRating}</span>
            <span className="text-xs text-gray-500 font-medium">({stats.totalReviews})</span>
          </div>
        </div>
      </div>

      {/* Recent Client Feedback Widget */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-gray-900">
              Recent Client Feedback
            </h3>
            <span className="rounded-full bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 text-xs font-semibold">
              {stats.totalReviews} Reviews
            </span>
          </div>
          <Link
            href="/dashboard/freelancer/earnings"
            className="text-xs font-semibold text-indigo-600 hover:underline"
          >
            View all feedback →
          </Link>
        </div>

        <div className="divide-y divide-gray-100">
          {recentReviews.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-500">
              No client reviews received yet. Complete delivered tasks to start accumulating client testimonials.
            </div>
          ) : (
            recentReviews.map((rev, index) => (
              <div
                key={rev._id || index}
                className="flex flex-col sm:flex-row sm:items-start sm:justify-between px-6 py-4 gap-3 hover:bg-gray-50/50 transition"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-900">
                      {rev.reviewer_email || rev.reviewerEmail || "Client"}
                    </span>
                    <div className="flex items-center text-amber-500 text-xs font-bold gap-0.5">
                      {Array.from({ length: 5 }).map((_, starIdx) => (
                        <span key={starIdx}>
                          {starIdx < (Number(rev.rating) || 5) ? "★" : "☆"}
                        </span>
                      ))}
                      <span className="ml-1 text-gray-500 font-normal">
                        ({Number(rev.rating || 5).toFixed(1)})
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 italic">
                    "{rev.comment || "Great work, excellent communication and fast delivery!"}"
                  </p>
                </div>

                <div className="text-[11px] text-gray-400 sm:text-right shrink-0">
                  {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : "Recent"}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recent Proposals Feed */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h3 className="text-base font-semibold text-gray-900">
            Recent Proposal Applications
          </h3>
          <Link
            href="/dashboard/freelancer/my-proposals"
            className="text-xs font-semibold text-indigo-600 hover:underline"
          >
            View all proposals →
          </Link>
        </div>

        <div className="divide-y divide-gray-100">
          {recentProposals.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-500">
              No proposals submitted yet. Head over to{" "}
              <Link href="/browse-tasks" className="text-indigo-600 font-semibold hover:underline">
                Browse Tasks
              </Link>{" "}
              to start bidding on client requirements.
            </div>
          ) : (
            recentProposals.map((item) => {
              const status = (item.status || "pending").toLowerCase();
              return (
                <div
                  key={item._id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-6 py-4 gap-2 hover:bg-gray-50/50 transition"
                >
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">
                      {item.taskTitle || "Task Proposal"}
                    </h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Offered Price: <span className="font-semibold text-emerald-600">${item.budgetPrice}</span> • Est. Days: {item.completionDays}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        status === "accepted"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : status === "rejected"
                          ? "bg-red-50 text-red-700 border border-red-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {status.toUpperCase()}
                    </span>

                    <Link
                      href={`/tasks/${item.taskId}`}
                      className="text-xs font-medium text-indigo-600 hover:underline"
                    >
                      View Task
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}