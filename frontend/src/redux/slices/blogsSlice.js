import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../controllers/api.js";
import { getUserCookie } from "../../utils/cookies.js";

// Helper to get auth token from cookies
function getAuthToken() {
  // Token is stored in httpOnly cookie, backend will read it automatically
  // But some endpoints may need Authorization header
  const user = getUserCookie();
  return user?.token || null;
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
        params: { page, size, search },
      };

      // Backend expects status in body (non-standard for GET, but working with existing backend)
      // Using POST when status filter is provided, GET otherwise
      let response;
      if (status) {
        response = await api.post(
          "/admin/blogs/getallblogs",
          { status },
          config
        );
      } else {
        response = await api.get("/admin/blogs/getallblogs", config);
      }

      return response.data;
    } catch (error) {
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
      const token = getAuthToken();
      const config = {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      };

      const response = await api.get(`/admin/blogs/blogs/${blogId}`, config);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch blog"
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
      const token = getAuthToken();
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      };

      const response = await api.put(
        `/admin/blogs/blogs/${blogId}`,
        formData,
        config
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update blog"
      );
    }
  }
);

export const deleteBlog = createAsyncThunk(
  "blogs/delete",
  async (blogId, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      const config = {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      };

      const response = await api.delete(`/admin/blogs/blogs/${blogId}`, config);
      return { blogId, data: response.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete blog"
      );
    }
  }
);

export const permanentDeleteBlog = createAsyncThunk(
  "blogs/permanentDelete",
  async (blogId, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      const config = {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      };

      const response = await api.delete(
        `/admin/blogs/blogs/${blogId}/permanent`,
        config
      );
      return { blogId, data: response.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to permanently delete blog"
      );
    }
  }
);

export const flagBlog = createAsyncThunk(
  "blogs/flag",
  async ({ blogId, flagType }, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      const config = {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      };

      // This endpoint might need to be created in backend
      // For now, we'll use update endpoint
      const response = await api.put(
        `/admin/blogs/blogs/${blogId}`,
        {
          flags: [
            {
              type: flagType,
              by: getUserCookie()?.id,
              date: new Date().toISOString(),
            },
          ],
        },
        config
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to flag blog"
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
        state.blogs = action.payload.data || action.payload.blogs || [];
        if (action.payload.pagination) {
          state.pagination = action.payload.pagination;
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
        state.blogs.unshift(action.payload.data || action.payload);
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
        const updatedBlog = action.payload.data || action.payload;
        const index = state.blogs.findIndex((b) => b._id === updatedBlog._id);
        if (index !== -1) {
          state.blogs[index] = updatedBlog;
        }
        if (state.currentBlog?._id === updatedBlog._id) {
          state.currentBlog = updatedBlog;
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
        state.blogs = state.blogs.filter(
          (b) => b._id !== action.payload.blogId
        );
      })
      .addCase(deleteBlog.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Permanent delete
      .addCase(permanentDeleteBlog.fulfilled, (state, action) => {
        state.blogs = state.blogs.filter(
          (b) => b._id !== action.payload.blogId
        );
      })
      // Flag blog
      .addCase(flagBlog.fulfilled, (state, action) => {
        const updatedBlog = action.payload.data || action.payload;
        const index = state.blogs.findIndex((b) => b._id === updatedBlog._id);
        if (index !== -1) {
          state.blogs[index] = updatedBlog;
        }
      });
  },
});

export const { clearError, clearCurrentBlog } = blogsSlice.actions;
export default blogsSlice.reducer;
