import React from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Building2,
  MessageSquare,
  Star,
  AlertCircle,
  TrendingUp,
  FileText,
} from "lucide-react";
import { getAllCompanies } from "../controllers/companiesController.js";
import {
  getAllReviews,
  deleteReview,
} from "../controllers/reviewsController.js";
import { getAllBlogs } from "../controllers/blogsController.js";
import { updateMockMode } from "../redux/slices/mockSlice.js";
import { fetchAllBlogs } from "../redux/slices/blogsSlice.js";
import ConfirmModal from "../components/shared/ConfirmModal.jsx";
import { Trash2, Flag } from "lucide-react";

// Mock data generator for charts when mock mode is ON
function generateMockChartData() {
  const now = new Date();
  const months = [];
  const weeks = [];

  // Generate last 6 months
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      month: date.toLocaleDateString("en-US", { month: "short" }),
      companies: Math.floor(Math.random() * 5) + 2,
      reviews: Math.floor(Math.random() * 10) + 5,
      blogs: Math.floor(Math.random() * 3) + 1,
    });
  }

  // Generate last 8 weeks
  for (let i = 7; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i * 7);
    weeks.push({
      week: `Week ${8 - i}`,
      companies: Math.floor(Math.random() * 3) + 1,
      reviews: Math.floor(Math.random() * 8) + 3,
    });
  }

  return { months, weeks };
}

