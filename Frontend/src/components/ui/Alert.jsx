import { AlertCircle, CheckCircle, Info, X } from "lucide-react";

export function Alert({
  type = "info",
  message,
  onClose,
  dismissible = true,
  className = "",
}) {
  const styles = {
    error: {
      container: "bg-red-50 border border-red-200",
      text: "text-red-800",
      icon: "text-red-600",
      closeBtn:
        "text-red-600 hover:text-red-800 hover:bg-red-100 focus:ring-red-500",
    },
    success: {
      container: "bg-green-50 border border-green-200",
      text: "text-green-800",
      icon: "text-green-600",
      closeBtn:
        "text-green-600 hover:text-green-800 hover:bg-green-100 focus:ring-green-500",
    },
    warning: {
      container: "bg-yellow-50 border border-yellow-200",
      text: "text-yellow-800",
      icon: "text-yellow-600",
      closeBtn:
        "text-yellow-600 hover:text-yellow-800 hover:bg-yellow-100 focus:ring-yellow-500",
    },
    info: {
      container: "bg-blue-50 border border-blue-200",
      text: "text-blue-800",
      icon: "text-blue-600",
      closeBtn:
        "text-blue-600 hover:text-blue-800 hover:bg-blue-100 focus:ring-blue-500",
    },
  };

  const style = styles[type] || styles.info;

  const getIcon = () => {
    switch (type) {
      case "error":
        return <AlertCircle className="w-5 h-5" />;
      case "success":
        return <CheckCircle className="w-5 h-5" />;
      case "warning":
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  return (
    <div
      className={`flex items-center gap-3 p-4 rounded-lg ${style.container} ${className}`}
      role="alert"
    >
      <div className={style.icon}>{getIcon()}</div>
      <div className={`flex-1 text-sm font-medium ${style.text}`}>
        {message}
      </div>
      {dismissible && onClose && (
        <button
          type="button"
          onClick={onClose}
          className={`p-1 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${style.closeBtn}`}
          aria-label="Dismiss alert"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
