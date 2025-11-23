import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { X, Upload, Image as ImageIcon } from "lucide-react";
import BlogEditor from "./BlogEditor.jsx";
import {
  createBlog,
  updateBlog,
  fetchBlogById,
  clearError,
} from "../../../redux/slices/blogsSlice.js";
import { getUserCookie } from "../../../utils/cookies.js";

export default function BlogForm() {
  const { blogId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentBlog, loading, error } = useSelector((state) => state.blogs);
  const reduxUser = useSelector((state) => state.auth.user);
  const user = reduxUser || getUserCookie();
  const isEdit = !!blogId;

  const [formData, setFormData] = React.useState({
    title: "",
    content: "",
    excerpt: "",
    categories: [],
    tags: [],
    status: "draft",
    isFeatured: false,
    seoKeywords: [],
  });

  const [files, setFiles] = React.useState({
    featuredImage: null,
    images: [],
  });

  const [previews, setPreviews] = React.useState({
    featuredImage: null,
    images: [],
  });

  const [categoryInput, setCategoryInput] = React.useState("");
  const [tagInput, setTagInput] = React.useState("");
  const [seoKeywordInput, setSeoKeywordInput] = React.useState("");

  React.useEffect(() => {
    if (isEdit && blogId) {
      dispatch(fetchBlogById(blogId));
    }
    return () => {
      dispatch(clearError());
    };
  }, [blogId, isEdit, dispatch]);

  React.useEffect(() => {
    if (isEdit && currentBlog) {
      setFormData({
        title: currentBlog.title || "",
        content: currentBlog.content || "",
        excerpt: currentBlog.excerpt || "",
        categories: currentBlog.categories || [],
        tags: currentBlog.tags || [],
        status: currentBlog.status || "draft",
        isFeatured: currentBlog.isFeatured || false,
        seoKeywords: currentBlog.seoKeywords || [],
      });
      setPreviews({
        featuredImage: currentBlog.featuredImage || null,
        images: currentBlog.images || [],
      });
    }
  }, [currentBlog, isEdit]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (field, fileList) => {
    const filesArray = Array.from(fileList);

    if (field === "featuredImage") {
      const file = filesArray[0];
      setFiles((prev) => ({ ...prev, featuredImage: file }));
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreviews((prev) => ({ ...prev, featuredImage: e.target.result }));
        };
        reader.readAsDataURL(file);
      }
    } else if (field === "images") {
      const newImages = filesArray.slice(0, 4);
      setFiles((prev) => ({ ...prev, images: newImages }));
      const newPreviews = [];
      newImages.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          newPreviews.push(e.target.result);
          if (newPreviews.length === newImages.length) {
            setPreviews((prev) => ({ ...prev, images: newPreviews }));
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeFile = (field, index = null) => {
    if (field === "featuredImage") {
      setFiles((prev) => ({ ...prev, featuredImage: null }));
      setPreviews((prev) => ({ ...prev, featuredImage: null }));
    } else if (field === "images") {
      const newFiles = [...files.images];
      const newPreviews = [...previews.images];
      newFiles.splice(index, 1);
      newPreviews.splice(index, 1);
      setFiles((prev) => ({ ...prev, images: newFiles }));
      setPreviews((prev) => ({ ...prev, images: newPreviews }));
    }
  };

  const addCategory = () => {
    if (
      categoryInput.trim() &&
      !formData.categories.includes(categoryInput.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        categories: [...prev.categories, categoryInput.trim()],
      }));
      setCategoryInput("");
    }
  };

  const removeCategory = (category) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.filter((c) => c !== category),
    }));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  const removeTag = (tag) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  const addSeoKeyword = () => {
    if (
      seoKeywordInput.trim() &&
      !formData.seoKeywords.includes(seoKeywordInput.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        seoKeywords: [...prev.seoKeywords, seoKeywordInput.trim()],
      }));
      setSeoKeywordInput("");
    }
  };

  const removeSeoKeyword = (keyword) => {
    setFormData((prev) => ({
      ...prev,
      seoKeywords: prev.seoKeywords.filter((k) => k !== keyword),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.content.trim()) {
      alert("Title and content are required");
      return;
    }

    // Create FormData for multipart/form-data
    const submitData = new FormData();

    // Append text fields
    submitData.append("title", formData.title);
    submitData.append("content", formData.content);
    if (formData.excerpt) submitData.append("excerpt", formData.excerpt);
    submitData.append("status", formData.status);
    submitData.append("isFeatured", formData.isFeatured);

    // Append arrays
    formData.categories.forEach((cat) => {
      submitData.append("categories", cat);
    });
    formData.tags.forEach((tag) => {
      submitData.append("tags", tag);
    });
    formData.seoKeywords.forEach((keyword) => {
      submitData.append("seoKeywords", keyword);
    });

    // Append files
    if (files.featuredImage) {
      submitData.append("featuredImage", files.featuredImage);
    }
    files.images.forEach((image) => {
      submitData.append("images", image);
    });

    try {
      if (isEdit) {
        await dispatch(updateBlog({ blogId, formData: submitData })).unwrap();
      } else {
        await dispatch(createBlog(submitData)).unwrap();
      }
      navigate("/admin/blogs");
    } catch (err) {
      console.error("Error saving blog:", err);
    }
  };

  if (isEdit && loading && !currentBlog) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-400">Loading blog...</div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">
          {isEdit ? "Edit Blog Post" : "Create New Blog Post"}
        </h1>
        <p className="text-sm text-gray-400">
          {isEdit
            ? "Update your blog post details"
            : "Fill in the details to create a new blog post"}
        </p>
      </div>

      {error && (
        <div className="card mb-6 border-red-500/50 bg-red-500/10">
          <div className="card-body text-red-300">{error}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div className="card">
          <div className="card-body">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              className="input w-full"
              placeholder="Enter blog title"
              required
            />
          </div>
        </div>

        {/* Excerpt */}
        <div className="card">
          <div className="card-body">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Excerpt
            </label>
            <textarea
              value={formData.excerpt}
              onChange={(e) => handleInputChange("excerpt", e.target.value)}
              className="input w-full"
              rows="3"
              placeholder="Brief description of the blog post"
              maxLength={500}
            />
            <div className="text-xs text-gray-500 mt-1">
              {formData.excerpt.length}/500 characters
            </div>
          </div>
        </div>

        {/* Content Editor */}
        <div className="card">
          <div className="card-body">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Content <span className="text-red-400">*</span>
            </label>
            <BlogEditor
              value={formData.content}
              onChange={(value) => handleInputChange("content", value)}
            />
          </div>
        </div>

        {/* Categories */}
        <div className="card">
          <div className="card-body">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Categories
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={categoryInput}
                onChange={(e) => setCategoryInput(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addCategory())
                }
                className="input flex-1"
                placeholder="Add category"
              />
              <button
                type="button"
                onClick={addCategory}
                className="btn btn-secondary"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.categories.map((cat, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded bg-blue-500/20 text-blue-300 text-sm"
                >
                  {cat}
                  <button
                    type="button"
                    onClick={() => removeCategory(cat)}
                    className="hover:text-red-400"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="card">
          <div className="card-body">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tags
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addTag())
                }
                className="input flex-1"
                placeholder="Add tag"
              />
              <button
                type="button"
                onClick={addTag}
                className="btn btn-secondary"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded bg-green-500/20 text-green-300 text-sm"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:text-red-400"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Status and Featured */}
        <div className="card">
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange("status", e.target.value)}
                  className="input w-full"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div className="flex items-center">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) =>
                      handleInputChange("isFeatured", e.target.checked)
                    }
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm font-medium text-gray-300">
                    Featured Post
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* SEO Keywords */}
        <div className="card">
          <div className="card-body">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              SEO Keywords
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={seoKeywordInput}
                onChange={(e) => setSeoKeywordInput(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addSeoKeyword())
                }
                className="input flex-1"
                placeholder="Add SEO keyword"
              />
              <button
                type="button"
                onClick={addSeoKeyword}
                className="btn btn-secondary"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.seoKeywords.map((keyword, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded bg-purple-500/20 text-purple-300 text-sm"
                >
                  {keyword}
                  <button
                    type="button"
                    onClick={() => removeSeoKeyword(keyword)}
                    className="hover:text-red-400"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Featured Image */}
        <div className="card">
          <div className="card-body">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Featured Image
            </label>
            {previews.featuredImage ? (
              <div className="relative inline-block">
                <img
                  src={previews.featuredImage}
                  alt="Featured preview"
                  className="w-48 h-48 object-cover rounded"
                />
                <button
                  type="button"
                  onClick={() => removeFile("featuredImage")}
                  className="absolute top-2 right-2 p-1 bg-red-500 rounded hover:bg-red-600"
                >
                  <X className="h-4 w-4 text-white" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-48 h-48 border-2 border-dashed border-gray-600 rounded cursor-pointer hover:border-blue-500">
                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-400">Upload Image</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) =>
                    handleFileChange("featuredImage", e.target.files)
                  }
                />
              </label>
            )}
          </div>
        </div>

        {/* Additional Images */}
        <div className="card">
          <div className="card-body">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Additional Images (Max 4)
            </label>
            <div className="flex flex-wrap gap-4">
              {previews.images.map((preview, idx) => (
                <div key={idx} className="relative">
                  <img
                    src={preview}
                    alt={`Preview ${idx + 1}`}
                    className="w-32 h-32 object-cover rounded"
                  />
                  <button
                    type="button"
                    onClick={() => removeFile("images", idx)}
                    className="absolute top-1 right-1 p-1 bg-red-500 rounded hover:bg-red-600"
                  >
                    <X className="h-3 w-3 text-white" />
                  </button>
                </div>
              ))}
              {previews.images.length < 4 && (
                <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-gray-600 rounded cursor-pointer hover:border-blue-500">
                  <ImageIcon className="h-6 w-6 text-gray-400 mb-1" />
                  <span className="text-xs text-gray-400">Add Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    multiple
                    onChange={(e) => handleFileChange("images", e.target.files)}
                  />
                </label>
              )}
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex items-center gap-4">
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? "Saving..." : isEdit ? "Update Blog" : "Create Blog"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/admin/blogs")}
            className="btn btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
