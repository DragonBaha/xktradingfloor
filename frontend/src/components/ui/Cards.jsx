import React from "react";
import ImageWithFallback from "../shared/ImageWithFallback.jsx";

export function FeatureCard({ icon, title, description }) {
  return (
    <div className="card h-full">
      <div className="card-body">
        <div className="h-10 w-10 rounded bg-accent/10 text-accent flex items-center justify-center mb-4">
          {icon}
        </div>
        <h3 className="font-semibold mb-1">{title}</h3>
        <p className="text-sm text-gray-400">{description}</p>
      </div>
    </div>
  );
}

export function EventCard({ event, onView }) {
  return (
    <div className="card overflow-hidden">
      <ImageWithFallback
        src={event.image}
        fallback="/assets/placeholder.jpg"
        alt={event.title}
        className="h-40 w-full object-cover"
      />
      <div className="card-body">
        <div className="flex items-center justify-between mb-2">
          <span
            className={`text-xs px-2 py-0.5 rounded border ${
              event.type === "online"
                ? "text-blue-300 border-blue-700"
                : "text-green-300 border-green-700"
            }`}
          >
            {event.type}
          </span>
          <span className="text-sm text-gray-300">₹{event.price}</span>
        </div>
        <h3 className="font-semibold mb-1">{event.title}</h3>
        <p className="text-sm text-gray-400 line-clamp-2">{event.excerpt}</p>
        <button
          className="btn btn-primary mt-3"
          onClick={() => onView?.(event)}
        >
          Details
        </button>
      </div>
    </div>
  );
}

export function BlogCard({ post, onView }) {
  return (
    <div className="card h-full">
      <div className="card-body">
        <span className="text-xs text-gray-400">
          {new Date(post.publishedAt).toLocaleDateString()}
        </span>
        <h3 className="font-semibold mt-1 mb-2">{post.title}</h3>
        <p className="text-sm text-gray-400 line-clamp-3">{post.excerpt}</p>
        <button
          className="btn btn-secondary mt-3"
          onClick={() => onView?.(post)}
        >
          Read
        </button>
      </div>
    </div>
  );
}

export function ReviewCard({ company, onView }) {
  return (
    <div className="card h-full">
      <div className="card-body">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-10 w-10 rounded bg-muted overflow-hidden">
            <ImageWithFallback
              src={company.logo}
              fallback="/assets/placeholder.jpg"
              alt={company.name}
              className="h-full w-full object-cover"
              useDynamicFallback={true}
            />
          </div>
          <div>
            <div className="text-sm text-gray-400">{company.category}</div>
            <div className="font-semibold">{company.name}</div>
          </div>
        </div>
        <div className="text-sm text-gray-400 mb-3 line-clamp-2">
          {company.details}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm">
            ⭐ {company.ratingsAggregate.toFixed(1)}
          </span>
          <button className="btn btn-primary" onClick={() => onView?.(company)}>
            View
          </button>
        </div>
      </div>
    </div>
  );
}

export function ProductCard({ product, onView }) {
  return (
    <div className="card h-full overflow-hidden">
      <ImageWithFallback
        src={product.images?.[0]}
        fallback="/assets/placeholder.jpg"
        alt={product.title}
        className="h-44 w-full object-cover"
      />
      <div className="card-body">
        <h3 className="font-semibold mb-1">{product.title}</h3>
        <p className="text-sm text-gray-400 line-clamp-2">
          {product.description}
        </p>
        <div className="flex items-center justify-between mt-3">
          <span>₹{product.price}</span>
          <button className="btn btn-primary" onClick={() => onView?.(product)}>
            Details
          </button>
        </div>
      </div>
    </div>
  );
}

export function LockOverlay({ children, locked, cta }) {
  return (
    <div className="relative">
      {children}
      {locked && (
        <div className="absolute inset-0 backdrop-blur-sm bg-black/40 flex items-center justify-center">
          <div className="text-center">
            <div className="mb-2 text-sm text-gray-200">
              Register to access this content
            </div>
            {cta}
          </div>
        </div>
      )}
    </div>
  );
}
