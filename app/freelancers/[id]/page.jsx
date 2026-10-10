"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function FreelancerPublicProfilePage() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ----------------------------------------------------
  // Fetch freelancer public details by ID & Fetch Reviews
  // ----------------------------------------------------
  useEffect(() => {
    async function fetchFreelancerAndReviews() {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const res = await fetch(`${API_URL}/api/tasks/freelancers/${id}`);
        const data = await res.json();

        if (res.ok) {
          setProfile(data);

          if (data?.email) {
            try {
              const reviewsRes = await fetch(
                `${API_URL}/api/reviews?revieweeEmail=${encodeURIComponent(data.email)}`
              );
              if (reviewsRes.ok) {
                const reviewsData = await reviewsRes.json();
                setReviews(Array.isArray(reviewsData) ? reviewsData : []);
              }
            } catch (err) {
              console.error("Failed to load reviews:", err);
            }
          }
        } else {
          setError(data.error || "Profile not found");
        }
      } catch (err) {
        setError("Network error occurred while fetching freelancer profile");
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchFreelancerAndReviews();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-9 w-9 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <p className="text-base font-semibold text-red-600">{error || "Freelancer profile unavailable."}</p>
        <Link
          href="/freelancers"
          className="inline-block rounded-lg bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-indigo-700 transition"
        >
          Back to Freelancers
        </Link>
      </div>
    );
  }

  const skillsList = Array.isArray(profile.skills)
    ? profile.skills
    : typeof profile.skills === "string"
    ? profile.skills.split(",").map((s) => s.trim()).filter(Boolean)
    : ["General Specialist"];

  const totalReviewsCount = reviews.length;
  const averageRating =
    totalReviewsCount > 0
      ? (
          reviews.reduce((acc, curr) => acc + (Number(curr.rating) || 0), 0) /
          totalReviewsCount
        ).toFixed(1)
      : profile.rating || "5.0";

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 min-h-screen">
      {/* Back Link */}
      <div>
        <Link
          href="/freelancers"
          className="text-xs font-semibold text-indigo-600 hover:underline inline-flex items-center gap-1"
        >
          ← Back to all freelancers
        </Link>
      </div>

      {/* ---------------------------------------------------- */}
      {/* Profile Header Card */}
      {/* ---------------------------------------------------- */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {profile.image ? (
              <img
                src={profile.image}
                alt={profile.name}
                className="h-20 w-20 rounded-full object-cover border-2 border-gray-100"
              />
            ) : (
              <div className="h-20 w-20 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-2xl">
                {profile.name ? profile.name.charAt(0).toUpperCase() : "U"}
              </div>
            )}
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
                <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                  Verified Specialist
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">{profile.email}</p>
              
              {/* Dynamic Rating and Completed Metrics */}
              <div className="mt-3 flex items-center gap-3 text-xs text-gray-600">
                <span className="flex items-center text-amber-500 font-semibold gap-1">
                  ★ {averageRating}
                </span>
                <span className="text-gray-400">
                  ({totalReviewsCount} {totalReviewsCount === 1 ? "review" : "reviews"})
                </span>
                <span className="text-gray-300">•</span>
                <span>
                  <strong>{profile.completedJobs || (totalReviewsCount > 0 ? totalReviewsCount : 0)}</strong> projects completed
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4 text-left sm:text-right min-w-42.5">
            <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">Hourly Rate</p>
            <p className="text-2xl font-bold text-emerald-700">
              ${profile.hourlyRate || 25} <span className="text-xs font-normal text-emerald-600">/ hr</span>
            </p>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Bio, Experience & Reviews Section */}
        <div className="md:col-span-2 space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-base font-semibold text-gray-900">About the Specialist</h2>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
              {profile.bio || "No professional summary provided yet."}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-base font-semibold text-gray-900">Work Experience & History</h2>
            <p className="text-xs text-gray-500 leading-relaxed">
              Successfully executed milestones across enterprise architectures, focusing on scalable clean components and delivery assurance.
            </p>
          </div>

          {/* ---------------------------------------------------- */}
          {/* Client Reviews & Feedback List Section */}
          {/* ---------------------------------------------------- */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="text-base font-semibold text-gray-900">
                Client Reviews & Ratings
              </h2>
              <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                {totalReviewsCount} Feedback
              </span>
            </div>

            {reviews.length === 0 ? (
              <p className="text-xs text-gray-400 py-3 text-center">
                No client reviews received yet.
              </p>
            ) : (
              <div className="space-y-4 pt-1">
                {reviews.map((rev, idx) => (
                  <div
                    key={rev._id || idx}
                    className="p-4 rounded-xl border border-gray-100 bg-gray-50/60 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-800">
                        {rev.reviewer_email || rev.reviewerEmail || "Client"}
                      </span>
                      <div className="flex items-center text-amber-500 text-xs font-bold gap-0.5">
                        {Array.from({ length: 5 }).map((_, starIndex) => (
                          <span key={starIndex}>
                            {starIndex < (Number(rev.rating) || 5) ? "★" : "☆"}
                          </span>
                        ))}
                        <span className="ml-1 text-gray-600 font-normal">
                          ({rev.rating || 5}.0)
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      "{rev.comment || "Great collaboration and quick delivery!"}"
                    </p>
                    {rev.created_at && (
                      <p className="text-[10px] text-gray-400 text-right">
                        {new Date(rev.created_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Skills & Action Column */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-base font-semibold text-gray-900">Core Expertise</h2>
            <div className="flex flex-wrap gap-2">
              {skillsList.map((skill, index) => (
                <span
                  key={index}
                  className="rounded-lg bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-base font-semibold text-gray-900">Direct Inquiries & Hire</h2>
            <p className="text-xs text-gray-500">
              Have an open project? You can post a task targeted for this specialist or send a direct email.
            </p>
            
            <div className="space-y-2 pt-1">
              <Link
                href="/dashboard/client/post-task"
                className="block w-full text-center rounded-lg bg-indigo-600 py-2.5 text-xs font-semibold text-white hover:bg-indigo-700 transition"
              >
                Create Task to Hire
              </Link>
              <a
                href={`mailto:${profile.email}`}
                className="block w-full text-center rounded-lg border border-gray-300 bg-white py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
              >
                Send Direct Email
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}