import { useState, useEffect, Suspense, lazy } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ToastProvider } from "./components/ui/Toast";

const Dashboard = lazy(() =>
  import("./components/Dashboard").then((m) => ({ default: m.Dashboard })),
);
const DefectList = lazy(() =>
  import("./components/DefectList").then((m) => ({ default: m.DefectList })),
);
const DefectDetail = lazy(() =>
  import("./components/DefectDetail").then((m) => ({
    default: m.DefectDetail,
  })),
);
const DefectForm = lazy(() =>
  import("./components/DefectForm").then((m) => ({ default: m.DefectForm })),
);
const Buildings = lazy(() =>
  import("./components/Buildings").then((m) => ({ default: m.Buildings })),
);
const Users = lazy(() =>
  import("./components/Users").then((m) => ({ default: m.Users })),
);
const Analytics = lazy(() =>
  import("./components/Analytics").then((m) => ({ default: m.Analytics })),
);
const Auth = lazy(() =>
  import("./components/Auth").then((m) => ({ default: m.Auth })),
);
const Layout = lazy(() =>
  import("./components/Layout").then((m) => ({ default: m.Layout })),
);

const PageFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-sm text-gray-600">Loading...</div>
  </div>
);

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (savedUser && token) {
      setCurrentUser(JSON.parse(savedUser));
    }
    setAuthChecked(true);
  }, []);

  const handleLogout = () => {
    setCurrentUser(null);
  };

  return (
    <ToastProvider>
      <Router>
        <Suspense fallback={<PageFallback />}>
          {!authChecked ? (
            <PageFallback />
          ) : (
            <Routes>
              <Route
                path="/login"
                element={
                  currentUser ? (
                    <Navigate to="/dashboard" replace />
                  ) : (
                    <Auth onLogin={setCurrentUser} />
                  )
                }
              />
              <Route
                element={
                  currentUser ? (
                    <Layout currentUser={currentUser} onLogout={handleLogout} />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              >
                <Route
                  path="/"
                  element={<Navigate to="/dashboard" replace />}
                />
                <Route
                  path="/dashboard"
                  element={<Dashboard currentUser={currentUser} />}
                />
                <Route
                  path="/defects"
                  element={<DefectList currentUser={currentUser} />}
                />
                <Route
                  path="/defects/new"
                  element={<DefectForm currentUser={currentUser} />}
                />
                <Route
                  path="/defects/:id"
                  element={<DefectDetail currentUser={currentUser} />}
                />
                <Route
                  path="/buildings"
                  element={<Buildings currentUser={currentUser} />}
                />
                <Route
                  path="/users"
                  element={<Users currentUser={currentUser} />}
                />
                <Route
                  path="/analytics"
                  element={<Analytics currentUser={currentUser} />}
                />
                <Route
                  path="*"
                  element={<Navigate to="/dashboard" replace />}
                />
              </Route>
            </Routes>
          )}
        </Suspense>
      </Router>
    </ToastProvider>
  );
}

export default App;
