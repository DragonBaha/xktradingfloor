import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ProtectedRoute from '../components/dashboard/ProtectedRoute.jsx';
import { getCompanyById, createCompany, updateCompany } from '../controllers/companiesController.js';

function CompanyForm() {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const isEdit = !!companyId;
  
  const [form, setForm] = React.useState({
    name: '',
    category: 'Broker',
    website: '',
    logo: '',
    details: '',
    description: '',
    promoCodes: []
  });
  const [promoForm, setPromoForm] = React.useState({
    code: '',
    discount: '',
    discountType: 'percentage',
    validFrom: '',
    validTo: '',
    terms: '',
    featured: false
  });
  const [loading, setLoading] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState('');

  const user = (() => {
    const s = sessionStorage.getItem('xktf_user');
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
        name: data.name || '',
        category: data.category || 'Broker',
        website: data.website || '',
        logo: data.logo || '',
        details: data.details || '',
        description: data.description || '',
        promoCodes: data.promoCodes || []
      });
    } catch (error) {
      setError('Failed to load company: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (isEdit) {
        await updateCompany(companyId, form);
      } else {
        await createCompany(form);
      }
      navigate('/reviews/operator');
    } catch (error) {
      setError(error.message || 'Failed to save company');
    } finally {
      setSubmitting(false);
    }
  }

  function addPromoCode() {
    if (!promoForm.code || !promoForm.discount || !promoForm.validTo) {
      alert('Please fill in promo code, discount, and expiry date');
      return;
    }

    const newPromo = {
      ...promoForm,
      discount: parseFloat(promoForm.discount),
      validFrom: promoForm.validFrom || new Date().toISOString(),
      validTo: new Date(promoForm.validTo).toISOString()
    };

    setForm({
      ...form,
      promoCodes: [...(form.promoCodes || []), newPromo]
    });

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

  function removePromoCode(index) {
    const newPromos = [...form.promoCodes];
    newPromos.splice(index, 1);
    setForm({ ...form, promoCodes: newPromos });
  }

  // Allow both admin and operator roles
  const userRole = user?.role?.toLowerCase();
  const isAdmin = userRole === 'admin' || userRole === 'subadmin';
  const isOperator = userRole === 'operator';
  const canAccess = isAdmin || isOperator;

  if (!user || !canAccess) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="card">
          <div className="card-body text-center">
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-gray-400 mb-4">Only administrators and operators can manage companies from this page.</p>
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
          <title>{isEdit ? 'Edit Company' : 'Create Company'} | XK Trading Floor</title>
        </Helmet>

        <div className="max-w-4xl mx-auto px-4 py-8">
          <Link to="/reviews/operator" className="text-accent hover:text-accent/80 text-sm mb-4 inline-block">
            ← Back to Companies
          </Link>

          <h1 className="text-3xl font-bold mb-6">
            {isEdit ? 'Edit Company' : 'Create New Company'}
          </h1>

          {error && (
            <div className="mb-4 p-3 rounded bg-red-500/10 border border-red-500/30 text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="card">
              <div className="card-body space-y-4">
                <h2 className="text-xl font-semibold mb-4">Basic Information</h2>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Company Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="input"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Category *</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="input"
                    required
                  >
                    <option value="Broker">Broker</option>
                    <option value="PropFirm">Prop Firm</option>
                    <option value="Crypto">Crypto Exchange</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Website URL *</label>
                  <input
                    type="url"
                    value={form.website}
                    onChange={(e) => setForm({ ...form, website: e.target.value })}
                    className="input"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Logo URL</label>
                  <input
                    type="url"
                    value={form.logo}
                    onChange={(e) => setForm({ ...form, logo: e.target.value })}
                    className="input"
                    placeholder="/assets/broker-1.png"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Short Description *</label>
                  <input
                    type="text"
                    value={form.details}
                    onChange={(e) => setForm({ ...form, details: e.target.value })}
                    className="input"
                    placeholder="Brief one-line description"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Full Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="input h-32"
                    placeholder="Detailed description of the company"
                  />
                </div>
              </div>
            </div>

            {/* Promo Codes Section */}
            <div className="card">
              <div className="card-body space-y-4">
                <h2 className="text-xl font-semibold mb-4">Promo Codes</h2>

                {/* Add Promo Code Form */}
                <div className="p-4 rounded bg-gray-800/50 border border-gray-700 space-y-3">
                  <h3 className="font-semibold text-sm">Add New Promo Code</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Code *</label>
                      <input
                        type="text"
                        value={promoForm.code}
                        onChange={(e) => setPromoForm({ ...promoForm, code: e.target.value.toUpperCase() })}
                        className="input text-sm"
                        placeholder="PROMOCODE"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Discount *</label>
                      <input
                        type="number"
                        value={promoForm.discount}
                        onChange={(e) => setPromoForm({ ...promoForm, discount: e.target.value })}
                        className="input text-sm"
                        placeholder="10"
                        min="0"
                        max="100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Valid From</label>
                      <input
                        type="date"
                        value={promoForm.validFrom}
                        onChange={(e) => setPromoForm({ ...promoForm, validFrom: e.target.value })}
                        className="input text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Valid To *</label>
                      <input
                        type="date"
                        value={promoForm.validTo}
                        onChange={(e) => setPromoForm({ ...promoForm, validTo: e.target.value })}
                        className="input text-sm"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs text-gray-400 mb-1">Terms & Conditions</label>
                      <textarea
                        value={promoForm.terms}
                        onChange={(e) => setPromoForm({ ...promoForm, terms: e.target.value })}
                        className="input text-sm h-20"
                        placeholder="Terms and conditions for this promo code"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={promoForm.featured}
                          onChange={(e) => setPromoForm({ ...promoForm, featured: e.target.checked })}
                          className="w-4 h-4"
                        />
                        <span className="text-sm text-gray-400">Mark as featured</span>
                      </label>
                    </div>
                    <div className="md:col-span-2">
                      <button
                        type="button"
                        onClick={addPromoCode}
                        className="btn btn-secondary w-full"
                      >
                        Add Promo Code
                      </button>
                    </div>
                  </div>
                </div>

                {/* Existing Promo Codes */}
                {form.promoCodes?.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm">Existing Promo Codes</h3>
                    {form.promoCodes.map((promo, index) => (
                      <div key={index} className="p-3 rounded bg-gray-800/30 border border-gray-700 flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono font-semibold">{promo.code}</span>
                            <span className="text-sm text-green-400">{promo.discount}% OFF</span>
                            {promo.featured && (
                              <span className="text-xs px-2 py-0.5 rounded bg-green-500/20 text-green-400">
                                Featured
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-400">
                            Valid until {new Date(promo.validTo).toLocaleDateString()}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removePromoCode(index)}
                          className="text-red-400 hover:text-red-300 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
              >
                {submitting ? 'Saving...' : isEdit ? 'Update Company' : 'Create Company'}
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

