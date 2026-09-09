"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function HomePage() {
  const [tasks, setTasks] = useState([]);
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);

  // ----------------------------------------------------
  // SECTION 05: Fetch Real Database Tasks & Freelancers
  // ----------------------------------------------------
  useEffect(() => {
    async function loadHomeData() {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        
        const [tasksRes, freelancersRes] = await Promise.all([
          fetch(`${API_URL}/api/tasks/public/featured-tasks`),
          fetch(`${API_URL}/api/tasks/public/top-freelancers`),
        ]);

        if (tasksRes.ok) {
          const tasksData = await tasksRes.json();
          setTasks(Array.isArray(tasksData) ? tasksData : []);
        }

        if (freelancersRes.ok) {
          const freelancersData = await freelancersRes.json();
          setFreelancers(Array.isArray(freelancersData) ? freelancersData : []);
        }
      } catch (err) {
        console.error("Failed to load homepage dynamic collections:", err);
      } finally {
        setLoading(false);
      }
    }

    loadHomeData();
  }, []);

  return (
    <div className="space-y-20 pb-20">
      {/* ---------------------------------------------------- */}
      {/* Hero Banner Section with Smooth Layout Transitions */}
      {/* ---------------------------------------------------- */}
      <section className="relative overflow-hidden bg-linear-to-b from-indigo-50/70 via-white to-white py-20 sm:py-28 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto space-y-6 transition-all duration-700 ease-out transform translate-y-0 opacity-100">
            <span className="inline-flex items-center rounded-full bg-indigo-100/80 px-3.5 py-1 text-xs font-semibold text-indigo-700">
              Decentralized Talent Network
            </span>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-gray-900 leading-tight">
              Get your tasks done by skilled freelancers
            </h1>

            <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
              Connect with vetted specialists, negotiate milestones transparently, and streamline deliverables through secure escrow-backed contracts.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href="/dashboard/client/post-task"
                className="w-full sm:w-auto rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition duration-200 transform hover:-translate-y-0.5"
              >
                Post a Task
              </Link>
              <Link
                href="/tasks"
                className="w-full sm:w-auto rounded-xl border border-gray-300 bg-white px-6 py-3.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition duration-200 transform hover:-translate-y-0.5 shadow-sm"
              >
                Browse Tasks
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* Extra Section 1: How It Works (3-Step Guide) */}
      {/* ---------------------------------------------------- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl font-bold text-gray-900">How It Works</h2>
          <p className="text-sm text-gray-500 mt-1">Simple, predictable, and protected milestone delivery.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm text-center space-y-3">
            <div className="h-10 w-10 mx-auto rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-base">
              1
            </div>
            <h3 className="text-base font-semibold text-gray-900">Post a Task</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Specify your project scope, timeline expectations, and target budget size.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm text-center space-y-3">
            <div className="h-10 w-10 mx-auto rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-base">
              2
            </div>
            <h3 className="text-base font-semibold text-gray-900">Get Proposals</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Evaluate competitive pitches, past portfolios, and hourly milestones from top candidates.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm text-center space-y-3">
            <div className="h-10 w-10 mx-auto rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-base">
              3
            </div>
            <h3 className="text-base font-semibold text-gray-900">Hire and Pay</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Authorize payouts seamlessly via Stripe escrow protection once results are validated.
            </p>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* Dynamic Section 1: Latest Featured Tasks (Real Data) */}
      {/* ---------------------------------------------------- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Latest Featured Tasks</h2>
            <p className="text-sm text-gray-500 mt-1">Explore recently posted active contracts awaiting offers.</p>
          </div>
          <Link href="/tasks" className="text-xs font-semibold text-indigo-600 hover:underline">
            View all tasks →
          </Link>
        </div>

        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
          </div>
        ) : tasks.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
            No active tasks found in the database.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tasks.map((task) => (
              <div
                key={task._id}
                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col justify-between hover:border-indigo-300 hover:shadow-md transition duration-200"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
                      {task.category || "General"}
                    </span>
                    <span className="text-sm font-bold text-emerald-600">${task.budget} USD</span>
                  </div>

                  <h3 className="text-base font-semibold text-gray-900 line-clamp-1">
                    {task.title}
                  </h3>

                  <p className="text-xs text-gray-500 line-clamp-2">
                    {task.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 space-y-3">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Client: <strong className="text-gray-700">{task.clientName || task.clientEmail}</strong></span>
                    <span>Due: <strong className="text-gray-700">{task.deadline ? new Date(task.deadline).toLocaleDateString() : "Flexible"}</strong></span>
                  </div>

                  <Link
                    href={`/tasks/${task._id}`}
                    className="block w-full text-center rounded-lg bg-indigo-50 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition"
                  >
                    View Details & Offer
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ---------------------------------------------------- */}
      {/* Dynamic Section 2: Top Freelancers (Real Data) */}
      {/* ---------------------------------------------------- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Top Freelancers</h2>
            <p className="text-sm text-gray-500 mt-1">High-performing specialists with verified completed contracts.</p>
          </div>
          <Link href="/freelancers" className="text-xs font-semibold text-indigo-600 hover:underline">
            Browse all talents →
          </Link>
        </div>

        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
          </div>
        ) : freelancers.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
            No active freelancers currently listed.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {freelancers.map((freelancer) => (
              <div
                key={freelancer._id}
                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col justify-between hover:border-indigo-300 hover:shadow-md transition duration-200 text-center"
              >
                <div className="space-y-4">
                  {freelancer.image ? (
                    <img
                      src={freelancer.image}
                      alt={freelancer.name}
                      className="h-16 w-16 mx-auto rounded-full object-cover border border-gray-200"
                    />
                  ) : (
                    <div className="h-16 w-16 mx-auto rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xl">
                      {freelancer.name ? freelancer.name.charAt(0).toUpperCase() : "U"}
                    </div>
                  )}

                  <div>
                    <h3 className="text-sm font-bold text-gray-900">{freelancer.name}</h3>
                    <div className="mt-1 flex items-center justify-center gap-1 text-xs text-amber-500">
                      <span>★</span>
                      <span className="font-semibold text-gray-700">{freelancer.rating}</span>
                      <span className="text-gray-400">({freelancer.completedJobs} jobs)</span>
                    </div>
                  </div>

                  {/* Skill tags */}
                  <div className="flex flex-wrap justify-center gap-1">
                    {freelancer.skills.split(",").slice(0, 2).map((skill, idx) => (
                      <span
                        key={idx}
                        className="rounded-md bg-gray-100 px-2 py-0.5 text-[11px] text-gray-600"
                      >
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100">
                  <Link
                    href={`/freelancers/${freelancer._id}`}
                    className="block w-full rounded-lg bg-indigo-50 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition"
                  >
                    View Profile
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ---------------------------------------------------- */}
      {/* Extra Section 2: Popular Categories */}
      {/* ---------------------------------------------------- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl font-bold text-gray-900">Popular Categories</h2>
          <p className="text-sm text-gray-500 mt-1">Quickly explore tasks grouped by technical disciplines.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {["Development", "Design", "Writing", "Marketing", "Other"].map((cat) => (
            <Link
              key={cat}
              href={`/tasks?category=${cat}`}
              className="rounded-xl border border-gray-200 bg-white p-5 text-center shadow-sm hover:border-indigo-600 hover:text-indigo-600 transition duration-200 group"
            >
              <span className="block text-sm font-semibold text-gray-900 group-hover:text-indigo-600">
                {cat}
              </span>
              <span className="text-[11px] text-gray-400 mt-1 block">Explore tasks →</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}