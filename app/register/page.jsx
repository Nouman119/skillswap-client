"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signUp } from "@/utils/auth-client";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isFreelancer, setIsFreelancer] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    const name = e.target.name.value;
    const email = e.target.email.value;
    const image = e.target.image.value;
    const password = e.target.password.value;

    // Password validation: min 6 chars, 1 uppercase, 1 lowercase
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (!hasUpperCase) {
      setError("Password must contain at least one capital letter.");
      return;
    }
    if (!hasLowerCase) {
      setError("Password must contain at least one lowercase letter.");
      return;
    }

    const assignedRole = isFreelancer ? "freelancer" : "client";

    setLoading(true);

    try {
      // Better Auth email sign up
      const result = await signUp.email({
        email,
        password,
        name,
        image,
      });

      if (result?.error) {
        setError(result.error.message || "Failed to register.");
        setLoading(false);
        return;
      }

      // Sync role and metadata to backend database
      await fetch("http://localhost:5000/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          image,
          role: assignedRole,
        }),
      });

      // Role-based route redirects
      if (assignedRole === "freelancer") {
        router.push("/dashboard/freelancer");
      } else {
        router.push("/");
      }
    } catch (err) {
      setError("An unexpected error occurred during registration.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-md">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Create an Account</h2>
          <p className="mt-1 text-sm text-gray-600">Join SkillSwap to post or complete tasks</p>
        </div>

        {error && (
          <div className="mt-4 rounded bg-red-100 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input
              name="name"
              type="text"
              required
              placeholder="John Doe"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email Address</label>
            <input
              name="email"
              type="email"
              required
              placeholder="john@example.com"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Profile Image URL</label>
            <input
              name="image"
              type="url"
              placeholder="https://example.com/avatar.jpg"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              name="password"
              type="password"
              required
              placeholder="••••••••"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <input
              id="role-checkbox"
              type="checkbox"
              checked={isFreelancer}
              onChange={(e) => setIsFreelancer(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="role-checkbox" className="text-sm font-medium text-gray-700">
              Register as a Freelancer (Want to do tasks)
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-indigo-600 py-2 text-sm font-medium text-white shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Register"}
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            Login here
          </Link>
        </div>
      </div>
    </div>
  );
}