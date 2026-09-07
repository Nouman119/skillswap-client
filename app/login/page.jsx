"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, setUser } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Role-based redirect function according to specifications
  const handleRoleRedirect = (userRole) => {
    if (userRole === "freelancer") {
      router.push("/dashboard/freelancer");
    } else if (userRole === "admin") {
      router.push("/dashboard/admin");
    } else {
      router.push("/dashboard/client");
    }
  };

  // Sync Google user with backend database safely
  useEffect(() => {
    const syncOAuthUser = async () => {
      const isOAuthSuccess = searchParams.get("oauth_success");

      if (isOAuthSuccess && user) {
        try {
          const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
          await fetch(`${API_URL}/api/users`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: user.name || "Client User",
              email: user.email,
              image: user.image || "",
              role: "client",
            }),
          });
          handleRoleRedirect("client");
        } catch (err) {
          console.error("Failed to sync Google user:", err);
        }
      }
    };

    syncOAuthUser();
  }, [user, searchParams]);

  // Handle email and password form submission
  const handleCredentialsLogin = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;

    setLoading(true);
    setError("");

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${API_URL}/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid email or password");
      } else {
        setUser(data.user);
        handleRoleRedirect(data.user?.role || "client");
      }
    } catch (err) {
      setError("An unexpected error occurred during login.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Google OAuth login redirection
  const handleGoogleLogin = () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      window.location.href = `${API_URL}/auth/google`;
    } catch (err) {
      setError("Google sign-in failed.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-md">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Login to SkillSwap
          </h2>
        </div>

        {error && (
          <div className="rounded bg-red-100 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleCredentialsLogin}>
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </div>
        </form>

        <div className="mt-4">
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
          >
            Sign in with Google
          </button>
        </div>

        <div className="text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <Link href="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}