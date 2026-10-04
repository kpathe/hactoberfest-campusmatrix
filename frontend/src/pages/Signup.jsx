import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "../api/axios";

const Signup = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    year: "",
    roles: [],
    adminSecret: "",
  });
  const [showAdmin, setShowAdmin] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);


  const handleYearChange = (e) => {
    const value = e.target.value;
    setError("");
    setMessage("");

    let updatedRoles = [...formData.roles];
    if (value === "1") {
      updatedRoles = ["mentee"];
    } else if (value === "4") {
      updatedRoles = ["mentor"];
    } else {
      updatedRoles = [];
    }

    setFormData((prev) => ({
      ...prev,
      year: value,
      roles: updatedRoles,
    }));
  };

  const handleRoleToggle = (role) => {
    setError("");
    setMessage("");
    const { year } = formData;
    if (year === "1" || year === "4") return;

    setFormData((prev) => {
      const newRoles = prev.roles.includes(role)
        ? prev.roles.filter((item) => item !== role)
        : [...prev.roles, role];

      return { ...prev, roles: newRoles };
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setError("");
    setMessage("");
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.roles.length === 0) {
      setError("Please select at least one role.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post("/api/auth/signup", formData, {
        withCredentials: true,
      });

      setMessage(
        res.data.message ||
          "Signup successful. Please verify your email to log in."
      );

      setTimeout(() => {
        navigate("/auth/login", {
          state: {
            email: formData.email,
            message: "Account created! Please verify your email with the OTP we sent.",
            requiresVerification: true,
          },
        });
      }, 900);
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top,_#ede9fe,_#faf5ff_35%,_#f8fafc_70%)] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-72 h-72 bg-fuchsia-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
      <div className="absolute top-0 right-0 w-72 h-72 bg-rose-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-amber-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-md w-full bg-white/85 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-white z-10"
      >
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-600 to-rose-600">
            Create Account
          </h2>
          <p className="text-gray-500 mt-2 text-sm">Join the Campus Matrix network</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-4">
            <input
              type="text"
              name="name"
              placeholder="Full name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
            />
            <input
              type="text"
              name="username"
              placeholder="Username (lowercase letters, numbers, . or _)"
              required
              value={formData.username}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
            />
            <div className="relative">
              <input
                type="email"
                name="email"
                placeholder="College email (@satiengg.in)"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
              />
              {formData.email &&
                !formData.email.endsWith("@satiengg.in") &&
                !formData.adminSecret && (
                  <p className="text-xs text-red-500 mt-1 ml-1 absolute -bottom-5">
                    Must use @satiengg.in domain
                  </p>
                )}
            </div>
            <input
              type="password"
              name="password"
              placeholder="Password (min 8 chars, letter + number)"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
            />
            <select
              name="year"
              required
              value={formData.year}
              onChange={handleYearChange}
              className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-fuchsia-500 text-gray-700"
            >
              <option value="">Select current year</option>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
            </select>
          </div>

          <div className="bg-gray-50/60 p-4 rounded-xl border border-gray-100">
            <p className="text-sm font-semibold text-gray-700 mb-3">Assign Roles</p>
            <div className="flex gap-6">
              <label className="flex items-center space-x-2 text-sm cursor-pointer group">
                <input
                  type="checkbox"
                  checked={formData.roles.includes("mentee")}
                  onChange={() => handleRoleToggle("mentee")}
                  disabled={formData.year === "1" || formData.year === "4"}
                  className="w-4 h-4 rounded text-fuchsia-600 focus:ring-fuchsia-500 disabled:opacity-40"
                />
                <span className={formData.year === "4" ? "text-gray-400" : "text-gray-700"}>
                  Mentee
                </span>
              </label>

              <label className="flex items-center space-x-2 text-sm cursor-pointer group">
                <input
                  type="checkbox"
                  checked={formData.roles.includes("mentor")}
                  onChange={() => handleRoleToggle("mentor")}
                  disabled={formData.year === "1" || formData.year === "4"}
                  className="w-4 h-4 rounded text-fuchsia-600 focus:ring-fuchsia-500 disabled:opacity-40"
                />
                <span className={formData.year === "1" ? "text-gray-400" : "text-gray-700"}>
                  Mentor
                </span>
              </label>
            </div>

            <AnimatePresence>
              {(formData.year === "1" || formData.year === "4") && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-xs text-fuchsia-500 mt-2 font-medium"
                >
                  {formData.year === "1"
                    ? "1st years are locked as mentees."
                    : "4th years are locked as mentors."}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <div className="py-2">
            <button
              type="button"
              onClick={() => setShowAdmin(!showAdmin)}
              className="text-xs text-gray-500 hover:text-fuchsia-600 font-medium transition-colors"
            >
              Register as Faculty / Admin?
            </button>
            <AnimatePresence>
              {showAdmin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3"
                >
                  <input
                    type="password"
                    name="adminSecret"
                    placeholder="Admin Access Code"
                    value={formData.adminSecret}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-red-50/50 border border-red-200 text-red-900 placeholder-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 text-sm"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {message && <p className="text-emerald-600 text-sm text-center">{message}</p>}
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 text-sm font-semibold rounded-xl text-white bg-fuchsia-600 hover:bg-fuchsia-700 transition-all shadow-lg shadow-fuchsia-200 disabled:opacity-70"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            to="/auth/login"
            className="font-semibold text-fuchsia-600 hover:text-fuchsia-500 transition-colors"
          >
            Log in instead
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Signup;
