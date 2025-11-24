import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { getAllCompanies } from '../controllers/companiesController.js';
import CompanyCard from '../components/reviews/CompanyCard.jsx';
import CompanyFilters from '../components/reviews/CompanyFilters.jsx';
import Pagination from '../components/reviews/Pagination.jsx';

// Map URL category to actual category value
const categoryMap = {
  broker: 'Broker',
  propfirm: 'PropFirm',
  crypto: 'Crypto'
};

const categoryLabels = {
  Broker: 'Brokers',
  PropFirm: 'Prop Firms',
  Crypto: 'Crypto Exchanges'
};

const categoryDescriptions = {
  Broker: 'Browse and compare forex and stock brokers. Read authentic reviews and find the best deals.',
  PropFirm: 'Explore prop trading firms and funding programs. Compare evaluation processes and profit splits.',
  Crypto: 'Review crypto exchanges and trading platforms. Find secure platforms with competitive fees.'
};

export default function Reviews() {
  const location = useLocation();
  const pathname = location.pathname;
  const [allCompanies, setAllCompanies] = React.useState([]);
  const [companies, setCompanies] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [filters, setFilters] = React.useState({});
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage, setItemsPerPage] = React.useState(10);

  // Extract category from URL pathname
  React.useEffect(() => {
    const pathParts = pathname.split('/');
    const categoryFromPath = pathParts[pathParts.length - 1]; // Get last part of path
    
    // Check if it's a category route (broker, propfirm, crypto)
    if (categoryFromPath && categoryFromPath !== 'reviews' && categoryFromPath !== 'operator' && !categoryFromPath.startsWith('company')) {
      const mappedCategory = categoryMap[categoryFromPath.toLowerCase()];
      if (mappedCategory) {
        // Set category filter when URL has a category
        setFilters(prev => {
          // Only update if it's different to avoid infinite loops
          if (prev.category !== mappedCategory) {
            return { ...prev, category: mappedCategory };
          }
          return prev;
        });
      }
    } else if (pathname === '/reviews') {
      // On main reviews page, don't force a category
      // But keep existing filters if user set them manually
    }
  }, [pathname]);

  // Get category from filters
  const activeCategory = filters.category || null;

  React.useEffect(() => {
    loadCompanies();
  }, [filters]);

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
      const { data } = await getAllCompanies(filters);
      // Only show approved companies to regular users
      const user = (() => {
        const s = sessionStorage.getItem('xktf_user');
        return s ? JSON.parse(s) : null;
      })();
      const filtered = user?.role === 'operator' || user?.role === 'admin'
        ? data
        : data.filter(c => c.status === 'approved');
      setAllCompanies(filtered);
      setCurrentPage(1); // Reset to first page when filters change
    } catch (error) {
      console.error('Error loading companies:', error);
    } finally {
      setLoading(false);
    }
  }

  function handlePageChange(page) {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    : 'Company Reviews | XK Trading Floor';
  
  const heroTitle = activeCategory 
    ? `Compare ${categoryLabels[activeCategory]}`
    : 'Compare Trading Companies';
  
  const heroDescription = activeCategory 
    ? categoryDescriptions[activeCategory]
    : 'Browse brokers, prop firms, and crypto exchanges. Read authentic reviews from traders and find the best deals with promo codes.';

  return (
    <div className="bg-gray-950 text-white min-h-screen">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={heroDescription} />
      </Helmet>
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-green-500/10 via-transparent to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8 text-center">
          <h1 className="font-display font-extrabold text-3xl sm:text-5xl mb-3">
            {heroTitle}
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto">
            {heroDescription}
          </p>
        </div>
      </section>

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
              <div className="text-center py-12">
                <div className="text-gray-400">Loading companies...</div>
              </div>
            ) : companies.length === 0 ? (
              <div className="card">
                <div className="card-body text-center py-12">
                  <div className="text-gray-400 mb-4">No companies found matching your filters.</div>
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
                    Showing {startIndex + 1}-{endIndex} of {allCompanies.length} {allCompanies.length === 1 ? 'company' : 'companies'}
                  </div>
                </div>
                <div className="space-y-4">
                  {companies.map(company => (
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
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}


