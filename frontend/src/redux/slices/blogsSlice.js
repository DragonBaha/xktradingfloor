import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../controllers/api.js";
import { getUserCookie } from "../../utils/cookies.js";

// Helper to get auth token from cookies
function getAuthToken() {
  // Token can be in:
  // 1. User cookie (set after login) - for Authorization header
  // 2. httpOnly cookie 'token' (set by backend) - sent automatically with withCredentials
  const user = getUserCookie();
  if (user?.token) {
    return user.token;
  }
  // Try to get from cookie string as fallback
  if (typeof window !== "undefined") {
    try {
      const userCookie = document.cookie
        .split("; ")
        .find((row) => row.startsWith("xktf_user="));
      if (userCookie) {
        const userString = decodeURIComponent(
          userCookie.split("=").slice(1).join("=")
        );
        const parsedUser = JSON.parse(userString);
        return parsedUser?.token || null;
      }
    } catch (error) {
      // Silently fail
    }
  }
  return null;
}

// Async thunks
export const fetchAllBlogs = createAsyncThunk(
  "blogs/fetchAll",
  async (
    { page = 1, size = 10, search = "", status = "" } = {},
    { rejectWithValue }
  ) => {
    try {
      const token = getAuthToken();
      const config = {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        params: { page, size, search, ...(status && { status }) },
      };

      // Backend route: GET /api/admin/blogs/getallblogs
      // Note: Backend controller reads status from req.body (line 66), but GET requests
      // don't typically have bodies. Frontend sends status in query params.
      // Backend should be updated to read from req.query.status for consistency.
      const response = await api.get("/admin/blogs/getallblogs", config);

      return response.data;
    } catch (error) {
      // Handle connection refused or network errors gracefully
      if (
        error.code === "ERR_NETWORK" ||
        error.message?.includes("ERR_CONNECTION_REFUSED") ||
        error.code === "ECONNREFUSED"
      ) {
        // Suppress console error for connection refused (expected when backend is down)
        if (import.meta.env.MODE !== "production") {
          console.info(
            "Backend connection unavailable - this is expected if backend is not running"
          );
        }
        return rejectWithValue(
          "Backend server is not running. Please start the backend server or contact support."
        );
      }
      if (error.response?.status === 401) {
        return rejectWithValue("Unauthorized. Please log in again.");
      }
      if (error.response?.status === 403) {
        return rejectWithValue("You don't have permission to view blogs.");
      }
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch blogs"
      );
    }
  }
);

export const fetchBlogById = createAsyncThunk(
  "blogs/fetchById",
  async (blogId, { rejectWithValue }) => {
    try {
      // Validate blogId
      if (!blogId || typeof blogId !== "string") {
        return rejectWithValue("Invalid blog ID");
      }

      const token = getAuthToken();
      const config = {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      };

      // Backend route: GET /api/admin/blogs/:blogid/getblogbyid
      // Ensure blogId is properly encoded in URL
      const encodedBlogId = encodeURIComponent(blogId);
      const response = await api.get(
        `/admin/blogs/${encodedBlogId}/getblogbyid`,
        config
      );

      // Backend returns: { success: true, data: {...} }
      return response.data?.data || response.data;
    } catch (error) {
      // Handle specific error cases
      if (error.response?.status === 404) {
        return rejectWithValue("Blog post not found");
      }
      if (error.response?.status === 401) {
        return rejectWithValue("Unauthorized. Please log in again.");
      }
      if (error.response?.status === 403) {
        return rejectWithValue("You don't have permission to view this blog.");
      }

      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch blog"
      );
    }
  }
);

export const createBlog = createAsyncThunk(
  "blogs/create",
  async (formData, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      };

      const response = await api.post("/admin/blogs/addblog", formData, config);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create blog"
      );
    }
  }
);

