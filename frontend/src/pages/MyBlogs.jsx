import React from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Plus } from "lucide-react";
import { BlogList } from "../components/admin/blog/index.js";
import {
  fetchUserBlogs,
  deleteBlog,
  updateBlog,
  clearError,
} from "../redux/slices/blogsSlice.js";
import { getUserCookie } from "../utils/cookies.js";
import ProtectedRoute from "../components/dashboard/ProtectedRoute.jsx";

function MyBlogsContent() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { blogs, loading, error } = useSelector((state) => state.blogs);
  const reduxUser = useSelector((state) => state.auth.user);
  const user = reduxUser || getUserCookie();

  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("");

  React.useEffect(() => {
    if (user?.id) {
      dispatch(
        fetchUserBlogs({
          userId: user.id,
          search: searchQuery,
          status: statusFilter,
        })
      ).catch(() => {
        // Error is handled by Redux slice, just catch to prevent unhandled promise rejection
      });
    }
  }, [dispatch, user?.id, searchQuery, statusFilter]);

  React.useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleEdit = (blogId) => {
    navigate(`/blogs/edit/${blogId}`);
  };

  const handleDelete = async (blogId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this blog? This action can be undone."
      )
    ) {
      try {
        await dispatch(deleteBlog(blogId)).unwrap();
        // Refresh the list
        if (user?.id) {
          dispatch(
            fetchUserBlogs({
              userId: user.id,
              search: searchQuery,
              status: statusFilter,
            })
          );
        }
      } catch (err) {
        alert("Failed to delete blog: " + (err || "Unknown error"));
      }
    }
  };

  const handlePublish = async (blogId) => {
    if (!window.confirm("Are you sure you want to publish this blog? It will be visible to all users.")) {
      return;
    }
    try {
      const formData = new FormData();
      formData.append("status", "published");
      await dispatch(updateBlog({ blogId, formData })).unwrap();
      // Refresh the list
      if (user?.id) {
        dispatch(
          fetchUserBlogs({
            userId: user.id,
            search: searchQuery,
            status: statusFilter,
          })
        );
      }
    } catch (err) {
      alert("Failed to publish blog: " + (err || "Unknown error"));
    }
  };

  const handleUnpublish = async (blogId) => {
    if (!window.confirm("Are you sure you want to unpublish this blog? It will no longer be visible to users.")) {
      return;
    }
    try {
      const formData = new FormData();
      formData.append("status", "draft");
      await dispatch(updateBlog({ blogId, formData })).unwrap();
      // Refresh the list
      if (user?.id) {
        dispatch(
          fetchUserBlogs({
            userId: user.id,
            search: searchQuery,
            status: statusFilter,
          })
        );
      }
    } catch (err) {
      alert("Failed to unpublish blog: " + (err || "Unknown error"));
    }
  };

  return (
    <div className="bg-gray-950 text-white min-h-screen">
      <Helmet>
        <title>My Blogs | XK Trading Floor</title>
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold mb-2">My Blogs</h1>
            <p className="text-sm text-gray-400">
              Manage your blog posts - create, edit, and delete your own blogs
            </p>
          </div>
          <button
            onClick={() => navigate("/blogs/create")}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create New Blog
          </button>
        </div>

        {error && error.includes("Backend server is not running") && (
          <div className="card mb-6 border-blue-500/50 bg-blue-500/10">
            <div className="card-body">
              <div className="text-blue-300 mb-2 font-semibold">
                Blog Service Temporarily Unavailable
              </div>
              <div className="text-sm text-gray-300 mb-3">
                We're currently unable to load your saved blogs. Don't worry -
                you can still create new blog posts! Your work will be saved
                automatically once the service is back online.
              </div>
            </div>
          </div>
        )}

        {error && !error.includes("Backend server is not running") && (
          <div className="card mb-6 border-red-500/50 bg-red-500/10">
            <div className="card-body">
              <div className="text-red-300 mb-2">{error}</div>
            </div>
          </div>
        )}

        {!loading && !error && blogs.length === 0 && (
          <div className="card mb-6">
            <div className="card-body text-center py-12">
              <div className="text-gray-400 mb-4">No blogs found.</div>
              <button
                onClick={() => navigate("/blogs/create")}
                className="btn btn-primary"
              >
                Create your first blog post
              </button>
            </div>
          </div>
        )}

        {error &&
          error.includes("Backend server is not running") &&
          blogs.length === 0 && (
            <div className="card mb-6">
              <div className="card-body text-center py-12">
                <div className="text-gray-300 mb-4 text-lg">
                  Start writing your first blog post!
                </div>
                <p className="text-sm text-gray-400 mb-6">
                  Create engaging content to share with the trading community.
                </p>
                <button
                  onClick={() => navigate("/blogs/create")}
                  className="btn btn-primary"
                >
                  Create New Blog Post
                </button>
              </div>
            </div>
          )}

        {/* Blog List */}
        <BlogList
          blogs={blogs}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onPublish={handlePublish}
          onUnpublish={handleUnpublish}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          canDelete
        />
      </div>
    </div>
  );
}

export default function MyBlogs() {
  return (
    <ProtectedRoute>
      <MyBlogsContent />
    </ProtectedRoute>
  );
}
