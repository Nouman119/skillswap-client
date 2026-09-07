"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  // Determine dashboard link based on role
  const getDashboardPath = () => {
    if (user?.role === "admin") return "/dashboard/admin";
    if (user?.role === "freelancer") return "/dashboard/freelancer";
    return "/dashboard/client";
  };

  // ----------------------------------------------------
  // SECTION 04: Public and Private Navigation Config
  // ----------------------------------------------------
  const publicLinks = [
    { name: "Home", href: "/" },
    { name: "Browse Tasks", href: "/tasks" },
    { name: "Browse Freelancers", href: "/freelancers" },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold tracking-tight text-indigo-600">
              Skill<span className="text-gray-900">Swap</span>
            </Link>
          </div>

          {/* Center Navigation: Public Links */}
          <div className="hidden md:flex items-center space-x-6">
            {publicLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-sm font-medium transition ${
                    isActive ? "text-indigo-600 font-semibold" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Right Action Menu: Auth Conditionals */}
          <div className="flex items-center space-x-4">
            {user ? (
              // ----------------------------------------------------
              // Logged-in / Private Navigation State
              // ----------------------------------------------------
              <div className="flex items-center space-x-3">
                <Link
                  href={getDashboardPath()}
                  className="rounded-lg bg-indigo-50 px-3.5 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition"
                >
                  Dashboard
                </Link>

                <Link
                  href={user?.role === "freelancer" ? "/dashboard/freelancer/profile" : "/profile"}
                  className="text-xs font-medium text-gray-600 hover:text-gray-900 transition"
                >
                  Profile
                </Link>

                <button
                  onClick={logout}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              // ----------------------------------------------------
              // Unauthenticated / Public State
              // ----------------------------------------------------
              <div className="flex items-center space-x-3">
                <Link
                  href="/login"
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 transition"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}