export const updateBlog = createAsyncThunk(
  "blogs/update",
  async ({ blogId, formData }, { rejectWithValue }) => {
    try {
      // Validate blogId
      if (!blogId || typeof blogId !== "string") {
        return rejectWithValue("Invalid blog ID");
      }

      // Validate formData
      if (!formData) {
        return rejectWithValue("No data provided to update");
      }

      const token = getAuthToken();
      if (!token) {
        return rejectWithValue("Authentication required. Please log in.");
      }

      // Determine Content-Type based on formData type
      // If formData is FormData instance, let axios set it automatically (includes boundary)
      // If formData is a plain object, use application/json
      const isFormData = formData instanceof FormData;
      const config = {
        headers: {
          // Don't set Content-Type for FormData - let axios set it with boundary
          ...(isFormData ? {} : { "Content-Type": "application/json" }),
          Authorization: `Bearer ${token}`,
        },
      };

      // Backend route: PUT /api/admin/blogs/:blogid/updateblog
      // Ensure blogId is properly encoded in URL
      const encodedBlogId = encodeURIComponent(blogId);
      const response = await api.put(
        `/admin/blogs/${encodedBlogId}/updateblog`,
        formData,
        config
      );

      // Backend returns: { success: true, message: "...", data: {...} }
      return response.data?.data || response.data;
    } catch (error) {
      // Handle specific error cases
      if (error.response?.status === 404) {
        return rejectWithValue("Blog post not found");
      }
      if (error.response?.status === 401) {
        return rejectWithValue("Unauthorized. Please log in again.");
      }
      if (error.response?.status === 403) {
        return rejectWithValue(
          "You don't have permission to update this blog."
        );
      }
      if (error.response?.status === 400) {
        return rejectWithValue(
          error.response?.data?.message || "Invalid data provided"
        );
      }

      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to update blog"
      );
    }
  }
);

export const deleteBlog = createAsyncThunk(
  "blogs/delete",
  async (blogId, { rejectWithValue }) => {
    try {
      // Validate blogId
      if (!blogId || typeof blogId !== "string") {
        return rejectWithValue("Invalid blog ID");
      }

      const token = getAuthToken();
      if (!token) {
        return rejectWithValue("Authentication required. Please log in.");
      }

      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };

      // Backend route: DELETE /api/admin/blogs/:blogid/deleteblog
      // Ensure blogId is properly encoded in URL
      const encodedBlogId = encodeURIComponent(blogId);
      const response = await api.delete(
        `/admin/blogs/${encodedBlogId}/deleteblog`,
        config
      );

      // Backend returns: { success: true, message: "Blog post deleted successfully" }
      return { blogId, data: response.data };
    } catch (error) {
      // Handle specific error cases
      if (error.response?.status === 404) {
        return rejectWithValue("Blog post not found");
      }
      if (error.response?.status === 401) {
        return rejectWithValue("Unauthorized. Please log in again.");
      }
      if (error.response?.status === 403) {
        return rejectWithValue(
          "You don't have permission to delete this blog."
        );
      }

      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to delete blog"
      );
    }
  }
);

export const permanentDeleteBlog = createAsyncThunk(
  "blogs/permanentDelete",
  async (blogId, { rejectWithValue }) => {
    try {
      // Validate blogId
      if (!blogId || typeof blogId !== "string") {
        return rejectWithValue("Invalid blog ID");
      }

      const token = getAuthToken();
      if (!token) {
        return rejectWithValue("Authentication required. Please log in.");
      }

      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };

      // Backend route: DELETE /api/admin/blogs/:blogid/permanentdeleteblog
      const encodedBlogId = encodeURIComponent(blogId);
      const response = await api.delete(
        `/admin/blogs/${encodedBlogId}/permanentdeleteblog`,
        config
      );

      // Backend returns: { success: true, message: "Blog post permanently deleted" }
      return { blogId, data: response.data };
    } catch (error) {
      // Handle specific error cases
      if (error.response?.status === 404) {
        return rejectWithValue("Blog post not found");
      }
      if (error.response?.status === 401) {
        return rejectWithValue("Unauthorized. Please log in again.");
      }
      if (error.response?.status === 403) {
        return rejectWithValue(
          "You don't have permission to permanently delete this blog."
        );
      }

      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to permanently delete blog"
      );
    }
  }
);

