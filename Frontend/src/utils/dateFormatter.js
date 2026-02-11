const normalizeDate = (dateString) => {
  if (!dateString) return null;

  // Treat naive ISO timestamps (no timezone) as UTC.
  const hasTimezone = /[zZ]|[+-]\d{2}:?\d{2}$/.test(dateString);
  const normalized = hasTimezone ? dateString : `${dateString}Z`;
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date;
};

export function formatDate(dateString, options = {}) {
  const date = normalizeDate(dateString);
  if (!date) return "—";

  const defaultOptions = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    ...options,
  };

  return date.toLocaleDateString("en-GB", defaultOptions);
}

export function formatDateTime(dateString) {
  const date = normalizeDate(dateString);
  if (!date) return "—";

  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatRelativeTime(dateString) {
  const date = normalizeDate(dateString);
  if (!date) return "—";
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800)
    return `${Math.floor(diffInSeconds / 86400)}d ago`;

  return formatDate(dateString);
}
