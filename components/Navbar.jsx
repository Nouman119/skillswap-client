"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext"; // Ensure your auth hook path matches

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { user, logOut } = useAuth(); // Reads current logged-in user state

  const handleLogout = async () => {
    try {
      await logOut();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Browse Tasks", href: "/tasks" },
    { name: "Browse Freelancers", href: "/freelancers" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-lg font-bold text-white shadow-sm">
            S
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900">
            Skill<span className="text-indigo-600">Swap</span>
          </span>
        </Link>

        {/* Desktop Public Nav Links */}
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  isActive ? "text-indigo-600 font-semibold" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Auth State Actions */}
        <div className="hidden items-center gap-4 md:flex">
          {user ? (
            <>
              {/* Private Links */}
              <Link
                href="/dashboard"
                className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition"
              >
                Dashboard
              </Link>
              <Link
                href="/profile"
                className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition"
              >
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              {/* Public Login */}
              <Link
                href="/login"
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 transition"
              >
                Login
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle Menu"
            className="p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div className="border-t border-gray-100 bg-white px-4 pt-2 pb-4 md:hidden space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="block py-2 text-base font-medium text-gray-700 hover:text-indigo-600"
            >
              {link.name}
            </Link>
          ))}

          <div className="border-t border-gray-100 pt-3">
            {user ? (
              <div className="flex flex-col gap-2">
                <Link
                  href="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="block py-2 text-base font-medium text-gray-700 hover:text-indigo-600"
                >
                  Dashboard
                </Link>
                <Link
                  href="/profile"
                  onClick={() => setIsOpen(false)}
                  className="block py-2 text-base font-medium text-gray-700 hover:text-indigo-600"
                >
                  Profile
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="w-full text-left py-2 text-base font-medium text-red-600 hover:text-red-700"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="block w-full rounded-lg bg-indigo-600 py-2.5 text-center text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}