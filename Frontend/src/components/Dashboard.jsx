import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, CheckCircle2, Clock, TrendingUp } from "lucide-react";
import { defectsAPI } from "../services/api";
import { StatusBadge } from "./ui/Badge";
import { CardSkeleton } from "./ui/LoadingSkeleton";
import { formatRelativeTime } from "../utils/dateFormatter";

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

  const statCards = [
    {
      label: "Total Defects",
      value: stats.total,
      icon: AlertTriangle,
      color: "bg-blue-500",
      ariaLabel: `${stats.total} total defects`,
    },
    {
      label: "Ongoing",
      value: stats.ongoing,
      icon: Clock,
      color: "bg-yellow-500",
      ariaLabel: `${stats.ongoing} ongoing defects`,
    },
    {
      label: "Completed",
      value: stats.completed,
      icon: CheckCircle2,
      color: "bg-green-500",
      ariaLabel: `${stats.completed} completed defects`,
    },
    {
      label: "Open",
      value: stats.open,
      icon: TrendingUp,
      color: "bg-purple-500",
      ariaLabel: `${stats.open} open defects`,
    },
  ];

  if (loading) {
    return (
      <div className="max-w-7xl">
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
      <div className="max-w-7xl">
        <div className="text-center py-12 text-red-600" role="alert">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome back, {currentUser.name}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <article
              key={stat.label}
              className="wf-panel-soft p-6"
              aria-label={stat.ariaLabel}
            >
              <div
                className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center mb-4`}
                aria-hidden="true"
              >
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-semibold text-gray-900 mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </article>
          );
        })}
      </div>

      <section
        className="wf-panel p-6"
        aria-labelledby="recent-activity-heading"
      >
        <h2
          id="recent-activity-heading"
          className="text-lg font-semibold text-gray-900 mb-4"
        >
          Recent Activity
        </h2>
        {recentDefects.length > 0 ? (
          <ul className="space-y-4">
            {recentDefects.map((defect) => (
              <li
                key={defect.id}
                className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0"
              >
                <div
                  className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"
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
                    Updated {formatRelativeTime(defect.updated_at)}
                  </p>
                </div>
                <StatusBadge status={defect.status} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">No recent activity.</p>
        )}
      </section>
    </div>
  );
}
