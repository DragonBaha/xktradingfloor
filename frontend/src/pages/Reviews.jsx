import React from "react";
import { Helmet } from "react-helmet-async";
import { useLocation, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { getAllCompanies } from "../controllers/companiesController.js";
import CompanyCard from "../components/reviews/CompanyCard.jsx";
import CompanyFilters from "../components/reviews/CompanyFilters.jsx";
import Pagination from "../components/reviews/Pagination.jsx";
import CardLoader from "../components/shared/CardLoader.jsx";
import WriteToUsModal from "../components/reviews/WriteToUsModal.jsx";
import { getUserCookie } from "../utils/cookies.js";
import { updateMockMode, fetchMockMode, syncMockModeFromStorage } from "../redux/slices/mockSlice.js";

// Map URL category to actual category value
const categoryMap = {
  broker: "Broker",
  propfirm: "PropFirm",
  crypto: "Crypto",
};

const categoryLabels = {
  Broker: "Brokers",
  PropFirm: "Prop Firms",
  Crypto: "Crypto Exchanges",
};

const categoryDescriptions = {
  Broker:
    "Browse and compare forex and stock brokers. Read authentic reviews and find the best deals.",
  PropFirm:
    "Explore prop trading firms and funding programs. Compare evaluation processes and profit splits.",
  Crypto:
    "Review crypto exchanges and trading platforms. Find secure platforms with competitive fees.",
};

export default function Reviews() {
  const location = useLocation();
  const pathname = location.pathname;
  const dispatch = useDispatch();
  const reduxUser = useSelector((state) => state.auth.user);
  const user = reduxUser || getUserCookie();
  const userRole =
    typeof user?.role === "string" ? user.role.toLowerCase() : null;
  const canSeePendingCompanies =
    userRole === "admin" || userRole === "operator";
  const isAdmin = userRole === "admin";
  const mockMode = useSelector((state) => state.mock.enabled);
  const [allCompanies, setAllCompanies] = React.useState([]);
  const [companies, setCompanies] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [filters, setFilters] = React.useState({});
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage, setItemsPerPage] = React.useState(10);
  const [writeToUsModalOpen, setWriteToUsModalOpen] = React.useState(false);

  // Extract category from URL pathname
  React.useEffect(() => {
    const pathParts = pathname.split("/");
    const categoryFromPath = pathParts[pathParts.length - 1]; // Get last part of path

    // Check if it's a category route (broker, propfirm, crypto)
    if (
      categoryFromPath &&
      categoryFromPath !== "reviews" &&
      categoryFromPath !== "operator" &&
      !categoryFromPath.startsWith("company")
    ) {
      const mappedCategory = categoryMap[categoryFromPath.toLowerCase()];
      if (mappedCategory) {
        // Set category filter when URL has a category
        setFilters((prev) => {
          // Only update if it's different to avoid infinite loops
          if (prev.category !== mappedCategory) {
            return { ...prev, category: mappedCategory };
          }
          return prev;
        });
      }
    } else if (pathname === "/reviews") {
      // On main reviews page, don't force a category
      // But keep existing filters if user set them manually
    }
  }, [pathname]);

  // Get category from filters
  const activeCategory = filters.category || null;

  // Fetch and sync mock mode from backend (for global sync across all users)
  React.useEffect(() => {
    // Fetch from backend on mount
    dispatch(fetchMockMode());

    // Poll backend periodically to sync mock mode globally (every 5 seconds)
    const pollInterval = setInterval(() => {
      dispatch(fetchMockMode());
    }, 5000);

    // Also listen for localStorage changes (for cross-tab sync on same device)
    const handleStorageChange = (e) => {
      if (e.key === "xk_mock_mode") {
        dispatch(syncMockModeFromStorage());
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      clearInterval(pollInterval);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [dispatch]);

  React.useEffect(() => {
    loadCompanies();
  }, [filters, mockMode]); // Reload when mock mode changes

  React.useEffect(() => {
    updatePaginatedCompanies();
  }, [allCompanies, currentPage, itemsPerPage]);

  function updatePaginatedCompanies() {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setCompanies(allCompanies.slice(startIndex, endIndex));
    // Reset to page 1 if current page is out of bounds
    const totalPages = Math.ceil(allCompanies.length / itemsPerPage);
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }

  async function loadCompanies() {
    setLoading(true);
    try {
      const response = await getAllCompanies(filters);
      // Handle different response structures
      let companiesData = [];
      if (Array.isArray(response.data)) {
        companiesData = response.data;
      } else if (response.data?.docs && Array.isArray(response.data.docs)) {
        companiesData = response.data.docs;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        companiesData = response.data.data;
      }

      const filtered = canSeePendingCompanies
        ? companiesData
        : companiesData.filter((c) => c.status === "approved");
      setAllCompanies(filtered);
      setCurrentPage(1); // Reset to first page when filters change
    } catch (error) {
      console.error("Error loading companies:", error);
      // Set empty array on error to prevent page from breaking
      setAllCompanies([]);
    } finally {
      setLoading(false);
    }
  }

  function handlePageChange(page) {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleItemsPerPageChange(items) {
    setItemsPerPage(items);
    setCurrentPage(1); // Reset to first page when changing items per page
  }

  const totalPages = Math.ceil(allCompanies.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, allCompanies.length);

  const pageTitle = activeCategory
    ? `${categoryLabels[activeCategory]} Reviews | XK Trading Floor`
    : "Company Reviews | XK Trading Floor";

  const heroTitle = activeCategory
    ? `Compare ${categoryLabels[activeCategory]}`
    : "Compare Trading Companies";

  const heroDescription = activeCategory
    ? categoryDescriptions[activeCategory]
    : "Browse brokers, prop firms, and crypto exchanges. Read authentic reviews from traders and find the best deals with promo codes.";

  return (
    <div className="bg-black text-white min-h-screen">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={heroDescription} />
      </Helmet>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-black">
        {/* <section className="relative overflow-hidden bg-gradient-to-b from-green-500/10 via-transparent to-transparent"> */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8 text-center">
          <h1 className="font-display font-extrabold text-3xl sm:text-5xl mb-3">
            {heroTitle}
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto">{heroDescription}</p>
        </div>
      </section>

      {/* Mock Data Toggle - HIDDEN FOR NOW (can be enabled later) */}
      {false && isAdmin && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-end gap-4">
            {/* Modern Mock Data Toggle */}
            <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-gray-800/50 border border-white/10">
              <span className="text-sm font-medium text-gray-300 whitespace-nowrap">
                Mock Data
              </span>
              <button
                type="button"
                onClick={() => dispatch(updateMockMode(!mockMode))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${
                  mockMode ? "bg-blue-600" : "bg-gray-600"
                }`}
                role="switch"
                aria-checked={mockMode}
                aria-label="Toggle mock data mode"
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    mockMode ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
              <span className="text-xs text-gray-500 whitespace-nowrap">
                {mockMode ? "ON" : "OFF"}
              </span>
            </div>
            <Link to="/admin/companies/create" className="btn btn-primary">
              + Add Company
            </Link>
          </div>
        </section>
      )}
      
      {isAdmin && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-end gap-4">
            <Link to="/admin/companies" className="btn btn-secondary">
              Manage Companies
            </Link>
            <Link to="/admin/companies/create" className="btn btn-primary">
              + Add Company
            </Link>
          </div>
        </section>
      )}

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <CompanyFilters filters={filters} onChange={setFilters} />
          </div>

          {/* Companies List */}
          <div className="lg:col-span-3">
            {loading ? (
              <CardLoader count={3} horizontal={true} />
            ) : companies.length === 0 ? (
              <div className="card">
                <div className="card-body text-center py-12">
                  <div className="text-gray-400 mb-4">
                    No companies found matching your filters.
                  </div>
                  <button
                    onClick={() => setFilters({})}
                    className="btn btn-secondary"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-400">
                    Showing {startIndex + 1}-{endIndex} of {allCompanies.length}{" "}
                    {allCompanies.length === 1 ? "company" : "companies"}
                  </div>
                </div>
                <div className="space-y-4">
                  {companies.map((company) => (
                    <CompanyCard key={company.id} company={company} />
                  ))}
                </div>
                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    itemsPerPage={itemsPerPage}
                    onItemsPerPageChange={handleItemsPerPageChange}
                  />
                )}
                {/* Write to Us Option */}
                <div className="card mt-6 border-2 border-dashed border-gray-700 hover:border-blue-500/50 transition-colors">
                  <div className="card-body text-center py-8">
                    <div className="text-gray-400 mb-4">
                      Didn't find your broker, propfirm or crypto?
                    </div>
                    <p className="text-gray-300 mb-6">
                      Write to us and get it added to our platform.
                    </p>
                    <button
                      onClick={() => setWriteToUsModalOpen(true)}
                      className="btn btn-primary inline-flex items-center gap-2"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      Request Company Addition
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
      <WriteToUsModal
        isOpen={writeToUsModalOpen}
        onClose={() => setWriteToUsModalOpen(false)}
        onSubmit={(data) => {
          console.log("Submitted:", data);
        }}
      />
    </div>
  );
}
