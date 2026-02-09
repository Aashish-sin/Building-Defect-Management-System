import { forwardRef } from "react";

export const Input = forwardRef(
  (
    {
      label,
      id,
      error,
      helperText,
      required = false,
      labelClassName = "",
      className = "",
      size = "md",
      ...props
    },
    ref,
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    const sizeClasses = {
      sm: "px-2.5 py-1.5 text-sm",
      md: "px-3 py-2 text-base",
      lg: "px-4 py-3 text-lg",
    };

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className={`block text-sm font-medium text-gray-700 mb-2 ${labelClassName}`}
          >
            {label}
            {required && (
              <span className="text-red-600 ml-1" aria-label="required">
                :
              </span>
            )}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          required={required}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          className={`block w-full border rounded-md bg-white placeholder:text-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            error
              ? "border-red-600 focus:ring-red-500 focus:ring-offset-white"
              : "border-gray-300 focus:ring-gray-400 focus:border-transparent"
          } ${sizeClasses[size] || sizeClasses.md} ${className}`}
          {...props}
        />
        {error && (
          <p
            id={errorId}
            className="mt-1.5 text-sm text-red-600 font-medium"
            role="alert"
          >
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

Input.displayName = "Input";
