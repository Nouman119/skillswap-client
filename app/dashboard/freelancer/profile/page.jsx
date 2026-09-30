"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function EditProfilePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ error: "", success: "" });

  // ----------------------------------------------------
  // Handle Freelancer Profile Update
  // ----------------------------------------------------

  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    const form = e.target;
    const userEmail = (user?.email || (typeof window !== "undefined" ? localStorage.getItem("userEmail") : ""))?.trim();

    console.log("Logged In User Object:", user);
    console.log("Submitting with Email:", userEmail);

    setLoading(true);
    setFeedback({ error: "", success: "" });

    if (!userEmail) {
      setFeedback({ error: "Please log in first to update your profile.", success: "" });
      setLoading(false);
      return;
    }

const profilePayload = {
      userId: user?.id || user?._id,
      email: userEmail,
      name: form.name.value.trim(),
      image: form.image.value.trim(),
      skills: form.skills.value.trim(),
      bio: form.bio.value.trim(),
      hourlyRate: Number(form.hourlyRate.value) || 0,
    };

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${API_URL}/api/tasks/freelancers/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profilePayload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      setFeedback({ error: "", success: "Profile details updated successfully!" });
    } catch (err) {
      setFeedback({ error: err.message, success: "" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Public Profile</h1>
        <p className="mt-1 text-sm text-gray-500">Update your freelance credentials, showcase skills, and adjust hourly pricing.</p>
      </div>

      {feedback.error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-200">
          {feedback.error}
        </div>
      )}

      {feedback.success && (
        <div className="rounded-lg bg-emerald-50 p-4 text-sm text-emerald-700 border border-emerald-200">
          {feedback.success}
        </div>
      )}

      {/* Profile Form */}
      <form onSubmit={handleProfileSubmit} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Full Name</label>
          <input
            name="name"
            type="text"
            required
            defaultValue={user?.name || "Freelancer"}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Profile Photo URL</label>
          <input
            name="image"
            type="url"
            placeholder="https://example.com/avatar.jpg"
            defaultValue={user?.image || ""}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none text-sm"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Hourly Rate (USD)</label>
            <input
              name="hourlyRate"
              type="number"
              min="1"
              required
              placeholder="e.g. 35"
              defaultValue={user?.hourlyRate || "25"}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Skills (Comma Separated)</label>
            <input
              name="skills"
              type="text"
              required
              placeholder="React, Next.js, Tailwind, Node.js"
              defaultValue={Array.isArray(user?.skills) ? user.skills.join(", ") : (user?.skills || "React, Next.js, Tailwind CSS")}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Professional Bio</label>
          <textarea
            name="bio"
            rows="4"
            required
            placeholder="Briefly describe your expertise, years of experience, and technologies you master..."
            defaultValue={user?.bio || "Full-stack developer building clean, responsive, and performance-oriented web applications."}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none text-sm"
          ></textarea>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50 transition"
          >
            {loading ? "Saving Changes..." : "Save Profile"}
          </button>
        </div>
      </form>
    </div>
  );
}