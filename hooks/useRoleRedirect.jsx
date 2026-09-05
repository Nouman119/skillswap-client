"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/utils/auth-client";

// Hook to verify user role and handle role-based navigation guards
export function useRoleRedirect(allowedRoles = []) {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [role, setRole] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      if (isPending) return;

      // Redirect unauthenticated requests to login
      if (!session?.user) {
        router.push("/login");
        setChecking(false);
        return;
      }

      try {
        const res = await fetch(`http://localhost:5000/api/users/${session.user.email}`);
        const data = await res.json();

        // Check if user is blocked
        if (data?.isBlocked) {
          router.push("/login");
          return;
        }

        const userRole = data?.role || "client";
        setRole(userRole);

        // Guard against unauthorized roles for private views
        if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
          if (userRole === "admin") {
            router.push("/dashboard/admin");
          } else if (userRole === "freelancer") {
            router.push("/dashboard/freelancer");
          } else {
            router.push("/");
          }
        }
      } catch (error) {
        console.error("Verification failed:", error);
      } finally {
        setChecking(false);
      }
    };

    verifyUser();
  }, [session, isPending, router, allowedRoles]);

  return { session, role, checking };
}