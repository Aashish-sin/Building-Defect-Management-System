import { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export const PasswordInput = forwardRef(
  (
    {
      label,
      id,
      error,
      helperText,
      required = false,
      className = "",
      togglePosition = "inside",
      ...props
    },
    ref,
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputId = id || `password-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;
    const isToggleOutside = togglePosition === "outside";
    const inputBaseClasses = `w-full px-3 py-2 border-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 ${
      error
        ? "border-red-600 focus:ring-red-500"
        : "border-gray-300 focus:ring-gray-400 focus:border-gray-600"
    } ${className}`;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
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
        {isToggleOutside ? (
          <div className="flex items-center gap-2">
            <input
              ref={ref}
              type={showPassword ? "text" : "password"}
              id={inputId}
              required={required}
              aria-invalid={error ? "true" : "false"}
              aria-describedby={
                error ? errorId : helperText ? helperId : undefined
              }
              className={inputBaseClasses}
              {...props}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="p-1 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4 text-gray-500" />
              ) : (
                <Eye className="w-4 h-4 text-gray-500" />
              )}
            </button>
          </div>
        ) : (
          <div className="relative">
            <input
              ref={ref}
              type={showPassword ? "text" : "password"}
              id={inputId}
              required={required}
              aria-invalid={error ? "true" : "false"}
              aria-describedby={
                error ? errorId : helperText ? helperId : undefined
              }
              className={`${inputBaseClasses} pr-10`}
              {...props}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4 text-gray-500" />
              ) : (
                <Eye className="w-4 h-4 text-gray-500" />
              )}
            </button>
          </div>
        )}
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

PasswordInput.displayName = "PasswordInput";
