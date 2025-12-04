import React from "react";
import {
  Edit,
  Loader2,
  ShieldCheck,
  Trash2,
  Flag,
  Eye,
  EyeOff,
} from "lucide-react";

const statusStyles = {
  draft: "bg-yellow-500/10 text-yellow-300 border-yellow-500/40",
  published: "bg-emerald-500/10 text-emerald-300 border-emerald-500/40",
  archived: "bg-slate-500/10 text-slate-300 border-slate-500/40",
};

const noop = () => {};

function BlogList({
  blogs = [],
  loading = false,
  searchQuery = "",
  onSearchChange = noop,
  statusFilter = "",
  onStatusFilterChange = noop,
  onEdit = noop,
  onDelete = noop,
  onFlag = noop,
  onUnflag = noop,
  onPublish = noop,
  onUnpublish = noop,
  canDelete = true,
  canFlag = false,
  canUnflag = false,
}) {
  const hasBlogs = Array.isArray(blogs) && blogs.length > 0;

  const formatDate = (value) => {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <input
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search by title, author, or tag"
          className="input input-bordered bg-gray-900/70 border-white/10 text-white placeholder:text-gray-500"
          type="search"
        />
        <select
          value={statusFilter}
          onChange={(event) => onStatusFilterChange(event.target.value)}
          className="select select-bordered bg-gray-900/70 border-white/10 text-white"
        >
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      <div className="rounded-2xl border border-white/10 bg-gray-900/70 backdrop-blur">
        {loading && (
          <div className="flex items-center justify-center gap-3 py-16 text-gray-400">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading blogs...
          </div>
        )}

        {!loading && !hasBlogs && (
          <div className="py-16 text-center text-gray-400">
            <div className="text-lg font-medium mb-2">No blogs found</div>
            <p className="text-sm text-gray-500">
              Try adjusting your filters or create a new blog post.
            </p>
          </div>
        )}

        {!loading && hasBlogs && (
          <div className="divide-y divide-white/5">
            {blogs.map((blog) => {
              const flags = Array.isArray(blog.flags) ? blog.flags : [];
              return (
                <div
                  key={blog._id || blog.id}
                  className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center"
                >
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 text-white">
                      <h3 className="text-lg font-semibold">
                        {blog.title || "Untitled blog"}
                      </h3>
                      {blog.isFeatured && (
                        <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-300 border border-amber-500/40">
                          Featured
                        </span>
                      )}
                    </div>
                    <div className="mt-1 text-sm text-gray-400">
                      {blog.author?.fullName ||
                        blog.author?.name ||
                        blog.author?.email ||
                        "Unknown author"}
                      {" • "}
                      Updated {formatDate(blog.updatedAt || blog.createdAt)}
                    </div>
                    {blog.excerpt && (
                      <p className="mt-2 text-sm text-gray-300">
                        {blog.excerpt}
                      </p>
                    )}
                    {Array.isArray(blog.tags) && blog.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {blog.tags.slice(0, 6).map((tag) => (
                          <span
                            key={`${blog._id}-${tag}`}
                            className="rounded-full border border-white/10 px-2 py-0.5 text-xs text-gray-300"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-3 lg:w-64">
                    <div
                      className={`inline-flex items-center justify-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                        statusStyles[blog.status] ||
                        "border-white/10 text-gray-300"
                      }`}
                    >
                      {blog.status || "unknown"}
                    </div>
                    {flags.length > 0 && (
                      <div className="text-xs text-gray-400">
                        Flags:{" "}
                        <span className="font-semibold text-red-300">
                          {flags.length}
                        </span>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(blog._id || blog.id)}
                        className="btn btn-sm btn-outline border-white/20 text-white hover:bg-white/10"
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </button>
                      {blog.status === "draft" && (
                        <button
                          type="button"
                          onClick={() => onPublish(blog._id || blog.id)}
                          className="btn btn-sm btn-outline border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10"
                        >
                          <Eye className="h-4 w-4" />
                          Publish
                        </button>
                      )}
                      {blog.status === "published" && (
                        <button
                          type="button"
                          onClick={() => onUnpublish(blog._id || blog.id)}
                          className="btn btn-sm btn-outline border-yellow-500/40 text-yellow-300 hover:bg-yellow-500/10"
                        >
                          <EyeOff className="h-4 w-4" />
                          Unpublish
                        </button>
                      )}
                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => onDelete(blog._id || blog.id)}
                          className="btn btn-sm btn-outline border-red-500/40 text-red-300 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </button>
                      )}
                    </div>
                    {(canFlag || (canUnflag && (flags.length > 0 || blog.isFlagged))) && (
                      <div className="flex flex-wrap gap-2">
                        {canFlag && !blog.isFlagged && (
                          <button
                            type="button"
                            onClick={() => onFlag(blog._id || blog.id)}
                            className="btn btn-xs btn-outline border-amber-500/40 text-amber-300 hover:bg-amber-500/10"
                          >
                            <Flag className="h-4 w-4" />
                            Flag
                          </button>
                        )}
                        {canUnflag && (flags.length > 0 || blog.isFlagged) && (
                          <button
                            type="button"
                            onClick={() => onUnflag(blog._id || blog.id)}
                            className="btn btn-xs btn-outline border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10"
                          >
                            <ShieldCheck className="h-4 w-4" />
                            Unflag
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default BlogList;
