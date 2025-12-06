import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { login } from "../controllers/authController.js";
import { loginSuccess } from "../redux/slices/authSlice.js";

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form, setForm] = React.useState({ email: "", password: "" });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await login(form);
      if (res.data) {
        // Store user data with token in Redux and cookies
        // The backend sets httpOnly cookie 'token' automatically
        // We also store token in user cookie for Authorization header
        dispatch(loginSuccess(res.data));
        // Redirect based on user role (case-insensitive)
        const userRole = res.data.role?.toLowerCase();
        if (userRole === 'admin' || userRole === 'subadmin' || userRole === 'supervisor') {
          navigate("/admin/blogs");
        } else if (userRole === 'operator') {
          navigate("/operator/blogs");
        } else {
          navigate("/dashboard");
        }
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Invalid credentials. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-black min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <Helmet>
        <title>Login | XK Trading Floor</title>
        <meta
          name="description"
          content="Log in to your XK Trading Floor account to access your dashboard and trading resources."
        />
      </Helmet>

      {/* Background Effects */}
      {/* <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10" /> */}
      {/* <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" /> */}
      {/* <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-purple-500/20 blur-3xl" /> */}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Title Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome back</h1>
          <p className="text-gray-400">
            Sign in to continue your trading journey
          </p>
        </div>

        {/* Form Card */}
        <div className="card bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 shadow-2xl">
          <div className="card-body p-8">
            <form className="space-y-5" onSubmit={handleSubmit}>
              {/* Email Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    className="input pl-10 h-12 bg-gray-800/50 border-gray-700 focus:border-blue-500 focus:ring-blue-500/20"
                    placeholder="Enter your email"
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    className="input pl-10 h-12 bg-gray-800/50 border-gray-700 focus:border-blue-500 focus:ring-blue-500/20"
                    placeholder="Enter your password"
                    type="password"
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
                >
                  {error}
                </motion.div>
              )}

              {/* Submit Button */}
              <button
                className="btn btn-primary w-full h-12 rounded-lg font-semibold text-base bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/20 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Log in
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="px-2 bg-gray-900/80 text-gray-400">
                  New to XK?
                </span>
              </div>
            </div>

            {/* Sign Up Link */}
            <Link
              to="/signup"
              className="block w-full text-center py-3 rounded-lg border border-gray-700 bg-gray-800/50 hover:bg-gray-800 hover:border-gray-600 text-gray-300 hover:text-white transition-all duration-200 font-medium"
            >
              Create an account
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500 mt-6">
          By signing in, you agree to our{" "}
          <a href="#" className="text-blue-400 hover:text-blue-300">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="text-blue-400 hover:text-blue-300">
            Privacy Policy
          </a>
        </p>
      </motion.div>
    </div>
  );
}

export default Login;
