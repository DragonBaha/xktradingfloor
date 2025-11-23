import React from "react";
import { Link } from "react-router-dom";
import { Edit, Trash2, Eye, Calendar, User } from "lucide-react";
import BlogStatusBadge from "./BlogStatusBadge.jsx";
import BlogFlags from "./BlogFlags.jsx";
import { useSelector } from "react-redux";
import { getUserCookie } from "../../../utils/cookies.js";

export default function BlogCardAdmin({
  blog,
  onEdit,
  onDelete,
  onPermanentDelete,
  onFlag,
  onUnflag,
}) {
  const reduxUser = useSelector((state) => state.auth.user);
  const user = reduxUser || getUserCookie();
  const isAdmin = user?.role === "admin";
  const isOperator = user?.role === "operator";
  const isOwner = blog.author?._id === user?.id || blog.author === user?.id;

  const canEdit =
    isAdmin || (isOperator && isOwner) || (user?.role === "User" && isOwner);
  const canDelete =
    isAdmin || (isOperator && isOwner) || (user?.role === "User" && isOwner);

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="card hover:border-blue-500/50 transition-colors">
      <div className="card-body">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-3 mb-2">
              {blog.featuredImage && (
                <img
                  src={blog.featuredImage}
                  alt={blog.title}
                  className="w-20 h-20 object-cover rounded flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg mb-1 line-clamp-2">
                  {blog.title}
                </h3>
                {blog.excerpt && (
                  <p className="text-sm text-gray-400 line-clamp-2 mb-2">
                    {blog.excerpt}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span>
                      {blog.author?.name || blog.authorName || "Unknown"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {formatDate(blog.createdAt || blog.publishedAt)}
                    </span>
                  </div>
                  {blog.views !== undefined && <span>{blog.views} views</span>}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-3">
              <BlogStatusBadge status={blog.status} />
              {blog.isFeatured && (
                <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-xs border border-blue-500/50">
                  Featured
                </span>
              )}
              {blog.categories && blog.categories.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {blog.categories.slice(0, 3).map((cat, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-gray-700/50 text-gray-300 text-xs"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <BlogFlags blog={blog} onFlag={onFlag} onUnflag={onUnflag} />
          </div>

          <div className="flex flex-col gap-2 flex-shrink-0">
            {canEdit && (
              <button
                onClick={() => onEdit(blog._id)}
                className="btn btn-secondary text-xs px-3 py-1.5 flex items-center gap-1"
                title="Edit blog"
              >
                <Edit className="h-3 w-3" />
                Edit
              </button>
            )}
            {canDelete && (
              <button
                onClick={() => onDelete(blog._id)}
                className="btn btn-secondary text-xs px-3 py-1.5 flex items-center gap-1 text-red-400 hover:text-red-300"
                title="Delete blog"
              >
                <Trash2 className="h-3 w-3" />
                Delete
              </button>
            )}
            {isAdmin && (
              <button
                onClick={() => onPermanentDelete(blog._id)}
                className="btn btn-secondary text-xs px-3 py-1.5 flex items-center gap-1 text-red-500 hover:text-red-400"
                title="Permanently delete blog"
              >
                <Trash2 className="h-3 w-3" />
                Permanent Delete
              </button>
            )}
            <Link
              to={`/blog/${blog._id}`}
              className="btn btn-secondary text-xs px-3 py-1.5 flex items-center gap-1"
              target="_blank"
            >
              <Eye className="h-3 w-3" />
              View
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
