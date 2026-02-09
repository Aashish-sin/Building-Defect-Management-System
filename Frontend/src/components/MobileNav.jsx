import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Building2 } from "lucide-react";
import { LayoutDashboard, AlertTriangle, Users, BarChart3 } from "lucide-react";

export function MobileNav({ currentUser }) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const isAdmin = currentUser.role === "admin";

  const navItems = [
    {
      path: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      adminOnly: false,
    },
    {
      path: "/defects",
      label: "Defects",
      icon: AlertTriangle,
      adminOnly: false,
    },
    {
      path: "/buildings",
      label: "Buildings",
      icon: Building2,
      allowedRoles: ["admin", "building_executive", "csr"],
    },
    { path: "/users", label: "Users", icon: Users, adminOnly: true },
    {
      path: "/analytics",
      label: "Analytics",
      icon: BarChart3,
      adminOnly: true,
    },
  ];

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden p-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400"
        aria-label={isOpen ? "Close menu" : "Open menu"}
        aria-expanded={isOpen}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Menu Panel */}
      <nav
        className={`fixed top-16 left-0 bottom-0 z-50 w-64 bg-white border-r-2 border-gray-300 overflow-y-auto transition-transform duration-300 md:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Mobile navigation"
      >
        <div className="p-4 flex flex-wrap gap-2">
          {navItems.map((item) => {
            if (item.adminOnly && !isAdmin) return null;
            if (
              item.allowedRoles &&
              !item.allowedRoles.includes(currentUser.role)
            )
              return null;

            const Icon = item.icon;
            const isActive =
              location.pathname === item.path ||
              location.pathname.startsWith(item.path + "/");

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`inline-flex items-center gap-3 px-4 py-2 rounded-md border transition-colors ${
                  isActive
                    ? "bg-gray-100 text-gray-900 border-gray-800"
                    : "text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
                {item.adminOnly && (
                  <span className="ml-auto text-xs text-gray-400">Admin</span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
