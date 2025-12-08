import api from "./api.js";

// FORCE REAL DATA MODE - Mock functionality is hidden but code is kept for future use
// Set to false to always use real data from database
const FORCE_REAL_DATA_MODE = true;

// Helper to check if mock mode is enabled
// Backend endpoint: GET /api/settings/mock-mode (no /public prefix)
async function isMockModeEnabled() {
  // If force real data mode is enabled, always return false (use real data)
  if (FORCE_REAL_DATA_MODE) {
    return false;
  }

  // Try to fetch from backend first
  try {
    const response = await api.get("/settings/mock-mode");
    // Backend returns: { success: true, data: { enabled: boolean } }
    if (response?.data?.data?.enabled !== undefined) {
      const enabled = response.data.data.enabled;
      // Sync to localStorage for backward compatibility
      if (typeof window !== "undefined") {
        localStorage.setItem("xk_mock_mode", enabled.toString());
      }
      return enabled;
    }
  } catch (error) {
    // Backend not available or endpoint not implemented yet
    // Fall back to localStorage
  }

  // Fallback to localStorage
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("xk_mock_mode");
    return stored === "true";
  }
  return false;
}

// Get all blogs
// Backend endpoint: GET /api/admin/blogs/getallblogs (but reads status from body, so using GET with body)
// Query params: page, size, search
// Body: { status } (optional) - status must be in payload, not query params
// Note: Backend route is GET but controller reads status from req.body, Postman shows POST
// Using GET to match route definition, but sending body if status is provided
export async function getAllBlogs(filters = {}) {
  const mockMode = await isMockModeEnabled();
  let backendBlogs = [];

  // Always try to fetch from backend first
  try {
    const { page, size, search, status } = filters;

    // Backend uses GET but reads status from body - using POST to match Postman collection
    // which is the source of truth for API contract
    const requestBody = {};
    if (status) {
      requestBody.status = status;
    }

    const params = { page, size, search };
    // Using POST to match Postman collection (backend controller reads from req.body)
    const response = await api.post("/admin/blogs/getallblogs", requestBody, {
      params,
    });

    // Backend returns: { success: true, data: { docs: [...], totalItems, currentPage, totalPages } }
    if (response.data?.success && response.data?.data?.docs) {
      // Transform backend format to frontend format
      backendBlogs = response.data.data.docs.map((blog) => ({
        ...blog,
        id: blog._id || blog.id,
      }));
    } else if (Array.isArray(response.data?.data)) {
      backendBlogs = response.data.data.map((blog) => ({
        ...blog,
        id: blog._id || blog.id,
      }));
    }
  } catch (error) {
    // If backend fails and mock mode is OFF, return empty array (no data)
    if (!mockMode) {
      if (error.response?.status === 401) {
        // Unauthorized - user needs to login, but for public view, return empty
        return [];
      }
      return [];
    }
    // If mock mode is ON and backend fails, we'll fall back to mock data
  }

  // If mock mode is OFF, return only backend data
  if (!mockMode) {
    // Filter to show only published blogs for public view
    return backendBlogs.filter(
      (blog) => blog.status === "published" || blog.status === "Published"
    );
  }

  // If mock mode is ON, return ONLY mock data (no merging with backend)
  const { default: mockBlogs } = await import("../models/blogsData.js");
  const allMockBlogs = mockBlogs || [];

  return allMockBlogs;
}

// Get blog by ID
// Backend endpoint: GET /api/admin/blogs/:blogid/getblogbyid
export async function getBlogById(id) {
  const mockMode = await isMockModeEnabled();

  // Always try backend first
  try {
    const response = await api.get(`/admin/blogs/${id}/getblogbyid`);

    // Backend returns: { success: true, data: {...} }
    if (response.data?.success && response.data?.data) {
      const blog = response.data.data;
      return {
        ...blog,
        id: blog._id || blog.id,
      };
    }
    if (response.data?.data) {
      return response.data.data;
    }
  } catch (error) {
    // If backend fails and mock mode is OFF, return null (no data)
    if (!mockMode) {
      if (error.response?.status === 404) {
        return null;
      }
      // For other errors, return null for public view
      return null;
    }
    // If mock mode is ON and backend fails, fall back to mock data
  }

  // If mock mode is ON, try mock data
  if (mockMode) {
    const { default: blogs } = await import("../models/blogsData.js");
    return blogs.find((b) => b.id === parseInt(id) || b._id === id) || null;
  }

  return null;
}

// Get published blogs (public endpoint - no auth required)
// Backend endpoint: GET /api/blogs/getpublishedblogs
export async function getPublishedBlogs(filters = {}) {
  const mockMode = await isMockModeEnabled();
  let backendBlogs = [];

  // Always try to fetch from backend first
  try {
    const { page, size, search, category, tag, featured } = filters;

    const params = { page, size, search, category, tag, featured };
    const response = await api.get("/blogs/getpublishedblogs", { params });

    // Backend returns: { success: true, data: { docs: [...], totalItems, currentPage, totalPages } }
    if (response.data?.success && response.data?.data?.docs) {
      backendBlogs = response.data.data.docs.map((blog) => ({
        ...blog,
        id: blog._id || blog.id,
      }));
    } else if (Array.isArray(response.data?.data)) {
      backendBlogs = response.data.data.map((blog) => ({
        ...blog,
        id: blog._id || blog.id,
      }));
    }
  } catch (error) {
    // If backend fails and mock mode is OFF, return empty array
    if (!mockMode) {
      return [];
    }
    // If mock mode is ON and backend fails, we'll fall back to mock data
  }

  // If mock mode is OFF, return only backend data
  if (!mockMode) {
    return backendBlogs;
  }

  // If mock mode is ON, return ONLY mock data (no merging with backend)
  const { default: mockBlogs } = await import("../models/blogsData.js");
  const allMockBlogs = mockBlogs || [];

  // Filter to only published blogs in mock mode
  return allMockBlogs.filter(
    (blog) => blog.status === "published" || blog.status === "Published"
  );
}
