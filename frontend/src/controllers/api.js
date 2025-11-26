import axios from 'axios';

// Axios instance for future backend integration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api',
  withCredentials: true,
});

// Dummy interceptor placeholders for JWT injection and error handling
api.interceptors.request.use((config) => {
  // const token = sessionStorage.getItem('xktf_token');
  // if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    // Suppress console errors for connection refused (expected when backend is down)
    if (
      err.code === "ERR_NETWORK" ||
      err.message?.includes("ERR_CONNECTION_REFUSED") ||
      err.code === "ECONNREFUSED"
    ) {
      // Don't log connection refused errors to console - they're expected when backend is down
      // The error will still be passed to the component for user-friendly display
      // Silently handle - no console spam
    } else {
      // Log other errors normally in development
      if (import.meta.env.MODE === 'development' && err.response?.status !== 401) {
        console.error('API Error:', err);
      }
    }
    // if (err.response?.status === 401) { /* handle logout or refresh */ }
    return Promise.reject(err);
  }
);

export default api;


