import React from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Plus } from "lucide-react";
import { BlogList } from "../../components/admin/blog/index.js";
import {
  fetchOperatorBlogs,
  deleteBlog,
  flagBlog,
  unflagBlog,
  clearError,
} from "../../redux/slices/blogsSlice.js";
import { getUserCookie } from "../../utils/cookies.js";
import ProtectedRoute from "../../components/dashboard/ProtectedRoute.jsx";

function OperatorBlogsContent() {
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
        fetchOperatorBlogs({
          operatorId: user.id,
          search: searchQuery,
          status: statusFilter,
        })
      );
    }
  }, [dispatch, user?.id, searchQuery, statusFilter]);

  // Filter blogs: show own blogs + normal user blogs (for flagging)
  const filteredBlogs = React.useMemo(() => {
    if (!blogs || !Array.isArray(blogs)) return [];
    return blogs.filter((blog) => {
      const authorId = blog.author?._id || blog.author;
      const isOwnBlog = authorId === user?.id;
      const authorRole = blog.author?.role?.toLowerCase();
      const isNormalUserBlog = authorRole === "user" || authorRole === undefined;
      // Show own blogs OR normal user blogs (for flagging)
      return isOwnBlog || isNormalUserBlog;
    });
  }, [blogs, user?.id]);

  React.useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleEdit = (blogId) => {
    navigate(`/operator/blogs/edit/${blogId}`);
  };

  const handleDelete = async (blogId) => {
    // Operators can only delete their own blogs
    const blog = blogs.find((b) => b._id === blogId || b.id === blogId);
    const authorId = blog?.author?._id || blog?.author;
    const isOwner = authorId === user?.id;

    if (!isOwner) {
      alert("You can only delete your own blogs. You can flag other users' blogs if they violate guidelines.");
      return;
    }

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
            fetchOperatorBlogs({
              operatorId: user.id,
              search: searchQuery,
              status: statusFilter,
            })
          );
        }
      } catch (err) {
        alert("Failed to delete blog: " + err);
      }
    }
  };

  const handleFlag = async (blogId) => {
    // For operators, we'll use a simple flag with default reason
    // In a real scenario, you might want to show a modal here too
    const flagType = "inappropriate"; // Default flag type
    if (!window.confirm("Are you sure you want to flag this blog?")) {
      return;
    }
    try {
      await dispatch(
        flagBlog({
          blogId,
          flagType,
          reason: flagType,
          description: "Flagged by operator",
        })
      ).unwrap();
      // Refresh the list
      if (user?.id) {
        dispatch(
          fetchOperatorBlogs({
            operatorId: user.id,
            search: searchQuery,
            status: statusFilter,
          })
        );
      }
    } catch (err) {
      alert("Failed to flag blog: " + (err || "Unknown error"));
    }
  };

  const handleUnflag = async (blogId) => {
    if (!window.confirm("Are you sure you want to unflag this blog?")) {
      return;
    }
    try {
      await dispatch(unflagBlog(blogId)).unwrap();
      // Refresh the list
      if (user?.id) {
        dispatch(
          fetchOperatorBlogs({
            operatorId: user.id,
            search: searchQuery,
            status: statusFilter,
          })
        );
      }
    } catch (err) {
      alert("Failed to unflag blog: " + (err || "Unknown error"));
    }
  };

  return (
    <div className="bg-gray-950 text-white min-h-screen">
      <Helmet>
        <title>Blog Management | XK Trading Floor Operator</title>
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold mb-2">Blog Management</h1>
            <p className="text-sm text-gray-400">
              Manage your blogs and flag inappropriate content
            </p>
          </div>
          <button
            onClick={() => navigate("/operator/blogs/create")}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create New Blog
          </button>
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
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          canDelete
          canFlag
          canUnflag
        />
      </div>
    </div>
  );
}

export default function OperatorBlogs() {
  return (
    <ProtectedRoute>
      <OperatorBlogsContent />
    </ProtectedRoute>
  );
}
