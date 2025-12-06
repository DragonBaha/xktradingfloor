import axios from "axios";

const inferDefaultBaseUrl = () => {
  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "localhost";
  // Default to port 3000 to match backend configuration (backend runs on port 3000 by default)
  const fallbackPort =
    import.meta.env.VITE_BACKEND_PORT || process.env.VITE_BACKEND_PORT || 3000;
  return `http://${hostname}:${fallbackPort}/api`;
};

const baseUrl =
  (import.meta.env.VITE_API_BASE_URL &&
    import.meta.env.VITE_API_BASE_URL.replace(/\/$/, "")) ||
  inferDefaultBaseUrl();

// Axios instance for future backend integration
const api = axios.create({
  baseURL: baseUrl,
  withCredentials: true,
});

// Request interceptor to inject JWT token from cookies or user data
api.interceptors.request.use((config) => {
  // Try to get token from user cookie (set after login)
  try {
    if (typeof window !== "undefined") {
      const userCookie = document.cookie
        .split("; ")
        .find((row) => row.startsWith("xktf_user="));
      if (userCookie) {
        const userString = decodeURIComponent(
          userCookie.split("=").slice(1).join("=")
        );
        const user = JSON.parse(userString);
        if (user?.token) {
          config.headers.Authorization = `Bearer ${user.token}`;
        }
      }
    }
  } catch (error) {
    // Silently fail - token might not be available yet
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    // List of endpoints that may not exist yet (expected 404s - suppress errors)
    const expected404Endpoints = [
      "/settings/mock-mode",
      "/admin/settings/mock-mode",
    ];

    // List of admin endpoints that return 403 for non-admin users (expected - suppress errors)
    const expected403Endpoints = [
      "/admin/blogs/getallblogs",
      "/admin/company/getallcompanies",
    ];

    const isExpected404 =
      err.response?.status === 404 &&
      expected404Endpoints.some(
        (endpoint) =>
          err.config?.url?.includes(endpoint) ||
          err.config?.url?.endsWith(endpoint)
      );

    const isExpected403 =
      err.response?.status === 403 &&
      expected403Endpoints.some(
        (endpoint) =>
          err.config?.url?.includes(endpoint) ||
          err.config?.url?.endsWith(endpoint)
      );

    // Suppress console errors for:
    // 1. Connection refused (expected when backend is down)
    // 2. Expected 404s (endpoints not implemented yet)
    // 3. Expected 403s (non-admin users accessing admin endpoints)
    // 4. 401 auth errors (expected for unauthenticated users)
    if (
      err.code === "ERR_NETWORK" ||
      err.message?.includes("ERR_CONNECTION_REFUSED") ||
      err.code === "ECONNREFUSED" ||
      isExpected404 ||
      isExpected403 ||
      err.response?.status === 401
    ) {
      // Don't log these errors to console - they're expected
      // The error will still be passed to the component for fallback handling
      // Silently handle - no console spam
    } else {
      // Log other errors normally in development
      if (import.meta.env.MODE === "development") {
        console.error("API Error:", err);
      }
    }
    // if (err.response?.status === 401) { /* handle logout or refresh */ }
    return Promise.reject(err);
  }
);

export default api;
