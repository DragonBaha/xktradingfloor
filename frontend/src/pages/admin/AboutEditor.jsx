import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, XCircle, Loader2, Save } from "lucide-react";
import { Helmet } from "react-helmet-async";
import RichTextEditor from "../../components/shared/RichTextEditor.jsx";
import ProtectedRoute from "../../components/dashboard/ProtectedRoute.jsx";
import ConfirmModal from "../../components/shared/ConfirmModal.jsx";

const DEFAULT_ABOUT_DATA = {
  name: "Sahil",
  designation: "Founder",
  description: "Passionate about empowering traders through education and technology. Building XK Trading Floor to create a transparent and supportive trading community.",
  image: "/assets/leadership/Sahil.png",
};

function getAboutData() {
  if (typeof window === "undefined") return DEFAULT_ABOUT_DATA;
  try {
    const stored = localStorage.getItem("xk_about_data");
    if (stored) {
      return { ...DEFAULT_ABOUT_DATA, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.error("Error loading about data:", error);
  }
  return DEFAULT_ABOUT_DATA;
}

function saveAboutData(data) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("xk_about_data", JSON.stringify(data));
    // Trigger storage event for cross-tab sync
    window.dispatchEvent(new Event("storage"));
  } catch (error) {
    console.error("Error saving about data:", error);
    throw error;
  }
}

function AboutEditorContent() {
  const navigate = useNavigate();
  const [formData, setFormData] = React.useState(DEFAULT_ABOUT_DATA);
  const [imageFile, setImageFile] = React.useState(null);
  const [imagePreview, setImagePreview] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");
  const [showUnsavedModal, setShowUnsavedModal] = React.useState(false);
  const [hasChanges, setHasChanges] = React.useState(false);

  React.useEffect(() => {
    const data = getAboutData();
    setFormData(data);
    setImagePreview(data.image || "");
    setLoading(false);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setHasChanges(true);
  };

  const handleDescriptionChange = (content) => {
    setFormData((prev) => ({ ...prev, description: content }));
    setHasChanges(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setHasChanges(true);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(DEFAULT_ABOUT_DATA.image);
    setFormData((prev) => ({ ...prev, image: DEFAULT_ABOUT_DATA.image }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setError("");
    setSaving(true);

    try {
      const dataToSave = {
        ...formData,
        image: imageFile ? URL.createObjectURL(imageFile) : formData.image,
      };
      saveAboutData(dataToSave);
      setHasChanges(false);
      // Show success message
      setTimeout(() => {
        navigate("/about");
      }, 500);
    } catch (error) {
      setError("Failed to save about section: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      setShowUnsavedModal(true);
    } else {
      navigate("/about");
    }
  };

  const confirmDiscard = () => {
    setShowUnsavedModal(false);
    navigate("/about");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="bg-gray-950 text-white min-h-screen">
      <Helmet>
        <title>Edit About Section | XK Trading Floor Admin</title>
      </Helmet>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <button
          type="button"
          onClick={handleCancel}
          className="mb-6 inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="rounded-3xl border border-white/10 bg-gray-900/60 p-8 shadow-2xl">
          <div className="mb-8">
            <p className="text-xs uppercase tracking-widest text-indigo-300">
              Admin Panel
            </p>
            <h1 className="text-3xl font-semibold mt-2">Edit About Section</h1>
            <p className="text-gray-400 mt-2">
              Update the founder information displayed on the About page.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300">
              {error}
            </div>
          )}

          <form
            className="space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              handleSave();
            }}
          >
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input input-bordered w-full border-white/10 bg-gray-950/40 text-white"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                Designation <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                className="input input-bordered w-full border-white/10 bg-gray-950/40 text-white"
                placeholder="e.g., Founder, CEO, Co-founder"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                Profile Image
              </label>
              <div className="rounded-2xl border border-dashed border-white/20 bg-gray-950/30 p-4">
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Profile preview"
                      className="w-full h-auto rounded-xl object-contain max-h-[600px]"
                      style={{ maxWidth: "100%" }}
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
                    <span>Upload profile image (JPG/PNG)</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </label>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                About Description <span className="text-red-400">*</span>
              </label>
              <RichTextEditor
                value={formData.description}
                onChange={handleDescriptionChange}
                placeholder="Write a brief description about the founder..."
              />
            </div>

            <div className="flex flex-wrap gap-3 pt-4">
              <button
                type="submit"
                className="btn btn-primary px-6"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="btn btn-ghost text-gray-300 hover:text-white"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Unsaved Changes Modal */}
      <ConfirmModal
        isOpen={showUnsavedModal}
        onClose={() => setShowUnsavedModal(false)}
        onConfirm={confirmDiscard}
        title="Unsaved Changes"
        message="You have unsaved changes. Are you sure you want to leave?"
        confirmText="Discard Changes"
        cancelText="Continue Editing"
        variant="warning"
      />
    </div>
  );
}

export default function AboutEditor() {
  return (
    <ProtectedRoute role="admin">
      <AboutEditorContent />
    </ProtectedRoute>
  );
}

