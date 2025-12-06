import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import store from "./redux/store.js";
import "./index.css";
import { HelmetProvider } from "react-helmet-async";

// Get base path from environment variables
// VITE_BASE_PATH is set via environment variable during build
// BASE_URL is automatically set by Vite based on the base config
// Default to "/" for localhost development
const basePath =
  import.meta.env.VITE_BASE_PATH || import.meta.env.BASE_URL || "/";

// Update favicon links dynamically based on base path
// This ensures favicons work correctly across all deployment environments
const updateFaviconLinks = () => {
  const faviconPath =
    basePath + (basePath.endsWith("/") ? "" : "/") + "assets/favicon.png";
  ["favicon-32", "favicon-96", "favicon-192", "apple-touch-icon"].forEach(
    (id) => {
      const link = document.getElementById(id);
      if (link) {
        link.href = faviconPath;
        if (link.type) link.type = "image/png";
        // Update sizes for larger favicons (4x increase)
        if (id === "favicon-32") link.sizes = "256x256";
        if (id === "favicon-96") link.sizes = "512x512";
        if (id === "favicon-192") link.sizes = "1024x1024";
        if (id === "apple-touch-icon") link.sizes = "720x720";
      }
    }
  );
};

// Update favicon links immediately
updateFaviconLinks();

// GitHub Pages 404 fix: Restore original path if redirected from 404.html
const storedPath = sessionStorage.getItem("github-404-redirect");
if (storedPath && storedPath !== window.location.pathname) {
  // Remove the stored path
  sessionStorage.removeItem("github-404-redirect");
  // Restore the original path using history.replaceState
  // This preserves the path for React Router without reloading
  window.history.replaceState(
    null,
    "",
    storedPath + window.location.search + window.location.hash
  );
}

const root = createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <HelmetProvider>
        <BrowserRouter basename={basePath}>
          <App />
        </BrowserRouter>
      </HelmetProvider>
    </Provider>
  </React.StrictMode>
);
