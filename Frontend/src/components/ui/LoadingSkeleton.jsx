export function LoadingSkeleton({ className = "", variant = "default" }) {
  const variants = {
    default: "h-4 w-full",
    title: "h-8 w-3/4",
    text: "h-4 w-full",
    avatar: "h-12 w-12 rounded-full",
    button: "h-10 w-24",
    card: "h-32 w-full",
  };

  return (
    <div
      className={`animate-pulse bg-gray-200 rounded ${variants[variant]} ${className}`}
      aria-hidden="true"
    ></div>
  );
}

export function TableSkeleton({ rows = 5, columns = 6 }) {
  return (
    <div className="space-y-3">
      <div className="flex gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <LoadingSkeleton key={i} variant="text" className="flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {Array.from({ length: columns }).map((_, j) => (
            <LoadingSkeleton key={j} variant="text" className="flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
      <LoadingSkeleton variant="title" />
      <LoadingSkeleton variant="text" />
      <LoadingSkeleton variant="text" className="w-2/3" />
    </div>
  );
}
