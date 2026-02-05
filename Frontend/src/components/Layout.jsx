import { Outlet } from "react-router-dom";
import { TopNav } from "./TopNav";
import { Sidebar } from "./Sidebar";

export function Layout({ currentUser, onLogout }) {
  return (
    <div className="min-h-screen wf-app">
      {/* Skip to content link for accessibility */}
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>

      <TopNav currentUser={currentUser} onLogout={onLogout} />
      <Sidebar currentUser={currentUser} />
      <main
        id="main-content"
        tabIndex="-1"
        className="pt-16 md:pl-64 transition-all duration-300"
      >
        <div className="p-4 sm:p-6 lg:p-8 mx-auto max-w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