export const fetchUserBlogs = createAsyncThunk(
  "blogs/fetchUserBlogs",
  async (
    { userId, page = 1, size = 10, search = "", status = "" } = {},
    { rejectWithValue }
  ) => {
    try {
      const token = getAuthToken();
      const config = {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        params: { page, size, search, userId },
      };

      // Using admin endpoint with userId filter
      const response = await api.get("/admin/blogs/getallblogs", {
        ...config,
        params: { ...config.params, ...(status && { status }), userId },
      });

      // Filter blogs by userId on frontend if backend doesn't support it
      let blogs = response.data.data || response.data.blogs || [];
      if (userId) {
        blogs = blogs.filter(
          (blog) => blog.author?._id === userId || blog.author === userId
        );
      }

      return { ...response.data, data: blogs, blogs };
    } catch (error) {
      // Handle connection refused or network errors gracefully
      if (
        error.code === "ERR_NETWORK" ||
        error.message?.includes("ERR_CONNECTION_REFUSED") ||
        error.code === "ECONNREFUSED"
      ) {
        // Suppress console error for connection refused (expected when backend is down)
        if (import.meta.env.MODE !== "production") {
          console.info(
            "Backend connection unavailable - this is expected if backend is not running"
          );
        }
        return rejectWithValue(
          "Backend server is not running. Please start the backend server or contact support."
        );
      }
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch user blogs"
      );
    }
  }
);

export const fetchOperatorBlogs = createAsyncThunk(
  "blogs/fetchOperatorBlogs",
  async (
    { operatorId, page = 1, size = 10, search = "", status = "" } = {},
    { rejectWithValue }
  ) => {
    try {
      const token = getAuthToken();
      const config = {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        params: { page, size, search },
      };

      // Fetch all blogs for operators (they can see all but only edit/delete their own)
      const response = await api.get("/admin/blogs/getallblogs", {
        ...config,
        params: { ...config.params, ...(status && { status }) },
      });

      return response.data;
    } catch (error) {
      // Handle connection refused or network errors gracefully
      if (
        error.code === "ERR_NETWORK" ||
        error.message?.includes("ERR_CONNECTION_REFUSED") ||
        error.code === "ECONNREFUSED"
      ) {
        // Suppress console error for connection refused (expected when backend is down)
        if (import.meta.env.MODE !== "production") {
          console.info(
            "Backend connection unavailable - this is expected if backend is not running"
          );
        }
        return rejectWithValue(
          "Backend server is not running. Please start the backend server or contact support."
        );
      }
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch operator blogs"
      );
    }
  }
);

