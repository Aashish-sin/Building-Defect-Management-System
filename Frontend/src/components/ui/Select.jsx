import { forwardRef } from "react";
import { ChevronDown } from "lucide-react";

export const Select = forwardRef(
  (
    {
      label,
      id,
      error,
      helperText,
      required = false,
      iconPlacement = "inside",
      children,
      className = "",
      ...props
    },
    ref,
  ) => {
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = `${selectId}-error`;
    const helperId = `${selectId}-helper`;

    const selectClasses = `w-full px-3 py-2 border-2 rounded-md appearance-none bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 ${
      error
        ? "border-red-600 focus:ring-red-500"
        : "border-gray-300 focus:ring-gray-400 focus:border-gray-600"
    } ${className}`;

    if (iconPlacement === "outside") {
      return (
        <div className="w-full">
          {label && (
            <label
              htmlFor={selectId}
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              {label}
              {required && (
                <span className="text-red-600 ml-1" aria-label="required">
                  :
                </span>
              )}
            </label>
          )}
          <div className="flex items-center gap-2">
            <select
              ref={ref}
              id={selectId}
              required={required}
              aria-invalid={error ? "true" : "false"}
              aria-describedby={
                error ? errorId : helperText ? helperId : undefined
              }
              className={selectClasses}
              {...props}
            >
              {children}
            </select>
            <ChevronDown className="w-4 h-4 text-gray-400" aria-hidden="true" />
          </div>
          {error && (
            <p id={errorId} className="mt-1 text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
          {helperText && !error && (
            <p id={helperId} className="mt-1 text-sm text-gray-500">
              {helperText}
            </p>
          )}
        </div>
      );
    }

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            {label}
            {required && (
              <span className="text-red-600 ml-1" aria-label="required">
                :
              </span>
            )}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            required={required}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={
              error ? errorId : helperText ? helperId : undefined
            }
            className={`${selectClasses} pr-12`}
            {...props}
          >
            {children}
          </select>
          <ChevronDown
            className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
            aria-hidden="true"
          />
        </div>
        {error && (
          <p id={errorId} className="mt-1 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={helperId} className="mt-1 text-sm text-gray-500">
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

Select.displayName = "Select";
