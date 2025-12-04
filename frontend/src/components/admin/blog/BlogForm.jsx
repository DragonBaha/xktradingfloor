import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, Upload, XCircle, Save, FileText } from "lucide-react";
import {
  fetchBlogById,
  createBlog,
  updateBlog,
  clearCurrentBlog,
  clearError,
} from "../../../redux/slices/blogsSlice.js";
import RichTextEditor from "../../shared/RichTextEditor.jsx";
import ChipInput from "../../shared/ChipInput.jsx";
import { getUserCookie } from "../../../utils/cookies.js";

const BLOG_CATEGORIES = [
  "Trading",
  "Stocks",
  "Forex",
  "Crypto",
  "Options",
  "Personal Finance",
  "Technical Analysis",
  "Market News",
];

const MIN_SUMMARY_LENGTH = 20;

const defaultState = {
  title: "",
  excerpt: "",
  content: "",
  status: "draft",
  category: "",
  tags: [],
  seoKeywords: [],
  isFeatured: false,
};

// Auto-save key generator
const getAutoSaveKey = (blogId, userId) => {
  if (blogId) {
    return `blog_draft_${blogId}`;
  }
  return `blog_draft_new_${userId || "anonymous"}`;
};

function BlogForm({ redirectPath = "/admin/blogs", blogId: blogIdProp }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const params = useParams();
  const blogId = blogIdProp ?? params.blogId;
  const isEditing = Boolean(blogId);
  const user = getUserCookie();
  const userId = user?.id;

  const { currentBlog, loading, error } = useSelector((state) => state.blogs);

  const [formState, setFormState] = React.useState(defaultState);
  const [featuredImageFile, setFeaturedImageFile] = React.useState(null);
  const [featuredImagePreview, setFeaturedImagePreview] = React.useState("");
  const [localError, setLocalError] = React.useState("");
  const [summaryError, setSummaryError] = React.useState("");
  const [lastSaved, setLastSaved] = React.useState(null);
  const [isAutoSaving, setIsAutoSaving] = React.useState(false);
  const autoSaveKey = React.useMemo(() => getAutoSaveKey(blogId, userId), [blogId, userId]);

  // Load draft from localStorage on mount (only for new blogs)
  React.useEffect(() => {
    if (!isEditing && typeof window !== "undefined") {
      try {
        const savedDraft = localStorage.getItem(autoSaveKey);
        if (savedDraft) {
          const draft = JSON.parse(savedDraft);
          setFormState(draft.formState || defaultState);
          setFeaturedImagePreview(draft.featuredImagePreview || "");
          setLastSaved(draft.lastSaved ? new Date(draft.lastSaved) : null);
        }
      } catch (err) {
        console.error("Failed to load draft:", err);
      }
    }
  }, [isEditing, autoSaveKey]);

  React.useEffect(() => {
    if (isEditing) {
      dispatch(fetchBlogById(blogId));
    } else {
      dispatch(clearCurrentBlog());
    }

    return () => {
      dispatch(clearCurrentBlog());
      dispatch(clearError());
    };
  }, [dispatch, blogId, isEditing]);

  React.useEffect(() => {
    if (currentBlog && isEditing) {
      // Extract first category if multiple exist, or use first from array
      const categories = currentBlog.categories || [];
      const category = Array.isArray(categories) ? categories[0] || "" : categories || "";
      
      setFormState({
        title: currentBlog.title || "",
        excerpt: currentBlog.excerpt || "",
        content: currentBlog.content || "",
        status: currentBlog.status || "draft",
        category: category,
        tags: Array.isArray(currentBlog.tags) ? currentBlog.tags : [],
        seoKeywords: Array.isArray(currentBlog.seoKeywords) ? currentBlog.seoKeywords : [],
        isFeatured: Boolean(currentBlog.isFeatured),
      });
      setFeaturedImagePreview(currentBlog.featuredImage || "");
      // Clear auto-save when loading existing blog
      if (typeof window !== "undefined") {
        localStorage.removeItem(autoSaveKey);
      }
    }
  }, [currentBlog, isEditing, autoSaveKey]);

  // Auto-save functionality - saves to localStorage every 30 seconds
  React.useEffect(() => {
    if (isEditing) return; // Don't auto-save when editing existing blog

    const autoSaveInterval = setInterval(() => {
      // Only save if there's meaningful content
      if (formState.title.trim() || formState.content.trim() || formState.excerpt.trim()) {
        setIsAutoSaving(true);
        try {
          const draftData = {
            formState,
            featuredImagePreview,
            lastSaved: new Date().toISOString(),
          };
          localStorage.setItem(autoSaveKey, JSON.stringify(draftData));
          setLastSaved(new Date());
        } catch (err) {
          console.error("Auto-save failed:", err);
        } finally {
          setIsAutoSaving(false);
        }
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [formState, featuredImagePreview, isEditing, autoSaveKey]);

  // Also save on form changes (debounced)
  React.useEffect(() => {
    if (isEditing) return;
    
    const timeoutId = setTimeout(() => {
      if (formState.title.trim() || formState.content.trim() || formState.excerpt.trim()) {
        try {
          const draftData = {
            formState,
            featuredImagePreview,
            lastSaved: new Date().toISOString(),
          };
          localStorage.setItem(autoSaveKey, JSON.stringify(draftData));
          setLastSaved(new Date());
        } catch (err) {
          console.error("Auto-save failed:", err);
        }
      }
    }, 2000); // Debounce for 2 seconds

    return () => clearTimeout(timeoutId);
  }, [formState, featuredImagePreview, isEditing, autoSaveKey]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormState((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Validate summary length
    if (name === "excerpt") {
      if (value.trim().length > 0 && value.trim().length < MIN_SUMMARY_LENGTH) {
        setSummaryError(`Summary must be at least ${MIN_SUMMARY_LENGTH} characters.`);
      } else {
        setSummaryError("");
      }
    }
  };

  const handleContentChange = (content) => {
    setFormState((prev) => ({
      ...prev,
      content: content,
    }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setFeaturedImageFile(file);
    setFeaturedImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setFeaturedImageFile(null);
    setFeaturedImagePreview("");
  };

  const handleSave = async (statusToSave) => {
    setLocalError("");
    setSummaryError("");
    dispatch(clearError());

    // Validation
    if (!formState.title.trim()) {
      setLocalError("Title is required.");
      return;
    }

    if (!formState.content.trim() || formState.content.trim() === "<p><br></p>") {
      setLocalError("Content is required.");
      return;
    }

    if (formState.excerpt.trim() && formState.excerpt.trim().length < MIN_SUMMARY_LENGTH) {
      setSummaryError(`Summary must be at least ${MIN_SUMMARY_LENGTH} characters.`);
      return;
    }

    if (!formState.category) {
      setLocalError("Please select a category.");
      return;
    }

    const payload = new FormData();
    payload.append("title", formState.title.trim());
    payload.append("excerpt", formState.excerpt.trim());
    payload.append("content", formState.content.trim());
    payload.append("status", statusToSave);
    payload.append("isFeatured", formState.isFeatured ? "true" : "false");
    payload.append("categories", formState.category);

    // Append tags and SEO keywords as arrays
    formState.tags.forEach((tag) => {
      payload.append("tags", tag);
    });
    formState.seoKeywords.forEach((keyword) => {
      payload.append("seoKeywords", keyword);
    });

    if (featuredImageFile) {
      payload.append("featuredImage", featuredImageFile);
    }

    try {
      if (isEditing) {
        await dispatch(updateBlog({ blogId, formData: payload })).unwrap();
      } else {
        await dispatch(createBlog(payload)).unwrap();
      }
      
      // Clear auto-save after successful save
      if (typeof window !== "undefined") {
        localStorage.removeItem(autoSaveKey);
      }
      
      navigate(redirectPath);
    } catch (err) {
      setLocalError(
        err?.message || err || "Failed to save blog. Please try again."
      );
    }
  };

  const handleSaveAsDraft = async (e) => {
    e.preventDefault();
    await handleSave("draft");
  };

  const handlePublish = async (e) => {
    e.preventDefault();
    await handleSave("published");
  };

  const handleCancel = () => {
    // Clear auto-save when canceling
    if (typeof window !== "undefined" && !isEditing) {
      if (window.confirm("Are you sure you want to cancel? Your draft will be saved locally.")) {
        localStorage.removeItem(autoSaveKey);
        navigate(redirectPath);
      }
    } else {
      navigate(redirectPath);
    }
  };

  const summaryLength = formState.excerpt.trim().length;
  const summaryRemaining = Math.max(0, MIN_SUMMARY_LENGTH - summaryLength);

  return (
    <div className="bg-gray-950 text-white min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="rounded-3xl border border-white/10 bg-gray-900/60 p-8 shadow-2xl">
          <div className="mb-8">
            <p className="text-xs uppercase tracking-widest text-indigo-300">
              {isEditing ? "Edit blog post" : "Create blog post"}
            </p>
            <h1 className="text-3xl font-semibold mt-2">
              {isEditing ? "Update your blog" : "Publish a new blog"}
            </h1>
            <p className="text-gray-400 mt-2">
              Craft long-form posts with featured images, tags, and SEO details.
            </p>
            {!isEditing && lastSaved && (
              <p className="text-xs text-green-400 mt-2 flex items-center gap-2">
                <Save className="h-3 w-3" />
                Draft auto-saved {lastSaved.toLocaleTimeString()}
                {isAutoSaving && <span className="text-gray-500">(saving...)</span>}
              </p>
            )}
          </div>

          {(localError || error) && (
            <div className="mb-6 rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {localError || error}
            </div>
          )}

          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                Title<span className="text-red-400">*</span>
              </label>
              <input
                name="title"
                value={formState.title}
                onChange={handleChange}
                placeholder="e.g., How I built my trading playbook"
                className="input input-bordered w-full border-white/10 bg-gray-950/40 text-white placeholder:text-gray-500"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                Summary
                {formState.excerpt.trim() && (
                  <span className="ml-2 text-xs text-gray-500">
                    ({summaryLength} / {MIN_SUMMARY_LENGTH} min characters)
                  </span>
                )}
              </label>
              <textarea
                name="excerpt"
                value={formState.excerpt}
                onChange={handleChange}
                rows={3}
                placeholder="Short elevator pitch for your blog (minimum 20 characters)."
                className={`textarea textarea-bordered w-full border-white/10 bg-gray-950/40 text-white placeholder:text-gray-500 ${
                  summaryError ? "border-red-500/50" : ""
                }`}
              />
              {summaryError && (
                <p className="text-xs text-red-400">{summaryError}</p>
              )}
              {formState.excerpt.trim() && summaryRemaining > 0 && (
                <p className="text-xs text-yellow-400">
                  {summaryRemaining} more characters required
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                Content<span className="text-red-400">*</span>
              </label>
              <RichTextEditor
                value={formState.content}
                onChange={handleContentChange}
                placeholder="Share your ideas..."
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  Category<span className="text-red-400">*</span>
                </label>
                <select
                  name="category"
                  value={formState.category}
                  onChange={handleChange}
                  className="select select-bordered w-full border-white/10 bg-gray-950/40 text-white"
                  required
                >
                  <option value="">Select a category...</option>
                  {BLOG_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

            </div>

            <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-gray-950/40 px-4 py-3 text-sm text-gray-300">
              <input
                type="checkbox"
                name="isFeatured"
                checked={formState.isFeatured}
                onChange={handleChange}
                className="checkbox checkbox-primary"
              />
              Feature this blog on landing pages
            </label>

            <ChipInput
              label="Tags"
              value={formState.tags}
              onChange={(tags) => setFormState((prev) => ({ ...prev, tags }))}
              placeholder="Type tag and press comma (e.g., swing, forex, mindset)"
            />

            <ChipInput
              label="SEO Keywords"
              value={formState.seoKeywords}
              onChange={(keywords) =>
                setFormState((prev) => ({ ...prev, seoKeywords: keywords }))
              }
              placeholder="Type keyword and press comma (e.g., pro trading journal, prop firm evaluation)"
            />

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                Featured Image
              </label>
              <div className="rounded-2xl border border-dashed border-white/20 bg-gray-950/30 p-4 text-sm text-gray-400">
                {featuredImagePreview ? (
                  <div className="relative">
                    <img
                      src={featuredImagePreview}
                      alt="Preview"
                      className="max-h-64 w-full rounded-xl object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-red-500/80 px-3 py-1 text-xs font-semibold text-white"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      Remove
                    </button>
                  </div>
                ) : (
                  <label className="flex cursor-pointer flex-col items-center gap-3 rounded-xl border border-white/10 bg-gray-900/50 px-6 py-10 text-center text-gray-400 hover:border-indigo-400/40">
                    <Upload className="h-6 w-6" />
                    <span>Upload cover image (JPG/PNG)</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={handleSaveAsDraft}
                className="btn btn-secondary px-6 flex items-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save as Draft
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handlePublish}
                className="btn btn-primary px-6 flex items-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4" />
                    Publish
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="btn btn-ghost text-gray-300 hover:text-white"
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default BlogForm;
