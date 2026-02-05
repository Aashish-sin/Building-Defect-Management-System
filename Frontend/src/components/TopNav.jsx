import {
  Building2,
  ChevronDown,
  BarChart3,
  UserCircle,
  LogOut,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";
import { useState, useRef, useEffect } from "react";
import { MobileNav } from "./MobileNav";

export function TopNav({ currentUser, onLogout }) {
  const isAdmin = currentUser.role === "admin";
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-white border-b-2 border-gray-300 z-50">
      <div className="h-full px-4 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-4 sm:gap-12">
          {/* Mobile Menu Toggle */}
          <MobileNav currentUser={currentUser} />

          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 transition-colors hover:opacity-80"
          >
            <div className="w-8 h-8 bg-white border-2 border-gray-800 rounded flex items-center justify-center">
              <Building2 className="w-5 h-5 text-gray-900" />
            </div>
            <span className="hidden sm:inline font-semibold tracking-tight text-gray-900">
              DefectTrack
            </span>
          </Link>

          {/* Desktop Nav Items - Hidden on mobile */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              to="/buildings"
              className="px-3 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              Buildings
            </Link>

            <Link
              to="/defects"
              className="px-3 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              Defects
            </Link>

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

        {/* Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 px-2 sm:px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
            aria-label="User menu"
            aria-expanded={showDropdown}
            aria-haspopup="true"
          >
            <UserCircle className="w-6 h-6" aria-hidden="true" />
            <span className="hidden sm:inline text-sm">{currentUser.name}</span>
            <ChevronDown className="w-4 h-4" aria-hidden="true" />
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg py-1 z-50 border-2 border-gray-700/60">
              <div className="px-4 py-2 text-sm text-gray-700 border-b-2 border-gray-200">
                <div className="font-medium">{currentUser.name}</div>
                <div className="text-xs text-gray-500">{currentUser.email}</div>
                <div className="text-xs text-gray-500 capitalize">
                  {currentUser.role.replace("_", " ")}
                </div>
              </div>
              <button
                onClick={async () => {
                  setShowDropdown(false);
                  try {
                    await authAPI.logout();
                  } catch (error) {
                    console.error("Logout error:", error);
                  } finally {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    if (onLogout) onLogout();
                    navigate("/login");
                  }
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-400"
              >
                <LogOut className="w-4 h-4" aria-hidden="true" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
