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

// Helper to get current user from session
function getCurrentUser() {
  const s = sessionStorage.getItem("xktf_user");
  return s ? JSON.parse(s) : null;
}

// Helper to load companies from JSON
async function loadCompanies() {
  const { default: companies } = await import("../models/companies.json");
  return companies;
}

// Helper to save companies to JSON (mock - in real app this would be API call)
async function saveCompanies(companies) {
  // In a real app, this would be: return api.put('/companies', companies);
  // For now, we'll use localStorage as a mock persistence layer
  localStorage.setItem("xktf_companies", JSON.stringify(companies));
  return { data: companies };
}

// Get all companies (with optional filters)
export async function getAllCompanies(filters = {}) {
  const mockMode = await isMockModeEnabled();

  // Backend API call (ready for integration)
  // Uncomment when backend is ready:
  /*
  try {
    const response = await api.get('/public/companies', { params: filters });
    if (mockMode) {
      // If mock mode is ON, merge with mock data
      const mockCompanies = await loadCompanies();
      const stored = localStorage.getItem('xktf_companies');
      let allMock = stored ? JSON.parse(stored) : mockCompanies;
      // Merge backend data with mock data
      return { data: [...response.data, ...allMock] };
    }
    return response;
  } catch (error) {
    // If backend fails and mock mode is ON, fall back to mock data
    if (mockMode) {
      console.warn('Backend unavailable, using mock data');
    } else {
      throw error;
    }
  }
  */

  let backendCompanies = [];
  let backendRequestSucceeded = false;

  // Helper to check if user is authenticated
  function isAuthenticated() {
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
        return !!user?.token;
      }
    } catch (error) {
      // Silently fail
    }
    // Also check sessionStorage
    try {
      const s = sessionStorage.getItem("xktf_user");
      if (s) {
        const user = JSON.parse(s);
        return !!user?.token;
      }
    } catch (error) {
      // Silently fail
    }
    return false;
  }

  const authenticated = isAuthenticated();

  // Always try to fetch from backend first (only if mock mode is OFF)
  if (!mockMode) {
    // Try public endpoint first for all users (authenticated or not)
    // This should work for regular users without admin access
    try {
      // Try /public/companies first (following the pattern of /public/blogs)
      const publicResponse = await api.get("/public/companies", {
        params: filters,
      });
      if (
        publicResponse.data?.data &&
        Array.isArray(publicResponse.data.data)
      ) {
        return { data: publicResponse.data.data };
      }
      if (Array.isArray(publicResponse.data)) {
        return { data: publicResponse.data };
      }
      return publicResponse;
    } catch (publicError) {
      // If /public/companies doesn't exist, try /companies
      try {
        const companiesResponse = await api.get("/companies", {
          params: filters,
        });
        if (
          companiesResponse.data?.data &&
          Array.isArray(companiesResponse.data.data)
        ) {
          return { data: companiesResponse.data.data };
        }
        if (Array.isArray(companiesResponse.data)) {
          return { data: companiesResponse.data };
        }
        return companiesResponse;
      } catch (companiesError) {
        // Both public endpoints failed - continue to try admin endpoint for authenticated users
        // For unauthenticated users, return empty array
        if (!authenticated) {
          return { data: [] };
        }
      }
    }

    // For authenticated users, try admin endpoint as fallback
    // This will work for admin/operator users
    if (authenticated) {
      try {
        // Backend expects POST for getAllCompanies with filters in body and query params
        const { search, page, size, ...bodyFilters } = filters;

        // Request approved companies for public visibility when no status filter is set
        const requestBody = { ...bodyFilters };
        if (!requestBody.status && !filters.status) {
          // Default to approved if no status specified
          requestBody.status = "approved";
        }

        const response = await api.post(
          "/admin/company/getallcompanies",
          requestBody,
          {
            params: { search, page, size },
          }
        );
        // Backend returns: { success: true, data: { docs: [...], totalItems, currentPage, totalPages } }
        // Transform to expected format: { data: [...] }
        if (response.data?.success && response.data?.data?.docs) {
          // Map _id to id for frontend compatibility
          backendCompanies = response.data.data.docs.map((company) => ({
            ...company,
            id: company._id || company.id,
          }));
          backendRequestSucceeded = true;
        } else if (Array.isArray(response.data?.data)) {
          backendCompanies = response.data.data.map((company) => ({
            ...company,
            id: company._id || company.id,
          }));
          backendRequestSucceeded = true;
        } else if (Array.isArray(response.data)) {
          backendCompanies = response.data;
          backendRequestSucceeded = true;
        }
      } catch (error) {
        // If we get 401 (unauthorized) or 403 (forbidden), the endpoint requires admin authentication
        // This is expected for non-admin users - return empty array
        if (error.response?.status === 401 || error.response?.status === 403) {
          backendRequestSucceeded = false;
        } else if (
          error.code === "ERR_NETWORK" ||
          error.message?.includes("ERR_CONNECTION_REFUSED") ||
          error.code === "ECONNREFUSED"
        ) {
          // Backend server is down - return empty array
          backendRequestSucceeded = false;
        } else {
          // Other errors - backend might be down
          backendRequestSucceeded = false;
        }
      }
    }
  }

  // If mock mode is OFF, return only backend data
  if (!mockMode) {
    // If backend request succeeded, filter to approved companies for public view
    if (backendRequestSucceeded) {
      // For authenticated users, show all companies they have access to
      // For unauthenticated users, show only approved companies
      if (authenticated) {
        return { data: backendCompanies };
      } else {
        const approvedCompanies = backendCompanies.filter(
          (c) => c.status === "approved" || c.status === "Approved"
        );
        return { data: approvedCompanies };
      }
    }
    // If backend request failed (403/401 expected for non-admin users or public endpoint doesn't exist)
    // Return empty array gracefully - this allows the page to render without errors
    return { data: [] };
  }

  // If mock mode is ON, return ONLY mock data (no merging with backend)
  let companies = await loadCompanies();

  // Check localStorage for any updates
  const stored = localStorage.getItem("xktf_companies");
  if (stored) {
    try {
      companies = JSON.parse(stored);
    } catch (e) {
      console.error("Error parsing stored companies:", e);
    }
  }

  // Apply filters
  let filteredCompanies = companies;
  if (filters.category) {
    filteredCompanies = filteredCompanies.filter(
      (c) => c.category === filters.category
    );
  }
  if (filters.status) {
    filteredCompanies = filteredCompanies.filter(
      (c) => c.status === filters.status
    );
  }
  if (filters.operatorId) {
    filteredCompanies = filteredCompanies.filter(
      (c) => c.operatorId === filters.operatorId
    );
  }
  if (filters.minRating) {
    filteredCompanies = filteredCompanies.filter(
      (c) => c.ratingsAggregate >= filters.minRating
    );
  }
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filteredCompanies = filteredCompanies.filter(
      (c) =>
        c.name.toLowerCase().includes(searchLower) ||
        c.details?.toLowerCase().includes(searchLower) ||
        c.description?.toLowerCase().includes(searchLower)
    );
  }

  return { data: filteredCompanies };
}

