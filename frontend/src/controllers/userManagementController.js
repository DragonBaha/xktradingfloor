import api from "./api.js";

/**
 * User Management Controller
 *
 * This service layer is prepared for backend API integration.
 * Currently returns mock data structure, but can be easily switched
 * to real API calls when backend endpoints are available.
 *
 * Expected Backend Endpoints (to be implemented):
 * - GET /api/admin/users/getallusers?page=1&size=10&search=&role=
 * - POST /api/admin/users/createoperator
 * - PUT /api/admin/users/:userId/updaterole
 * - PUT /api/admin/users/:userId/updatestatus
 */

// Helper to check if user is admin
function isAdmin() {
  if (typeof window === "undefined") return false;
  try {
    const userCookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("xktf_user="));
    if (userCookie) {
      const userString = decodeURIComponent(
        userCookie.split("=").slice(1).join("=")
      );
      const user = JSON.parse(userString);
      const role = user?.role?.toLowerCase();
      return role === "admin";
    }
  } catch (error) {
    // Silently fail
  }
  // Also check sessionStorage
  try {
    const s = sessionStorage.getItem("xktf_user");
    if (s) {
      const user = JSON.parse(s);
      const role = user?.role?.toLowerCase();
      return role === "admin";
    }
  } catch (error) {
    // Silently fail
  }
  return false;
}

/**
 * Get all users with pagination, search, and filtering
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.size - Items per page (default: 10)
 * @param {string} params.search - Search query (name, email)
 * @param {string} params.role - Filter by role (User, Operator, Admin)
 * @returns {Promise<{data: {docs: Array, totalItems: number, currentPage: number, totalPages: number}}>}
 */
export async function getAllUsers({
  page = 1,
  size = 10,
  search = "",
  role = "",
} = {}) {
  if (!isAdmin()) {
    throw new Error("Only admins can access user management");
  }

  // TODO: Replace with real API call when backend is ready
  // Expected endpoint: GET /api/admin/users/getallusers
  // Expected response: { success: true, data: { docs: [...], totalItems, currentPage, totalPages } }

  try {
    // Try backend API first
    const response = await api.get("/admin/users/getallusers", {
      params: { page, size, search, role },
    });

    if (response.data?.success && response.data?.data) {
      return {
        data: {
          docs:
            response.data.data.docs?.map((user) => ({
              ...user,
              id: user._id || user.id,
            })) || [],
          totalItems: response.data.data.totalItems || 0,
          currentPage: response.data.data.currentPage || page,
          totalPages: response.data.data.totalPages || 1,
        },
      };
    }
    return response;
  } catch (error) {
    // Backend endpoint not implemented yet - return empty structure
    // This allows the UI to render without errors
    if (error.response?.status === 404 || error.response?.status === 501) {
      return {
        data: {
          docs: [],
          totalItems: 0,
          currentPage: page,
          totalPages: 0,
        },
      };
    }
    // For other errors (401, 403), throw to show proper error message
    if (error.response?.status === 401 || error.response?.status === 403) {
      throw new Error("Unauthorized. Only admins can access user management.");
    }
    throw error;
  }
}

/**
 * Create a new operator
 * @param {Object} operatorData - Operator data
 * @param {string} operatorData.fullName - Full name
 * @param {string} operatorData.email - Email address
 * @param {string} operatorData.password - Password
 * @param {string} operatorData.mobileNumber - Mobile number (optional)
 * @returns {Promise<{data: Object}>}
 */
