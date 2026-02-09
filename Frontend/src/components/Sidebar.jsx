import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  AlertTriangle,
  Building2,
  Users,
  BarChart3,
} from "lucide-react";

export function Sidebar({ currentUser }) {
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

  return (
    <aside className="hidden md:block fixed left-0 top-16 w-64 h-[calc(100vh-4rem)] bg-white border-r-2 border-gray-300 overflow-y-auto">
      <nav className="p-4 flex flex-wrap gap-2">
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
                  : "text-gray-700 border-gray-300 hover:bg-gray-50 hover:text-gray-900"
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
      </nav>
    </aside>
  );
}