// Get company by ID
export async function getCompanyById(companyId) {
  const mockMode = await isMockModeEnabled();

  // Try backend API first
  if (!mockMode) {
    try {
      // Backend endpoint: GET /admin/company/:companyId/getcompanybyid
      const response = await api.get(
        `/admin/company/${companyId}/getcompanybyid`
      );
      // Backend returns: { success: true, data: {...} }
      if (response.data?.success && response.data?.data) {
        const company = response.data.data;
        return {
          data: {
            ...company,
            id: company._id || company.id,
          },
        };
      }
      return response;
    } catch (error) {
      if (error.response?.status === 401) {
        // Unauthorized - user needs to login
        throw error;
      }
      // If backend fails and mock mode is OFF, throw error
      if (!mockMode) {
        throw error;
      }
    }
  }

  // Mock data implementation (only if mock mode is ON or backend failed)
  const companies = await loadCompanies();
  const stored = localStorage.getItem("xktf_companies");
  let allCompanies = companies;

  if (stored) {
    try {
      allCompanies = JSON.parse(stored);
    } catch (e) {
      console.error("Error parsing stored companies:", e);
    }
  }

  const company = allCompanies.find(
    (c) => c.id === companyId || c._id === companyId
  );
  if (!company) {
    throw new Error("Company not found");
  }
  return { data: company };
}

