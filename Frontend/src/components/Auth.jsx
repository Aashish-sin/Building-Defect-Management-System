import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";
import { Input } from "./ui/Input";
import { PasswordInput } from "./ui/PasswordInput";
import { Select } from "./ui/Select";
import { Button } from "./ui/Button";
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
        showSuccess(`Welcome back, ${user.name}!`);
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
    <div className="min-h-screen flex items-center justify-center wf-app py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 wf-panel p-6 sm:p-8">
        <div>
          <h1 className="text-center text-3xl font-bold text-gray-900">
            {isLogin ? "Sign in to your account" : "Create your account"}
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600">
            {isLogin ? "Welcome back!" : "Get started with DefectTrack"}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {!isLogin && (
              <>
                <Input
                  label="Full Name"
                  id="name"
                  name="name"
                  type="text"
                  required
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                />

                <Select
                  label="Role"
                  id="role"
                  name="role"
                  required
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="csr">CSR</option>
                  <option value="building_executive">Building Executive</option>
                  <option value="technician">Technician</option>
                  <option value="admin">Admin</option>
                </Select>
              </>
            )}

            <Input
              label="Email Address"
              id="email-address"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <PasswordInput
              label="Password"
              id="password"
              name="password"
              autoComplete={isLogin ? "current-password" : "new-password"}
              required
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div
              className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
              role="alert"
            >
              {error}
            </div>
          )}

          <div>
            <Button type="submit" loading={loading} className="w-full">
              {isLogin ? "Sign in" : "Sign up"}
            </Button>
          </div>
        </form>

        <div className="text-center">
          <button
            type="button"
            className="text-sm text-gray-700 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 rounded px-2 py-1"
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
            }}
          >
            {isLogin
              ? "Don't have an account? Sign up"
              : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}
