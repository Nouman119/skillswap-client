"use client";

import { useEffect, useState, Suspense, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function BrowseTasksContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "";

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(initialCategory);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTasks, setTotalTasks] = useState(0);

  const ITEMS_PER_PAGE = 9;
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  // Synchronize category state when URL search params change
  useEffect(() => {
    const catFromUrl = searchParams.get("category") || "";
    setCategory(catFromUrl);
    setCurrentPage(1);
  }, [searchParams]);

  // ----------------------------------------------------
  // Fetch Server-Paginated & Filtered Tasks with Fallback
  // ----------------------------------------------------
  const fetchTasks = useCallback(
    async (customSearch = search, customCat = category, customPage = currentPage) => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams({
          page: customPage.toString(),
          limit: ITEMS_PER_PAGE.toString(),
          search: customSearch.trim(),
          category: customCat,
        });

        const res = await fetch(`${API_URL}/api/tasks/open-tasks?${queryParams.toString()}`);
        if (res.ok) {
          const data = await res.json();

          // Handle response if server returns paginated object
          if (data && typeof data === "object" && !Array.isArray(data)) {
            setTasks(Array.isArray(data.tasks) ? data.tasks : []);
            setTotalPages(data.totalPages || 1);
            setTotalTasks(data.totalTasks || (data.tasks ? data.tasks.length : 0));
          } 
          // Handle fallback if server returns direct array of open tasks
          else if (Array.isArray(data)) {
            let filtered = data;

            if (customSearch.trim()) {
              filtered = filtered.filter((t) =>
                (t.title || "").toLowerCase().includes(customSearch.trim().toLowerCase())
              );
            }

            if (customCat) {
              filtered = filtered.filter(
                (t) => (t.category || "").toLowerCase() === customCat.toLowerCase()
              );
            }

            const total = filtered.length;
            const computedPages = Math.ceil(total / ITEMS_PER_PAGE) || 1;
            const startIndex = (customPage - 1) * ITEMS_PER_PAGE;
            const paginatedItems = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

            setTasks(paginatedItems);
            setTotalPages(computedPages);
            setTotalTasks(total);
          } else {
            setTasks([]);
            setTotalPages(1);
            setTotalTasks(0);
          }
        } else {
          setTasks([]);
          setTotalPages(1);
          setTotalTasks(0);
        }
      } catch (err) {
        console.error("Failed to load tasks:", err);
        setTasks([]);
        setTotalPages(1);
        setTotalTasks(0);
      } finally {
        setLoading(false);
      }
    },
    [search, category, currentPage, API_URL]
  );

  // Fetch tasks when current page or category changes
  useEffect(() => {
    fetchTasks(search, category, currentPage);
  }, [currentPage, category, fetchTasks]);

  // Handle explicit form search submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchTasks(search, category, 1);
  };

  // Reset search when input field is cleared
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    if (val === "") {
      setCurrentPage(1);
      fetchTasks("", category, 1);
    }
  };

  // Handle category dropdown filter change
  const handleCategoryChange = (e) => {
    const selected = e.target.value;
    setCategory(selected);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Browse Available Tasks</h1>
            <p className="mt-1 text-sm text-gray-500">
              Explore open assignments, filter by domain expertise, or search by keywords.
            </p>
          </div>
          <span className="self-start sm:self-auto rounded-full bg-indigo-50 border border-indigo-200 px-3.5 py-1 text-xs font-semibold text-indigo-700">
            {totalTasks} Open {totalTasks === 1 ? "Task" : "Tasks"} Available
          </span>
        </div>

        {/* ---------------------------------------------------- */}
        {/*  Text Search & Category Dropdown Filter Bar          */}
        {/* ---------------------------------------------------- */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <form onSubmit={handleSearchSubmit} className="flex flex-1 gap-2">
            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder="Search by task title..."
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition"
            >
              Search
            </button>
          </form>

          <div className="w-full md:w-64">
            <select
              value={category}
              onChange={handleCategoryChange}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">All Categories</option>
              <option value="Development">Development</option>
              <option value="Design">Design</option>
              <option value="Writing">Writing</option>
              <option value="Marketing">Marketing</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* Task Grid Rendering (9 Tasks Max Per Page)          */}
        {/* ---------------------------------------------------- */}
        {loading ? (
          <div className="flex h-60 items-center justify-center">
            <div className="h-9 w-9 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
          </div>
        ) : tasks.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-12 text-center text-gray-500">
            No open tasks found matching your criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tasks.map((task) => (
              <div
                key={task._id}
                className="flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md hover:border-indigo-200"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
                      {task.category || "General"}
                    </span>
                    <span className="text-sm font-bold text-emerald-600">${task.budget} USD</span>
                  </div>

                  <h3 className="mt-3 text-lg font-semibold text-gray-900 line-clamp-1">{task.title}</h3>
                  <p className="mt-2 text-sm text-gray-600 line-clamp-3">{task.description}</p>
                </div>

                <div className="mt-6 border-t border-gray-100 pt-4 flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    Deadline: {task.deadline ? new Date(task.deadline).toLocaleDateString() : "Flexible"}
                  </span>
                  <Link
                    href={`/tasks/${task._id}`}
                    className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* Server & Client Combined Pagination Controls         */}
        {/* ---------------------------------------------------- */}
        {!loading && totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 transition"
            >
              Previous
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, index) => {
                const pageNumber = index + 1;
                return (
                  <button
                    key={pageNumber}
                    onClick={() => setCurrentPage(pageNumber)}
                    className={`h-9 w-9 rounded-lg text-sm font-medium transition ${
                      currentPage === pageNumber
                        ? "bg-indigo-600 text-white"
                        : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 transition"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BrowseTasksPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
        </div>
      }
    >
      <BrowseTasksContent />
    </Suspense>
  );
}