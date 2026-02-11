import {
  Building2,
  BarChart3,
  Users,
  LayoutDashboard,
  AlertTriangle,
  UserCircle,
  LogOut,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";
import { useState, useEffect } from "react";

export function TopNav({ currentUser, onLogout }) {
  const isAdmin = currentUser.role === "admin";
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const className = "nav-dropdown-open";
    document.body.classList.remove(className);
    return () => {
      document.body.classList.remove(className);
    };
  }, []);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await authAPI.logout();
    } catch (error) {
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (onLogout) onLogout();
      navigate("/login");
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 h-16 bg-white border-b-2 border-gray-300 z-50">
        <div className="h-full px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-4 sm:gap-12">
            <span className="font-semibold tracking-tight text-gray-900">
              BDMS
            </span>

            {/* Primary Nav Items */}
            <div className="flex flex-wrap items-center gap-4">
              <Link
                to="/dashboard"
                className="flex items-center gap-2 px-3 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" aria-hidden="true" />
                Dashboard
              </Link>

              <Link
                to="/buildings"
                className="flex items-center gap-2 px-3 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
              >
                <Building2 className="w-4 h-4" aria-hidden="true" />
                Buildings
              </Link>

              <Link
                to="/defects"
                className="flex items-center gap-2 px-3 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
              >
                <AlertTriangle className="w-4 h-4" aria-hidden="true" />
                Defects
              </Link>

              {isAdmin && (
                <Link
                  to="/users"
                  className="flex items-center gap-2 px-3 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                >
                  <Users className="w-4 h-4" aria-hidden="true" />
                  Users
                </Link>
              )}

              {isAdmin && (
                <Link
                  to="/analytics"
                  className="flex items-center gap-2 px-3 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                >
                  <BarChart3 className="w-4 h-4" aria-hidden="true" />
                  Analytics
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex flex-row items-center gap-2 text-sm text-gray-700 whitespace-nowrap leading-none">
              <UserCircle className="w-5 h-5" aria-hidden="true" />
              <span>{currentUser.name}</span>
            </div>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center gap-2 px-3 py-2 rounded-md border border-red-200 bg-red-100 text-red-800 hover:bg-red-200 transition-colors focus:outline-none focus:ring-2 focus:ring-red-200 disabled:opacity-60"
            >
              <LogOut className="w-4 h-4" aria-hidden="true" />
              <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}
