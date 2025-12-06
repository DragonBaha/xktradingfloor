import React from "react";
import { Helmet } from "react-helmet-async";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Edit, Trash2, Shield, ShieldOff, Pin, PinOff, Eye, EyeOff } from "lucide-react";
import { getCompanyById, deleteCompany, toggleCompanyStatus, addPromoCode, updatePromoCode, deletePromoCode } from "../../controllers/companiesController.js";
import { getReviewsByCompanyId, hideReview, pinReview, deleteReview } from "../../controllers/reviewsController.js";
import ProtectedRoute from "../../components/dashboard/ProtectedRoute.jsx";
import RatingBreakdownChart from "../../components/reviews/RatingBreakdownChart.jsx";
import ImageWithFallback from "../../components/shared/ImageWithFallback.jsx";
import StarRating from "../../components/reviews/StarRating.jsx";
import ConfirmModal from "../../components/shared/ConfirmModal.jsx";
import { useSelector } from "react-redux";
import { getUserCookie } from "../../utils/cookies.js";

function AdminCompanyDetailsContent() {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const reduxUser = useSelector((state) => state.auth.user);
  const user = reduxUser || getUserCookie();

  const [company, setCompany] = React.useState(null);
  const [reviews, setReviews] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [deleteCompanyModal, setDeleteCompanyModal] = React.useState({ isOpen: false });
  const [deleteReviewModal, setDeleteReviewModal] = React.useState({ isOpen: false, reviewId: null });
  const [deletePromoModal, setDeletePromoModal] = React.useState({ isOpen: false, promoId: null });
  const [showPromoForm, setShowPromoForm] = React.useState(false);
  const [editingPromo, setEditingPromo] = React.useState(null);
  const [promoForm, setPromoForm] = React.useState({
    code: '',
    discount: '',
    discountType: 'percentage',
    validFrom: '',
    validTo: '',
    terms: '',
    featured: false
  });
  const [promoSubmitting, setPromoSubmitting] = React.useState(false);

  React.useEffect(() => {
    loadData();
  }, [companyId]);

  async function loadData() {
    setLoading(true);
    try {
      const [companyRes, reviewsRes] = await Promise.all([
        getCompanyById(companyId),
        getReviewsByCompanyId(companyId),
      ]);
      setCompany(companyRes.data);
      // Filter out hidden reviews for display, but show all to admin
      setReviews(reviewsRes.data || []);
    } catch (error) {
      console.error("Error loading company details:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    setDeleteCompanyModal({ isOpen: true });
  }

  const confirmDeleteCompany = async () => {
    try {
      await deleteCompany(companyId);
      navigate("/admin/companies");
    } catch (error) {
      console.error("Failed to delete company:", error);
    }
  };

  async function handleToggleStatus() {
    try {
      await toggleCompanyStatus(companyId);
      await loadData();
    } catch (error) {
      console.error("Failed to toggle company status:", error);
    }
  }

  async function handlePinReview(reviewId) {
    try {
      await pinReview(reviewId);
      await loadData();
    } catch (error) {
      console.error("Failed to pin/unpin review:", error);
    }
  }

  async function handleHideReview(reviewId) {
    try {
      await hideReview(reviewId);
      await loadData();
    } catch (error) {
      console.error("Failed to hide review:", error);
    }
  }

  async function handleDeleteReview(reviewId) {
    setDeleteReviewModal({ isOpen: true, reviewId });
  }

  const confirmDeleteReview = async () => {
    if (!deleteReviewModal.reviewId) return;
    try {
      await deleteReview(deleteReviewModal.reviewId);
      await loadData();
    } catch (error) {
      console.error("Failed to delete review:", error);
    }
  };

  function handleAddPromoCode() {
    setPromoForm({
      code: '',
      discount: '',
      discountType: 'percentage',
      validFrom: '',
      validTo: '',
      terms: '',
      featured: false
    });
    setEditingPromo(null);
    setShowPromoForm(true);
  }

  function handleEditPromoCode(promo) {
    setPromoForm({
      code: promo.code || '',
      discount: promo.discount?.toString() || '',
      discountType: promo.discountType || 'percentage',
      validFrom: promo.validFrom ? new Date(promo.validFrom).toISOString().split('T')[0] : '',
      validTo: promo.validTo ? new Date(promo.validTo).toISOString().split('T')[0] : '',
      terms: promo.terms || '',
      featured: promo.featured || false
    });
    setEditingPromo(promo);
    setShowPromoForm(true);
  }

  async function handleSavePromoCode() {
    if (!promoForm.code || !promoForm.discount || !promoForm.validTo) {
      alert('Please fill in promo code, discount, and expiry date');
      return;
    }

    setPromoSubmitting(true);
    try {
      const promoData = {
        code: promoForm.code.toUpperCase(),
        discount: parseFloat(promoForm.discount),
        discountType: promoForm.discountType || 'percentage',
        validFrom: promoForm.validFrom || new Date().toISOString(),
        validTo: new Date(promoForm.validTo).toISOString(),
        terms: promoForm.terms || '',
        featured: promoForm.featured || false
      };

      if (editingPromo) {
        await updatePromoCode(companyId, editingPromo.id || editingPromo._id, promoData);
      } else {
        await addPromoCode(companyId, promoData);
      }

      await loadData();
      setShowPromoForm(false);
      setEditingPromo(null);
      setPromoForm({
        code: '',
        discount: '',
        discountType: 'percentage',
        validFrom: '',
        validTo: '',
        terms: '',
        featured: false
      });
    } catch (error) {
      console.error("Failed to save promo code:", error);
      alert(error.message || 'Failed to save promo code');
    } finally {
      setPromoSubmitting(false);
    }
  }

  function handleDeletePromoCode(promoId) {
    setDeletePromoModal({ isOpen: true, promoId });
  }

  const confirmDeletePromo = async () => {
    if (!deletePromoModal.promoId) return;
    try {
      await deletePromoCode(companyId, deletePromoModal.promoId);
      await loadData();
    } catch (error) {
      console.error("Failed to delete promo code:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="text-center py-16">
        <div className="text-gray-400 mb-4">Company not found</div>
        <Link to="/admin/companies" className="btn btn-primary">
          Back to Companies
        </Link>
      </div>
    );
  }

  const visibleReviews = reviews.filter((r) => !r.isHidden);
  const pinnedReviews = visibleReviews.filter((r) => r.isPinned);
  const regularReviews = visibleReviews.filter((r) => !r.isPinned);

  return (
    <div className="bg-gray-950 text-white min-h-screen">
      <Helmet>
        <title>{company.name} - Admin | XK Trading Floor</title>
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to="/admin/companies"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Companies
        </Link>

        {/* Company Header */}
        <div className="card mb-6">
          <div className="card-body">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                <div className="h-20 w-20 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                  <ImageWithFallback
                    src={company.logo}
                    fallback="/assets/placeholder.jpg"
                    alt={company.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <h1 className="text-3xl font-bold mb-2">{company.name}</h1>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 rounded bg-blue-500/20 text-blue-400 text-sm">
                      {company.category}
                    </span>
                    <span
                      className={`px-3 py-1 rounded text-sm ${
                        company.status === "approved"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : company.status === "pending"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {company.status}
                    </span>
                    <div className="flex items-center gap-2">
                      <StarRating value={company.ratingsAggregate} size={20} />
                      <span className="text-lg font-semibold">
                        {company.ratingsAggregate?.toFixed(1) || "0.0"}
                      </span>
                      <span className="text-sm text-gray-400">
                        ({company.totalReviews || 0} reviews)
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-300">{company.description || company.details}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/admin/companies/edit/${companyId}`)}
                  className="btn btn-outline border-white/20 text-white hover:bg-white/10"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </button>
                <button
                  onClick={handleToggleStatus}
                  className={`btn btn-outline ${
                    company.status === "approved"
                      ? "border-yellow-500/40 text-yellow-300 hover:bg-yellow-500/10"
                      : "border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10"
                  }`}
                >
                  {company.status === "approved" ? (
                    <>
                      <ShieldOff className="h-4 w-4" />
                      Block
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4" />
                      Approve
                    </>
                  )}
                </button>
                <button
                  onClick={handleDelete}
                  className="btn btn-outline border-red-500/40 text-red-300 hover:bg-red-500/10"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Reviews Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Rating Breakdown */}
            <div className="card">
              <div className="card-body">
                <RatingBreakdownChart reviews={visibleReviews} />
              </div>
            </div>

            {/* Reviews List */}
            <div className="card">
              <div className="card-body">
                <h2 className="text-xl font-semibold mb-4">
                  Reviews ({visibleReviews.length} visible, {reviews.length - visibleReviews.length} hidden)
                </h2>

                {pinnedReviews.length > 0 && (
                  <div className="space-y-4 mb-6">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
                      Pinned Reviews
                    </h3>
                    {pinnedReviews.map((review) => (
                      <ReviewCard
                        key={review.id}
                        review={review}
                        onPin={() => handlePinReview(review.id)}
                        onHide={() => handleHideReview(review.id)}
                        onDelete={() => handleDeleteReview(review.id)}
                      />
                    ))}
                  </div>
                )}

                {regularReviews.length > 0 && (
                  <div className="space-y-4">
                    {pinnedReviews.length > 0 && (
                      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">
                        All Reviews
                      </h3>
                    )}
                    {regularReviews.map((review) => (
                      <ReviewCard
                        key={review.id}
                        review={review}
                        onPin={() => handlePinReview(review.id)}
                        onHide={() => handleHideReview(review.id)}
                        onDelete={() => handleDeleteReview(review.id)}
                      />
                    ))}
                  </div>
                )}

                {visibleReviews.length === 0 && (
                  <div className="text-center py-12 text-gray-400">
                    No reviews yet for this company.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="card">
              <div className="card-body">
                <h3 className="font-semibold mb-4">Company Stats</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Reviews</span>
                    <span className="text-white font-semibold">{reviews.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Visible Reviews</span>
                    <span className="text-white font-semibold">{visibleReviews.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Average Rating</span>
                    <span className="text-white font-semibold">
                      {company.ratingsAggregate?.toFixed(1) || "0.0"} ⭐
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Status</span>
                    <span className="text-white font-semibold capitalize">{company.status}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Promo Codes Section */}
            <div className="card">
              <div className="card-body">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Promo Codes</h3>
                  <button
                    onClick={handleAddPromoCode}
                    className="btn btn-xs btn-primary"
                  >
                    + Add
                  </button>
                </div>

                {showPromoForm && (
                  <div className="mb-4 p-4 rounded-lg bg-gray-800/50 border border-gray-700 space-y-3">
                    <h4 className="text-sm font-semibold">
                      {editingPromo ? 'Edit Promo Code' : 'Add New Promo Code'}
                    </h4>
                    <div className="space-y-2">
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Code *</label>
                        <input
                          type="text"
                          value={promoForm.code}
                          onChange={(e) => setPromoForm({ ...promoForm, code: e.target.value.toUpperCase() })}
                          className="input input-sm w-full"
                          placeholder="PROMOCODE"
                          disabled={promoSubmitting}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Discount *</label>
                          <input
                            type="number"
                            value={promoForm.discount}
                            onChange={(e) => setPromoForm({ ...promoForm, discount: e.target.value })}
                            className="input input-sm w-full"
                            placeholder="10"
                            min="0"
                            disabled={promoSubmitting}
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Type</label>
                          <select
                            value={promoForm.discountType}
                            onChange={(e) => setPromoForm({ ...promoForm, discountType: e.target.value })}
                            className="input input-sm w-full"
                            disabled={promoSubmitting}
                          >
                            <option value="percentage">%</option>
                            <option value="fixed">Fixed</option>
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Valid From</label>
                          <input
                            type="date"
                            value={promoForm.validFrom}
                            onChange={(e) => setPromoForm({ ...promoForm, validFrom: e.target.value })}
                            className="input input-sm w-full"
                            disabled={promoSubmitting}
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Valid To *</label>
                          <input
                            type="date"
                            value={promoForm.validTo}
                            onChange={(e) => setPromoForm({ ...promoForm, validTo: e.target.value })}
                            className="input input-sm w-full"
                            required
                            disabled={promoSubmitting}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Terms</label>
                        <textarea
                          value={promoForm.terms}
                          onChange={(e) => setPromoForm({ ...promoForm, terms: e.target.value })}
                          className="input input-sm w-full h-16"
                          placeholder="Terms and conditions"
                          disabled={promoSubmitting}
                        />
                      </div>
                      <div>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={promoForm.featured}
                            onChange={(e) => setPromoForm({ ...promoForm, featured: e.target.checked })}
                            className="checkbox checkbox-sm"
                            disabled={promoSubmitting}
                          />
                          <span className="text-xs text-gray-400">Featured</span>
                        </label>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleSavePromoCode}
                          className="btn btn-xs btn-primary flex-1"
                          disabled={promoSubmitting}
                        >
                          {promoSubmitting ? 'Saving...' : editingPromo ? 'Update' : 'Add'}
                        </button>
                        <button
                          onClick={() => {
                            setShowPromoForm(false);
                            setEditingPromo(null);
                          }}
                          className="btn btn-xs btn-outline"
                          disabled={promoSubmitting}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  {company.promoCodes?.length > 0 ? (
                    company.promoCodes.map((promo) => (
                      <div
                        key={promo.id || promo._id}
                        className="p-3 rounded-lg bg-gray-800/30 border border-gray-700"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-mono font-semibold text-sm">{promo.code}</span>
                              <span className="text-xs text-green-400">
                                {promo.discount}{promo.discountType === 'percentage' ? '%' : ''} OFF
                              </span>
                              {promo.featured && (
                                <span className="text-xs px-1.5 py-0.5 rounded bg-green-500/20 text-green-400">
                                  Featured
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-400">
                              Valid until {new Date(promo.validTo).toLocaleDateString()}
                            </div>
                            {promo.terms && (
                              <div className="text-xs text-gray-500 mt-1">{promo.terms}</div>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleEditPromoCode(promo)}
                              className="btn btn-xs btn-ghost"
                              title="Edit"
                            >
                              <Edit className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => handleDeletePromoCode(promo.id || promo._id)}
                              className="btn btn-xs btn-ghost text-red-400"
                              title="Delete"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-sm text-gray-400">
                      No promo codes yet
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Company Modal */}
      <ConfirmModal
        isOpen={deleteCompanyModal.isOpen}
        onClose={() => setDeleteCompanyModal({ isOpen: false })}
        onConfirm={confirmDeleteCompany}
        title="Delete Company"
        message={`Are you sure you want to delete "${company?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />

      {/* Delete Review Modal */}
      <ConfirmModal
        isOpen={deleteReviewModal.isOpen}
        onClose={() => setDeleteReviewModal({ isOpen: false, reviewId: null })}
        onConfirm={confirmDeleteReview}
        title="Delete Review"
        message="Are you sure you want to delete this review? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />

      {/* Delete Promo Code Modal */}
      <ConfirmModal
        isOpen={deletePromoModal.isOpen}
        onClose={() => setDeletePromoModal({ isOpen: false, promoId: null })}
        onConfirm={confirmDeletePromo}
        title="Delete Promo Code"
        message="Are you sure you want to delete this promo code? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}

function ReviewCard({ review, onPin, onHide, onDelete }) {
  return (
    <div className={`p-4 rounded-lg border ${review.isPinned ? 'border-amber-500/40 bg-amber-500/5' : 'border-white/10 bg-gray-900/30'}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-white">{review.userName}</span>
            {review.isVerified && (
              <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-400">
                Verified
              </span>
            )}
            {review.isPinned && (
              <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-400">
                Pinned
              </span>
            )}
          </div>
          <StarRating value={review.rating} size={16} />
        </div>
        <div className="flex gap-2">
          <button
            onClick={onPin}
            className={`btn btn-xs btn-outline ${
              review.isPinned
                ? "border-amber-500/40 text-amber-300"
                : "border-white/20 text-white"
            }`}
            title={review.isPinned ? "Unpin review" : "Pin review"}
          >
            {review.isPinned ? <PinOff className="h-3 w-3" /> : <Pin className="h-3 w-3" />}
          </button>
          <button
            onClick={onHide}
            className="btn btn-xs btn-outline border-yellow-500/40 text-yellow-300"
            title="Hide review"
          >
            <EyeOff className="h-3 w-3" />
          </button>
          {onDelete && (
            <button
              onClick={onDelete}
              className="btn btn-xs btn-outline border-red-500/40 text-red-300"
              title="Delete review"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>
      {review.pros && (
        <div className="text-sm mb-2">
          <span className="text-green-400 font-semibold">Pros:</span> {review.pros}
        </div>
      )}
      {review.cons && (
        <div className="text-sm mb-2">
          <span className="text-red-400 font-semibold">Cons:</span> {review.cons}
        </div>
      )}
      {review.description && (
        <p className="text-sm text-gray-300">{review.description}</p>
      )}
      {review.screenshot && (
        <img
          src={review.screenshot}
          alt="Review screenshot"
          className="mt-2 max-w-xs rounded-lg"
        />
      )}
      <div className="text-xs text-gray-500 mt-2">
        {new Date(review.createdAt).toLocaleDateString()}
      </div>
    </div>
  );
}

export default function AdminCompanyDetails() {
  return (
    <ProtectedRoute role="admin">
      <AdminCompanyDetailsContent />
    </ProtectedRoute>
  );
}


