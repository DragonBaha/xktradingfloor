import api from "./api.js";

// Helper to check if mock mode is enabled
// Backend endpoint: GET /api/public/settings/mock-mode
async function isMockModeEnabled() {
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

  // If mock mode is OFF, try to fetch from backend
  if (!mockMode) {
    try {
      // Backend expects POST for getAllCompanies with filters in body
      const response = await api.post("/admin/company/getallcompanies", filters, {
        params: { search: filters.search, page: filters.page, size: filters.size }
      });
      // Backend returns: { success: true, data: { docs: [...], totalItems, currentPage, totalPages } }
      // Transform to expected format: { data: [...] }
      if (response.data?.success && response.data?.data?.docs) {
        return { data: response.data.data.docs };
      }
      // If response is already in expected format
      if (Array.isArray(response.data?.data)) {
        return { data: response.data.data };
      }
      // If response.data is already an array
      if (Array.isArray(response.data)) {
        return { data: response.data };
      }
      return response;
    } catch (error) {
      // Backend not available and mock mode is OFF
      // Expected 404 if endpoint not implemented - silently return empty
      if (error.response?.status === 401) {
        // Unauthorized - user needs to login
        throw error;
      }
      // If backend fails, try public endpoint as fallback
      try {
        const publicResponse = await api.get("/public/companies", { params: filters });
        if (Array.isArray(publicResponse.data?.data)) {
          return { data: publicResponse.data.data };
        }
        if (Array.isArray(publicResponse.data)) {
          return { data: publicResponse.data };
        }
        return publicResponse;
      } catch (publicError) {
        // Both endpoints failed, return empty array
        return { data: [] };
      }
    }
  }

  // Mock data implementation (only when mock mode is ON)
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
  if (filters.category) {
    companies = companies.filter((c) => c.category === filters.category);
  }
  if (filters.status) {
    companies = companies.filter((c) => c.status === filters.status);
  }
  if (filters.operatorId) {
    companies = companies.filter((c) => c.operatorId === filters.operatorId);
  }
  if (filters.minRating) {
    companies = companies.filter(
      (c) => c.ratingsAggregate >= filters.minRating
    );
  }
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    companies = companies.filter(
      (c) =>
        c.name.toLowerCase().includes(searchLower) ||
        c.details?.toLowerCase().includes(searchLower) ||
        c.description?.toLowerCase().includes(searchLower)
    );
  }

  return { data: companies };
}

