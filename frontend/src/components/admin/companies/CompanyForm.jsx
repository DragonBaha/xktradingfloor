import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Upload, XCircle, Loader2, Edit } from "lucide-react";
import { useSelector } from "react-redux";
import { getCompanyById, createCompany, updateCompany, addPromoCode, updatePromoCode, deletePromoCode } from "../../../controllers/companiesController.js";
import { getUserCookie } from "../../../utils/cookies.js";
import RichTextEditor from "../../shared/RichTextEditor.jsx";

const MAX_SHORT_DESCRIPTION = 150;

export default function CompanyForm({ redirectPath = "/admin/companies" }) {
  const navigate = useNavigate();
  const params = useParams();
  const companyId = params.companyId;
  const isEditing = Boolean(companyId);
  const reduxUser = useSelector((state) => state.auth.user);
  const user = reduxUser || getUserCookie();

  const [form, setForm] = React.useState({
    name: "",
    category: "Broker",
    website: "",
    logo: "",
    details: "",
    description: "",
    status: "pending",
    promoCodes: [],
  });
  const [logoFile, setLogoFile] = React.useState(null);
  const [logoPreview, setLogoPreview] = React.useState("");
  const [images, setImages] = React.useState([]);
  const [imageFiles, setImageFiles] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState("");
  const [showPromoForm, setShowPromoForm] = React.useState(false);
  const [editingPromo, setEditingPromo] = React.useState(null);
  const [promoForm, setPromoForm] = React.useState({
    code: '',
    discount: '',
    discountType: 'percentage',
    validFrom: '',
    validTo: '',
    terms: '',
    featured: false
  });
  const [promoSubmitting, setPromoSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (isEditing && companyId) {
      loadCompany();
    }
  }, [companyId, isEditing]);

  async function loadCompany() {
    setLoading(true);
    try {
      const { data } = await getCompanyById(companyId);
      setForm({
        name: data.name || "",
        category: data.category || "Broker",
        website: data.website || "",
        logo: data.logo || "",
        details: data.details || "",
        description: data.description || "",
        status: data.status || "pending",
        promoCodes: data.promoCodes || [],
      });
      setLogoPreview(data.logo || "");
      setImages(data.images || []);
    } catch (error) {
      setError("Failed to load company: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  function handleLogoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  }

  function handleImagesChange(e) {
    const files = Array.from(e.target.files || []);
    setImageFiles((prev) => [...prev, ...files]);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImages((prev) => [...prev, { url: e.target.result, file }]);
      };
      reader.readAsDataURL(file);
    });
  }

  function removeImage(index) {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function handleShortDescriptionChange(e) {
    const value = e.target.value;
    if (value.length <= MAX_SHORT_DESCRIPTION) {
      setForm({ ...form, details: value });
    }
  }

  function handleDescriptionChange(content) {
    setForm({ ...form, description: content });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    if (form.details.trim().length < 10) {
      setError("Short description must be at least 10 characters.");
      setSubmitting(false);
      return;
    }

    try {
      // Don't send promoCodes in company form - they're managed separately via API
      const { promoCodes, ...companyData } = form;
      const promoCodesToAdd = promoCodes || [];
      const finalData = {
        ...companyData,
        logo: logoFile || form.logo,
        images: imageFiles.length > 0 ? imageFiles : images.map((img) => img.url),
      };

      if (isEditing) {
        await updateCompany(companyId, finalData);
        navigate(redirectPath);
      } else {
        // Create company first
        const result = await createCompany(finalData);
        const newCompanyId = result?.data?._id || result?.data?.id;
        
        if (newCompanyId) {
          // After creating company, add all promo codes that were added during creation
          if (promoCodesToAdd.length > 0) {
            try {
              // Add all promo codes one by one
              for (const promo of promoCodesToAdd) {
                const promoData = {
                  code: promo.code?.toUpperCase() || '',
                  discount: typeof promo.discount === 'number' ? promo.discount : parseFloat(promo.discount) || 0,
                  discountType: promo.discountType || 'percentage',
                  validFrom: promo.validFrom || new Date().toISOString(),
                  validTo: promo.validTo ? new Date(promo.validTo).toISOString() : new Date().toISOString(),
                  terms: promo.terms || '',
                  featured: promo.featured || false
                };
                await addPromoCode(newCompanyId, promoData);
              }
            } catch (promoError) {
              // If promo codes fail, still navigate but show warning
              console.error("Failed to add some promo codes:", promoError);
              setError("Company created successfully, but some promo codes failed to save. You can add them manually.");
              setTimeout(() => navigate(redirectPath), 2000);
              return;
            }
          }
          navigate(redirectPath);
        } else {
          setError("Company created but could not retrieve company ID");
        }
      }
    } catch (error) {
      setError(error.message || "Failed to save company");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSavePromoCode() {
    if (!promoForm.code || !promoForm.discount || !promoForm.validTo) {
      setError('Please fill in promo code, discount, and expiry date');
      return;
    }

    // If editing existing company, save immediately via API
    if (isEditing && companyId) {
      setPromoSubmitting(true);
      setError('');

      try {
        const promoData = {
          code: promoForm.code.toUpperCase(),
          discount: parseFloat(promoForm.discount),
          discountType: promoForm.discountType || 'percentage',
          validFrom: promoForm.validFrom || new Date().toISOString(),
          validTo: new Date(promoForm.validTo).toISOString(),
          terms: promoForm.terms || '',
          featured: promoForm.featured || false
        };

        if (editingPromo) {
          await updatePromoCode(companyId, editingPromo.id || editingPromo._id, promoData);
        } else {
          await addPromoCode(companyId, promoData);
        }

        await loadCompany();
        setShowPromoForm(false);
        setEditingPromo(null);
        setPromoForm({
          code: '',
          discount: '',
          discountType: 'percentage',
          validFrom: '',
          validTo: '',
          terms: '',
          featured: false
        });
      } catch (error) {
        setError(error.message || 'Failed to save promo code');
      } finally {
        setPromoSubmitting(false);
      }
    } else {
      // If creating new company, add to local state (will be saved after company creation)
      const newPromo = {
        code: promoForm.code.toUpperCase(),
        discount: parseFloat(promoForm.discount),
        discountType: promoForm.discountType || 'percentage',
        validFrom: promoForm.validFrom || new Date().toISOString(),
        validTo: new Date(promoForm.validTo).toISOString(),
        terms: promoForm.terms || '',
        featured: promoForm.featured || false,
        // Temporary ID for local state
        tempId: `temp-${Date.now()}`,
      };

      setForm({
        ...form,
        promoCodes: [...(form.promoCodes || []), newPromo],
      });

      setShowPromoForm(false);
      setEditingPromo(null);
      setPromoForm({
        code: '',
        discount: '',
        discountType: 'percentage',
        validFrom: '',
        validTo: '',
        terms: '',
        featured: false
      });
    }
  }

  async function handleDeletePromoCode(promoId) {
    if (!confirm('Are you sure you want to delete this promo code?')) {
      return;
    }

    // If editing existing company, delete via API
    if (isEditing && companyId && !promoId.startsWith('temp-')) {
      setPromoSubmitting(true);
      setError('');

      try {
        await deletePromoCode(companyId, promoId);
        await loadCompany();
      } catch (error) {
        setError(error.message || 'Failed to delete promo code');
      } finally {
        setPromoSubmitting(false);
      }
    } else {
      // If creating new company or temp promo, remove from local state
      setForm({
        ...form,
        promoCodes: form.promoCodes.filter(
          (p) => (p.id || p._id || p.tempId) !== promoId
        ),
      });
    }
  }

  function handleEditPromoCode(promo) {
    setPromoForm({
      code: promo.code || '',
      discount: promo.discount?.toString() || '',
      discountType: promo.discountType || 'percentage',
      validFrom: promo.validFrom ? new Date(promo.validFrom).toISOString().split('T')[0] : '',
      validTo: promo.validTo ? new Date(promo.validTo).toISOString().split('T')[0] : '',
      terms: promo.terms || '',
      featured: promo.featured || false
    });
    setEditingPromo(promo);
    setShowPromoForm(true);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const shortDescLength = form.details.length;
  const shortDescRemaining = MAX_SHORT_DESCRIPTION - shortDescLength;

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
              {isEditing ? "Edit company" : "Create company"}
            </p>
            <h1 className="text-3xl font-semibold mt-2">
              {isEditing ? "Update company" : "Add new company"}
            </h1>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                Company Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input input-bordered w-full border-white/10 bg-gray-950/40 text-white"
                required
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  Category <span className="text-red-400">*</span>
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="select select-bordered w-full border-white/10 bg-gray-950/40 text-white"
                  required
                >
                  <option value="Broker">Broker</option>
                  <option value="PropFirm">Prop Firm</option>
                  <option value="Crypto">Crypto Exchange</option>
                </select>
              </div>

              {user?.role === "admin" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="select select-bordered w-full border-white/10 bg-gray-950/40 text-white"
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                Website URL <span className="text-red-400">*</span>
              </label>
              <input
                type="url"
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
                className="input input-bordered w-full border-white/10 bg-gray-950/40 text-white"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Company Logo</label>
              <div className="rounded-2xl border border-dashed border-white/20 bg-gray-950/30 p-4">
                {logoPreview ? (
                  <div className="relative">
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="max-h-32 w-auto rounded-xl object-contain"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setLogoFile(null);
                        setLogoPreview("");
                      }}
                      className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-red-500/80 px-3 py-1 text-xs font-semibold text-white"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      Remove
                    </button>
                  </div>
                ) : (
                  <label className="flex cursor-pointer flex-col items-center gap-3 rounded-xl border border-white/10 bg-gray-900/50 px-6 py-10 text-center text-gray-400 hover:border-indigo-400/40">
                    <Upload className="h-6 w-6" />
                    <span>Upload logo (JPG/PNG)</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoChange}
                    />
                  </label>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                Short Description <span className="text-red-400">*</span>
                <span className="ml-2 text-xs text-gray-500">
                  ({shortDescLength} / {MAX_SHORT_DESCRIPTION} characters)
                </span>
              </label>
              <input
                type="text"
                value={form.details}
                onChange={handleShortDescriptionChange}
                className="input input-bordered w-full border-white/10 bg-gray-950/40 text-white"
                placeholder="Brief one-line description (max 150 characters)"
                required
                maxLength={MAX_SHORT_DESCRIPTION}
              />
              {shortDescRemaining < 20 && (
                <p className="text-xs text-yellow-400">
                  {shortDescRemaining} characters remaining
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Full Description</label>
              <RichTextEditor
                value={form.description}
                onChange={handleDescriptionChange}
                placeholder="Detailed description of the company..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Company Images</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {images.map((img, idx) => (
                  <div key={idx} className="relative">
                    <img
                      src={img.url}
                      alt={`Company image ${idx + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-2 right-2 bg-red-500/80 text-white rounded-full p-1"
                    >
                      <XCircle className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-white/20 bg-gray-900/50 p-4 text-gray-400 hover:border-indigo-400/40">
                  <Upload className="h-5 w-5" />
                  <span className="text-xs">Add Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImagesChange}
                  />
                </label>
              </div>
            </div>

            {/* Promo Codes Section - Show for both creating and editing */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-300">
                  Promo Codes
                  {!isEditing && (
                    <span className="ml-2 text-xs text-gray-500">
                      (will be saved when company is created)
                    </span>
                  )}
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setShowPromoForm(!showPromoForm);
                    setEditingPromo(null);
                    setPromoForm({
                      code: '',
                      discount: '',
                      discountType: 'percentage',
                      validFrom: '',
                      validTo: '',
                      terms: '',
                      featured: false
                    });
                  }}
                  className="btn btn-xs btn-primary"
                >
                  {showPromoForm ? 'Cancel' : '+ Add Promo Code'}
                </button>
              </div>

                {showPromoForm && (
                  <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700 space-y-3">
                    <h4 className="text-sm font-semibold">
                      {editingPromo ? 'Edit Promo Code' : 'Add New Promo Code'}
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Code *</label>
                        <input
                          type="text"
                          value={promoForm.code}
                          onChange={(e) => setPromoForm({ ...promoForm, code: e.target.value.toUpperCase() })}
                          className="input input-sm w-full"
                          placeholder="PROMOCODE"
                          disabled={promoSubmitting}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Discount *</label>
                        <input
                          type="number"
                          value={promoForm.discount}
                          onChange={(e) => setPromoForm({ ...promoForm, discount: e.target.value })}
                          className="input input-sm w-full"
                          placeholder="10"
                          min="0"
                          disabled={promoSubmitting}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Discount Type</label>
                        <select
                          value={promoForm.discountType}
                          onChange={(e) => setPromoForm({ ...promoForm, discountType: e.target.value })}
                          className="input input-sm w-full"
                          disabled={promoSubmitting}
                        >
                          <option value="percentage">Percentage</option>
                          <option value="fixed">Fixed Amount</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Valid From</label>
                        <input
                          type="date"
                          value={promoForm.validFrom}
                          onChange={(e) => setPromoForm({ ...promoForm, validFrom: e.target.value })}
                          className="input input-sm w-full"
                          disabled={promoSubmitting}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Valid To *</label>
                        <input
                          type="date"
                          value={promoForm.validTo}
                          onChange={(e) => setPromoForm({ ...promoForm, validTo: e.target.value })}
                          className="input input-sm w-full"
                          required
                          disabled={promoSubmitting}
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs text-gray-400 mb-1">Terms & Conditions</label>
                        <textarea
                          value={promoForm.terms}
                          onChange={(e) => setPromoForm({ ...promoForm, terms: e.target.value })}
                          className="input input-sm w-full h-20"
                          placeholder="Terms and conditions"
                          disabled={promoSubmitting}
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={promoForm.featured}
                            onChange={(e) => setPromoForm({ ...promoForm, featured: e.target.checked })}
                            className="checkbox checkbox-sm"
                            disabled={promoSubmitting}
                          />
                          <span className="text-xs text-gray-400">Mark as featured</span>
                        </label>
                      </div>
                      <div className="col-span-2 flex gap-2">
                        {isEditing && companyId ? (
                          <>
                            <button
                              type="button"
                              onClick={handleSavePromoCode}
                              className="btn btn-sm btn-primary flex-1"
                              disabled={promoSubmitting}
                            >
                              {promoSubmitting ? 'Saving...' : editingPromo ? 'Update' : 'Add Promo Code'}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setShowPromoForm(false);
                                setEditingPromo(null);
                              }}
                              className="btn btn-sm btn-outline"
                              disabled={promoSubmitting}
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                // Update in local state for new company
                                if (editingPromo) {
                                  const updatedPromos = [...form.promoCodes];
                                  const index = updatedPromos.findIndex(
                                    (p) => (p.id || p._id || p.tempId) === (editingPromo.id || editingPromo._id || editingPromo.tempId)
                                  );
                                  if (index !== -1) {
                                    updatedPromos[index] = {
                                      ...promoForm,
                                      discount: parseFloat(promoForm.discount),
                                      validFrom: promoForm.validFrom || new Date().toISOString(),
                                      validTo: new Date(promoForm.validTo).toISOString(),
                                      tempId: updatedPromos[index].tempId || `temp-${Date.now()}`,
                                    };
                                    setForm({ ...form, promoCodes: updatedPromos });
                                  }
                                } else {
                                  handleSavePromoCode();
                                }
                                setShowPromoForm(false);
                                setEditingPromo(null);
                              }}
                              className="btn btn-sm btn-primary flex-1"
                            >
                              {editingPromo ? 'Update' : 'Add Promo Code'}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setShowPromoForm(false);
                                setEditingPromo(null);
                              }}
                              className="btn btn-sm btn-outline"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {form.promoCodes?.length > 0 && (
                  <div className="space-y-2">
                    {form.promoCodes.map((promo) => (
                      <div
                        key={promo.id || promo._id}
                        className="p-3 rounded-lg bg-gray-800/30 border border-gray-700 flex items-center justify-between"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono font-semibold text-sm">{promo.code}</span>
                            <span className="text-xs text-green-400">
                              {promo.discount}{promo.discountType === 'percentage' ? '%' : ''} OFF
                            </span>
                            {promo.featured && (
                              <span className="text-xs px-1.5 py-0.5 rounded bg-green-500/20 text-green-400">
                                Featured
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-400">
                            Valid until {new Date(promo.validTo).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleEditPromoCode(promo)}
                            className="btn btn-xs btn-ghost"
                            disabled={promoSubmitting && isEditing && companyId}
                          >
                            <Edit className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeletePromoCode(promo.id || promo._id || promo.tempId)}
                            className="btn btn-xs btn-ghost text-red-400"
                            disabled={promoSubmitting && isEditing && companyId}
                          >
                            <XCircle className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            <div className="flex flex-wrap gap-3 pt-4">
              <button
                type="submit"
                className="btn btn-primary px-6"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : isEditing ? (
                  "Update Company"
                ) : (
                  "Create Company"
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate(redirectPath)}
                className="btn btn-secondary px-6"
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
