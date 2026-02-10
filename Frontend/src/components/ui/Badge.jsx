export function Badge({ children, variant = "default", className = "" }) {
  const variants = {
    default: "bg-white text-gray-700 border border-gray-300",
    admin: "bg-gray-50 text-gray-700 border border-gray-400",
    csr: "bg-gray-50 text-gray-700 border border-gray-400",
    building_executive: "bg-gray-50 text-gray-700 border border-gray-400",
    technician: "bg-gray-50 text-gray-700 border border-gray-400",
    open: "bg-red-50 text-red-800 border border-red-200",
    reviewed: "bg-purple-50 text-purple-800 border border-purple-200",
    ongoing: "bg-yellow-50 text-yellow-800 border border-yellow-200",
    done: "bg-green-50 text-green-800 border border-green-200",
    completed: "bg-white text-gray-700 border border-gray-300",
    high: "bg-red-50 text-red-800 border border-red-200",
    medium: "bg-yellow-50 text-yellow-800 border border-yellow-200",
    low: "bg-blue-50 text-blue-800 border border-blue-200",
  };

  const variantClass = variants[variant.toLowerCase()] || variants.default;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${variantClass} ${className}`}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }) {
  const statusMap = {
    Open: "open",
    Reviewed: "reviewed",
    Ongoing: "ongoing",
    Done: "done",
    Completed: "completed",
  };

  return <Badge variant={statusMap[status] || "default"}>{status}</Badge>;
}

export function PriorityBadge({ priority }) {
  const priorityMap = {
    high: "high",
    medium: "medium",
    low: "low",
  };

  return (
    <Badge variant={priorityMap[priority] || "default"}>
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </Badge>
  );
}
