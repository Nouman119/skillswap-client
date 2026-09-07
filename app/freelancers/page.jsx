"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function BrowseFreelancersPage() {
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ----------------------------------------------------
  // Fetch public freelancers list from backend
  // ----------------------------------------------------
  useEffect(() => {
    async function fetchFreelancers() {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const res = await fetch(`${API_URL}/api/tasks/freelancers`);
        const data = await res.json();

        if (res.ok) {
          setFreelancers(Array.isArray(data) ? data : []);
        } else {
          setError(data.error || "Failed to load freelancers");
        }
      } catch (err) {
        setError("Network error occurred while fetching freelancers");
      } finally {
        setLoading(false);
      }
    }

    fetchFreelancers();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Browse Talented Freelancers</h1>
        <p className="mt-2 text-sm text-gray-500">
          Discover verified domain experts ready to collaborate on your next project.
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-200">
          {error}
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* Freelancer Cards Grid */}
      {/* ---------------------------------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {freelancers.length === 0 ? (
          <div className="col-span-full rounded-xl border border-gray-200 bg-white p-12 text-center text-sm text-gray-500">
            No freelancers available at the moment.
          </div>
        ) : (
          freelancers.map((profile) => (
            <div
              key={profile._id}
              className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col justify-between hover:border-indigo-300 transition"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  {profile.image ? (
                    <img
                      src={profile.image}
                      alt={profile.name}
                      className="h-14 w-14 rounded-full object-cover border border-gray-200"
                    />
                  ) : (
                    <div className="h-14 w-14 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg">
                      {profile.name ? profile.name.charAt(0).toUpperCase() : "U"}
                    </div>
                  )}
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">{profile.name}</h3>
                    <p className="text-xs text-emerald-600 font-semibold">
                      ${profile.hourlyRate || 25} / hr
                    </p>
                  </div>
                </div>

                <p className="text-xs text-gray-500 line-clamp-3">
                  {profile.bio || "Full-stack specialist delivering robust applications."}
                </p>

                {/* Skills tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {profile.skills
                    ? profile.skills.split(",").slice(0, 3).map((skill, index) => (
                        <span
                          key={index}
                          className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-700"
                        >
                          {skill.trim()}
                        </span>
                      ))
                    : (
                      <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
                        General
                      </span>
                    )}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100">
                <Link
                  href={`/freelancers/${profile._id}`}
                  className="block w-full text-center rounded-lg bg-indigo-50 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition"
                >
                  View Public Profile
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}