// Create company (admin only)
export async function createCompany(companyData) {
  const mockMode = await isMockModeEnabled();
  const user = getCurrentUser();

  const userRole = user?.role?.toLowerCase();
  if (
    !user ||
    (userRole !== "admin" && userRole !== "subadmin" && userRole !== "operator")
  ) {
    throw new Error("Only admins and operators can create companies");
  }

  // Try backend API first
  if (!mockMode) {
    try {
      const formData = new FormData();
      Object.keys(companyData).forEach((key) => {
        if (key === "logo" && companyData[key] instanceof File) {
          formData.append("logo", companyData[key]);
        } else if (key === "images" && Array.isArray(companyData[key])) {
          companyData[key].forEach((img, idx) => {
            if (img instanceof File) {
              formData.append(`images`, img);
            }
          });
        } else if (key !== "logo" && key !== "images") {
          formData.append(
            key,
            typeof companyData[key] === "object"
              ? JSON.stringify(companyData[key])
              : companyData[key]
          );
        }
      });

      // Backend endpoint: POST /admin/company/addcompany
      const response = await api.post("/admin/company/addcompany", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Backend returns: { success: true, message: "...", data: {...} }
      return response;
    } catch (error) {
      if (error.response?.status === 401) {
        // Unauthorized - user needs to login
        throw error;
      }
      // If backend fails and mock mode is OFF, throw error
      if (!mockMode) {
        throw error;
      }
    }
  }

  // Mock data implementation (only if mock mode is ON or backend failed)
  const companies = await loadCompanies();
  const stored = localStorage.getItem("xktf_companies");
  let allCompanies = stored ? JSON.parse(stored) : companies;

  const newCompany = {
    id: `cmp-${Date.now()}`,
    ...companyData,
    operatorId: userRole === "operator" ? user.id : companyData.operatorId,
    status:
      userRole === "admin" || userRole === "subadmin" ? "approved" : "pending",
    ratingsAggregate: 0,
    totalReviews: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    promoCodes: companyData.promoCodes || [],
  };

  allCompanies.push(newCompany);
  await saveCompanies(allCompanies);
  return { data: newCompany };
}

// Update company (admin can update any, operator can only update their own)
export async function updateCompany(companyId, updates) {
  const mockMode = await isMockModeEnabled();
  const user = getCurrentUser();

  const userRole = user?.role?.toLowerCase();
  if (
    !user ||
    (userRole !== "operator" && userRole !== "admin" && userRole !== "subadmin")
  ) {
    throw new Error("Only operators and admins can update companies");
  }

  // Try backend API first
  if (!mockMode) {
    try {
      const formData = new FormData();
      Object.keys(updates).forEach((key) => {
        if (key === "logo" && updates[key] instanceof File) {
          formData.append("logo", updates[key]);
        } else if (key === "images" && Array.isArray(updates[key])) {
          updates[key].forEach((img) => {
            if (img instanceof File) {
              formData.append(`images`, img);
            }
          });
        } else if (key !== "logo" && key !== "images") {
          formData.append(
            key,
            typeof updates[key] === "object"
              ? JSON.stringify(updates[key])
              : updates[key]
          );
        }
      });

      // Note: Backend updateCompany endpoint might need to be added
      // For now, using the pattern from backend controller
      const response = await api.put(
        `/admin/company/${companyId}/updatecompany`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      // Backend returns: { success: true, message: "...", data: {...} }
      return response;
    } catch (error) {
      if (error.response?.status === 401) {
        // Unauthorized - user needs to login
        throw error;
      }
      // If backend fails and mock mode is OFF, throw error
      if (!mockMode) {
        throw error;
      }
    }
  }

  // Mock data implementation (only if mock mode is ON or backend failed)
  const companies = await loadCompanies();
  const stored = localStorage.getItem("xktf_companies");
  let allCompanies = stored ? JSON.parse(stored) : companies;

  const companyIndex = allCompanies.findIndex(
    (c) => c.id === companyId || c._id === companyId
  );
  if (companyIndex === -1) {
    throw new Error("Company not found");
  }

  const company = allCompanies[companyIndex];

  // Operators can only update their own companies, admins can update any
  if (userRole === "operator" && company.operatorId !== user.id) {
    throw new Error("You can only update your own companies");
  }

  allCompanies[companyIndex] = {
    ...company,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  await saveCompanies(allCompanies);
  return { data: allCompanies[companyIndex] };
}

// Delete company (admin only)
export async function deleteCompany(companyId) {
  const mockMode = await isMockModeEnabled();
  const user = getCurrentUser();

  const userRole = user?.role?.toLowerCase();
  if (!user || (userRole !== "admin" && userRole !== "subadmin")) {
    throw new Error("Only admins can delete companies");
  }

  // Try backend API first
  // Note: Backend deleteCompany endpoint might need to be added to routes
  // For now, checking if it exists
  if (!mockMode) {
    try {
      // Backend endpoint: DELETE /admin/company/:companyId/deletecompany (if implemented)
      const response = await api.delete(
        `/admin/company/${companyId}/deletecompany`
      );
      // Backend returns: { success: true, message: "..." }
      return response;
    } catch (error) {
      if (error.response?.status === 401) {
        // Unauthorized - user needs to login
        throw error;
      }
      // If backend fails and mock mode is OFF, throw error
      if (!mockMode) {
        throw error;
      }
    }
  }

  // Mock data implementation (only if mock mode is ON or backend failed)
  const companies = await loadCompanies();
  const stored = localStorage.getItem("xktf_companies");
  let allCompanies = stored ? JSON.parse(stored) : companies;

  const companyIndex = allCompanies.findIndex(
    (c) => c.id === companyId || c._id === companyId
  );
  if (companyIndex === -1) {
    throw new Error("Company not found");
  }

  allCompanies.splice(companyIndex, 1);
  await saveCompanies(allCompanies);
  return { data: { success: true } };
}

// Toggle company active/blocked status (admin only)
export async function toggleCompanyStatus(companyId) {
  const mockMode = await isMockModeEnabled();
  const user = getCurrentUser();

  const userRole = user?.role?.toLowerCase();
  if (!user || (userRole !== "admin" && userRole !== "subadmin")) {
    throw new Error("Only admins can toggle company status");
  }

  // Backend API call (ready for integration)
  // Uncomment when backend is ready:
  /*
  try {
    const response = await api.patch(`/admin/companies/${companyId}/toggle`);
    
    if (mockMode) {
      // Also update mock data if mock mode is ON
      const companies = await loadCompanies();
      const stored = localStorage.getItem('xktf_companies');
      let allCompanies = stored ? JSON.parse(stored) : companies;
      const companyIndex = allCompanies.findIndex(c => c.id === companyId);
      if (companyIndex !== -1) {
        allCompanies[companyIndex].status = allCompanies[companyIndex].status === 'approved' ? 'blocked' : 'approved';
        allCompanies[companyIndex].updatedAt = new Date().toISOString();
        await saveCompanies(allCompanies);
      }
    }
    
    return response;
  } catch (error) {
    if (mockMode) {
      console.warn('Backend unavailable, using mock data');
    } else {
      throw error;
    }
  }
  */

  // Mock data implementation
  const companies = await loadCompanies();
  const stored = localStorage.getItem("xktf_companies");
  let allCompanies = stored ? JSON.parse(stored) : companies;
  const companyIndex = allCompanies.findIndex((c) => c.id === companyId);

  if (companyIndex === -1) {
    throw new Error("Company not found");
  }

  allCompanies[companyIndex].status =
    allCompanies[companyIndex].status === "approved" ? "blocked" : "approved";
  allCompanies[companyIndex].updatedAt = new Date().toISOString();
  await saveCompanies(allCompanies);
  return { data: allCompanies[companyIndex] };
}

// Add promo code to company
// Backend endpoint: POST /api/admin/company/:companyId/addpromocode
export async function addPromoCode(companyId, promoData) {
  const mockMode = await isMockModeEnabled();
  const user = getCurrentUser();

  const userRole = user?.role?.toLowerCase();
  if (
    !user ||
    (userRole !== "operator" && userRole !== "admin" && userRole !== "subadmin")
  ) {
    throw new Error("Only operators and admins can add promo codes");
  }

  // Try backend API first (when mock mode is OFF)
  if (!mockMode) {
    try {
      // Backend endpoint: POST /api/admin/company/:companyId/addpromocode
      // Body: { code, discount, discountType, validFrom, validTo, featured }
      const response = await api.post(
        `/admin/company/${companyId}/addpromocode`,
        promoData
      );

      // Backend returns: { success: true, message: "...", data: {...} }
      if (response.data?.success && response.data?.data) {
        return { data: response.data.data };
      }
      return response;
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error("Unauthorized. Please log in again.");
      }
      if (error.response?.status === 403) {
        throw new Error(
          error.response?.data?.message ||
            "You don't have permission to add promo codes to this company"
        );
      }
      // If backend fails and mock mode is OFF, throw error
      if (!mockMode) {
        throw error;
      }
    }
  }

  // Mock data implementation (only if mock mode is ON or backend failed)
  const companies = await loadCompanies();
  const stored = localStorage.getItem("xktf_companies");
  let allCompanies = stored ? JSON.parse(stored) : companies;

  const companyIndex = allCompanies.findIndex(
    (c) => c.id === companyId || c._id === companyId
  );
  if (companyIndex === -1) {
    throw new Error("Company not found");
  }

  const company = allCompanies[companyIndex];

  if (userRole === "operator" && company.operatorId !== user.id) {
    throw new Error("You can only add promo codes to your own companies");
  }

  const newPromo = {
    id: `promo-${Date.now()}`,
    ...promoData,
    createdAt: new Date().toISOString(),
  };

  company.promoCodes = company.promoCodes || [];
  company.promoCodes.push(newPromo);
  company.updatedAt = new Date().toISOString();

  allCompanies[companyIndex] = company;
  await saveCompanies(allCompanies);
  return { data: newPromo };
}

// Update promo code
// Backend endpoint: PUT /api/admin/company/:companyId/updatepromocode/:promoId
export async function updatePromoCode(companyId, promoId, updates) {
  const mockMode = await isMockModeEnabled();
  const user = getCurrentUser();

  const userRole = user?.role?.toLowerCase();
  if (
    !user ||
    (userRole !== "operator" && userRole !== "admin" && userRole !== "subadmin")
  ) {
    throw new Error("Only operators and admins can update promo codes");
  }

  // Try backend API first (when mock mode is OFF)
  if (!mockMode) {
    try {
      // Backend endpoint: PUT /api/admin/company/:companyId/updatepromocode/:promoId
      // Body: { code, discount, discountType, validFrom, validTo, featured }
      const response = await api.put(
        `/admin/company/${companyId}/updatepromocode/${promoId}`,
        updates
      );

      // Backend returns: { success: true, message: "...", data: {...} }
      if (response.data?.success && response.data?.data) {
        return { data: response.data.data };
      }
      return response;
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error("Unauthorized. Please log in again.");
      }
      if (error.response?.status === 403) {
        throw new Error(
          error.response?.data?.message ||
            "You don't have permission to update promo codes for this company"
        );
      }
      // If backend fails and mock mode is OFF, throw error
      if (!mockMode) {
        throw error;
      }
    }
  }

  // Mock data implementation (only if mock mode is ON or backend failed)
  const companies = await loadCompanies();
  const stored = localStorage.getItem("xktf_companies");
  let allCompanies = stored ? JSON.parse(stored) : companies;

  const companyIndex = allCompanies.findIndex(
    (c) => c.id === companyId || c._id === companyId
  );
  if (companyIndex === -1) {
    throw new Error("Company not found");
  }

  const company = allCompanies[companyIndex];

  if (userRole === "operator" && company.operatorId !== user.id) {
    throw new Error("You can only update promo codes for your own companies");
  }

  const promoIndex = company.promoCodes.findIndex(
    (p) => p.id === promoId || p._id === promoId
  );
  if (promoIndex === -1) {
    throw new Error("Promo code not found");
  }

  company.promoCodes[promoIndex] = {
    ...company.promoCodes[promoIndex],
    ...updates,
  };
  company.updatedAt = new Date().toISOString();

  allCompanies[companyIndex] = company;
  await saveCompanies(allCompanies);
  return { data: company.promoCodes[promoIndex] };
}

// Delete promo code
// Backend endpoint: DELETE /api/admin/company/:companyId/deletepromocode/:promoId
export async function deletePromoCode(companyId, promoId) {
  const mockMode = await isMockModeEnabled();
  const user = getCurrentUser();

  const userRole = user?.role?.toLowerCase();
  if (
    !user ||
    (userRole !== "operator" && userRole !== "admin" && userRole !== "subadmin")
  ) {
    throw new Error("Only operators and admins can delete promo codes");
  }

  // Try backend API first (when mock mode is OFF)
  if (!mockMode) {
    try {
      // Backend endpoint: DELETE /api/admin/company/:companyId/deletepromocode/:promoId
      const response = await api.delete(
        `/admin/company/${companyId}/deletepromocode/${promoId}`
      );

      // Backend returns: { success: true, message: "..." }
      if (response.data?.success) {
        return { data: { success: true } };
      }
      return response;
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error("Unauthorized. Please log in again.");
      }
      if (error.response?.status === 403) {
        throw new Error(
          error.response?.data?.message ||
            "You don't have permission to delete promo codes from this company"
        );
      }
      // If backend fails and mock mode is OFF, throw error
      if (!mockMode) {
        throw error;
      }
    }
  }

  // Mock data implementation (only if mock mode is ON or backend failed)
  const companies = await loadCompanies();
  const stored = localStorage.getItem("xktf_companies");
  let allCompanies = stored ? JSON.parse(stored) : companies;

  const companyIndex = allCompanies.findIndex(
    (c) => c.id === companyId || c._id === companyId
  );
  if (companyIndex === -1) {
    throw new Error("Company not found");
  }

  const company = allCompanies[companyIndex];

  if (userRole === "operator" && company.operatorId !== user.id) {
    throw new Error("You can only delete promo codes from your own companies");
  }

  company.promoCodes = company.promoCodes.filter(
    (p) => p.id !== promoId && p._id !== promoId
  );
  company.updatedAt = new Date().toISOString();

  allCompanies[companyIndex] = company;
  await saveCompanies(allCompanies);
  return { data: { success: true } };
}
