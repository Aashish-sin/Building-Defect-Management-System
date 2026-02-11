import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";
import { PasswordInput } from "./ui/PasswordInput";
import { Alert } from "./ui/Alert";
import { useToast } from "./ui/Toast";

export function Auth({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("csr");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        const response = await authAPI.login(email, password);
        const { token, user } = response.data;

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        onLogin(user);
        navigate("/dashboard");
      } else {
        const signupResponse = await authAPI.signup({
          name,
          email,
          password,
          role,
        });

        const { token, user } = signupResponse.data;
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        onLogin(user);
        showSuccess(`Account created successfully! Welcome, ${user.name}!`);
        navigate("/dashboard");
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "An error occurred. Please try again.";
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center wf-app bg-gradient-to-br from-sky-200 via-sky-100 to-white px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl">
        <div className="mb-12">
          <h1 className="text-center text-5xl font-bold text-gray-900">
            {isLogin
              ? "Welcome to Building Defect Management System"
              : "Create your account"}
          </h1>
        </div>
        <div className="max-w-md mx-auto space-y-8 wf-panel p-6 sm:p-8 bg-white shadow-xl rounded-2xl">
          <div>
            <p className="mt-8 text-center text-lg text-gray-600">
              {isLogin ? "Sign in" : "Get started with BDMS"}
            </p>
          </div>

          <form className="mt-8" onSubmit={handleSubmit}>
            <div className="space-y-8">
              <div className="space-y-4">
                {!isLogin && (
                  <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 justify-center">
                    <label
                      htmlFor="name"
                      className="text-lg font-medium text-gray-700 sm:min-w-fit"
                    >
                      Full Name :
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      required
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full sm:w-72 px-3 py-2 border border-gray-300 rounded-md text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
              </div>

              {isLogin ? (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 justify-center">
                    <label
                      htmlFor="email-address"
                      className="text-lg font-medium text-gray-700 sm:min-w-fit whitespace-nowrap"
                    >
                      Email Address :
                    </label>
                    <input
                      id="email-address"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full sm:w-72 px-3 py-2 border border-gray-300 rounded-md text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 justify-center">
                    <label
                      htmlFor="password"
                      className="text-lg font-medium text-gray-700 sm:min-w-fit whitespace-nowrap"
                    >
                      Password :
                    </label>
                    <div className="w-full sm:w-72">
                      <PasswordInput
                        id="password"
                        name="password"
                        autoComplete="current-password"
                        required
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        togglePosition="outside"
                        className="text-lg border border-gray-300 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 justify-center">
                      <label
                        htmlFor="email-address"
                        className="text-lg font-medium text-gray-700 sm:min-w-fit whitespace-nowrap"
                      >
                        Email :
                      </label>
                      <input
                        id="email-address"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full sm:w-72 px-3 py-2 border border-gray-300 rounded-md text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 justify-center">
                      <label
                        htmlFor="password"
                        className="text-lg font-medium text-gray-700 sm:min-w-fit whitespace-nowrap"
                      >
                        Password :
                      </label>
                      <div className="w-full sm:w-72">
                        <PasswordInput
                          id="password"
                          name="password"
                          autoComplete="new-password"
                          required
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          togglePosition="outside"
                          className="text-lg border border-gray-300 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 justify-center">
                    <label
                      htmlFor="role"
                      className="text-lg font-medium text-gray-700 sm:min-w-fit whitespace-nowrap"
                    >
                      Role :
                    </label>
                    <select
                      id="role"
                      name="role"
                      required
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full sm:w-72 px-3 py-2 border border-gray-300 rounded-md text-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="csr">CSR</option>
                      <option value="building_executive">
                        Building Executive
                      </option>
                      <option value="technician">Technician</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </>
              )}

              {error && (
                <Alert
                  type="error"
                  message={error}
                  dismissible
                  onClose={() => setError("")}
                />
              )}
            </div>

            <div className="flex justify-center mt-8">
              <button
                type="submit"
                disabled={loading}
                className="px-20 py-3 bg-sky-400 hover:bg-sky-500 text-white font-semibold text-xl rounded-lg border-2 border-sky-500 transition-all focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                {isLogin ? "Sign in" : "Sign up"}
              </button>
            </div>
          </form>

          <div className="flex justify-center">
            <button
              type="button"
              className="text-lg text-gray-700 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 rounded px-2 py-1"
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
              }}
            >
              {isLogin
                ? "Don't have an account? "
                : "Already have an account? "}
              <span className="inline-flex items-center px-6 py-3 bg-red-100 hover:bg-red-200 text-gray-900 font-semibold text-xl rounded-lg border-2 border-red-200 transition-all">
                {isLogin ? "Sign up" : "Sign in"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