// Get company by ID
export async function getCompanyById(companyId) {
  const mockMode = await isMockModeEnabled();

  // Try backend API first
  if (!mockMode) {
    try {
      // Backend endpoint: GET /admin/company/:companyId/getcompanybyid
      const response = await api.get(`/admin/company/${companyId}/getcompanybyid`);
      // Backend returns: { success: true, data: {...} }
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

  const company = allCompanies.find((c) => c.id === companyId || c._id === companyId);
  if (!company) {
    throw new Error("Company not found");
  }
  return { data: company };
}

// Create company (admin only)
export async function createCompany(companyData) {
  const mockMode = await isMockModeEnabled();
  const user = getCurrentUser();

  if (!user || (user.role !== "admin" && user.role !== "operator")) {
    throw new Error("Only admins and operators can create companies");
  }

  // Try backend API first
  if (!mockMode) {
    try {
      const formData = new FormData();
      Object.keys(companyData).forEach(key => {
        if (key === 'logo' && companyData[key] instanceof File) {
          formData.append('logo', companyData[key]);
        } else if (key === 'images' && Array.isArray(companyData[key])) {
          companyData[key].forEach((img, idx) => {
            if (img instanceof File) {
              formData.append(`images`, img);
            }
          });
        } else if (key !== 'logo' && key !== 'images') {
          formData.append(key, typeof companyData[key] === 'object' ? JSON.stringify(companyData[key]) : companyData[key]);
        }
      });

      // Backend endpoint: POST /admin/company/addcompany
      const response = await api.post('/admin/company/addcompany', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
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
    operatorId: user.role === "operator" ? user.id : companyData.operatorId,
    status: user.role === "admin" ? "approved" : "pending",
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

  if (!user || (user.role !== "operator" && user.role !== "admin")) {
    throw new Error("Only operators and admins can update companies");
  }

  // Try backend API first
  if (!mockMode) {
    try {
      const formData = new FormData();
      Object.keys(updates).forEach(key => {
        if (key === 'logo' && updates[key] instanceof File) {
          formData.append('logo', updates[key]);
        } else if (key === 'images' && Array.isArray(updates[key])) {
          updates[key].forEach((img) => {
            if (img instanceof File) {
              formData.append(`images`, img);
            }
          });
        } else if (key !== 'logo' && key !== 'images') {
          formData.append(key, typeof updates[key] === 'object' ? JSON.stringify(updates[key]) : updates[key]);
        }
      });

      // Note: Backend updateCompany endpoint might need to be added
      // For now, using the pattern from backend controller
      const response = await api.put(`/admin/company/${companyId}/updatecompany`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
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

  const companyIndex = allCompanies.findIndex((c) => c.id === companyId || c._id === companyId);
  if (companyIndex === -1) {
    throw new Error("Company not found");
  }

  const company = allCompanies[companyIndex];

  // Operators can only update their own companies, admins can update any
  if (user?.role === "operator" && company.operatorId !== user.id) {
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

  if (!user || user.role !== "admin") {
    throw new Error("Only admins can delete companies");
  }

  // Try backend API first
  // Note: Backend deleteCompany endpoint might need to be added to routes
  // For now, checking if it exists
  if (!mockMode) {
    try {
      // Backend endpoint: DELETE /admin/company/:companyId/deletecompany (if implemented)
      const response = await api.delete(`/admin/company/${companyId}/deletecompany`);
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

  const companyIndex = allCompanies.findIndex((c) => c.id === companyId || c._id === companyId);
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

  if (!user || user.role !== "admin") {
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
export async function addPromoCode(companyId, promoData) {
  // return api.post(`/companies/${companyId}/promo-codes`, promoData);
  const user = getCurrentUser();
  const companies = await loadCompanies();
  const stored = localStorage.getItem("xktf_companies");
  let allCompanies = stored ? JSON.parse(stored) : companies;

  const companyIndex = allCompanies.findIndex((c) => c.id === companyId);
  if (companyIndex === -1) {
    throw new Error("Company not found");
  }

  const company = allCompanies[companyIndex];

  if (user?.role === "operator" && company.operatorId !== user.id) {
    throw new Error("You can only add promo codes to your own companies");
  }
  if (!user || (user.role !== "operator" && user.role !== "admin")) {
    throw new Error("Only operators and admins can add promo codes");
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
export async function updatePromoCode(companyId, promoId, updates) {
  // return api.put(`/companies/${companyId}/promo-codes/${promoId}`, updates);
  const user = getCurrentUser();
  const companies = await loadCompanies();
  const stored = localStorage.getItem("xktf_companies");
  let allCompanies = stored ? JSON.parse(stored) : companies;

  const companyIndex = allCompanies.findIndex((c) => c.id === companyId);
  if (companyIndex === -1) {
    throw new Error("Company not found");
  }

  const company = allCompanies[companyIndex];

  if (user?.role === "operator" && company.operatorId !== user.id) {
    throw new Error("You can only update promo codes for your own companies");
  }
  if (!user || (user.role !== "operator" && user.role !== "admin")) {
    throw new Error("Only operators and admins can update promo codes");
  }

  const promoIndex = company.promoCodes.findIndex((p) => p.id === promoId);
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
export async function deletePromoCode(companyId, promoId) {
  // return api.delete(`/companies/${companyId}/promo-codes/${promoId}`);
  const user = getCurrentUser();
  const companies = await loadCompanies();
  const stored = localStorage.getItem("xktf_companies");
  let allCompanies = stored ? JSON.parse(stored) : companies;

  const companyIndex = allCompanies.findIndex((c) => c.id === companyId);
  if (companyIndex === -1) {
    throw new Error("Company not found");
  }

  const company = allCompanies[companyIndex];

  if (user?.role === "operator" && company.operatorId !== user.id) {
    throw new Error("You can only delete promo codes from your own companies");
  }
  if (!user || (user.role !== "operator" && user.role !== "admin")) {
    throw new Error("Only operators and admins can delete promo codes");
  }

  company.promoCodes = company.promoCodes.filter((p) => p.id !== promoId);
  company.updatedAt = new Date().toISOString();

  allCompanies[companyIndex] = company;
  await saveCompanies(allCompanies);
  return { data: { success: true } };
}
