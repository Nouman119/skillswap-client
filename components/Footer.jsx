import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* ---------------------------------------------------- */}
          {/* Website Logo with Name and Contact Details */}
          {/* ---------------------------------------------------- */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="text-xl font-bold tracking-tight text-indigo-600">
              Skill<span className="text-gray-900">Swap</span>
            </Link>
            <p className="text-xs text-gray-500 leading-relaxed">
              A peer-to-peer digital freelance network connecting specialized builders directly with visionary founders.
            </p>
            <div className="text-xs text-gray-600 space-y-1">
              <p>Email: <a href="mailto:support@skillswap.com" className="text-indigo-600 hover:underline">support@skillswap.com</a></p>
              <p>Contact: +1 (555) 019-2834</p>
            </div>
          </div>

          {/* ---------------------------------------------------- */}
          {/* Navigation Links to Main Pages */}
          {/* ---------------------------------------------------- */}
          <div>
            <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider">Explore</h3>
            <ul className="mt-4 space-y-2 text-xs text-gray-600">
              <li>
                <Link href="/" className="hover:text-indigo-600 transition">Home</Link>
              </li>
              <li>
                <Link href="/tasks" className="hover:text-indigo-600 transition">Browse Tasks</Link>
              </li>
              <li>
                <Link href="/freelancers" className="hover:text-indigo-600 transition">Browse Freelancers</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider">Accounts</h3>
            <ul className="mt-4 space-y-2 text-xs text-gray-600">
              <li>
                <Link href="/login" className="hover:text-indigo-600 transition">Sign In</Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-indigo-600 transition">Join SkillSwap</Link>
              </li>
              <li>
                <Link href="/dashboard/client" className="hover:text-indigo-600 transition">Client Desk</Link>
              </li>
              <li>
                <Link href="/dashboard/freelancer" className="hover:text-indigo-600 transition">Freelancer Hub</Link>
              </li>
            </ul>
          </div>

          {/* ---------------------------------------------------- */}
          {/* Social Media Links with new X icon */}
          {/* ---------------------------------------------------- */}
          <div>
            <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider">Connect</h3>
            <div className="mt-4 flex items-center space-x-4">
              {/* New X Icon (Formerly Twitter) */}
              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow us on X"
                className="text-gray-400 hover:text-gray-900 transition"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>

              {/* GitHub */}
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub Repository"
                className="text-gray-400 hover:text-gray-900 transition"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
              </a>

              {/* LinkedIn */}
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn Profile"
                className="text-gray-400 hover:text-gray-900 transition"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.64 1.64 0 1 0 0-3.28 1.64 1.64 0 0 0 0 3.28m1.39 9.74v-8.37H5.07v8.37h2.78z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* Copyright Section with Auto-Calculated Year */}
        {/* ---------------------------------------------------- */}
        <div className="mt-8 border-t border-gray-100 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <p>© {currentYear} SkillSwap Platform Inc. All rights reserved.</p>
          <p className="text-gray-400">Built for precision freelance workflows.</p>
        </div>
      </div>
    </footer>
  );
}