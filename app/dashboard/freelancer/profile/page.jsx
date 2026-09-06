"use client";

import { useEffect, useState } from "react";
import { useRoleRedirect } from "@/hooks/useRoleRedirect";

export default function EditProfilePage() {
  const { session } = useRoleRedirect(["freelancer"]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const [profileData, setProfileData] = useState({
    name: "",
    image: "",
    skills: "",
    bio: "",
    hourlyRate: 0,
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    if (session?.user?.email) {
      fetch(`${API_URL}/api/users/profile?email=${session.user.email}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && !data.error) {
            setProfileData({
              name: data.name || session.user.name || "",
              image: data.image || session.user.image || "",
              skills: Array.isArray(data.skills) ? data.skills.join(", ") : "",
              bio: data.bio || "",
              hourlyRate: data.hourlyRate || 0,
            });
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [session, API_URL]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setFeedback({ type: "", message: "" });

    const payload = {
      email: session?.user?.email,
      name: profileData.name,
      image: profileData.image,
      skills: profileData.skills,
      bio: profileData.bio,
      hourlyRate: profileData.hourlyRate,
    };

    try {
      const res = await fetch(`${API_URL}/api/users/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({ type: "success", message: "Profile updated successfully!" });
      } else {
        setFeedback({ type: "error", message: data.error || "Failed to update profile" });
      }
    } catch (err) {
      setFeedback({ type: "error", message: "Server connection failed" });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-600">Loading profile data...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-2xl rounded-xl border border-gray-100 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Public Profile</h1>

        {feedback.message && (
          <div className={`mb-4 rounded p-3 text-sm ${feedback.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            {feedback.message}
          </div>
        )}

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={profileData.name}
              onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
              className="w-full rounded border border-gray-300 p-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Profile Photo Link (URL)</label>
            <input
              type="url"
              value={profileData.image}
              onChange={(e) => setProfileData({ ...profileData, image: e.target.value })}
              className="w-full rounded border border-gray-300 p-2 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Hourly Rate ($ USD)</label>
              <input
                type="number"
                value={profileData.hourlyRate}
                onChange={(e) => setProfileData({ ...profileData, hourlyRate: e.target.value })}
                className="w-full rounded border border-gray-300 p-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Skills (comma-separated tags)</label>
              <input
                type="text"
                placeholder="React, Next.js, Tailwind, Node.js"
                value={profileData.skills}
                onChange={(e) => setProfileData({ ...profileData, skills: e.target.value })}
                className="w-full rounded border border-gray-300 p-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Bio Description</label>
            <textarea
              rows="4"
              value={profileData.bio}
              onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
              placeholder="Tell clients about your expertise..."
              className="w-full rounded border border-gray-300 p-2 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={updating}
            className="w-full rounded bg-indigo-600 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {updating ? "Saving Changes..." : "Save Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}