"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export function useRoleRedirect(allowedRoles = []) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Redirect to login if not signed in
        router.push("/login");
      } else {
        setChecking(false);
      }
    }
  }, [user, loading, router]);

  return { user, checking };
}