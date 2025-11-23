import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { syncUserFromCookie } from '../redux/slices/authSlice.js';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import Home from '../pages/Home.jsx';
import Academy from '../pages/Academy.jsx';
import EventDetails from '../pages/EventDetails.jsx';
import Blog from '../pages/Blog.jsx';
import BlogPost from '../pages/BlogPost.jsx';
import Reviews from '../pages/Reviews.jsx';
import CompanyDetails from '../pages/CompanyDetails.jsx';
import Merch from '../pages/Merch.jsx';
import ProductDetails from '../pages/ProductDetails.jsx';
import Signup from '../pages/Signup.jsx';
import Login from '../pages/Login.jsx';
import About from '../pages/About.jsx';
import Contact from '../pages/Contact.jsx';
import AdminDashboard from '../pages/AdminDashboard.jsx';
import Dashboard from '../pages/Dashboard.jsx';
import Profile from '../pages/Profile.jsx';
import OperatorDashboard from '../pages/OperatorDashboard.jsx';
import CompanyForm from '../pages/CompanyForm.jsx';
import ProtectedRoute from '../components/dashboard/ProtectedRoute.jsx';

function Layout({ children }) {
  const dispatch = useDispatch();

  // Sync user from cookie on mount for cross-tab persistence
  React.useEffect(() => {
    dispatch(syncUserFromCookie());
  }, [dispatch]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1 pt-20 bg-background text-foreground">
        {children}
      </main>
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
        <Route path="/reviews/operator" element={<ProtectedRoute><OperatorDashboard /></ProtectedRoute>} />
        <Route path="/reviews/company/new" element={<ProtectedRoute><CompanyForm /></ProtectedRoute>} />
        <Route path="/reviews/company/edit/:companyId" element={<ProtectedRoute><CompanyForm /></ProtectedRoute>} />
        <Route path="/reviews/:companyId" element={<CompanyDetails />} />
        <Route path="/merch" element={<Merch />} />
        <Route path="/merch/:productId" element={<ProductDetails />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}


