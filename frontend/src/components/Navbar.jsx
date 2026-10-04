import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Bell, LogOut, Menu, MessageSquare, Moon, Sun, Monitor, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const themeOptions = [
  { value: "system", label: "System", icon: Monitor },
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
];

export default function Navbar({ user, setUser, theme, setTheme }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      setUser(null);
      navigate("/auth/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const isLoggedIn = !!user;
  const activeTheme = themeOptions.find((option) => option.value === theme) || themeOptions[0];
  const ActiveThemeIcon = activeTheme.icon;

  const NavLink = ({ to, children, className = "" }) => {
    const isActive = location.pathname.startsWith(to) && to !== "/" || (to === "/" && location.pathname === "/");
    return (
      <Link
        to={to}
        onClick={() => setIsMobileMenuOpen(false)}
        className={`relative font-medium text-sm transition-colors ${
          isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400"
        } ${className}`}
      >
        {children}
        {isActive && (
          <motion.div
            layoutId="navbar-indicator"
            className="absolute -bottom-1.5 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full hidden md:block"
          />
        )}
      </Link>
    );
  };

  return (
    <>
      <nav
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm border-b border-slate-200/50 dark:border-slate-800/50"
            : "bg-white dark:bg-slate-900 border-b border-transparent dark:border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xl transition-colors shadow-sm">
                <img src="/favicon.png" alt="logo" />
              </div>
              <span className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Campus Matrix</span>
            </Link>

            <div className="hidden md:flex items-center space-x-6">
              {isLoggedIn && <NavLink to="/dashboard">Dashboard</NavLink>}
              {isLoggedIn && <NavLink to="/connect">Connect</NavLink>}
              {isLoggedIn && <NavLink to="/matching">Matching</NavLink>}
              {isLoggedIn && <NavLink to="/goals">Tasks</NavLink>}
              <NavLink to="/leaderboard">Leaderboard</NavLink>
              <NavLink to="/resources">Resources</NavLink>
              <NavLink to="/events">Events</NavLink>
              <NavLink to="/news">News</NavLink>
              {isLoggedIn && user?.roles?.includes("admin") && (
                <NavLink to="/admin" className="!text-red-600 dark:!text-red-400 hover:!text-red-700 dark:hover:!text-red-500">
                  Admin
                </NavLink>
              )}

              <div className="flex items-center gap-2">
                <ActiveThemeIcon size={16} className="text-slate-400 dark:text-slate-500" />
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-sm text-slate-600 dark:text-slate-300 outline-none transition-colors hover:border-indigo-300 dark:hover:border-indigo-500 focus:border-indigo-500 dark:focus:border-indigo-400"
                  aria-label="Theme"
                >
                  {themeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {isLoggedIn ? (
                <div className="flex items-center gap-4 pl-4 border-l border-slate-200 dark:border-slate-700">
                  <Link to="/messages" className="text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    <MessageSquare size={20} />
                  </Link>
                  <Link to="/notifications" className="text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    <Bell size={20} />
                  </Link>
                  <Link to="/profile" className="flex items-center gap-2">
                    <img
                      src={user?.image || "/avatar.png"}
                      alt={user?.name || "User"}
                      className="w-9 h-9 rounded-full object-cover border-2 border-white dark:border-slate-800 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700"
                    />
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-700">
                  <Link to="/auth/login" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    Log in
                  </Link>
                  <Link to="/auth/signup" className="text-sm font-medium bg-indigo-600 text-white px-4 py-2 flex items-center justify-center rounded-lg hover:bg-indigo-700 transition shadow-sm">
                    Sign up
                  </Link>
                </div>
              )}
            </div>

            <div className="md:hidden flex items-center relative z-[60]">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            key="mobile-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[45] md:hidden"
          />
        )}
        {isMobileMenuOpen && (
          <motion.div
            key="mobile-sidebar"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-4/5 max-w-sm bg-white dark:bg-slate-900 shadow-2xl z-[60] flex flex-col md:hidden"
          >
              <div className="p-6 flex-1 overflow-y-auto">
                <div className="flex justify-between items-center mb-8 mt-2">
                  <span className="text-xl font-bold text-slate-800 dark:text-slate-100">Menu</span>
                  <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                    <X size={20} />
                  </button>
                </div>

                <div className="flex flex-col gap-4">
                  {isLoggedIn && <NavLink to="/dashboard" className="text-lg">Dashboard</NavLink>}
                  {isLoggedIn && <NavLink to="/connect" className="text-lg">Connect</NavLink>}
                  {isLoggedIn && <NavLink to="/matching" className="text-lg">Matching</NavLink>}
                  {isLoggedIn && <NavLink to="/goals" className="text-lg">Tasks</NavLink>}
                  {isLoggedIn && <NavLink to="/messages" className="text-lg">Messages</NavLink>}
                  {isLoggedIn && <NavLink to="/notifications" className="text-lg">Notifications</NavLink>}
                  <NavLink to="/leaderboard" className="text-lg">Leaderboard</NavLink>
                  <NavLink to="/resources" className="text-lg">Resources</NavLink>
                  <NavLink to="/events" className="text-lg">Events</NavLink>
                  <NavLink to="/news" className="text-lg">News</NavLink>
                  {isLoggedIn && user?.roles?.includes("admin") && (
                    <NavLink to="/admin" className="text-lg !text-red-600 dark:!text-red-400">
                      Admin Panel
                    </NavLink>
                  )}
                  <div className="pt-2">
                    <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-2">
                      Theme
                    </label>
                    <select
                      value={theme}
                      onChange={(e) => setTheme(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-slate-700 dark:text-slate-100 outline-none focus:border-indigo-500 dark:focus:border-indigo-400"
                    >
                      {themeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {isLoggedIn ? (
                <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                  <div className="flex items-center gap-3 mb-6">
                    <img src={user?.image || "/avatar.png"} alt="User" className="w-12 h-12 rounded-full border border-slate-200 dark:border-slate-700" />
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-100">{user.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">@{user.username || "user"}</p>
                    </div>
                  </div>
                  <button onClick={handleLogout} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-red-600 dark:text-red-400 font-medium py-3 rounded-xl flex justify-center items-center gap-2 hover:bg-red-50 dark:hover:bg-red-900/20">
                    <LogOut size={18} />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex flex-col gap-3">
                  <Link to="/auth/login" onClick={() => setIsMobileMenuOpen(false)} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-100 font-medium py-3 rounded-xl flex justify-center hover:bg-slate-50 dark:hover:bg-slate-800">
                    Log in
                  </Link>
                  <Link to="/auth/signup" onClick={() => setIsMobileMenuOpen(false)} className="w-full bg-indigo-600 text-white font-medium py-3 rounded-xl flex justify-center hover:bg-indigo-700">
                    Sign up
                  </Link>
                </div>
              )}
            </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
