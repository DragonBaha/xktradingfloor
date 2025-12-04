import React from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Plus } from "lucide-react";
import { BlogList } from "../../components/admin/blog/index.js";
import {
  fetchAllBlogs,
  deleteBlog,
  permanentDeleteBlog,
  flagBlog,
  unflagBlog,
  updateBlog,
  clearError,
} from "../../redux/slices/blogsSlice.js";
import { getUserCookie } from "../../utils/cookies.js";
import ProtectedRoute from "../../components/dashboard/ProtectedRoute.jsx";
import ConfirmModal from "../../components/shared/ConfirmModal.jsx";
import FlagModal from "../../components/shared/FlagModal.jsx";

function AdminBlogsContent() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { blogs, loading, error } = useSelector((state) => state.blogs);
  const reduxUser = useSelector((state) => state.auth.user);
  const user = reduxUser || getUserCookie();

  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("");
  const [viewFilter, setViewFilter] = React.useState("all"); // "all", "flagged", "own"
  const [deleteModal, setDeleteModal] = React.useState({ isOpen: false, blogId: null });
  const [flagModal, setFlagModal] = React.useState({ isOpen: false, blogId: null });

  React.useEffect(() => {
    dispatch(fetchAllBlogs({ search: searchQuery, status: statusFilter }));
  }, [dispatch, searchQuery, statusFilter]);

  // Filter blogs based on view filter
  const filteredBlogs = React.useMemo(() => {
    if (!blogs || !Array.isArray(blogs)) return [];
    
    switch (viewFilter) {
      case "flagged":
        return blogs.filter((blog) => {
          // Check both flags array and isFlagged field
          const flags = Array.isArray(blog.flags) ? blog.flags : [];
          return flags.length > 0 || blog.isFlagged === true;
        });
      case "own":
        return blogs.filter((blog) => {
          const authorId = blog.author?._id || blog.author;
          return authorId === user?.id;
        });
      case "all":
      default:
        return blogs;
    }
  }, [blogs, viewFilter, user?.id]);

  React.useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleEdit = (blogId) => {
    navigate(`/admin/blogs/edit/${blogId}`);
  };

  const handleDelete = (blogId) => {
    setDeleteModal({ isOpen: true, blogId });
  };

  const confirmDelete = async () => {
    if (!deleteModal.blogId) return;
    try {
      // Use permanent delete to completely remove the blog
      await dispatch(permanentDeleteBlog(deleteModal.blogId)).unwrap();
      // Refresh the list after deletion
      dispatch(fetchAllBlogs({ search: searchQuery, status: statusFilter }));
      setDeleteModal({ isOpen: false, blogId: null });
    } catch (err) {
      // Extract error message from response
      const errorMessage = 
        err?.response?.data?.message || 
        err?.message || 
        (typeof err === "string" ? err : "Unknown error");
      console.error("Failed to delete blog:", err);
      alert(`Failed to delete blog: ${errorMessage}`);
    }
  };

  const handleFlag = (blogId) => {
    setFlagModal({ isOpen: true, blogId });
  };

  const confirmFlag = async (reason, description) => {
    if (!flagModal.blogId) return;
    try {
      await dispatch(
        flagBlog({
          blogId: flagModal.blogId,
          flagType: reason,
          reason: reason,
          description: description || "",
        })
      ).unwrap();
      // Refresh the list
      dispatch(fetchAllBlogs({ search: searchQuery, status: statusFilter }));
      setFlagModal({ isOpen: false, blogId: null });
    } catch (err) {
      // Extract error message from response
      const errorMessage = 
        err?.response?.data?.message || 
        err?.message || 
        (typeof err === "string" ? err : "An error occurred. Please contact support or try again later.");
      console.error("Failed to flag blog:", err);
      alert(`Failed to flag blog: ${errorMessage}`);
    }
  };

  const handleUnflag = async (blogId) => {
    if (!window.confirm("Are you sure you want to unflag this blog?")) {
      return;
    }
    try {
      await dispatch(unflagBlog(blogId)).unwrap();
      // Refresh the list
      dispatch(fetchAllBlogs({ search: searchQuery, status: statusFilter }));
    } catch (err) {
      // Extract error message from response
      const errorMessage = 
        err?.response?.data?.message || 
        err?.message || 
        (typeof err === "string" ? err : "Unknown error");
      console.error("Failed to unflag blog:", err);
      alert(`Failed to unflag blog: ${errorMessage}`);
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
      dispatch(fetchAllBlogs({ search: searchQuery, status: statusFilter }));
    } catch (err) {
      // Extract error message from response
      const errorMessage = 
        err?.response?.data?.message || 
        err?.message || 
        (typeof err === "string" ? err : "Unknown error");
      console.error("Failed to publish blog:", err);
      alert(`Failed to publish blog: ${errorMessage}`);
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
      // Refresh admin list
      dispatch(fetchAllBlogs({ search: searchQuery, status: statusFilter }));
      // Note: The /blog page will automatically refresh via its polling mechanism
      // or users can manually refresh to see the change
    } catch (err) {
      // Extract error message from response
      const errorMessage = 
        err?.response?.data?.message || 
        err?.message || 
        (typeof err === "string" ? err : "Unknown error");
      console.error("Failed to unpublish blog:", err);
      alert(`Failed to unpublish blog: ${errorMessage}`);
    }
  };

  return (
    <div className="bg-gray-950 text-white min-h-screen">
      <Helmet>
        <title>Blog Management | XK Trading Floor Admin</title>
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold mb-2">Blog Management</h1>
            <p className="text-sm text-gray-400">
              Create, edit, and manage blog posts
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={viewFilter}
              onChange={(e) => setViewFilter(e.target.value)}
              className="select select-bordered bg-gray-900/70 border-white/10 text-white"
            >
              <option value="all">All Blogs</option>
              <option value="flagged">Flagged Blogs</option>
              <option value="own">My Blogs</option>
            </select>
            <button
              onClick={() => navigate("/admin/blogs/create")}
              className="btn btn-primary flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create New Blog
            </button>
          </div>
        </div>

        {error && (
          <div className="card mb-6 border-red-500/50 bg-red-500/10">
            <div className="card-body text-red-300">{error}</div>
          </div>
        )}

        {/* Blog List */}
        <BlogList
          blogs={filteredBlogs}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onFlag={handleFlag}
          onUnflag={handleUnflag}
          onPublish={handlePublish}
          onUnpublish={handleUnpublish}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          canDelete
          canFlag
          canUnflag
        />
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, blogId: null })}
        onConfirm={confirmDelete}
        title="Delete Blog"
        message="Are you sure you want to delete this blog? This action can be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />

      {/* Flag Modal */}
      <FlagModal
        isOpen={flagModal.isOpen}
        onClose={() => setFlagModal({ isOpen: false, blogId: null })}
        onConfirm={confirmFlag}
        title="Flag Blog Post"
      />
    </div>
  );
}

export default function AdminBlogs() {
  return (
    <ProtectedRoute role="admin">
      <AdminBlogsContent />
    </ProtectedRoute>
  );
}
