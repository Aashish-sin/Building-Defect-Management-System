import { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  AlertCircle,
  Clock,
  Download,
} from "lucide-react";
import { defectsAPI } from "../services/api";
import { LoadingSkeleton } from "./ui/LoadingSkeleton";

export function Analytics({ currentUser }) {
  const [defects, setDefects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadAnalyticsData = async () => {
      try {
        setLoading(true);
        const response = await defectsAPI.getAll();
        setDefects(response.data);
      } catch (err) {
        setError("Failed to load analytics data.");
      } finally {
        setLoading(false);
      }
    };

    if (currentUser.role === "admin") {
      loadAnalyticsData();
    }
  }, [currentUser.role]);

  if (currentUser.role !== "admin") {
    return (
      <div className="max-w-7xl text-center py-12">
        <p className="text-gray-600">
          You don't have permission to access this page.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl">
        <div className="space-y-4">
          <LoadingSkeleton variant="title" className="w-48" />
          <LoadingSkeleton variant="text" className="w-72" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <LoadingSkeleton variant="card" />
            <LoadingSkeleton variant="card" />
          </div>
        </div>
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

  const totalDefects = defects.length;

  const statusCounts = {
    Open: defects.filter((d) => d.status === "Open").length,
    Reviewed: defects.filter((d) => d.status === "Reviewed").length,
    Ongoing: defects.filter((d) => d.status === "Ongoing").length,
    Done: defects.filter((d) => d.status === "Done").length,
    Completed: defects.filter((d) => d.status === "Completed").length,
  };

  const priorityCounts = {
    High: defects.filter((d) => d.priority === "high").length,
    Medium: defects.filter((d) => d.priority === "medium").length,
    Low: defects.filter((d) => d.priority === "low").length,
  };

  const completionRate =
    totalDefects > 0
      ? Math.round((statusCounts.Completed / totalDefects) * 100)
      : 0;

  const defectsThisMonth = defects.filter((d) => {
    const defectDate = new Date(d.created_at);
    const now = new Date();
    return (
      defectDate.getMonth() === now.getMonth() &&
      defectDate.getFullYear() === now.getFullYear()
    );
  }).length;

  const handleExport = () => {
    const headers = ["ID", "Title", "Status", "Priority", "Created At"];
    const rows = defects.map((d) => [
      d.id,
      d.title,
      d.status,
      d.priority,
      d.created_at,
    ]);
    const csvContent = [headers, ...rows]
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "defects-analytics.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Analytics
          </h1>
          <p className="text-gray-600">
            Overview of defect statistics and trends
          </p>
        </div>
        <button
          type="button"
          onClick={handleExport}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md border-2 border-gray-300 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400"
        >
          <Download className="w-4 h-4" aria-hidden="true" />
          Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Status Distribution */}
        <div
          className="wf-panel p-6"
          role="region"
          aria-labelledby="status-distribution-heading"
        >
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <h2
              id="status-distribution-heading"
              className="text-lg font-semibold text-gray-900"
            >
              Status Distribution
            </h2>
          </div>
          <div className="sr-only" aria-hidden="false">
            Status distribution chart
          </div>
          <div className="space-y-3">
            {Object.entries(statusCounts).map(([status, count]) => (
              <div key={status}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-700">{status}</span>
                  <span className="text-sm font-medium text-gray-900">
                    {count}
                  </span>
                </div>
                <div
                  className="w-full bg-gray-200 rounded-full h-2"
                  role="progressbar"
                  aria-valuenow={
                    totalDefects > 0
                      ? Math.round((count / totalDefects) * 100)
                      : 0
                  }
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${status} defects`}
                  title={`${status}: ${count}`}
                >
                  <div
                    className="bg-blue-700 h-2 rounded-full"
                    style={{
                      width: `${totalDefects > 0 ? (count / totalDefects) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-xs text-gray-500">
            Colors indicate relative distribution of statuses.
          </div>
        </div>

        {/* Priority Distribution */}
        <div
          className="wf-panel p-6"
          role="region"
          aria-labelledby="priority-distribution-heading"
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-red-600" />
            <h2
              id="priority-distribution-heading"
              className="text-lg font-semibold text-gray-900"
            >
              Priority Distribution
            </h2>
          </div>
          <div className="sr-only" aria-hidden="false">
            Priority distribution chart
          </div>
          <div className="space-y-3">
            {Object.entries(priorityCounts).map(([priority, count]) => {
              const color =
                priority === "High"
                  ? "bg-red-700"
                  : priority === "Medium"
                    ? "bg-yellow-700"
                    : "bg-green-700";
              return (
                <div key={priority}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-700">{priority}</span>
                    <span className="text-sm font-medium text-gray-900">
                      {count}
                    </span>
                  </div>
                  <div
                    className="w-full bg-gray-200 rounded-full h-2"
                    role="progressbar"
                    aria-valuenow={
                      totalDefects > 0
                        ? Math.round((count / totalDefects) * 100)
                        : 0
                    }
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${priority} priority defects`}
                    title={`${priority}: ${count}`}
                  >
                    <div
                      className={`${color} h-2 rounded-full`}
                      style={{
                        width: `${totalDefects > 0 ? (count / totalDefects) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 text-xs text-gray-500">
            Colors represent priority levels.
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <dl className="wf-panel-soft p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-green-700" aria-hidden="true" />
            </div>
            <div>
              <dd className="text-2xl font-semibold text-gray-900">
                {completionRate}%
              </dd>
              <dt className="text-sm text-gray-600">Completed</dt>
            </div>
          </div>
        </dl>

        <dl className="wf-panel-soft p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <AlertCircle
                className="w-5 h-5 text-blue-700"
                aria-hidden="true"
              />
            </div>
            <div>
              <dd className="text-2xl font-semibold text-gray-900">
                {totalDefects}
              </dd>
              <dt className="text-sm text-gray-600">Total Defects</dt>
            </div>
          </div>
        </dl>

        <dl className="wf-panel-soft p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp
                className="w-5 h-5 text-purple-700"
                aria-hidden="true"
              />
            </div>
            <div>
              <dd className="text-2xl font-semibold text-gray-900">
                {defectsThisMonth}
              </dd>
              <dt className="text-sm text-gray-600">This Month</dt>
            </div>
          </div>
        </dl>
      </div>
    </div>
  );
}
