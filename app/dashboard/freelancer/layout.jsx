"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function FreelancerDashboardLayout({ children }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  // Navigation menu items for freelancer dashboard
  const navItems = [
    { name: "Overview", href: "/dashboard/freelancer" },
    { name: "Browse Tasks", href: "/dashboard/freelancer/browse" },
    { name: "My Proposals", href: "/dashboard/freelancer/proposals" },
    { name: "Active Projects", href: "/dashboard/freelancer/projects" },
    { name: "My Earnings", href: "/dashboard/freelancer/earnings" },
    { name: "Edit Profile", href: "/dashboard/freelancer/profile" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* ---------------------------------------------------- */}
      {/* Freelancer Sidebar Component */}
      {/* ---------------------------------------------------- */}
      <aside className="w-64 border-r border-gray-200 bg-white flex flex-col justify-between md:flex">
        <div>
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <Link href="/dashboard/freelancer" className="text-xl font-bold text-indigo-600">
              SkillSwap <span className="text-xs text-gray-500 font-normal">Freelancer</span>
            </Link>
          </div>

          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                    isActive
                      ? "bg-indigo-50 text-indigo-600"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-gray-100">
          <div className="mb-3 px-2">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {user?.name || "Freelancer Account"}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user?.email || "freelancer@skillswap.com"}
            </p>
          </div>
          <button
            onClick={logout}
            className="w-full text-left px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-md transition"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* ---------------------------------------------------- */}
      {/* Main Content Area */}
      {/* ---------------------------------------------------- */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-6">
          <span className="text-sm font-medium text-gray-500">Freelancer Workspace</span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
            Available for Hire
          </span>
        </header>

        <main className="p-6 md:p-8 flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}