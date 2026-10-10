"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const [user, setUser] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const cachedUser = localStorage.getItem("skillswap_user");
        return cachedUser ? JSON.parse(cachedUser) : null;
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [loading, setLoading] = useState(true);

  // ----------------------------------------------------
  // Sign Out Handler
  // ----------------------------------------------------
  const logout = useCallback(async () => {
    try {
      await authClient.signOut();
    } catch (err) {
      console.error("Sign out error:", err);
    } finally {
      setUser(null);
      localStorage.removeItem("skillswap_user");
      router.push("/login");
    }
  }, [router]);

  // ----------------------------------------------------
  // Verify User Block Status from Database
  // ----------------------------------------------------
  const verifyBlockStatus = useCallback(async (email) => {
    if (!email) return false;
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${API_URL}/api/users/${encodeURIComponent(email)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.isBlocked || data.status === "blocked") {
          alert("Your account has been suspended by administration.");
          await logout();
          return true; // Is blocked
        }
      }
    } catch (e) {
      console.error("Error checking block status:", e);
    }
    return false;
  }, [logout]);

  // Sync state when session resolves and verify block status
  useEffect(() => {
    if (isPending) {
      setLoading(true);
      return;
    }

    async function handleSession() {
      if (session?.user) {
        const isBlocked = await verifyBlockStatus(session.user.email);
        if (!isBlocked) {
          setUser(session.user);
          localStorage.setItem("skillswap_user", JSON.stringify(session.user));
        }
      } else {
        setUser(null);
        localStorage.removeItem("skillswap_user");
      }
      setLoading(false);
    }

    handleSession();
  }, [session, isPending, verifyBlockStatus]);

  // ----------------------------------------------------
  // Role-based routing helper
  // ----------------------------------------------------
  const handleRoleRedirect = (role) => {
    const normalizedRole = (role || "").toLowerCase();
    if (normalizedRole === "admin") {
      router.push("/dashboard/admin");
    } else if (normalizedRole === "freelancer") {
      router.push("/dashboard/freelancer");
    } else {
      router.push("/dashboard/client");
    }
  };

  // ----------------------------------------------------
  // Better Auth: Email & Password Sign In
  // ----------------------------------------------------
  const login = async (email, password) => {
    // 1. First check if user is blocked in database
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    try {
      const checkRes = await fetch(`${API_URL}/api/users/${encodeURIComponent(email)}`);
      if (checkRes.ok) {
        const userData = await checkRes.json();
        if (userData.isBlocked || userData.status === "blocked") {
          throw new Error("Your account has been suspended by administration");
        }
      }
    } catch (err) {
      if (err.message.includes("suspended")) {
        throw err;
      }
    }

    // 2. Perform sign in via Better Auth
    const { data, error } = await authClient.signIn.email({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message || "Failed to sign in");
    }

    const activeUser = data?.user;
    if (activeUser) {
      setUser(activeUser);
      localStorage.setItem("skillswap_user", JSON.stringify(activeUser));
      handleRoleRedirect(activeUser.role || "client");
    }
    return activeUser;
  };

  // ----------------------------------------------------
  // Better Auth: Real Google OAuth Sign In
  // ----------------------------------------------------
const loginWithGoogle = async () => {
    const { error } = await authClient.signIn.social({
      provider: "google",
      callbackURL: "https://skillswap-client-five.vercel.app/dashboard/client", // Absolute URL to force redirect back to frontend
      prompt: "select_account",
    });

    if (error) {
      throw new Error(error.message || "Google authentication failed");
    }
  };

  // ----------------------------------------------------
  // Better Auth: Email & Password Sign Up
  // ----------------------------------------------------
  const register = async ({ name, email, password, image, role }) => {
    const { data, error } = await authClient.signUp.email({
      name,
      email,
      password,
      image: image || undefined,
      role: role || "client",
    });

    if (error) {
      throw new Error(error.message || "Registration failed");
    }

    const newUser = data?.user;
    if (newUser) {
      setUser(newUser);
      localStorage.setItem("skillswap_user", JSON.stringify(newUser));
      handleRoleRedirect(newUser.role || role || "client");
    }
    return newUser;
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