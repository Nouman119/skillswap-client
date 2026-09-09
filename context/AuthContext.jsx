"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (session?.user) {
      setUser(session.user);
      localStorage.setItem("skillswap_user", JSON.stringify(session.user));
    } else if (!isPending && !session) {
      setUser(null);
      localStorage.removeItem("skillswap_user");
    }
  }, [session, isPending]);

  // ----------------------------------------------------
  // SECTION 06: Role-based redirect router rules
  // Clients -> Home (/); Freelancers & Admins -> Dashboard
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
      callbackURL: "/", // Google login auto-defaults to Client and redirects to Home
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

  // Sign out
  const logout = async () => {
    await authClient.signOut();
    setUser(null);
    localStorage.removeItem("skillswap_user");
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading: isPending,
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