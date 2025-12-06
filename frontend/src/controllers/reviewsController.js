import api from "./api.js";

// FORCE REAL DATA MODE - Mock functionality is hidden but code is kept for future use
// Set to false to always use real data from database
const FORCE_REAL_DATA_MODE = true;

// Helper to check if mock mode is enabled
// Checks backend first, then falls back to localStorage (synced by Redux)
async function isMockModeEnabled() {
  // If force real data mode is enabled, always return false (use real data)
  if (FORCE_REAL_DATA_MODE) {
    return false;
  }

  // Try to fetch from backend first (for global sync)
  try {
    const response = await api.get("/public/settings/mock-mode");
    if (response?.data?.enabled !== undefined) {
      // Sync to localStorage for backward compatibility
      if (typeof window !== "undefined") {
        localStorage.setItem("xk_mock_mode", response.data.enabled.toString());
      }
      return response.data.enabled;
    }
  } catch (error) {
    // Backend not available or endpoint not implemented yet
    // Fall back to localStorage (synced by Redux)
  }

  // Fallback to localStorage (current implementation, synced by Redux)
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

// Helper to load reviews from JSON
async function loadReviews() {
  const { default: reviews } = await import("../models/reviews.json");
  return reviews;
}

// Helper to save reviews to JSON (mock - in real app this would be API call)
async function saveReviews(reviews) {
  // In a real app, this would be: return api.put('/reviews', reviews);
  // For now, we'll use localStorage as a mock persistence layer
  localStorage.setItem("xktf_reviews", JSON.stringify(reviews));
  return { data: reviews };
}

// Helper to recalculate aggregated rating for a company
async function recalculateCompanyRating(companyId) {
  const { getAllCompanies } = await import("./companiesController.js");
  const reviews = await loadReviews();
  const stored = localStorage.getItem("xktf_reviews");
  const allReviews = stored ? JSON.parse(stored) : reviews;

  const companyReviews = allReviews.filter((r) => r.companyId === companyId);
  if (companyReviews.length === 0) {
    return { ratingsAggregate: 0, totalReviews: 0 };
  }

  const totalRating = companyReviews.reduce((sum, r) => sum + r.rating, 0);
  const ratingsAggregate = totalRating / companyReviews.length;

  return { ratingsAggregate, totalReviews: companyReviews.length };
}

// Get all reviews (with optional filters)
export async function getAllReviews(filters = {}) {
  const mockMode = await isMockModeEnabled();

  // If mock mode is OFF, try to fetch from backend
  if (!mockMode) {
    try {
      const response = await api.get("/public/reviews", { params: filters });
      // Handle different response structures
      if (Array.isArray(response.data?.data)) {
        return { data: response.data.data };
      }
      if (Array.isArray(response.data)) {
        return { data: response.data };
      }
      return response;
    } catch (error) {
      // Backend not available and mock mode is OFF, return empty
      if (error.response?.status === 401) {
        throw error;
      }
      return { data: [] };
    }
  }

  // Mock data implementation (only when mock mode is ON)
  let reviews = await loadReviews();

  // Check localStorage for any updates
  const stored = localStorage.getItem("xktf_reviews");
  if (stored) {
    try {
      reviews = JSON.parse(stored);
    } catch (e) {
      console.error("Error parsing stored reviews:", e);
    }
  }

  // Apply filters
  if (filters.companyId) {
    reviews = reviews.filter((r) => r.companyId === filters.companyId);
  }
  if (filters.userId) {
    reviews = reviews.filter((r) => r.userId === filters.userId);
  }
  if (filters.rating) {
    reviews = reviews.filter((r) => r.rating === filters.rating);
  }

  return { data: reviews };
}

// Get reviews by company ID
export async function getReviewsByCompanyId(companyId) {
  const mockMode = await isMockModeEnabled();

  // Backend API call (ready for integration)
  // Uncomment when backend is ready:
  /*
  try {
    const response = await api.get(`/public/reviews/company/${companyId}`);
    if (mockMode) {
      // If mock mode is ON, merge with mock data
      const { data: mockData } = await getAllReviews({ companyId });
      return { data: [...response.data, ...mockData] };
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
  const { data } = await getAllReviews({ companyId });
  return { data };
}

// Get reviews by user ID
// Backend endpoint: GET /api/admin/review/:userId/getreviewsbyusers
export async function getReviewsByUserId(userId) {
  const mockMode = await isMockModeEnabled();

  // Try backend API first (when mock mode is OFF)
  if (!mockMode) {
    try {
      const response = await api.get(
        `/admin/review/${userId}/getreviewsbyusers`
      );
      // Backend returns: { success: true, data: { docs: [...], totalItems, currentPage, totalPages } }
      if (response.data?.success && response.data?.data?.docs) {
        const reviews = response.data.data.docs.map((review) => ({
          ...review,
          id: review._id || review.id,
        }));
        return { data: reviews };
      }
      if (Array.isArray(response.data?.data)) {
        return { data: response.data.data };
      }
      return response;
    } catch (error) {
      if (error.response?.status === 401) {
        throw error;
      }
      // Fall back to mock if backend fails
    }
  }

  // Mock data implementation
  const { data } = await getAllReviews({ userId });
  return { data };
}

// Get review by ID
export async function getReviewById(reviewId) {
  // return api.get(`/reviews/${reviewId}`);
  const reviews = await loadReviews();
  const stored = localStorage.getItem("xktf_reviews");
  const allReviews = stored ? JSON.parse(stored) : reviews;

  const review = allReviews.find((r) => r.id === reviewId);
  if (!review) {
    throw new Error("Review not found");
  }
  return { data: review };
}

// Create review (authenticated users only)
export async function createReview(reviewData) {
  const mockMode = await isMockModeEnabled();
  const user = getCurrentUser();

  if (!user) {
    throw new Error("You must be logged in to create a review");
  }

  // Backend API call
  // Backend endpoint: POST /api/admin/review/addReview
  // Backend expects: { companyId, rating, title, body, comment }
  if (!mockMode) {
    try {
      const payload = {
        companyId: reviewData.companyId,
        rating: reviewData.rating,
        title: reviewData.title || reviewData.description || "",
        body: reviewData.body || reviewData.description || "",
        comment:
          reviewData.comment || reviewData.description || reviewData.body || "",
      };

      const response = await api.post("/admin/review/addReview", payload);

      // Backend returns: { success: true, message: "...", data: {...} }
      if (response.data?.success && response.data?.data) {
        const review = response.data.data;
        return {
          data: {
            ...review,
            id: review._id || review.id,
          },
        };
      }
      return response;
    } catch (error) {
      if (error.response?.status === 401) {
        throw error;
      }
      // If backend fails and mock mode is OFF, throw error
      if (!mockMode) {
        throw error;
      }
    }
  }

  // Mock data implementation
  const reviews = await loadReviews();
  const stored = localStorage.getItem("xktf_reviews");
  let allReviews = stored ? JSON.parse(stored) : reviews;

  // Check if user already reviewed this company
  const existingReview = allReviews.find(
    (r) => r.companyId === reviewData.companyId && r.userId === user.id
  );
  if (existingReview) {
    throw new Error(
      "You have already reviewed this company. Please edit your existing review instead."
    );
  }

  const newReview = {
    id: `rvw-${Date.now()}`,
    companyId: reviewData.companyId,
    userId: user.id,
    userName: user.name || user.email.split("@")[0],
    userAvatar: user.avatar || "/assets/users/default-avatar.jpg",
    rating: reviewData.rating,
    pros: reviewData.pros || "",
    cons: reviewData.cons || "",
    description: reviewData.description || reviewData.body || "",
    screenshot: reviewData.screenshot || null,
    isVerified: false,
    isPinned: false,
    isHidden: false,
    flags: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  allReviews.push(newReview);
  await saveReviews(allReviews);

  // Recalculate company rating
  const { updateCompany } = await import("./companiesController.js");
  const ratingData = await recalculateCompanyRating(reviewData.companyId);
  try {
    await updateCompany(reviewData.companyId, ratingData);
  } catch (e) {
    console.error("Error updating company rating:", e);
  }

  return { data: newReview };
}

// Update review (users can only update their own reviews)
export async function updateReview(reviewId, updates) {
  // return api.put(`/reviews/${reviewId}`, updates);
  const user = getCurrentUser();
  if (!user) {
    throw new Error("You must be logged in to update a review");
  }

  const reviews = await loadReviews();
  const stored = localStorage.getItem("xktf_reviews");
  let allReviews = stored ? JSON.parse(stored) : reviews;

  const reviewIndex = allReviews.findIndex((r) => r.id === reviewId);
  if (reviewIndex === -1) {
    throw new Error("Review not found");
  }

  const review = allReviews[reviewIndex];

  // Users can only update their own reviews
  if (review.userId !== user.id) {
    throw new Error("You can only update your own reviews");
  }

  allReviews[reviewIndex] = {
    ...review,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  await saveReviews(allReviews);

  // Recalculate company rating if rating changed
  if (updates.rating !== undefined) {
    const { updateCompany } = await import("./companiesController.js");
    const ratingData = await recalculateCompanyRating(review.companyId);
    try {
      await updateCompany(review.companyId, ratingData);
    } catch (e) {
      console.error("Error updating company rating:", e);
    }
  }

  return { data: allReviews[reviewIndex] };
}

// Delete review (users can only delete their own reviews)
// Backend endpoint: DELETE /api/admin/review/:reviewId/deletereview
export async function deleteReview(reviewId) {
  const mockMode = await isMockModeEnabled();
  const user = getCurrentUser();

  if (!user) {
    throw new Error("You must be logged in to delete a review");
  }

  // Try backend API first (when mock mode is OFF)
  if (!mockMode) {
    try {
      const response = await api.delete(
        `/admin/review/${reviewId}/deletereview`
      );
      // Backend returns: { success: true, message: "..." }
      if (response.data?.success) {
        return { data: { success: true } };
      }
      return response;
    } catch (error) {
      if (error.response?.status === 401) {
        throw error;
      }
      if (error.response?.status === 403) {
        // Permission denied - user can't delete this review
        throw new Error("You can only delete your own reviews");
      }
      // If backend fails and mock mode is OFF, throw error
      if (!mockMode) {
        throw error;
      }
    }
  }

  // Mock data implementation (only if mock mode is ON or backend failed)
  const reviews = await loadReviews();
  const stored = localStorage.getItem("xktf_reviews");
  let allReviews = stored ? JSON.parse(stored) : reviews;

  const reviewIndex = allReviews.findIndex(
    (r) => r.id === reviewId || r._id === reviewId
  );
  if (reviewIndex === -1) {
    throw new Error("Review not found");
  }

  const review = allReviews[reviewIndex];

  // Users can only delete their own reviews (admins can delete any)
  if (review.userId !== user.id && user.role !== "admin") {
    throw new Error("You can only delete your own reviews");
  }

  const companyId = review.companyId;
  allReviews.splice(reviewIndex, 1);
  await saveReviews(allReviews);

  // Recalculate company rating
  const { updateCompany } = await import("./companiesController.js");
  const ratingData = await recalculateCompanyRating(companyId);
  try {
    await updateCompany(companyId, ratingData);
  } catch (e) {
    console.error("Error updating company rating:", e);
  }

  return { data: { success: true } };
}

// Report review (users can report suspicious content)
export async function reportReview(reviewId, reason) {
  const mockMode = await isMockModeEnabled();
  const user = getCurrentUser();

  if (!user) {
    throw new Error("You must be logged in to report a review");
  }

  // Backend API call (ready for integration)
  // Uncomment when backend is ready:
  /*
  try {
    const response = await api.post(`/protected/reviews/${reviewId}/report`, { reason });
    
    if (mockMode) {
      // Also update mock data if mock mode is ON
      const reviews = await loadReviews();
      const stored = localStorage.getItem('xktf_reviews');
      let allReviews = stored ? JSON.parse(stored) : reviews;
      const reviewIndex = allReviews.findIndex(r => r.id === reviewId);
      if (reviewIndex !== -1) {
        if (!allReviews[reviewIndex].reports) {
          allReviews[reviewIndex].reports = [];
        }
        allReviews[reviewIndex].reports.push({
          userId: user.id,
          reason,
          createdAt: new Date().toISOString()
        });
        await saveReviews(allReviews);
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
  const reviews = await loadReviews();
  const stored = localStorage.getItem("xktf_reviews");
  let allReviews = stored ? JSON.parse(stored) : reviews;
  const reviewIndex = allReviews.findIndex((r) => r.id === reviewId);

  if (reviewIndex === -1) {
    throw new Error("Review not found");
  }

  if (!allReviews[reviewIndex].reports) {
    allReviews[reviewIndex].reports = [];
  }
  allReviews[reviewIndex].reports.push({
    userId: user.id,
    reason,
    createdAt: new Date().toISOString(),
  });
  await saveReviews(allReviews);

  return { data: { success: true, message: "Review reported successfully" } };
}

// Get reviews for operator moderation
export async function getOperatorReviews(filters = {}) {
  const mockMode = await isMockModeEnabled();
  const user = getCurrentUser();

  if (!user || user.role !== "operator") {
    throw new Error("Only operators can access this endpoint");
  }

  // Backend API call (ready for integration)
  // Uncomment when backend is ready:
  /*
  try {
    const response = await api.get('/operator/reviews', { params: filters });
    if (mockMode) {
      // If mock mode is ON, merge with mock data
      const { data: mockData } = await getAllReviews(filters);
      return { data: [...response.data, ...mockData] };
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

  // Mock data implementation - return all reviews for now
  return await getAllReviews(filters);
}

// Flag review (operator only)
export async function flagReview(reviewId, flagType) {
  const mockMode = await isMockModeEnabled();
  const user = getCurrentUser();

  if (!user || user.role !== "operator") {
    throw new Error("Only operators can flag reviews");
  }

  // Backend API call (ready for integration)
  // Uncomment when backend is ready:
  /*
  try {
    const response = await api.patch(`/operator/reviews/${reviewId}/flag`, { flagType });
    
    if (mockMode) {
      // Also update mock data if mock mode is ON
      const reviews = await loadReviews();
      const stored = localStorage.getItem('xktf_reviews');
      let allReviews = stored ? JSON.parse(stored) : reviews;
      const reviewIndex = allReviews.findIndex(r => r.id === reviewId);
      if (reviewIndex !== -1) {
        if (!allReviews[reviewIndex].flags) {
          allReviews[reviewIndex].flags = [];
        }
        if (!allReviews[reviewIndex].flags.includes(flagType)) {
          allReviews[reviewIndex].flags.push(flagType);
        }
        allReviews[reviewIndex].updatedAt = new Date().toISOString();
        await saveReviews(allReviews);
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
  const reviews = await loadReviews();
  const stored = localStorage.getItem("xktf_reviews");
  let allReviews = stored ? JSON.parse(stored) : reviews;
  const reviewIndex = allReviews.findIndex((r) => r.id === reviewId);

  if (reviewIndex === -1) {
    throw new Error("Review not found");
  }

  if (!allReviews[reviewIndex].flags) {
    allReviews[reviewIndex].flags = [];
  }
  if (!allReviews[reviewIndex].flags.includes(flagType)) {
    allReviews[reviewIndex].flags.push(flagType);
  }
  allReviews[reviewIndex].updatedAt = new Date().toISOString();
  await saveReviews(allReviews);

  return { data: allReviews[reviewIndex] };
}

// Approve/unhide review (operator only)
export async function approveReview(reviewId) {
  const mockMode = await isMockModeEnabled();
  const user = getCurrentUser();

  if (!user || user.role !== "operator") {
    throw new Error("Only operators can approve reviews");
  }

  // Backend API call (ready for integration)
  // Uncomment when backend is ready:
  /*
  try {
    const response = await api.patch(`/operator/reviews/${reviewId}/approve`);
    
    if (mockMode) {
      // Also update mock data if mock mode is ON
      const reviews = await loadReviews();
      const stored = localStorage.getItem('xktf_reviews');
      let allReviews = stored ? JSON.parse(stored) : reviews;
      const reviewIndex = allReviews.findIndex(r => r.id === reviewId);
      if (reviewIndex !== -1) {
        allReviews[reviewIndex].isHidden = false;
        allReviews[reviewIndex].flags = [];
        allReviews[reviewIndex].updatedAt = new Date().toISOString();
        await saveReviews(allReviews);
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
  const reviews = await loadReviews();
  const stored = localStorage.getItem("xktf_reviews");
  let allReviews = stored ? JSON.parse(stored) : reviews;
  const reviewIndex = allReviews.findIndex((r) => r.id === reviewId);

  if (reviewIndex === -1) {
    throw new Error("Review not found");
  }

  allReviews[reviewIndex].isHidden = false;
  allReviews[reviewIndex].flags = [];
  allReviews[reviewIndex].updatedAt = new Date().toISOString();
  await saveReviews(allReviews);

  return { data: allReviews[reviewIndex] };
}

// Hide review (admin only)
export async function hideReview(reviewId) {
  const mockMode = await isMockModeEnabled();
  const user = getCurrentUser();

  if (!user || user.role !== "admin") {
    throw new Error("Only admins can hide reviews");
  }

  // Backend API call (ready for integration)
  // Uncomment when backend is ready:
  /*
  try {
    const response = await api.patch(`/admin/reviews/${reviewId}/hide`);
    
    if (mockMode) {
      // Also update mock data if mock mode is ON
      const reviews = await loadReviews();
      const stored = localStorage.getItem('xktf_reviews');
      let allReviews = stored ? JSON.parse(stored) : reviews;
      const reviewIndex = allReviews.findIndex(r => r.id === reviewId);
      if (reviewIndex !== -1) {
        allReviews[reviewIndex].isHidden = true;
        allReviews[reviewIndex].updatedAt = new Date().toISOString();
        await saveReviews(allReviews);
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
  const reviews = await loadReviews();
  const stored = localStorage.getItem("xktf_reviews");
  let allReviews = stored ? JSON.parse(stored) : reviews;
  const reviewIndex = allReviews.findIndex((r) => r.id === reviewId);

  if (reviewIndex === -1) {
    throw new Error("Review not found");
  }

  allReviews[reviewIndex].isHidden = true;
  allReviews[reviewIndex].updatedAt = new Date().toISOString();
  await saveReviews(allReviews);

  return { data: allReviews[reviewIndex] };
}

// Pin review (admin only)
export async function pinReview(reviewId) {
  const mockMode = await isMockModeEnabled();
  const user = getCurrentUser();

  if (!user || user.role !== "admin") {
    throw new Error("Only admins can pin reviews");
  }

  // Backend API call (ready for integration)
  // Uncomment when backend is ready:
  /*
  try {
    const response = await api.patch(`/admin/reviews/${reviewId}/pin`);
    
    if (mockMode) {
      // Also update mock data if mock mode is ON
      const reviews = await loadReviews();
      const stored = localStorage.getItem('xktf_reviews');
      let allReviews = stored ? JSON.parse(stored) : reviews;
      const reviewIndex = allReviews.findIndex(r => r.id === reviewId);
      if (reviewIndex !== -1) {
        allReviews[reviewIndex].isPinned = !allReviews[reviewIndex].isPinned;
        allReviews[reviewIndex].updatedAt = new Date().toISOString();
        await saveReviews(allReviews);
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
  const reviews = await loadReviews();
  const stored = localStorage.getItem("xktf_reviews");
  let allReviews = stored ? JSON.parse(stored) : reviews;
  const reviewIndex = allReviews.findIndex((r) => r.id === reviewId);

  if (reviewIndex === -1) {
    throw new Error("Review not found");
  }

  allReviews[reviewIndex].isPinned = !allReviews[reviewIndex].isPinned;
  allReviews[reviewIndex].updatedAt = new Date().toISOString();
  await saveReviews(allReviews);

  return { data: allReviews[reviewIndex] };
}

// Legacy function for backward compatibility
export async function getReviewsByRating(rating) {
  const { data } = await getAllReviews({ rating: parseInt(rating) });
  return data;
}
