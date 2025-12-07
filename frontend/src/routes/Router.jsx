import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { syncUserFromCookie } from "../redux/slices/authSlice.js";
import {
  syncMockModeFromStorage,
  fetchMockMode,
} from "../redux/slices/mockSlice.js";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import Home from "../pages/Home.jsx";
import Academy from "../pages/Academy.jsx";
import EventDetails from "../pages/EventDetails.jsx";
import Blog from "../pages/Blog.jsx";
import BlogPost from "../pages/BlogPost.jsx";
import Reviews from "../pages/Reviews.jsx";
import CompanyDetails from "../pages/CompanyDetails.jsx";
import Merch from "../pages/Merch.jsx";
import ProductDetails from "../pages/ProductDetails.jsx";
import Signup from "../pages/Signup.jsx";
import Login from "../pages/Login.jsx";
import About from "../pages/About.jsx";
import Contact from "../pages/Contact.jsx";
import PrivacyPolicy from "../pages/PrivacyPolicy.jsx";
import Terms from "../pages/Terms.jsx";
import AdminDashboard from "../pages/AdminDashboard.jsx";
import Dashboard from "../pages/Dashboard.jsx";
import Profile from "../pages/Profile.jsx";
import OperatorDashboard from "../pages/OperatorDashboard.jsx";
import OperatorCompanyForm from "../pages/CompanyForm.jsx";
import AdminBlogs from "../pages/admin/AdminBlogs.jsx";
import AdminCompanies from "../pages/admin/AdminCompanies.jsx";
import AdminCompanyDetails from "../pages/admin/AdminCompanyDetails.jsx";
import AdminCompanyForm from "../components/admin/companies/CompanyForm.jsx";
import AboutEditor from "../pages/admin/AboutEditor.jsx";
import AdminSettings from "../pages/admin/AdminSettings.jsx";
import MyBlogs from "../pages/MyBlogs.jsx";
import OperatorBlogs from "../pages/operator/OperatorBlogs.jsx";
import OperatorReviews from "../pages/operator/OperatorReviews.jsx";
import { BlogForm } from "../components/admin/blog/index.js";
import ProtectedRoute from "../components/dashboard/ProtectedRoute.jsx";

function Layout({ children }) {
  const dispatch = useDispatch();

  // Sync user from cookie on mount for cross-tab persistence
  React.useEffect(() => {
    dispatch(syncUserFromCookie());
  }, [dispatch]);

  // Sync mock mode from backend globally (so admin changes affect all users across all browsers/devices)
  React.useEffect(() => {
    // Fetch from backend on mount (will fallback to localStorage if backend not available)
    dispatch(fetchMockMode());

    // Listen for storage changes (when admin changes mock mode in another tab - fallback)
    const handleStorageChange = (e) => {
      if (e.key === "xk_mock_mode") {
        dispatch(syncMockModeFromStorage());
      }
    };

    // Poll backend periodically to catch admin changes (every 30 seconds to reduce spam)
    // This will silently fail if backend endpoint doesn't exist yet
    const interval = setInterval(() => {
      dispatch(fetchMockMode());
    }, 30000); // Check every 30 seconds (reduced from 5 to avoid spam)

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, [dispatch]);

  return (
    <div className="min-h-screen flex flex-col bg-black text-foreground">
      <Header />
      <main className="flex-1 pt-20 bg-black text-foreground">{children}</main>
      <Footer />
    </div>
  );
}

// Replaced by dedicated component in components/dashboard/ProtectedRoute.jsx

export default function AppRouter() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/academy" element={<Academy />} />
        <Route path="/events/:eventId" element={<EventDetails />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:id" element={<BlogPost />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/reviews/broker" element={<Reviews />} />
        <Route path="/reviews/propfirm" element={<Reviews />} />
        <Route path="/reviews/crypto" element={<Reviews />} />
        <Route
          path="/reviews/operator"
          element={
            <ProtectedRoute>
              <OperatorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reviews/company/new"
          element={
            <ProtectedRoute>
              <OperatorCompanyForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reviews/company/edit/:companyId"
          element={
            <ProtectedRoute>
              <OperatorCompanyForm />
            </ProtectedRoute>
          }
        />
        <Route path="/reviews/:companyId" element={<CompanyDetails />} />
        <Route path="/merch" element={<Merch />} />
        <Route path="/merch/:productId" element={<ProductDetails />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<Terms />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        {/* Admin Blog Routes */}
        <Route
          path="/admin/blogs"
          element={
            <ProtectedRoute role="admin">
              <AdminBlogs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/blogs/create"
          element={
            <ProtectedRoute role="admin">
              <BlogForm redirectPath="/admin/blogs" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/blogs/edit/:blogId"
          element={
            <ProtectedRoute role="admin">
              <BlogForm redirectPath="/admin/blogs" />
            </ProtectedRoute>
          }
        />

        {/* Admin Company Routes */}
        <Route
          path="/admin/companies"
          element={
            <ProtectedRoute role="admin">
              <AdminCompanies />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/companies/create"
          element={
            <ProtectedRoute role="admin">
              <AdminCompanyForm redirectPath="/admin/companies" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/companies/edit/:companyId"
          element={
            <ProtectedRoute role="admin">
              <AdminCompanyForm redirectPath="/admin/companies" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/companies/:companyId"
          element={
            <ProtectedRoute role="admin">
              <AdminCompanyDetails />
            </ProtectedRoute>
          }
        />

        {/* Admin About Editor Route */}
        <Route
          path="/admin/about/edit"
          element={
            <ProtectedRoute role="admin">
              <AboutEditor />
            </ProtectedRoute>
          }
        />

        {/* Admin Settings Route */}
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute role="admin">
              <AdminSettings />
            </ProtectedRoute>
          }
        />

        {/* User Blog Routes */}
        <Route
          path="/blogs/my-blogs"
          element={
            <ProtectedRoute>
              <MyBlogs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/blogs/create"
          element={
            <ProtectedRoute>
              <BlogForm redirectPath="/blogs/my-blogs" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/blogs/edit/:blogId"
          element={
            <ProtectedRoute>
              <BlogForm redirectPath="/blogs/my-blogs" />
            </ProtectedRoute>
          }
        />

        {/* Operator Blog Routes */}
        <Route
          path="/operator/blogs"
          element={
            <ProtectedRoute>
              <OperatorBlogs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/operator/blogs/create"
          element={
            <ProtectedRoute>
              <BlogForm redirectPath="/operator/blogs" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/operator/blogs/edit/:blogId"
          element={
            <ProtectedRoute>
              <BlogForm redirectPath="/operator/blogs" />
            </ProtectedRoute>
          }
        />

        {/* Operator Review Routes */}
        <Route
          path="/operator/reviews"
          element={
            <ProtectedRoute>
              <OperatorReviews />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
