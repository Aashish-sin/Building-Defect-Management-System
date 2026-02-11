import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { defectsAPI } from "../services/api";
import { StatusBadge } from "./ui/Badge";
import { CardSkeleton } from "./ui/LoadingSkeleton";
import { Alert } from "./ui/Alert";
import { formatDateTime } from "../utils/dateFormatter";

export function Dashboard({ currentUser }) {
  const [stats, setStats] = useState({
    total: 0,
    ongoing: 0,
    completed: 0,
    open: 0,
  });
  const [recentDefects, setRecentDefects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const response = await defectsAPI.getAll();
        const defects = response.data;

        const total = defects.length;
        const ongoing = defects.filter((d) => d.status === "Ongoing").length;
        const completed = defects.filter(
          (d) => d.status === "Completed",
        ).length;
        const open = defects.filter((d) => d.status === "Open").length;

        setStats({ total, ongoing, completed, open });

        const sortedDefects = [...defects].sort(
          (a, b) => new Date(b.updated_at) - new Date(a.updated_at),
        );
        setRecentDefects(sortedDefects.slice(0, 5));
      } catch (err) {
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const statRows = [
    { label: "Total Defects", value: stats.total },
    { label: "Ongoing", value: stats.ongoing },
    { label: "Completed", value: stats.completed },
    { label: "Open", value: stats.open },
  ];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-6 w-64 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <CardSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto py-12">
        <Alert type="error" message={error} dismissible={false} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome back, {currentUser.name}</p>
      </div>

      <section
        className="wf-panel p-0 bg-white mb-8 mx-auto max-w-4xl rounded-lg overflow-hidden shadow-sm"
        aria-label="Defect stats"
      >
        {statRows.map((stat, index) => (
          <div
            key={stat.label}
            className={`flex items-center justify-center gap-4 px-6 py-4 ${index === statRows.length - 1 ? "" : "border-b border-gray-200"}`}
          >
            <span className="text-sm text-gray-600">{stat.label} :</span>
            <span className="text-3xl font-semibold text-gray-900">
              {stat.value}
            </span>
          </div>
        ))}
      </section>

      <section
        className="wf-panel p-0 bg-white rounded-lg overflow-hidden mx-auto max-w-4xl shadow-sm"
        aria-labelledby="recent-activity-heading"
      >
        <div className="px-6 py-4 border-b border-gray-200">
          <h2
            id="recent-activity-heading"
            className="text-lg font-semibold text-gray-900"
          >
            Recent Activity
          </h2>
        </div>
        {recentDefects.length > 0 ? (
          <ul>
            {recentDefects.map((defect, index) => (
              <li
                key={defect.id}
                className={`flex items-center gap-4 px-6 py-4 ${
                  index === recentDefects.length - 1
                    ? ""
                    : "border-b border-gray-200"
                }`}
              >
                <div
                  className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"
                  aria-hidden="true"
                ></div>
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/defects/${defect.id}`}
                    className="text-sm text-gray-900 font-medium hover:text-blue-600 focus:outline-none focus:underline"
                  >
                    {defect.title}
                  </Link>
                  <p className="text-xs text-gray-500 mt-1">
                    Last updated{" "}
                    {formatDateTime(defect.updated_at || defect.created_at)}
                  </p>
                </div>
                <StatusBadge status={defect.status} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="px-6 py-4 text-sm text-gray-500">
            No recent activity.
          </div>
        )}
      </section>
    </div>
  );
}