export const fetchPublishedBlogs = createAsyncThunk(
  "blogs/fetchPublished",
  async (
    {
      page = 1,
      limit = 100,
      category = "",
      tag = "",
      search = "",
      featured = "",
    } = {},
    { rejectWithValue }
  ) => {
    // Helper to check if user is authenticated
    const token = getAuthToken();
    const isAuthenticated = !!token;

    // Try public endpoint first (works for everyone)
    try {
      const publicConfig = {
        params: { page, limit, category, tag, search, featured },
      };
      const publicResponse = await api.get("/public/blogs", publicConfig);

      if (
        publicResponse.data?.data &&
        Array.isArray(publicResponse.data.data)
      ) {
        return {
          data: publicResponse.data.data,
          pagination: publicResponse.data?.pagination || {
            page: 1,
            totalPages: 1,
            totalItems: publicResponse.data.data.length,
          },
        };
      }
    } catch (publicError) {
      // If public endpoint fails and user is not authenticated, return empty array
      // Don't try admin endpoint for unauthenticated users (will always fail with 403)
      if (!isAuthenticated) {
        return {
          data: [],
          pagination: { page: 1, totalPages: 1, totalItems: 0 },
        };
      }
      // For authenticated users, continue to try admin endpoint as fallback
    }

    // Fallback to admin endpoint (only for authenticated users)
    if (isAuthenticated) {
      try {
        const config = {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          params: { page, size: limit, search, status: "published" },
        };

        // Use admin endpoint with published status filter
        // Backend route: GET /admin/blogs/getallblogs
        const response = await api.get("/admin/blogs/getallblogs", config);

        // Handle different response structures
        let blogs = [];
        if (response.data?.success && response.data?.data?.docs) {
          blogs = response.data.data.docs;
        } else if (Array.isArray(response.data?.data)) {
          blogs = response.data.data;
        } else if (Array.isArray(response.data?.blogs)) {
          blogs = response.data.blogs;
        } else if (Array.isArray(response.data)) {
          blogs = response.data;
        }

        // Filter to only published blogs
        blogs = blogs.filter(
          (blog) => blog.status === "published" || blog.status === "Published"
        );

        // Filter by category, tag, and featured on frontend if backend doesn't support it
        if (category) {
          blogs = blogs.filter((blog) => {
            const blogCategories = Array.isArray(blog.categories)
              ? blog.categories
              : [blog.categories || blog.category].filter(Boolean);
            return blogCategories.some((cat) => cat === category);
          });
        }

        if (tag) {
          blogs = blogs.filter((blog) => {
            const blogTags = Array.isArray(blog.tags) ? blog.tags : [];
            return blogTags.some((t) => t.toLowerCase() === tag.toLowerCase());
          });
        }

        if (featured === "true" || featured === true) {
          blogs = blogs.filter((blog) => blog.isFeatured === true);
        }

        return {
          data: blogs,
          pagination: response.data?.pagination ||
            response.data?.data?.pagination || {
              page: 1,
              totalPages: 1,
              totalItems: blogs.length,
            },
        };
      } catch (error) {
        // Handle connection refused gracefully
        if (
          error.code === "ERR_NETWORK" ||
          error.message?.includes("ERR_CONNECTION_REFUSED") ||
          error.code === "ECONNREFUSED"
        ) {
          // Return empty array instead of rejecting - allows page to render
          return {
            data: [],
            pagination: { page: 1, totalPages: 1, totalItems: 0 },
          };
        }
        // If 404, 401, or 403 (endpoint doesn't exist or user not authorized), return empty array
        // This is expected behavior for non-admin users when public endpoints don't exist
        if (
          error.response?.status === 404 ||
          error.response?.status === 401 ||
          error.response?.status === 403
        ) {
          // Silently return empty array - this is expected for non-admin users
          return {
            data: [],
            pagination: { page: 1, totalPages: 1, totalItems: 0 },
          };
        }
        // For other errors, also return empty array to prevent page breakage
        return {
          data: [],
          pagination: { page: 1, totalPages: 1, totalItems: 0 },
        };
      }
    }

    // If we get here and user is not authenticated, return empty array
    return { data: [], pagination: { page: 1, totalPages: 1, totalItems: 0 } };
  }
);

export const flagBlog = createAsyncThunk(
  "blogs/flag",
  async ({ blogId, flagType, reason, description }, { rejectWithValue }) => {
    try {
      // Validate blogId
      if (!blogId || typeof blogId !== "string") {
        return rejectWithValue("Invalid blog ID");
      }

      const token = getAuthToken();
      if (!token) {
        return rejectWithValue("Authentication required. Please log in.");
      }

      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };

      // Map frontend flag types to backend format
      const flagReasonMap = {
        spam: "Spam",
        inappropriate: "Inappropriate Content",
        misinformation: "Misinformation",
        duplicate: "Duplicate Content",
        other: "Other",
      };

      const backendReason =
        flagReasonMap[flagType] || flagReasonMap[reason] || "Other";

      // Backend route: PUT /api/admin/blogs/:blogid/updateblog
      // Use update endpoint with flagReason field
      const encodedBlogId = encodeURIComponent(blogId);
      const response = await api.put(
        `/admin/blogs/${encodedBlogId}/updateblog`,
        {
          flagReason: backendReason,
          flagAdditionalDetails: description || "",
        },
        config
      );

      // Backend returns: { success: true, message: "...", data: {...} }
      return { blogId, data: response.data?.data || response.data };
    } catch (error) {
      // Handle specific error cases
      if (error.response?.status === 404) {
        return rejectWithValue("Blog post not found");
      }
      if (error.response?.status === 401) {
        return rejectWithValue("Unauthorized. Please log in again.");
      }
      if (error.response?.status === 403) {
        return rejectWithValue("You don't have permission to flag this blog.");
      }
      if (error.response?.status === 400) {
        return rejectWithValue(
          error.response?.data?.message || "Invalid flag reason provided"
        );
      }

      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to flag blog"
      );
    }
  }
);

