"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  // Hydrate user session from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("skillswap_user");
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to parse saved user", e);
    } finally {
      setLoading(false);
    }
  }, []);

  // ----------------------------------------------------
  // Path router redirects rule
  // Clients -> Home (/); Freelancers & Admins -> Dashboard path
  // ----------------------------------------------------
  const handleRoleRedirect = (role) => {
    if (role === "admin") {
      router.push("/dashboard/admin");
    } else if (role === "freelancer") {
      router.push("/dashboard/freelancer");
    } else {
      router.push("/");
    }
  };

  // Standard Email/Password Login
  const login = async (email, password) => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Login failed");
    }

    setUser(data.user);
    localStorage.setItem("skillswap_user", JSON.stringify(data.user));
    handleRoleRedirect(data.user.role);
    return data.user;
  };

  // ----------------------------------------------------
  // SECTION 06: Google OAuth sign-in flow simulation & sync
  // ----------------------------------------------------
  const loginWithGoogle = async () => {
    const mockEmail = `client_${Date.now().toString().slice(-4)}@gmail.com`;
    const mockName = "Google Verified Client";

    const res = await fetch(`${API_URL}/api/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: mockEmail,
        name: mockName,
        image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
      }),
    });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Google authentication failed");
    }

    setUser(data.user);
    localStorage.setItem("skillswap_user", JSON.stringify(data.user));
    handleRoleRedirect(data.user.role);
    return data.user;
  };

  // Standard Registration
  const register = async (userData) => {
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Registration failed");
    }

    setUser(data.user);
    localStorage.setItem("skillswap_user", JSON.stringify(data.user));
    handleRoleRedirect(data.user.role);
    return data.user;
  };

  // Sign out
  const logout = () => {
    setUser(null);
    localStorage.removeItem("skillswap_user");
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);