import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import StarRating from "./StarRating.jsx";
import ImageWithFallback from "../shared/ImageWithFallback.jsx";

function CompanyCard({ company }) {
  const categoryColors = {
    Broker: "bg-blue-500/20 text-blue-400",
    PropFirm: "bg-purple-500/20 text-purple-400",
    Crypto: "bg-yellow-500/20 text-yellow-400",
  };

  const featuredPromo =
    company.promoCodes?.find((p) => p.featured) || company.promoCodes?.[0];
  const isPromoValid =
    featuredPromo && new Date(featuredPromo.validTo) > new Date();

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="bg-gray-800/40 border border-gray-700/50 hover:bg-gray-800/60 hover:border-gray-600/50 hover:shadow-xl hover:shadow-black/20 transition-all duration-300 rounded-2xl backdrop-blur-sm overflow-hidden"
    >
      <div className="card-body">
        <div className="flex items-start gap-4">
          <div className="h-16 w-16 rounded-lg bg-muted overflow-hidden flex-shrink-0">
            <ImageWithFallback
              src={company.logo}
              fallback="/assets/placeholder.jpg"
              alt={company.name}
              className="h-full w-full object-cover"
              useDynamicFallback={true}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <Link
                  to={`/reviews/${company.id}`}
                  className="text-lg font-semibold hover:text-accent transition-colors"
                >
                  {company.name}
                </Link>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`text-xs px-2 py-0.5 rounded ${
                      categoryColors[company.category] ||
                      "bg-gray-500/20 text-gray-400"
                    }`}
                  >
                    {company.category}
                  </span>
                  {company.status === "pending" && (
                    <span className="text-xs px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-400">
                      Pending Approval
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="flex items-center gap-1">
                  <StarRating value={company.ratingsAggregate} size={16} />
                  <span className="text-sm font-medium ml-1">
                    {company.ratingsAggregate.toFixed(1)}
                  </span>
                </div>
                <div className="text-xs text-gray-400 mt-0.5">
                  ({company.totalReviews || 0}{" "}
                  {company.totalReviews === 1 ? "review" : "reviews"})
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-300 line-clamp-2 mb-3">
              {company.details || company.description}
            </p>
            {isPromoValid && (
              <div className="mt-3 p-2 rounded bg-green-500/10 border border-green-500/30">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-green-400 font-semibold">
                      Featured Promo
                    </div>
                    <div className="text-sm font-mono text-green-300">
                      {featuredPromo.code}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-green-400">
                      {featuredPromo.discount}% OFF
                    </div>
                    <div className="text-xs text-gray-400">
                      Expires{" "}
                      {new Date(featuredPromo.validTo).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3 mt-4">
              <Link
                to={`/reviews/${company.id}`}
                className="text-sm text-accent hover:text-accent/80 font-medium"
              >
                View Details →
              </Link>
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-400 hover:text-gray-300"
              >
                Visit Website
              </a>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default CompanyCard;