function AdminDashboard() {
  const dispatch = useDispatch();
  const mockMode = useSelector((state) => state.mock.enabled);
  const [stats, setStats] = React.useState({
    totalCompanies: 0,
    pendingCompanies: 0,
    totalReviews: 0,
    flaggedReviews: 0,
    averageRating: 0,
    totalBlogs: 0,
    publishedBlogs: 0,
  });
  const [statsLoading, setStatsLoading] = React.useState(true);
  const [chartData, setChartData] = React.useState({
    companiesOverTime: [],
    reviewsOverTime: [],
    ratingDistribution: [],
    companyStatus: [],
    reviewsByMonth: [],
  });
  const [flaggedReviews, setFlaggedReviews] = React.useState([]);
  const [deleteReviewModal, setDeleteReviewModal] = React.useState({
    isOpen: false,
    reviewId: null,
  });

  React.useEffect(() => {
    loadStats();
  }, [mockMode]);

  async function loadStats() {
    setStatsLoading(true);
    try {
      const [companiesRes, reviewsRes, blogsData] = await Promise.all([
        getAllCompanies(),
        getAllReviews(),
        mockMode ? getAllBlogs() : Promise.resolve([]),
      ]);

      // Try to fetch real blogs if mock mode is OFF
      let realBlogs = [];
      if (!mockMode) {
        try {
          const blogsResult = await dispatch(
            fetchAllBlogs({ page: 1, size: 1000 })
          );
          if (blogsResult.payload) {
            const payload = blogsResult.payload;
            // Backend returns: { success: true, data: [...], pagination: {...} }
            if (payload.data && Array.isArray(payload.data)) {
              realBlogs = payload.data;
            } else if (Array.isArray(payload)) {
              realBlogs = payload;
            } else {
              realBlogs = [];
            }
          }
        } catch (error) {
          console.warn("Failed to fetch real blogs:", error);
        }
      }

      const companies = companiesRes.data || [];
      const reviews = reviewsRes.data || [];
      const blogs = mockMode ? blogsData : realBlogs;

      const totalReviews = reviews.length;
      const averageRating =
        totalReviews > 0
          ? reviews.reduce((sum, review) => sum + (review.rating || 0), 0) /
            totalReviews
          : 0;
      const flaggedReviews = reviews.filter(
        (review) => review.flags && review.flags.length > 0
      ).length;

      // Get flagged reviews
      const flagged = reviews.filter(
        (review) => review.flags && review.flags.length > 0
      );

      setStats({
        totalCompanies: companies.length,
        pendingCompanies: companies.filter(
          (company) => company.status === "pending"
        ).length,
        totalReviews,
        flaggedReviews: flagged.length,
        averageRating,
        totalBlogs: blogs.length,
        publishedBlogs: blogs.filter(
          (blog) => blog.status === "published" || !blog.status
        ).length,
      });

      setFlaggedReviews(flagged);

      // Process data for charts
      processChartData(companies, reviews, blogs);
    } catch (error) {
      console.error("Failed to load admin stats:", error);
    } finally {
      setStatsLoading(false);
    }
  }

  function processChartData(companies, reviews, blogs) {
    // Companies over time (last 6 months)
    const now = new Date();
    const companiesOverTime = [];
    const reviewsOverTime = [];
    const reviewsByMonth = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toLocaleDateString("en-US", { month: "short" });

      // Count companies created in this month
      const monthCompanies = companies.filter((c) => {
        if (!c.createdAt) return false;
        const created = new Date(c.createdAt);
        return (
          created.getFullYear() === date.getFullYear() &&
          created.getMonth() === date.getMonth()
        );
      }).length;

      // Count reviews created in this month
      const monthReviews = reviews.filter((r) => {
        if (!r.createdAt) return false;
        const created = new Date(r.createdAt);
        return (
          created.getFullYear() === date.getFullYear() &&
          created.getMonth() === date.getMonth()
        );
      }).length;

      companiesOverTime.push({
        month: monthKey,
        count: monthCompanies,
      });

      reviewsOverTime.push({
        month: monthKey,
        count: monthReviews,
      });

      reviewsByMonth.push({
        month: monthKey,
        reviews: monthReviews,
      });
    }

    // Rating distribution
    const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((review) => {
      const rating = Math.floor(review.rating || 0);
      if (rating >= 1 && rating <= 5) {
        ratingCounts[rating]++;
      }
    });

    const ratingDistribution = [
      { rating: "5 ⭐", count: ratingCounts[5] },
      { rating: "4 ⭐", count: ratingCounts[4] },
      { rating: "3 ⭐", count: ratingCounts[3] },
      { rating: "2 ⭐", count: ratingCounts[2] },
      { rating: "1 ⭐", count: ratingCounts[1] },
    ];

    // Company status breakdown
    const statusCounts = {};
    companies.forEach((company) => {
      const status = company.status || "unknown";
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    const companyStatus = Object.entries(statusCounts).map(
      ([status, count]) => ({
        name: status.charAt(0).toUpperCase() + status.slice(1),
        value: count,
      })
    );

    // If mock mode is ON and we have little/no data, use mock data
    if (mockMode && (companies.length < 3 || reviews.length < 3)) {
      const mockData = generateMockChartData();
      setChartData({
        companiesOverTime: mockData.months.map((m) => ({
          month: m.month,
          count: m.companies,
        })),
        reviewsOverTime: mockData.months.map((m) => ({
          month: m.month,
          count: m.reviews,
        })),
        ratingDistribution: [
          { rating: "5 ⭐", count: 12 },
          { rating: "4 ⭐", count: 8 },
          { rating: "3 ⭐", count: 5 },
          { rating: "2 ⭐", count: 2 },
          { rating: "1 ⭐", count: 1 },
        ],
        companyStatus: [
          { name: "Approved", value: 10 },
          { name: "Pending", value: 4 },
          { name: "Blocked", value: 0 },
        ],
        reviewsByMonth: mockData.months.map((m) => ({
          month: m.month,
          reviews: m.reviews,
        })),
      });
    } else {
      setChartData({
        companiesOverTime,
        reviewsOverTime,
        ratingDistribution,
        companyStatus,
        reviewsByMonth,
      });
    }
  }

  const COLORS = {
    pie: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"],
    rating: {
      5: "#10b981",
      4: "#3b82f6",
      3: "#f59e0b",
      2: "#f97316",
      1: "#ef4444",
    },
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-white/10 rounded-lg p-3 shadow-lg">
          <p className="text-white font-semibold mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-gray-300 text-sm">
              <span style={{ color: entry.color }}>●</span> {entry.name}:{" "}
              <span className="text-white font-semibold">{entry.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Helmet>
        <title>Admin Panel | XK Trading Floor</title>
        <meta
          name="description"
          content="Admin dashboard with analytics and statistics"
        />
      </Helmet>

      {/* Header with Toggle */}
      <div className="flex items-center justify-between mb-8">
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
        >
          Admin Panel
        </motion.h1>

        {/* Mock Data Toggle */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400">Mock Data:</span>
          <button
            onClick={() => dispatch(updateMockMode(!mockMode))}
            className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${
              mockMode ? "bg-blue-600" : "bg-gray-600"
            }`}
            role="switch"
            aria-checked={mockMode}
            aria-label="Toggle mock data mode"
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                mockMode ? "translate-x-8" : "translate-x-1"
              }`}
            />
          </button>
          <span
            className={`text-sm font-semibold min-w-[30px] ${
              mockMode ? "text-blue-400" : "text-gray-500"
            }`}
          >
            {mockMode ? "ON" : "OFF"}
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20 hover:border-blue-500/40 transition-all"
        >
          <div className="card-body">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs uppercase text-gray-400">Companies</div>
              <Building2 className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {statsLoading ? "—" : stats.totalCompanies}
            </div>
            <div className="text-sm text-gray-400">
              {stats.pendingCompanies} awaiting approval
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20 hover:border-green-500/40 transition-all"
        >
          <div className="card-body">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs uppercase text-gray-400">Reviews</div>
              <MessageSquare className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {statsLoading ? "—" : stats.totalReviews}
            </div>
            <div className="text-sm text-gray-400">
              {statsLoading ? "—" : `${stats.flaggedReviews} flagged`}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border-yellow-500/20 hover:border-yellow-500/40 transition-all"
        >
          <div className="card-body">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs uppercase text-gray-400">
                Average Rating
              </div>
              <Star className="w-5 h-5 text-yellow-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {statsLoading ? "—" : stats.averageRating.toFixed(1)}
            </div>
            <div className="text-sm text-gray-400">Across all reviews</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/20 hover:border-red-500/40 transition-all"
        >
          <div className="card-body">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs uppercase text-gray-400">
                Pending Tasks
              </div>
              <AlertCircle className="w-5 h-5 text-red-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {statsLoading
                ? "—"
                : stats.pendingCompanies + stats.flaggedReviews}
            </div>
            <div className="text-sm text-gray-400">
              Reviews to verify & companies to approve
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Companies Over Time */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="card"
        >
          <div className="card-body">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-semibold">Companies Over Time</h3>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={chartData.companiesOverTime}>
                <defs>
                  <linearGradient
                    id="colorCompanies"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1C2333" />
                <XAxis
                  dataKey="month"
                  stroke="#9CA3AF"
                  tick={{ fontSize: 12 }}
                />
                <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#colorCompanies)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Reviews Over Time */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="card"
        >
          <div className="card-body">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-5 h-5 text-green-400" />
              <h3 className="text-lg font-semibold">Reviews Over Time</h3>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData.reviewsOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1C2333" />
                <XAxis
                  dataKey="month"
                  stroke="#9CA3AF"
                  tick={{ fontSize: 12 }}
                />
                <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "#10b981" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Rating Distribution */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7 }}
          className="card"
        >
          <div className="card-body">
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-5 h-5 text-yellow-400" />
              <h3 className="text-lg font-semibold">Rating Distribution</h3>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData.ratingDistribution} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1C2333" />
                <XAxis type="number" hide />
                <YAxis
                  dataKey="rating"
                  type="category"
                  width={60}
                  stroke="#9CA3AF"
                  tick={{ fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                  {chartData.ratingDistribution.map((entry, index) => {
                    const rating = parseInt(entry.rating);
                    return (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS.rating[rating] || "#6b7280"}
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Company Status Breakdown */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 }}
          className="card"
        >
          <div className="card-body">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-semibold">Company Status</h3>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={chartData.companyStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.companyStatus.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS.pie[index % COLORS.pie.length]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Flagged Reviews Section */}
      {flaggedReviews.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="card mb-8 bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/20"
        >
          <div className="card-body">
            <div className="flex items-center gap-2 mb-4">
              <Flag className="w-5 h-5 text-red-400" />
              <h3 className="text-lg font-semibold">Flagged Reviews</h3>
              <span className="ml-auto px-3 py-1 rounded-full bg-red-500/20 text-red-300 text-sm font-semibold">
                {flaggedReviews.length}
              </span>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {flaggedReviews.map((review) => (
                <div
                  key={review.id}
                  className="p-4 rounded-lg border border-red-500/20 bg-gray-900/40"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-white">
                          {review.userName || "Anonymous"}
                        </span>
                        <span className="text-yellow-400">
                          {"⭐".repeat(review.rating || 0)}
                        </span>
                        {review.flags && review.flags.length > 0 && (
                          <span className="px-2 py-0.5 rounded text-xs bg-red-500/20 text-red-300 border border-red-500/40">
                            {review.flags[0]}
                          </span>
                        )}
                      </div>
                      {review.description && (
                        <p className="text-sm text-gray-300 mb-2 line-clamp-2">
                          {review.description}
                        </p>
                      )}
                      <div className="text-xs text-gray-400">
                        Company ID: {review.companyId} •{" "}
                        {review.createdAt
                          ? new Date(review.createdAt).toLocaleDateString()
                          : "Unknown date"}
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        setDeleteReviewModal({
                          isOpen: true,
                          reviewId: review.id,
                        })
                      }
                      className="btn btn-sm btn-outline border-red-500/40 text-red-300 hover:bg-red-500/10 ml-4"
                      title="Delete review"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Additional Stats Row */}
      {stats.totalBlogs > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="card mb-8 bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 border-indigo-500/20"
        >
          <div className="card-body">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-indigo-400" />
              <h3 className="text-lg font-semibold">Blog Statistics</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-2xl font-bold text-white">
                  {stats.totalBlogs}
                </div>
                <div className="text-sm text-gray-400">Total Blog Posts</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">
                  {stats.publishedBlogs}
                </div>
                <div className="text-sm text-gray-400">Published</div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/admin/blogs"
          className="card hover:border-blue-500/50 transition-all hover:scale-105"
        >
          <div className="card-body">
            <div className="font-semibold mb-1 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Blog
            </div>
            <div className="text-sm text-gray-400">Manage posts</div>
          </div>
        </Link>
        <div className="card hover:border-green-500/50 transition-all cursor-pointer">
          <div className="card-body">
            <div className="font-semibold mb-1 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Reviews
            </div>
            <div className="text-sm text-gray-400">
              Moderate companies & reviews
            </div>
          </div>
        </div>
        <div className="card hover:border-purple-500/50 transition-all cursor-pointer">
          <div className="card-body">
            <div className="font-semibold mb-1 flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Companies
            </div>
            <div className="text-sm text-gray-400">Manage & approve</div>
          </div>
        </div>
      </div>

      {/* Delete Review Modal */}
      <ConfirmModal
        isOpen={deleteReviewModal.isOpen}
        onClose={() => setDeleteReviewModal({ isOpen: false, reviewId: null })}
        onConfirm={async () => {
          if (!deleteReviewModal.reviewId) return;
          try {
            await deleteReview(deleteReviewModal.reviewId);
            await loadStats();
          } catch (error) {
            console.error("Failed to delete review:", error);
          }
        }}
        title="Delete Review"
        message="Are you sure you want to delete this flagged review? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}

export default AdminDashboard;
