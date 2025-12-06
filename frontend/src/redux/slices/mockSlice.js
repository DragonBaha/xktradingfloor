import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../controllers/api.js";

// Initialize from localStorage
const getInitialMockMode = () => {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("xk_mock_mode");
    return stored === "true";
  }
  return false;
};

// Async thunk to fetch mock mode from backend
export const fetchMockMode = createAsyncThunk(
  "mock/fetchMockMode",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/settings/mock-mode");
      // Backend returns: { success: true, data: { enabled: boolean } }
      const enabled = response.data?.data?.enabled ?? false;
      // Sync to localStorage for backward compatibility
      if (typeof window !== "undefined") {
        localStorage.setItem("xk_mock_mode", enabled.toString());
      }
      return enabled;
    } catch (error) {
      // Expected 404 if backend endpoint not implemented yet - silently fallback to localStorage
      // This endpoint doesn't exist in backend, so always fallback to localStorage
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("xk_mock_mode");
        const enabled = stored === "true";
        // Don't reject - just return the localStorage value
        return enabled;
      }
      return false;
    }
  }
);

// Async thunk to update mock mode on backend (admin only)
export const updateMockMode = createAsyncThunk(
  "mock/updateMockMode",
  async (enabled, { rejectWithValue }) => {
    try {
      const response = await api.put("/admin/settings/mock-mode", { enabled });
      // Backend returns: { success: true, enabled: boolean, message: string }
      const updatedEnabled = response.data?.enabled ?? enabled;
      // Also update localStorage for backward compatibility
      if (typeof window !== "undefined") {
        localStorage.setItem("xk_mock_mode", updatedEnabled.toString());
      }
      return updatedEnabled;
    } catch (error) {
      // If backend fails, still update localStorage (fallback)
      if (typeof window !== "undefined") {
        localStorage.setItem("xk_mock_mode", enabled.toString());
      }
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to update mock mode"
      );
    }
  }
);

const mockSlice = createSlice({
  name: "mock",
  initialState: {
    enabled: getInitialMockMode(),
    loading: false,
    error: null,
  },
  reducers: {
    toggleMockMode(state) {
      state.enabled = !state.enabled;
      if (typeof window !== "undefined") {
        localStorage.setItem("xk_mock_mode", state.enabled.toString());
      }
    },
    setMockMode(state, action) {
      state.enabled = action.payload;
      if (typeof window !== "undefined") {
        localStorage.setItem("xk_mock_mode", state.enabled.toString());
      }
    },
    // Sync mock mode from localStorage (for cross-tab and cross-user sync)
    syncMockModeFromStorage(state) {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("xk_mock_mode");
        state.enabled = stored === "true";
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch mock mode from backend
      .addCase(fetchMockMode.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMockMode.fulfilled, (state, action) => {
        state.loading = false;
        state.enabled = action.payload;
        // localStorage is already synced in the thunk
      })
      .addCase(fetchMockMode.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update mock mode on backend
      .addCase(updateMockMode.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateMockMode.fulfilled, (state, action) => {
        state.loading = false;
        state.enabled = action.payload;
      })
      .addCase(updateMockMode.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        // Still update state from localStorage as fallback
        if (typeof window !== "undefined") {
          const stored = localStorage.getItem("xk_mock_mode");
          state.enabled = stored === "true";
        }
      });
  },
});

export const { toggleMockMode, setMockMode, syncMockModeFromStorage } =
  mockSlice.actions;
export default mockSlice.reducer;
