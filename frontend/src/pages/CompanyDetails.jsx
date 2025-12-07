import React from "react";
import { Helmet } from "react-helmet-async";
import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { getCompanyById } from "../controllers/companiesController.js";
import ImageWithFallback from "../components/shared/ImageWithFallback.jsx";
import CardLoader from "../components/shared/CardLoader.jsx";
import { getReviewsByCompanyId } from "../controllers/reviewsController.js";
import StarRating from "../components/reviews/StarRating.jsx";
import CompanyReviewCard from "../components/reviews/CompanyReviewCard.jsx";
import CompanyReviewForm from "../components/reviews/CompanyReviewForm.jsx";
import { getUserCookie } from "../utils/cookies.js";

function CompanyDetails() {
  const { companyId } = useParams();
  const reduxUser = useSelector((state) => state.auth.user);
  const user = reduxUser || getUserCookie();
  const userRole =
    typeof user?.role === "string" ? user.role.toLowerCase() : null;
  const userId = user?.id;
  const canSubmitReview = userRole === "user";
  const [company, setCompany] = React.useState(null);
  const [reviews, setReviews] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [showReviewForm, setShowReviewForm] = React.useState(false);
  const [editingReview, setEditingReview] = React.useState(null);
  const [userReview, setUserReview] = React.useState(null);

  React.useEffect(() => {
    loadData();
  }, [companyId]);

  React.useEffect(() => {
    if (canSubmitReview && userId && reviews.length > 0) {
      const review = reviews.find((r) => r.userId === userId);
      setUserReview(review || null);
    } else {
      setUserReview(null);
    }
  }, [canSubmitReview, userId, reviews]);

  React.useEffect(() => {
    if (!canSubmitReview && showReviewForm) {
      setShowReviewForm(false);
      setEditingReview(null);
    }
  }, [canSubmitReview, showReviewForm]);

  async function loadData() {
    setLoading(true);
    try {
      const [companyRes, reviewsRes] = await Promise.all([
        getCompanyById(companyId),
        getReviewsByCompanyId(companyId),
      ]);
      setCompany(companyRes.data);
      setReviews(reviewsRes.data || []);
    } catch (error) {
      console.error("Error loading company details:", error);
    } finally {
      setLoading(false);
    }
  }

  function handleReviewSuccess() {
    setShowReviewForm(false);
    setEditingReview(null);
    loadData();
  }

  function handleEditReview(review) {
    setEditingReview(review);
    setShowReviewForm(true);
  }

  function handleCancelEdit() {
    setEditingReview(null);
    setShowReviewForm(false);
  }

  function handleDeleteReview() {
    loadData();
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <CardLoader count={1} />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="card">
          <div className="card-body text-center">
            <h2 className="text-xl font-semibold mb-2">Company not found</h2>
            <p className="text-gray-400 mb-4">
              The company you're looking for doesn't exist.
            </p>
            <Link to="/reviews" className="btn btn-primary">
              Back to Reviews
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const validPromoCodes =
    company.promoCodes?.filter((p) => new Date(p.validTo) > new Date()) || [];
  const featuredPromos = validPromoCodes.filter((p) => p.featured);
  const regularPromos = validPromoCodes.filter((p) => !p.featured);

  return (
    <div className="bg-black text-white min-h-screen">
      <Helmet>
        <title>{company.name} | XK Trading Floor</title>
        <meta
          name="description"
          content={`${company.details || "Read reviews and details about"} ${
            company.name
          } on XK Trading Floor.`}
        />
      </Helmet>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Back Button */}
        <Link
          to="/reviews"
          className="text-accent hover:text-accent/80 text-sm inline-flex items-center gap-1"
        >
          ← Back to Companies
        </Link>

        {/* Company Header */}
        <div className="card">
          <div className="card-body">
            <div className="flex items-start gap-4">
              <div className="h-20 w-20 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                <ImageWithFallback
                  src={company.logo}
                  fallback="/assets/placeholder.jpg"
                  alt={company.name}
                  className="h-full w-full object-cover"
                  useDynamicFallback={true}
                />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <h1 className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl mb-2">
                      <span className="bg-gradient-to-r from-blue-400 via-blue-300 to-blue-500 bg-clip-text text-transparent font-semibold">{company.name}</span>
                    </h1>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-sm px-3 py-1 rounded bg-blue-500/20 text-blue-400">
                        {company.category}
                      </span>
                      <div className="flex items-center gap-2">
                        <StarRating
                          value={company.ratingsAggregate}
                          size={20}
                        />
                        <span className="text-lg font-semibold">
                          {company.ratingsAggregate.toFixed(1)}
                        </span>
                        <span className="text-sm text-gray-400">
                          ({company.totalReviews || 0}{" "}
                          {company.totalReviews === 1 ? "review" : "reviews"})
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-sm sm:text-base text-gray-300 mb-4 leading-relaxed">
                  {company.description || company.details}
                </p>
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary inline-flex items-center gap-2"
                >
                  Visit Website →
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Promo Codes */}
        {validPromoCodes.length > 0 && (
          <div className="card">
            <div className="card-body">
              <h2 className="font-display font-bold text-lg sm:text-xl mb-4">
                <span className="bg-gradient-to-r from-blue-400 via-blue-300 to-blue-500 bg-clip-text text-transparent font-semibold">Promo Codes</span> & Offers
              </h2>
              <div className="space-y-4">
                {featuredPromos.map((promo) => (
                  <div
                    key={promo.id}
                    className="p-4 rounded-lg bg-gray-900 border-2 border-gray-700"
                    // className="p-4 rounded-lg bg-gradient-to-r from-green-500/20 to-green-600/20 border-2 border-green-500/50"
                  >
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs px-2 py-0.5 rounded bg-green-500/30 text-green-300 font-semibold">
                            FEATURED
                          </span>
                          <span className="text-lg font-mono font-bold text-green-400">
                            {promo.code}
                          </span>
                        </div>
                        <div className="text-2xl font-bold text-green-400 mb-1">
                          {promo.discount}% OFF
                        </div>
                        {promo.terms && (
                          <p className="text-sm text-gray-300 mt-2">
                            {promo.terms}
                          </p>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-xs text-gray-400 mb-1">
                          Valid until
                        </div>
                        <div className="text-sm font-semibold">
                          {new Date(promo.validTo).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {regularPromos.map((promo) => (
                  <div
                    key={promo.id}
                    className="p-3 rounded-lg bg-gray-800/50 border border-gray-700"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono font-semibold text-green-400">
                            {promo.code}
                          </span>
                          <span className="text-sm font-bold text-green-400">
                            {promo.discount}% OFF
                          </span>
                        </div>
                        {promo.terms && (
                          <p className="text-xs text-gray-400 mt-1">
                            {promo.terms}
                          </p>
                        )}
                      </div>
                      <div className="text-xs text-gray-400 flex-shrink-0">
                        Expires{" "}
                        {new Date(promo.validTo).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Reviews Section */}
        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-bold text-lg sm:text-xl">
                <span className="bg-gradient-to-r from-blue-400 via-blue-300 to-blue-500 bg-clip-text text-transparent font-semibold">User</span> Reviews
              </h2>
              {!user && (
                <Link to="/login" className="btn btn-secondary">
                  Login to Review
                </Link>
              )}
              {user && canSubmitReview && (
                !userReview ? (
                  <button
                    onClick={() => setShowReviewForm(true)}
                    className="btn btn-primary"
                  >
                    Write a Review
                  </button>
                ) : (
                  <div className="text-sm text-gray-400">
                    You've already reviewed this company
                  </div>
                )
              )}
              {user && !canSubmitReview && (
                <div className="text-sm text-gray-400">
                  Only trader accounts can publish reviews.
                </div>
              )}
            </div>

            {/* Review Form */}
            {showReviewForm && user && canSubmitReview && (
              <div className="mb-6">
                <CompanyReviewForm
                  companyId={companyId}
                  existingReview={editingReview}
                  onSuccess={handleReviewSuccess}
                  onCancel={handleCancelEdit}
                />
              </div>
            )}

            {/* Reviews List */}
            {reviews.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-2">No reviews yet.</div>
                <div className="text-sm text-gray-500">
                  Be the first to review this company!
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <CompanyReviewCard
                    key={review.id}
                    review={review}
                    currentUserId={userId}
                    onUpdate={handleEditReview}
                    onDelete={handleDeleteReview}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CompanyDetails;