export async function createOperator(operatorData) {
  if (!isAdmin()) {
    throw new Error("Only admins can create operators");
  }

  // Validate required fields
  if (!operatorData.fullName || !operatorData.email || !operatorData.password) {
    throw new Error("Full name, email, and password are required");
  }

  // Sanitize input
  const sanitizedData = {
    fullName: String(operatorData.fullName).trim(),
    email: String(operatorData.email).trim().toLowerCase(),
    password: String(operatorData.password),
    mobileNumber: operatorData.mobileNumber
      ? String(operatorData.mobileNumber).trim()
      : "",
    role: "Operator", // Default role for operators
  };

  // Backend endpoint: POST /api/admin/users/addAdminUser
  // Expected body: { fullName, email, password, mobileNumber, role }
  // Expected response: { success: true, message: "...", data: {...} }

  try {
    const response = await api.post("/admin/users/addAdminUser", sanitizedData);

    if (response.data?.success && response.data?.data) {
      return {
        data: {
          ...response.data.data,
          id: response.data.data._id || response.data.data.id,
        },
      };
    }
    return response;
  } catch (error) {
    // Backend endpoint not implemented yet
    if (error.response?.status === 404 || error.response?.status === 501) {
      throw new Error(
        "User management API is not yet implemented. Please contact the development team."
      );
    }
    // Handle validation errors
    if (error.response?.status === 400) {
      throw new Error(error.response?.data?.message || "Invalid input data");
    }
    if (error.response?.status === 401 || error.response?.status === 403) {
      throw new Error("Unauthorized. Only admins can create operators.");
    }
    throw error;
  }
}

/**
 * Update user role (User ↔ Operator only, NOT Admin)
 * @param {string} userId - User ID
 * @param {string} newRole - New role (User or Operator)
 * @returns {Promise<{data: Object}>}
 */
export async function updateUserRole(userId, newRole) {
  if (!isAdmin()) {
    throw new Error("Only admins can update user roles");
  }

  // Prevent admin role changes
  if (newRole === "Admin" || newRole === "admin") {
    throw new Error(
      "Cannot change user role to Admin. Admin roles must be assigned manually."
    );
  }

  // Validate role
  if (
    newRole !== "User" &&
    newRole !== "Operator" &&
    newRole !== "user" &&
    newRole !== "operator"
  ) {
    throw new Error("Invalid role. Must be 'User' or 'Operator'");
  }

  // Normalize role to match backend format
  const normalizedRole =
    newRole === "user" ? "User" : newRole === "operator" ? "Operator" : newRole;

  // TODO: Replace with real API call when backend is ready
  // Expected endpoint: PUT /api/admin/users/:userId/updaterole
  // Expected body: { role: "User" | "Operator" }
  // Expected response: { success: true, message: "...", data: {...} }

  try {
    const response = await api.put(`/admin/users/${userId}/updaterole`, {
      role: normalizedRole,
    });

    if (response.data?.success && response.data?.data) {
      return {
        data: {
          ...response.data.data,
          id: response.data.data._id || response.data.data.id,
        },
      };
    }
    return response;
  } catch (error) {
    // Backend endpoint not implemented yet
    if (error.response?.status === 404 || error.response?.status === 501) {
      throw new Error(
        "User management API is not yet implemented. Please contact the development team."
      );
    }
    if (error.response?.status === 400) {
      throw new Error(error.response?.data?.message || "Invalid role");
    }
    if (error.response?.status === 401 || error.response?.status === 403) {
      throw new Error("Unauthorized. Only admins can update user roles.");
    }
    throw error;
  }
}

/**
 * Update user status (active/inactive)
 * @param {string} userId - User ID
 * @param {boolean} isActive - Active status
 * @returns {Promise<{data: Object}>}
 */
export async function updateUserStatus(userId, isActive) {
  if (!isAdmin()) {
    throw new Error("Only admins can update user status");
  }

  // TODO: Replace with real API call when backend is ready
  // Expected endpoint: PUT /api/admin/users/:userId/updatestatus
  // Expected body: { isActive: boolean }
  // Expected response: { success: true, message: "...", data: {...} }

  try {
    const response = await api.put(`/admin/users/${userId}/updatestatus`, {
      isActive: Boolean(isActive),
    });

    if (response.data?.success && response.data?.data) {
      return {
        data: {
          ...response.data.data,
          id: response.data.data._id || response.data.data.id,
        },
      };
    }
    return response;
  } catch (error) {
    // Backend endpoint not implemented yet
    if (error.response?.status === 404 || error.response?.status === 501) {
      throw new Error(
        "User management API is not yet implemented. Please contact the development team."
      );
    }
    if (error.response?.status === 400) {
      throw new Error(error.response?.data?.message || "Invalid status");
    }
    if (error.response?.status === 401 || error.response?.status === 403) {
      throw new Error("Unauthorized. Only admins can update user status.");
    }
    throw error;
  }
}