export const unflagBlog = createAsyncThunk(
  "blogs/unflag",
  async (blogId, { rejectWithValue }) => {
    try {
      // Validate blogId
      if (!blogId || typeof blogId !== "string") {
        return rejectWithValue("Invalid blog ID");
      }

      const token = getAuthToken();
      if (!token) {
        return rejectWithValue("Authentication required. Please log in.");
      }

      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };

      // Backend route: PUT /api/admin/blogs/:blogid/updateblog
      // Unflag by setting flagReason to null
      const encodedBlogId = encodeURIComponent(blogId);
      const response = await api.put(
        `/admin/blogs/${encodedBlogId}/updateblog`,
        {
          flagReason: null,
          flagAdditionalDetails: null,
        },
        config
      );

      // Backend returns: { success: true, message: "...", data: {...} }
      return { blogId, data: response.data?.data || response.data };
    } catch (error) {
      // Handle specific error cases
      if (error.response?.status === 404) {
        return rejectWithValue("Blog post not found");
      }
      if (error.response?.status === 401) {
        return rejectWithValue("Unauthorized. Please log in again.");
      }
      if (error.response?.status === 403) {
        return rejectWithValue(
          "You don't have permission to unflag this blog."
        );
      }

      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to unflag blog"
      );
    }
  }
);

