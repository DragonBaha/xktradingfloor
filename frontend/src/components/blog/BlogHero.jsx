import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { getUserCookie } from "../../utils/cookies.js";
import { Plus, FileText } from "lucide-react";

function BlogHero() {
  const navigate = useNavigate();
  const reduxUser = useSelector((state) => state.auth.user);
  const user = reduxUser || getUserCookie();

  const handleWriteBlog = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    // Determine route based on role (case-insensitive check)
    const userRole = user.role?.toLowerCase();
    if (userRole === "admin") {
      navigate("/admin/blogs/create");
    } else if (userRole === "operator" || userRole === "subadmin") {
      navigate("/operator/blogs/create");
    } else {
      navigate("/blogs/create");
    }
  };

  const handleManageBlog = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    // Determine route based on role (case-insensitive check)
    const userRole = user.role?.toLowerCase();
    if (userRole === "admin") {
      navigate("/admin/blogs");
    } else if (userRole === "operator" || userRole === "subadmin") {
      navigate("/operator/blogs");
    } else {
      navigate("/blogs/my-blogs");
    }
  };

  return (
    <section className="relative overflow-hidden bg-black">
      {/* <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 via-transparent to-transparent pointer-events-none" /> */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-12 text-center relative z-10">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl"
        >
          Insights & <span className="bg-gradient-to-r from-blue-400 via-blue-300 to-blue-500 bg-clip-text text-transparent font-semibold">Market Analysis</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-3 text-sm sm:text-base text-gray-300 max-w-3xl mx-auto"
        >
          Stay ahead of the markets with in-depth research, tutorials, and
          expert opinions.
        </motion.p>
        <div className="mt-5 flex items-center justify-center gap-3 relative z-20">
          <button
            type="button"
            onClick={handleWriteBlog}
            className="btn btn-primary rounded-full flex items-center gap-2 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Write Blog
          </button>
          {user && (
            <button
              type="button"
              onClick={handleManageBlog}
              className="btn btn-secondary rounded-full flex items-center gap-2 cursor-pointer"
            >
              <FileText className="h-4 w-4" />
              Manage Blog
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

export default BlogHero;
