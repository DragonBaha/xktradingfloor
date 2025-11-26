import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import ProtectedRoute from "../components/dashboard/ProtectedRoute.jsx";
import { getAllCompanies } from "../controllers/companiesController.js";
import { deleteCompany } from "../controllers/companiesController.js";
import CompanyCard from "../components/reviews/CompanyCard.jsx";
import { getUserCookie } from "../utils/cookies.js";

function OperatorDashboard() {
  const [companies, setCompanies] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [showCreateForm, setShowCreateForm] = React.useState(false);
  const reduxUser = useSelector((state) => state.auth.user);
  const user = reduxUser || getUserCookie();

  React.useEffect(() => {
    if (user?.role === "operator" || user?.role === "admin") {
      loadCompanies();
    }
  }, [user]);

  async function loadCompanies() {
    setLoading(true);
    try {
      const { data } = await getAllCompanies({
        operatorId: user?.role === "admin" ? undefined : user?.id,
      });
      setCompanies(data || []);
    } catch (error) {
      console.error("Error loading companies:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(companyId) {
    if (
      !confirm(
        "Are you sure you want to delete this company? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await deleteCompany(companyId);
      loadCompanies();
    } catch (error) {
      alert(error.message || "Failed to delete company");
    }
  }

  if (!user || (user.role !== "operator" && user.role !== "admin")) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="card">
          <div className="card-body text-center">
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-gray-400 mb-4">
              You need to be an operator to access this page.
            </p>
            <Link to="/" className="btn btn-primary">
              Go Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute role={user.role === "admin" ? "admin" : "operator"}>
      <div className="bg-gray-950 text-white min-h-screen">
        <Helmet>
          <title>Manage Companies | XK Trading Floor</title>
          <meta
            name="description"
            content="Manage your company listings and promo codes"
          />
        </Helmet>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Manage Companies</h1>
              <p className="text-gray-400">
                {user.role === "admin"
                  ? "Manage all company listings"
                  : "Create and manage your company listings"}
              </p>
            </div>
            <div className="flex gap-3">
              <Link to="/operator/blogs" className="btn btn-secondary">
                Manage Blogs
              </Link>
              <Link to="/reviews/company/new" className="btn btn-primary">
                + Add New Company
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="text-gray-400">Loading companies...</div>
            </div>
          ) : companies.length === 0 ? (
            <div className="card">
              <div className="card-body text-center py-12">
                <div className="text-gray-400 mb-4">No companies found.</div>
                <Link to="/reviews/company/new" className="btn btn-primary">
                  Create Your First Company
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {companies.map((company) => (
                <div key={company.id} className="relative">
                  <CompanyCard company={company} />
                  <div className="absolute top-4 right-4 flex gap-2">
                    <Link
                      to={`/reviews/company/edit/${company.id}`}
                      className="btn btn-secondary btn-sm"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(company.id)}
                      className="btn btn-danger btn-sm"
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
    </ProtectedRoute>
  );
}

export default OperatorDashboard;