const blogsSlice = createSlice({
  name: "blogs",
  initialState: {
    blogs: [],
    currentBlog: null,
    loading: false,
    error: null,
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
    },
  },
  reducers: {
    clearError(state) {
      state.error = null;
    },
    clearCurrentBlog(state) {
      state.currentBlog = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all blogs
      .addCase(fetchAllBlogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllBlogs.fulfilled, (state, action) => {
        state.loading = false;
        // Backend returns: { success: true, data: [...], pagination: { totalItems, totalPages, currentPage, pageSize } }
        const payload = action.payload;
        if (payload.data && Array.isArray(payload.data)) {
          state.blogs = payload.data;
        } else if (Array.isArray(payload)) {
          state.blogs = payload;
        } else {
          state.blogs = [];
        }
        if (payload.pagination) {
          state.pagination = {
            currentPage: payload.pagination.currentPage || 1,
            totalPages: payload.pagination.totalPages || 1,
            totalItems: payload.pagination.totalItems || 0,
          };
        }
      })
      .addCase(fetchAllBlogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch blog by ID
      .addCase(fetchBlogById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBlogById.fulfilled, (state, action) => {
        state.loading = false;
        // Backend returns: { success: true, data: {...} }
        state.currentBlog = action.payload.data || action.payload;
      })
      .addCase(fetchBlogById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create blog
      .addCase(createBlog.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBlog.fulfilled, (state, action) => {
        state.loading = false;
        // Backend returns: { success: true, message: "...", data: {...} }
        const newBlog = action.payload.data || action.payload;
        if (newBlog) {
          state.blogs.unshift(newBlog);
        }
      })
      .addCase(createBlog.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update blog
      .addCase(updateBlog.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBlog.fulfilled, (state, action) => {
        state.loading = false;
        // Backend returns: { success: true, message: "...", data: {...} }
        const updatedBlog = action.payload.data || action.payload;
        if (updatedBlog) {
          const index = state.blogs.findIndex(
            (b) => b._id === updatedBlog._id || b.id === updatedBlog._id
          );
          if (index !== -1) {
            state.blogs[index] = updatedBlog;
          }
          if (
            state.currentBlog &&
            (state.currentBlog._id === updatedBlog._id ||
              state.currentBlog.id === updatedBlog._id)
          ) {
            state.currentBlog = updatedBlog;
          }
        }
      })
      .addCase(updateBlog.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete blog
      .addCase(deleteBlog.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBlog.fulfilled, (state, action) => {
        state.loading = false;
        // Backend returns: { success: true, message: "..." }
        const blogId = action.payload.blogId;
        state.blogs = state.blogs.filter(
          (b) => b._id !== blogId && b.id !== blogId
        );
        if (
          state.currentBlog &&
          (state.currentBlog._id === blogId || state.currentBlog.id === blogId)
        ) {
          state.currentBlog = null;
        }
      })
      .addCase(deleteBlog.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Permanent delete
      .addCase(permanentDeleteBlog.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(permanentDeleteBlog.fulfilled, (state, action) => {
        state.loading = false;
        // Remove blog from state completely
        const blogId = action.payload.blogId;
        state.blogs = state.blogs.filter((b) => (b._id || b.id) !== blogId);
        // Clear current blog if it was deleted
        if (
          state.currentBlog &&
          (state.currentBlog._id === blogId || state.currentBlog.id === blogId)
        ) {
          state.currentBlog = null;
        }
      })
      .addCase(permanentDeleteBlog.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch user blogs
      .addCase(fetchUserBlogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserBlogs.fulfilled, (state, action) => {
        state.loading = false;
        // Backend returns: { success: true, data: [...], pagination: { totalItems, totalPages, currentPage, pageSize } }
        const payload = action.payload;
        if (payload.data && Array.isArray(payload.data)) {
          state.blogs = payload.data;
        } else if (Array.isArray(payload)) {
          state.blogs = payload;
        } else {
          state.blogs = [];
        }
        if (payload.pagination) {
          state.pagination = {
            currentPage: payload.pagination.currentPage || 1,
            totalPages: payload.pagination.totalPages || 1,
            totalItems: payload.pagination.totalItems || 0,
          };
        }
      })
      .addCase(fetchUserBlogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch operator blogs
      .addCase(fetchOperatorBlogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOperatorBlogs.fulfilled, (state, action) => {
        state.loading = false;
        // Backend returns: { success: true, data: [...], pagination: { totalItems, totalPages, currentPage, pageSize } }
        const payload = action.payload;
        if (payload.data && Array.isArray(payload.data)) {
          state.blogs = payload.data;
        } else if (Array.isArray(payload)) {
          state.blogs = payload;
        } else {
          state.blogs = [];
        }
        if (payload.pagination) {
          state.pagination = {
            currentPage: payload.pagination.currentPage || 1,
            totalPages: payload.pagination.totalPages || 1,
            totalItems: payload.pagination.totalItems || 0,
          };
        }
      })
      .addCase(fetchOperatorBlogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch published blogs
      .addCase(fetchPublishedBlogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPublishedBlogs.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload;
        if (payload.data && Array.isArray(payload.data)) {
          state.blogs = payload.data;
        } else if (Array.isArray(payload)) {
          state.blogs = payload;
        } else {
          state.blogs = [];
        }
        if (payload.pagination) {
          state.pagination = {
            currentPage:
              payload.pagination.page || payload.pagination.currentPage || 1,
            totalPages:
              payload.pagination.pages || payload.pagination.totalPages || 1,
            totalItems:
              payload.pagination.total || payload.pagination.totalItems || 0,
          };
        }
      })
      .addCase(fetchPublishedBlogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        // Don't set blogs to empty on error - keep existing blogs
      })
      // Flag blog
      .addCase(flagBlog.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(flagBlog.fulfilled, (state, action) => {
        state.loading = false;
        const updatedBlog = action.payload.data?.data || action.payload.data;
        if (updatedBlog) {
          const index = state.blogs.findIndex(
            (b) => (b._id || b.id) === (updatedBlog._id || updatedBlog.id)
          );
          if (index !== -1) {
            state.blogs[index] = updatedBlog;
          }
        }
      })
      .addCase(flagBlog.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Unflag blog
      .addCase(unflagBlog.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(unflagBlog.fulfilled, (state, action) => {
        state.loading = false;
        const updatedBlog = action.payload.data?.data || action.payload.data;
        if (updatedBlog) {
          const index = state.blogs.findIndex(
            (b) => (b._id || b.id) === (updatedBlog._id || updatedBlog.id)
          );
          if (index !== -1) {
            state.blogs[index] = updatedBlog;
          }
        }
      })
      .addCase(unflagBlog.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearCurrentBlog } = blogsSlice.actions;
export default blogsSlice.reducer;
