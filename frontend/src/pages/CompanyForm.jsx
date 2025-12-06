import React from "react";
import { Helmet } from "react-helmet-async";
import { useParams, useNavigate, Link } from "react-router-dom";
import ProtectedRoute from "../components/dashboard/ProtectedRoute.jsx";
import {
  getCompanyById,
  createCompany,
  updateCompany,
  addPromoCode,
  deletePromoCode,
  updatePromoCode,
} from "../controllers/companiesController.js";

function CompanyForm() {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const isEdit = !!companyId;

  const [form, setForm] = React.useState({
    name: "",
    category: "Broker",
    website: "",
    logo: "",
    details: "",
    description: "",
    promoCodes: [],
  });
  const [promoForm, setPromoForm] = React.useState({
    code: "",
    discount: "",
    discountType: "percentage",
    validFrom: "",
    validTo: "",
    terms: "",
    featured: false,
  });
  const [loading, setLoading] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState("");
  const [promoSubmitting, setPromoSubmitting] = React.useState(false);
  const [editingPromoIndex, setEditingPromoIndex] = React.useState(null);

  const user = (() => {
    const s = sessionStorage.getItem("xktf_user");
    return s ? JSON.parse(s) : null;
  })();

  React.useEffect(() => {
    if (isEdit && companyId) {
      loadCompany();
    }
  }, [companyId, isEdit]);

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
        promoCodes: data.promoCodes || [],
      });
    } catch (error) {
      setError("Failed to load company: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      // Don't send promoCodes in company form - they're managed separately via API
      const { promoCodes, ...companyData } = form;
      const promoCodesToAdd = promoCodes || [];

      if (isEdit) {
        await updateCompany(companyId, companyData);
        navigate("/reviews/operator");
      } else {
        // Create company first
        const result = await createCompany(companyData);
        const newCompanyId = result?.data?._id || result?.data?.id;

        if (newCompanyId) {
          // After creating company, add all promo codes that were added during creation
          if (promoCodesToAdd.length > 0) {
            try {
              // Add all promo codes one by one
              for (const promo of promoCodesToAdd) {
                const promoData = {
                  code: promo.code?.toUpperCase() || "",
                  discount:
                    typeof promo.discount === "number"
                      ? promo.discount
                      : parseFloat(promo.discount) || 0,
                  discountType: promo.discountType || "percentage",
                  validFrom: promo.validFrom || new Date().toISOString(),
                  validTo: promo.validTo
                    ? new Date(promo.validTo).toISOString()
                    : new Date().toISOString(),
                  terms: promo.terms || "",
                  featured: promo.featured || false,
                };
                await addPromoCode(newCompanyId, promoData);
              }
            } catch (promoError) {
              // If promo codes fail, still navigate but show warning
              console.error("Failed to add some promo codes:", promoError);
              setError(
                "Company created successfully, but some promo codes failed to save. You can add them manually."
              );
              setTimeout(() => navigate("/reviews/operator"), 2000);
              return;
            }
          }
          navigate("/reviews/operator");
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

  async function handleAddPromoCode() {
    if (!promoForm.code || !promoForm.discount || !promoForm.validTo) {
      setError("Please fill in promo code, discount, and expiry date");
      return;
    }

    // If editing existing company, save immediately via API
    if (isEdit && companyId) {
      setPromoSubmitting(true);
      setError("");

      try {
        const promoData = {
          code: promoForm.code.toUpperCase(),
          discount: parseFloat(promoForm.discount),
          discountType: promoForm.discountType || "percentage",
          validFrom: promoForm.validFrom || new Date().toISOString(),
          validTo: new Date(promoForm.validTo).toISOString(),
          terms: promoForm.terms || "",
          featured: promoForm.featured || false,
        };

        await addPromoCode(companyId, promoData);

        // Reload company to get updated promo codes
        await loadCompany();

        setPromoForm({
          code: "",
          discount: "",
          discountType: "percentage",
          validFrom: "",
          validTo: "",
          terms: "",
          featured: false,
        });
      } catch (error) {
        setError(error.message || "Failed to add promo code");
      } finally {
        setPromoSubmitting(false);
      }
    } else {
      // If creating new company, add to local state (will be saved after company creation)
      const newPromo = {
        code: promoForm.code.toUpperCase(),
        discount: parseFloat(promoForm.discount),
        discountType: promoForm.discountType || "percentage",
        validFrom: promoForm.validFrom || new Date().toISOString(),
        validTo: new Date(promoForm.validTo).toISOString(),
        terms: promoForm.terms || "",
        featured: promoForm.featured || false,
        // Temporary ID for local state
        tempId: `temp-${Date.now()}`,
      };

      setForm({
        ...form,
        promoCodes: [...(form.promoCodes || []), newPromo],
      });

      setPromoForm({
        code: "",
        discount: "",
        discountType: "percentage",
        validFrom: "",
        validTo: "",
        terms: "",
        featured: false,
      });
    }
  }

  async function handleUpdatePromoCode(promoId, index) {
    if (!promoForm.code || !promoForm.discount || !promoForm.validTo) {
      setError("Please fill in promo code, discount, and expiry date");
      return;
    }

    setPromoSubmitting(true);
    setError("");

    try {
      const promoData = {
        code: promoForm.code.toUpperCase(),
        discount: parseFloat(promoForm.discount),
        discountType: promoForm.discountType || "percentage",
        validFrom: promoForm.validFrom || new Date().toISOString(),
        validTo: new Date(promoForm.validTo).toISOString(),
        terms: promoForm.terms || "",
        featured: promoForm.featured || false,
      };

      await updatePromoCode(companyId, promoId, promoData);

      // Reload company to get updated promo codes
      await loadCompany();

      setPromoForm({
        code: "",
        discount: "",
        discountType: "percentage",
        validFrom: "",
        validTo: "",
        terms: "",
        featured: false,
      });
      setEditingPromoIndex(null);
    } catch (error) {
      setError(error.message || "Failed to update promo code");
    } finally {
      setPromoSubmitting(false);
    }
  }

  async function handleDeletePromoCode(promoId) {
    if (!confirm("Are you sure you want to delete this promo code?")) {
      return;
    }

    // If editing existing company, delete via API
    if (isEdit && companyId && !promoId.startsWith("temp-")) {
      setPromoSubmitting(true);
      setError("");

      try {
        await deletePromoCode(companyId, promoId);

        // Reload company to get updated promo codes
        await loadCompany();
      } catch (error) {
        setError(error.message || "Failed to delete promo code");
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

  function startEditPromo(promo, index) {
    setPromoForm({
      code: promo.code || "",
      discount: promo.discount?.toString() || "",
      discountType: promo.discountType || "percentage",
      validFrom: promo.validFrom
        ? new Date(promo.validFrom).toISOString().split("T")[0]
        : "",
      validTo: promo.validTo
        ? new Date(promo.validTo).toISOString().split("T")[0]
        : "",
      terms: promo.terms || "",
      featured: promo.featured || false,
    });
    setEditingPromoIndex(index);
  }

  function cancelEditPromo() {
    setPromoForm({
      code: "",
      discount: "",
      discountType: "percentage",
      validFrom: "",
      validTo: "",
      terms: "",
      featured: false,
    });
    setEditingPromoIndex(null);
  }

  // Allow both admin and operator roles
  const userRole = user?.role?.toLowerCase();
  const isAdmin = userRole === "admin" || userRole === "subadmin";
  const isOperator = userRole === "operator";
  const canAccess = isAdmin || isOperator;

  if (!user || !canAccess) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="card">
          <div className="card-body text-center">
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-gray-400 mb-4">
              Only administrators and operators can manage companies from this
              page.
            </p>
            <Link to="/" className="btn btn-primary">
              Go Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <ProtectedRoute role={isAdmin ? "admin" : "operator"}>
      <div className="bg-gray-950 text-white min-h-screen">
        <Helmet>
          <title>
            {isEdit ? "Edit Company" : "Create Company"} | XK Trading Floor
          </title>
        </Helmet>

        <div className="max-w-4xl mx-auto px-4 py-8">
          <Link
            to="/reviews/operator"
            className="text-accent hover:text-accent/80 text-sm mb-4 inline-block"
          >
            ← Back to Companies
          </Link>

          <h1 className="text-3xl font-bold mb-6">
            {isEdit ? "Edit Company" : "Create New Company"}
          </h1>

          {error && (
            <div className="mb-4 p-3 rounded bg-red-500/10 border border-red-500/30 text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="card">
              <div className="card-body space-y-4">
                <h2 className="text-xl font-semibold mb-4">
                  Basic Information
                </h2>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="input"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Category *
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value })
                    }
                    className="input"
                    required
                  >
                    <option value="Broker">Broker</option>
                    <option value="PropFirm">Prop Firm</option>
                    <option value="Crypto">Crypto Exchange</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Website URL *
                  </label>
                  <input
                    type="url"
                    value={form.website}
                    onChange={(e) =>
                      setForm({ ...form, website: e.target.value })
                    }
                    className="input"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Logo URL
                  </label>
                  <input
                    type="url"
                    value={form.logo}
                    onChange={(e) => setForm({ ...form, logo: e.target.value })}
                    className="input"
                    placeholder="/assets/broker-1.png"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Short Description *
                  </label>
                  <input
                    type="text"
                    value={form.details}
                    onChange={(e) =>
                      setForm({ ...form, details: e.target.value })
                    }
                    className="input"
                    placeholder="Brief one-line description"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Full Description
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    className="input h-32"
                    placeholder="Detailed description of the company"
                  />
                </div>
              </div>
            </div>

            {/* Promo Codes Section - Show for both creating and editing */}
            {
              <div className="card">
                <div className="card-body space-y-4">
                  <h2 className="text-xl font-semibold mb-4">Promo Codes</h2>
                  <p className="text-sm text-gray-400 mb-4">
                    {isEdit && companyId
                      ? "Manage promo codes for this company. Promo codes are saved immediately when added."
                      : "Add promo codes for this company. They will be saved when you create the company."}
                  </p>

                  {/* Add/Edit Promo Code Form */}
                  <div className="p-4 rounded bg-gray-800/50 border border-gray-700 space-y-3">
                    <h3 className="font-semibold text-sm">
                      {editingPromoIndex !== null
                        ? "Edit Promo Code"
                        : "Add New Promo Code"}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">
                          Code *
                        </label>
                        <input
                          type="text"
                          value={promoForm.code}
                          onChange={(e) =>
                            setPromoForm({
                              ...promoForm,
                              code: e.target.value.toUpperCase(),
                            })
                          }
                          className="input text-sm"
                          placeholder="PROMOCODE"
                          disabled={promoSubmitting}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">
                          Discount *
                        </label>
                        <input
                          type="number"
                          value={promoForm.discount}
                          onChange={(e) =>
                            setPromoForm({
                              ...promoForm,
                              discount: e.target.value,
                            })
                          }
                          className="input text-sm"
                          placeholder="10"
                          min="0"
                          max="100"
                          disabled={promoSubmitting}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">
                          Discount Type
                        </label>
                        <select
                          value={promoForm.discountType}
                          onChange={(e) =>
                            setPromoForm({
                              ...promoForm,
                              discountType: e.target.value,
                            })
                          }
                          className="input text-sm"
                          disabled={promoSubmitting}
                        >
                          <option value="percentage">Percentage</option>
                          <option value="fixed">Fixed Amount</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">
                          Valid From
                        </label>
                        <input
                          type="date"
                          value={promoForm.validFrom}
                          onChange={(e) =>
                            setPromoForm({
                              ...promoForm,
                              validFrom: e.target.value,
                            })
                          }
                          className="input text-sm"
                          disabled={promoSubmitting}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">
                          Valid To *
                        </label>
                        <input
                          type="date"
                          value={promoForm.validTo}
                          onChange={(e) =>
                            setPromoForm({
                              ...promoForm,
                              validTo: e.target.value,
                            })
                          }
                          className="input text-sm"
                          required
                          disabled={promoSubmitting}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs text-gray-400 mb-1">
                          Terms & Conditions
                        </label>
                        <textarea
                          value={promoForm.terms}
                          onChange={(e) =>
                            setPromoForm({
                              ...promoForm,
                              terms: e.target.value,
                            })
                          }
                          className="input text-sm h-20"
                          placeholder="Terms and conditions for this promo code"
                          disabled={promoSubmitting}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={promoForm.featured}
                            onChange={(e) =>
                              setPromoForm({
                                ...promoForm,
                                featured: e.target.checked,
                              })
                            }
                            className="w-4 h-4"
                            disabled={promoSubmitting}
                          />
                          <span className="text-sm text-gray-400">
                            Mark as featured
                          </span>
                        </label>
                      </div>
                      <div className="md:col-span-2 flex gap-2">
                        {editingPromoIndex !== null ? (
                          <>
                            {isEdit && companyId ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleUpdatePromoCode(
                                      form.promoCodes[editingPromoIndex].id ||
                                        form.promoCodes[editingPromoIndex]._id,
                                      editingPromoIndex
                                    )
                                  }
                                  className="btn btn-secondary flex-1"
                                  disabled={promoSubmitting}
                                >
                                  {promoSubmitting
                                    ? "Updating..."
                                    : "Update Promo Code"}
                                </button>
                                <button
                                  type="button"
                                  onClick={cancelEditPromo}
                                  className="btn btn-outline"
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
                                    const updatedPromos = [...form.promoCodes];
                                    updatedPromos[editingPromoIndex] = {
                                      ...promoForm,
                                      discount: parseFloat(promoForm.discount),
                                      validFrom:
                                        promoForm.validFrom ||
                                        new Date().toISOString(),
                                      validTo: new Date(
                                        promoForm.validTo
                                      ).toISOString(),
                                      tempId:
                                        updatedPromos[editingPromoIndex]
                                          .tempId || `temp-${Date.now()}`,
                                    };
                                    setForm({
                                      ...form,
                                      promoCodes: updatedPromos,
                                    });
                                    cancelEditPromo();
                                  }}
                                  className="btn btn-secondary flex-1"
                                >
                                  Update Promo Code
                                </button>
                                <button
                                  type="button"
                                  onClick={cancelEditPromo}
                                  className="btn btn-outline"
                                >
                                  Cancel
                                </button>
                              </>
                            )}
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={handleAddPromoCode}
                            className="btn btn-secondary w-full"
                            disabled={promoSubmitting && isEdit && companyId}
                          >
                            {promoSubmitting && isEdit && companyId
                              ? "Adding..."
                              : "Add Promo Code"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Existing Promo Codes */}
                  {form.promoCodes?.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="font-semibold text-sm">
                        Existing Promo Codes
                      </h3>
                      {form.promoCodes.map((promo, index) => (
                        <div
                          key={promo.id || promo._id || index}
                          className="p-3 rounded bg-gray-800/30 border border-gray-700 flex items-center justify-between"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-mono font-semibold">
                                {promo.code}
                              </span>
                              <span className="text-sm text-green-400">
                                {promo.discount}
                                {promo.discountType === "percentage"
                                  ? "%"
                                  : ""}{" "}
                                OFF
                              </span>
                              {promo.featured && (
                                <span className="text-xs px-2 py-0.5 rounded bg-green-500/20 text-green-400">
                                  Featured
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-400">
                              Valid until{" "}
                              {new Date(promo.validTo).toLocaleDateString()}
                            </div>
                            {promo.terms && (
                              <div className="text-xs text-gray-500 mt-1">
                                {promo.terms}
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => startEditPromo(promo, index)}
                              className="text-blue-400 hover:text-blue-300 text-sm"
                              disabled={promoSubmitting && isEdit && companyId}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleDeletePromoCode(
                                  promo.id || promo._id || promo.tempId
                                )
                              }
                              className="text-red-400 hover:text-red-300 text-sm"
                              disabled={promoSubmitting && isEdit && companyId}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            }

            <div className="flex items-center gap-3">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
              >
                {submitting
                  ? "Saving..."
                  : isEdit
                  ? "Update Company"
                  : "Create Company"}
              </button>
              <Link to="/reviews/operator" className="btn btn-secondary">
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default CompanyForm;
