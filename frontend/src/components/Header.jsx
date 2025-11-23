import React from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { logout, syncUserFromCookie } from "../redux/slices/authSlice.js";
import { getUserCookie } from "../utils/cookies.js";
import { getAssetPath } from "../utils/assets.js";
import ImageWithFallback from "./shared/ImageWithFallback.jsx";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/academy", label: "Academy" },
  { to: "/blog", label: "Blog" },
  { to: "/merch", label: "Merch" },
  {
    to: "/reviews",
    label: "Reviews",
    subItems: [
      { to: "/reviews/broker", label: "Broker" },
      { to: "/reviews/propfirm", label: "PropFirm" },
      { to: "/reviews/crypto", label: "Crypto" },
    ],
  },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

// Animated Hamburger Icon Component
function HamburgerIcon({ isOpen, onClick }) {
  return (
    <button
      onClick={onClick}
      className="lg:hidden relative w-8 h-8 flex flex-col items-center justify-center gap-1.5 z-50"
      aria-label="Toggle Menu"
      aria-expanded={isOpen}
    >
      <motion.span
        className="block h-0.5 w-6 bg-white rounded-full origin-center"
        animate={{
          rotate: isOpen ? 45 : 0,
          y: isOpen ? 6 : 0,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      />
      <motion.span
        className="block h-0.5 w-6 bg-white rounded-full"
        animate={{
          opacity: isOpen ? 0 : 1,
          width: isOpen ? 0 : 24,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      />
      <motion.span
        className="block h-0.5 w-6 bg-white rounded-full origin-center"
        animate={{
          rotate: isOpen ? -45 : 0,
          y: isOpen ? -6 : 0,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      />
    </button>
  );
}

function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);
  const location = useLocation();
  const reduxUser = useSelector((state) => state.auth.user);
  // Fallback to cookie if Redux user is not available (for cross-tab sync)
  const user =
    reduxUser || (typeof window !== "undefined" ? getUserCookie() : null);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [reviewsDropdownOpen, setReviewsDropdownOpen] = React.useState(false);
  const [mobileSubmenus, setMobileSubmenus] = React.useState({});

  // Sync user from cookie on mount and when storage changes (cross-tab sync)
  const lastSyncedRef = React.useRef(null);

  React.useEffect(() => {
    // Only sync once on mount if needed - don't re-sync on every reduxUser change
    const cookieUser = getUserCookie();
    if (cookieUser) {
      const cookieStr = JSON.stringify(cookieUser);
      if (cookieStr !== lastSyncedRef.current) {
        // Only dispatch if we haven't synced this value yet
        dispatch(syncUserFromCookie());
        lastSyncedRef.current = cookieStr;
      }
    }

    const handleStorageChange = () => {
      // Storage events only fire from other tabs, so safe to sync
      dispatch(syncUserFromCookie());
      const updatedCookie = getUserCookie();
      if (updatedCookie) {
        lastSyncedRef.current = JSON.stringify(updatedCookie);
      }
    };

    // Listen for storage events (cross-tab sync)
    window.addEventListener("storage", handleStorageChange);

    // Also check periodically for cookie changes (since cookies don't trigger storage events)
    const interval = setInterval(() => {
      const currentCookieUser = getUserCookie();
      if (currentCookieUser) {
        const currentCookieStr = JSON.stringify(currentCookieUser);
        // Only sync if cookie changed and differs from last synced value
        if (currentCookieStr !== lastSyncedRef.current) {
          dispatch(syncUserFromCookie());
          lastSyncedRef.current = currentCookieStr;
        }
      } else if (lastSyncedRef.current !== null) {
        // Cookie was cleared, sync to clear Redux too
        dispatch(syncUserFromCookie());
        lastSyncedRef.current = null;
      }
    }, 3000); // Check every 3 seconds

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, [dispatch]); // Only dispatch in dependencies - sync once on mount

  // Close mobile menu when route changes
  React.useEffect(() => {
    setOpen(false);
    setMobileSubmenus({});
  }, [location.pathname]);

  // Close menus when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuOpen && !event.target.closest("[data-user-menu]")) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-gray-800/50 bg-gray-900/80 backdrop-blur-xl shadow-lg">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 h-14 md:h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-1.5 md:gap-2 transition-transform hover:scale-105 flex-shrink-0"
        >
          <img
            src={getAssetPath("/assets/logo.png")}
            alt="XK Trading Floor Logo"
            className="h-10 w-8 md:h-14 md:w-10 rounded object-cover"
          />
          <span className="font-display font-extrabold text-white tracking-wide text-sm md:text-base lg:text-lg whitespace-nowrap">
            <span className="hidden sm:inline">XK Trading Floor</span>
            <span className="sm:hidden">XK TF</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1 relative">
          {navItems.map((n) => {
            const isActive =
              location.pathname === n.to ||
              (n.to !== "/" && location.pathname.startsWith(n.to));
            const hasSubItems = n.subItems && n.subItems.length > 0;

            if (hasSubItems) {
              return (
                <div
                  key={n.to}
                  className="relative"
                  onMouseEnter={() => setReviewsDropdownOpen(true)}
                  onMouseLeave={() => setReviewsDropdownOpen(false)}
                >
                  <NavLink
                    to={n.to}
                    className={({ isActive }) =>
                      `relative px-2 xl:px-4 py-2 text-xs xl:text-sm font-medium transition-all duration-200 flex items-center gap-1 ${
                        isActive
                          ? "text-white"
                          : "text-gray-300 hover:text-white"
                      }`
                    }
                  >
                    <span className="relative z-10 whitespace-nowrap">
                      {n.label}
                    </span>
                    <ChevronDown
                      className={`h-3 w-3 transition-transform ${
                        reviewsDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                    {isActive && (
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-blue-600 pointer-events-none"
                        layoutId="activeIndicator"
                        layout
                        style={{
                          position: "absolute",
                          bottom: 0,
                        }}
                        initial={false}
                        transition={{
                          layout: {
                            type: "spring",
                            stiffness: 500,
                            damping: 40,
                          },
                        }}
                      />
                    )}
                  </NavLink>

                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {reviewsDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 mt-1 w-40 border border-gray-800 bg-gray-900/95 backdrop-blur-xl rounded-lg shadow-2xl overflow-hidden z-50"
                      >
                        {n.subItems.map((subItem) => {
                          const isSubActive = location.pathname === subItem.to;
                          return (
                            <Link
                              key={subItem.to}
                              to={subItem.to}
                              className={`block px-4 py-3 text-sm transition-colors ${
                                isSubActive
                                  ? "text-white bg-blue-500/10 border-l-2 border-blue-500"
                                  : "text-gray-300 hover:text-white hover:bg-gray-800/50"
                              }`}
                              onClick={() => setReviewsDropdownOpen(false)}
                            >
                              {subItem.label}
                            </Link>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            }

            return (
              <NavLink
                key={n.to}
                to={n.to}
                className={({ isActive }) =>
                  `relative px-2 xl:px-4 py-2 text-xs xl:text-sm font-medium transition-all duration-200 ${
                    isActive ? "text-white" : "text-gray-300 hover:text-white"
                  }`
                }
              >
                <span className="relative z-10 whitespace-nowrap">
                  {n.label}
                </span>
                {isActive && (
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-blue-600 pointer-events-none"
                    layoutId="activeIndicator"
                    layout
                    style={{
                      position: "absolute",
                      bottom: 0,
                    }}
                    initial={false}
                    transition={{
                      layout: {
                        type: "spring",
                        stiffness: 500,
                        damping: 40,
                      },
                    }}
                  />
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Tablet Navigation (Simplified) */}
        <nav className="hidden md:flex lg:hidden items-center gap-0.5 overflow-x-auto scrollbar-hide relative">
          {navItems.slice(0, 5).map((n) => {
            const isActive =
              location.pathname === n.to ||
              (n.to !== "/" && location.pathname.startsWith(n.to));
            return (
              <NavLink
                key={n.to}
                to={n.to}
                className={({ isActive }) =>
                  `relative px-2 py-2 text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                    isActive ? "text-white" : "text-gray-300 hover:text-white"
                  }`
                }
              >
                <span className="relative z-10">{n.label}</span>
                {isActive && (
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-blue-600 pointer-events-none"
                    layoutId="activeIndicatorTablet"
                    layout
                    style={{
                      position: "absolute",
                      bottom: 0,
                    }}
                    initial={false}
                    transition={{
                      layout: {
                        type: "spring",
                        stiffness: 500,
                        damping: 40,
                      },
                    }}
                  />
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Desktop User Actions */}
        <div className="hidden md:flex items-center gap-2 lg:gap-3 relative">
          {user ? (
            <>
              <button
                data-user-menu
                className="flex items-center gap-1.5 lg:gap-2 px-2 lg:px-3 py-1.5 rounded-lg hover:bg-gray-800/50 transition-colors"
                onClick={() => setMenuOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                aria-label="User menu"
              >
                <ImageWithFallback
                  src={user.avatar || "/assets/users/default-avatar.jpg"}
                  fallback="/assets/users/default-avatar.jpg"
                  alt="User avatar"
                  className="h-7 w-7 lg:h-8 lg:w-8 rounded-full object-cover ring-2 ring-blue-500/20 flex-shrink-0"
                />
                <span className="text-xs lg:text-sm text-gray-200 font-medium hidden lg:inline whitespace-nowrap">
                  {user.name || "Account"}
                </span>
                <ChevronDown
                  className={`h-3.5 w-3.5 lg:h-4 lg:w-4 text-gray-400 transition-transform flex-shrink-0 ${
                    menuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 top-12 w-48 border border-gray-800 bg-gray-900/95 backdrop-blur-xl rounded-lg shadow-2xl overflow-hidden"
                    role="menu"
                  >
                    {(user?.role === "admin" || user?.role === "operator") && (
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          // Use navigate with a small delay to ensure menu closes first
                          setTimeout(() => {
                            navigate("/dashboard");
                          }, 100);
                        }}
                        className="block w-full text-left px-4 py-3 text-sm text-gray-200 hover:bg-gray-800/50 transition-colors border-b border-gray-800"
                        role="menuitem"
                      >
                        Dashboard
                      </button>
                    )}
                    <Link
                      to="/profile"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-3 text-sm text-gray-200 hover:bg-gray-800/50 transition-colors border-b border-gray-800"
                      role="menuitem"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={() => {
                        dispatch(logout());
                        setMenuOpen(false);
                        navigate("/");
                      }}
                      className="block w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                      role="menuitem"
                    >
                      Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-xs lg:text-sm text-gray-300 hover:text-white font-medium transition-colors px-2 lg:px-3 py-1.5 rounded-lg hover:bg-gray-800/50 bg-gray-800/30 whitespace-nowrap"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                className="btn btn-primary rounded-lg px-3 lg:px-4 py-1.5 lg:py-2 text-xs lg:text-sm bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/20 transition-all whitespace-nowrap"
              >
                Sign up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <HamburgerIcon isOpen={open} onClick={() => setOpen((v) => !v)} />
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="lg:hidden border-t border-gray-800 bg-gray-900/95 backdrop-blur-xl overflow-hidden"
          >
            <motion.div
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              exit={{ y: -20 }}
              transition={{ duration: 0.3 }}
              className="px-4 py-4 flex flex-col gap-1"
            >
              {navItems.map((n, index) => {
                const hasSubItems = n.subItems && n.subItems.length > 0;
                const isActive =
                  location.pathname === n.to ||
                  (n.to !== "/" && location.pathname.startsWith(n.to));

                if (hasSubItems) {
                  const subMenuOpen = mobileSubmenus[n.to] || false;
                  return (
                    <div key={n.to}>
                      <button
                        onClick={() =>
                          setMobileSubmenus((prev) => ({
                            ...prev,
                            [n.to]: !prev[n.to],
                          }))
                        }
                        className={`w-full text-left px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 flex items-center justify-between ${
                          isActive
                            ? "text-white bg-blue-500/10 border-l-2 border-blue-500"
                            : "text-gray-300 hover:text-white hover:bg-gray-800/50"
                        }`}
                      >
                        <span>{n.label}</span>
                        <ChevronDown
                          className={`h-4 w-4 transition-transform ${
                            subMenuOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      {subMenuOpen && (
                        <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-800 pl-4">
                          {n.subItems.map((subItem) => {
                            const isSubActive =
                              location.pathname === subItem.to;
                            return (
                              <Link
                                key={subItem.to}
                                to={subItem.to}
                                onClick={() => {
                                  setOpen(false);
                                  setMobileSubmenus({});
                                }}
                                className={`block px-4 py-2 text-sm rounded-lg transition-all duration-200 ${
                                  isSubActive
                                    ? "text-white bg-blue-500/10 border-l-2 border-blue-500"
                                    : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                                }`}
                              >
                                {subItem.label}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <NavLink
                    key={n.to}
                    to={n.to}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `relative px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                        isActive
                          ? "text-white bg-blue-500/10 border-l-2 border-blue-500"
                          : "text-gray-300 hover:text-white hover:bg-gray-800/50"
                      }`
                    }
                  >
                    {n.label}
                  </NavLink>
                );
              })}
              <div className="pt-4 mt-2 border-t border-gray-800 flex flex-col gap-2">
                {user ? (
                  <>
                    {(user?.role === "admin" || user?.role === "operator") && (
                      <button
                        onClick={() => {
                          setOpen(false);
                          setTimeout(() => {
                            navigate("/dashboard");
                          }, 100);
                        }}
                        className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors"
                      >
                        Dashboard
                      </button>
                    )}
                    <Link
                      to="/profile"
                      onClick={() => setOpen(false)}
                      className="px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={() => {
                        dispatch(logout());
                        setOpen(false);
                        navigate("/");
                      }}
                      className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setOpen(false)}
                      className="px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-gray-800/50 bg-gray-800/30 rounded-lg transition-colors text-center"
                    >
                      Log in
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setOpen(false)}
                      className="btn btn-primary rounded-lg px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/20 text-center"
                    >
                      Sign up
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export default Header;
