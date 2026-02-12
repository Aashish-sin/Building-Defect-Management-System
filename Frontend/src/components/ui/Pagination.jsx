import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./Button";

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  totalItems,
}) {
  // Ensure currentPage is a number to prevent "1" === 1 failing
  const current = Number(currentPage);

  const startItem = (current - 1) * itemsPerPage + 1;
  const endItem = Math.min(current * itemsPerPage, totalItems);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 7;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (current <= 3) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      } else if (current >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = current - 1; i <= current + 1; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <nav
      className="flex items-center justify-between border-t-2 border-gray-200 px-4 py-3 sm:px-6"
      aria-label="Pagination"
    >
      <div className="hidden sm:block">
        <p className="text-sm text-gray-700">
          Showing <span className="font-medium">{startItem}</span> to{" "}
          <span className="font-medium">{endItem}</span> of{" "}
          <span className="font-medium">{totalItems}</span> results
        </p>
      </div>
      <div className="flex flex-1 justify-between sm:justify-end gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(current - 1)}
          disabled={current === 1}
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Previous</span>
        </Button>

        <div className="hidden md:flex gap-1">
          {getPageNumbers().map((page, index) => {
            // Check if this is the active page
            const isActive = page === current;

            return page === "..." ? (
              <span
                key={`ellipsis-${index}`}
                className="px-3 py-1 text-gray-500 flex items-center justify-center"
              >
                ...
              </span>
            ) : (
              <button
                key={page}
                type="button"
                onClick={() => onPageChange(page)}
                aria-label={`Go to page ${page}`}
                aria-current={isActive ? "page" : undefined}
                // FIX: Added min-w-[2rem] for shape and changed colors to blue-600 for better visibility
                className={`min-w-[2rem] px-3 py-1 rounded-md text-sm font-medium transition-colors border focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                  isActive
                    ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                {page}
              </button>
            );
          })}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(current + 1)}
          disabled={current === totalPages}
          aria-label="Next page"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </nav>
  );
}
