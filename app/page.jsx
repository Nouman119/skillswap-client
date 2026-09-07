"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Home() {
  const [latestTasks, setLatestTasks] = useState([]);
  const [topFreelancers, setTopFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch home page data from backend
  useEffect(() => {
    async function fetchHomeData() {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        
        const tasksRes = await fetch(`${API_URL}/api/tasks/latest-tasks`);
        const tasksData = await tasksRes.json();
        setLatestTasks(Array.isArray(tasksData) ? tasksData : []);

        setTopFreelancers([
          {
            _id: "1",
            name: "Alex Morgan",
            image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
            skills: ["React", "Next.js", "Tailwind"],
            rating: 4.9,
            completedJobs: 42,
          },
          {
            _id: "2",
            name: "Sarah Jenkins",
            image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
            skills: ["UI/UX Design", "Figma", "Branding"],
            rating: 5.0,
            completedJobs: 38,
          },
          {
            _id: "3",
            name: "David Chen",
            image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
            skills: ["Node.js", "MongoDB", "Express"],
            rating: 4.8,
            completedJobs: 29,
          },
        ]);
      } catch (error) {
        console.error("Error fetching home data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchHomeData();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden bg-linear-to-b from-indigo-50/50 via-white to-white py-20 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
            Get your tasks done by <span className="text-indigo-600">skilled freelancers</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
            Connect with vetted professionals worldwide to execute your projects efficiently and securely.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link
              href="/tasks/post"
              className="rounded-lg bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
            >
              Post a Task
            </Link>
            <Link
              href="/tasks"
              className="rounded-lg border border-gray-300 bg-white px-6 py-3.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
            >
              Browse Tasks
            </Link>
          </div>
        </div>
      </section>

      {/* Dynamic Section 1 — Latest Featured Tasks */}
      <section className="py-16 bg-gray-50/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Latest Featured Tasks</h2>
              <p className="mt-1 text-sm text-gray-500">Explore open opportunities posted recently by clients.</p>
            </div>
            <Link href="/tasks" className="text-sm font-semibold text-indigo-600 hover:text-indigo-500">
              View all tasks &rarr;
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-48 rounded-xl bg-gray-200 animate-pulse"></div>
              ))}
            </div>
          ) : latestTasks.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
              <p className="text-gray-500">No open tasks available at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {latestTasks.map((task) => (
                <div key={task._id} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition">
                  <div className="flex justify-between items-start">
                    <span className="inline-flex items-center rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700">
                      {task.category || "General"}
                    </span>
                    <span className="text-lg font-bold text-gray-900">${task.budget}</span>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-gray-900 line-clamp-1">{task.title}</h3>
                  <p className="mt-1 text-sm text-gray-500 line-clamp-2">{task.description}</p>
                  <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4 text-xs text-gray-500">
                    <span>Client: {task.clientName || "Anonymous"}</span>
                    <span>Deadline: {task.deadline ? new Date(task.deadline).toLocaleDateString() : "Flexible"}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Dynamic Section 2 — Top Freelancers */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Top Rated Freelancers</h2>
            <p className="mt-1 text-sm text-gray-500">Collaborate with our highest-performing talent pool.</p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {topFreelancers.map((freelancer) => (
              <div key={freelancer._id} className="rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm hover:shadow-md transition">
                <img
                  src={freelancer.image}
                  alt={freelancer.name}
                  className="mx-auto h-20 w-20 rounded-full object-cover border-2 border-indigo-50"
                />
                <h3 className="mt-4 text-lg font-semibold text-gray-900">{freelancer.name}</h3>
                <div className="mt-1 flex items-center justify-center gap-1 text-sm text-amber-500 font-medium">
                  <span>★</span>
                  <span>{freelancer.rating}</span>
                  <span className="text-gray-400 font-normal">({freelancer.completedJobs} jobs done)</span>
                </div>
                <div className="mt-4 flex flex-wrap justify-center gap-1.5">
                  {freelancer.skills.map((skill, index) => (
                    <span key={index} className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Extra Section 1: How It Works */}
      <section className="py-16 bg-gray-50/50 border-t border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">How SkillSwap Works</h2>
            <p className="mt-2 text-sm text-gray-500">Get things done in 3 simple steps</p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="bg-white p-6 rounded-xl border border-gray-200 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold text-lg mb-4">1</div>
              <h3 className="text-lg font-semibold text-gray-900">Post a Task</h3>
              <p className="mt-2 text-sm text-gray-500">Describe your project requirements and set your budget.</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold text-lg mb-4">2</div>
              <h3 className="text-lg font-semibold text-gray-900">Get Proposals</h3>
              <p className="mt-2 text-sm text-gray-500">Receive bids and review portfolios from skilled professionals.</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold text-lg mb-4">3</div>
              <h3 className="text-lg font-semibold text-gray-900">Hire and Pay</h3>
              <p className="mt-2 text-sm text-gray-500">Collaborate securely and release payment upon satisfaction.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Extra Section 2: Popular Categories */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl mb-8">Popular Categories</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {["Design", "Writing", "Development", "Marketing", "Other"].map((cat, idx) => (
              <Link
                key={idx}
                href={`/tasks?category=${cat.toLowerCase()}`}
                className="rounded-xl border border-gray-200 bg-white p-6 hover:border-indigo-600 hover:shadow-md transition group"
              >
                <span className="font-semibold text-gray-900 group-hover:text-indigo-600">{cat}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}