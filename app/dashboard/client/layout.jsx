"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ClientDashboardLayout({ children }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Navigation links for client dashboard
  const navLinks = [
    { name: "Overview", href: "/dashboard/client" },
    { name: "Post a Task", href: "/dashboard/client/add-task" },
    { name: "My Tasks", href: "/dashboard/client/tasks" },
    { name: "Manage Proposals", href: "/dashboard/client/proposals" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar for desktop and mobile */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center px-6 border-b border-gray-100">
          <Link href="/" className="text-xl font-bold text-indigo-600">
            SkillSwap <span className="text-xs text-gray-400">Client</span>
          </Link>
        </div>

        <nav className="p-4 space-y-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition ${
                  isActive
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main content wrapper */}
      <div className="flex-1 lg:pl-64 flex flex-col">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 lg:px-8">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-500 hover:text-gray-700 lg:hidden font-medium"
          >
            ☰ Menu
          </button>
          <div className="flex items-center gap-4 ml-auto">
            <span className="text-sm font-medium text-gray-700">Client Portal</span>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}