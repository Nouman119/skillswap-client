"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  // Initialize user state with cached local storage to prevent instant route guard bounces on browser refresh
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

  // Track overall authentication resolution state
  const [loading, setLoading] = useState(true);

  // Sync state when Better Auth resolves server session
  useEffect(() => {
    if (isPending) {
      setLoading(true);
      return;
    }

    if (session?.user) {
      setUser(session.user);
      localStorage.setItem("skillswap_user", JSON.stringify(session.user));
    } else {
      setUser(null);
      localStorage.removeItem("skillswap_user");
    }

    setLoading(false);
  }, [session, isPending]);

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
      callbackURL: "/dashboard/client",
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

  // ----------------------------------------------------
  // Sign Out Handler
  // ----------------------------------------------------
  const logout = async () => {
    try {
      await authClient.signOut();
    } catch (err) {
      console.error("Sign out error:", err);
    } finally {
      setUser(null);
      localStorage.removeItem("skillswap_user");
      router.push("/login");
    }
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