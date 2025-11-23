import React from "react";
import { Search, Filter } from "lucide-react";
import BlogCardAdmin from "./BlogCardAdmin.jsx";

export default function BlogList({
  blogs,
  loading,
  onEdit,
  onDelete,
  onPermanentDelete,
  onFlag,
  onUnflag,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
}) {
  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="card">
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search blogs by title, author..."
                className="input pl-10 w-full"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => onStatusFilterChange(e.target.value)}
                className="input pl-10 w-full"
              >
                <option value="">All Status</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Blog List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="text-gray-400">Loading blogs...</div>
        </div>
      ) : blogs.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-12">
            <div className="text-gray-400 mb-4">No blogs found</div>
            <p className="text-sm text-gray-500">
              {searchQuery || statusFilter
                ? "Try adjusting your search or filter criteria"
                : "Create your first blog post to get started"}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {blogs.map((blog) => (
            <BlogCardAdmin
              key={blog._id}
              blog={blog}
              onEdit={onEdit}
              onDelete={onDelete}
              onPermanentDelete={onPermanentDelete}
              onFlag={onFlag}
              onUnflag={onUnflag}
            />
          ))}
        </div>
      )}
    </div>
  );
}
