import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "../api/axios";

const initialLoginState = {
  email: "",
  password: "",
};

const initialResetState = {
  email: "",
  otp: "",
  newPassword: "",
};

const cardClassName =
  "max-w-md w-full bg-white/80 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-white z-10";

const Login = ({ setUser }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState(initialLoginState);
  const [resetForm, setResetForm] = useState(initialResetState);
  const [message, setMessage] = useState(location.state?.message || "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location.state?.email) {
      setForm((prev) => ({ ...prev, email: location.state.email }));
      setResetForm((prev) => ({ ...prev, email: location.state.email }));
    }
    if (location.state?.requiresVerification) {
      setMode("verify");
    }
  }, [location.state]);


  const resetStatus = () => {
    setError("");
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    resetStatus();
    setLoading(true);

    let loginData = null;
    try {
      const res = await axios.post("/api/auth/login", form);
      loginData = res.data;
    } catch (err) {
      console.error("Login API Error:", err);
      if (err.response?.data?.requiresVerification) {
        setMode("verify");
        setMessage(err.response.data.message || "Please check your email for a verification OTP.");
        setResetForm((prev) => ({ ...prev, email: err.response.data.email || form.email }));
      } else {
        setError(err.response?.data?.message || "Login failed. Please check your credentials.");
      }
      setLoading(false);
      return;
    }

    try {
      if (loginData?.user) {
        setUser(loginData.user);
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Post-login error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async (e) => {
    if (e && typeof e.preventDefault === "function") {
      e.preventDefault();
    }
    resetStatus();
    setLoading(true);
    const targetEmail = resetForm.email || form.email;
    if (!targetEmail) {
      setError("Please enter your registered email address.");
      setLoading(false);
      return;
    }
    if (!resetForm.otp) {
      setError("Please enter the 6-digit OTP.");
      setLoading(false);
      return;
    }
    try {
      const res = await axios.post("/api/auth/verify-email", { email: targetEmail, otp: resetForm.otp });
      setMessage(res.data?.message || "Email verified successfully! You can now log in.");
      setMode("login");
      setForm((prev) => ({ ...prev, email: targetEmail }));
      setResetForm(initialResetState);
    } catch (err) {
      console.error("API error during verify-email:", err);
      setError(err.response?.data?.message || "Failed to verify email.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    resetStatus();
    const targetEmail = resetForm.email || form.email;
    if (!targetEmail) {
      setError("Please enter your email address to resend OTP.");
      return;
    }
    try {
      await axios.post("/api/auth/resend-verification-otp", { email: targetEmail });
      setMessage("A fresh verification OTP has been sent to your email.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend OTP.");
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    resetStatus();
    setLoading(true);
    try {
      const res = await axios.post("/api/auth/forgot-password", { email: resetForm.email });
      setMessage(res.data.message || "If the account exists, a reset OTP has been sent.");
      setMode("reset");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to request password reset.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    resetStatus();
    setLoading(true);
    try {
      await axios.post("/api/auth/verify-reset-otp", {
        email: resetForm.email,
        otp: resetForm.otp,
      });

      const res = await axios.post("/api/auth/reset-password", resetForm);

      setMessage(res.data.message || "Password reset successful. Please log in.");
      setMode("login");
      setForm((prev) => ({ ...prev, email: resetForm.email }));
      setResetForm(initialResetState);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top,_#dbeafe,_#eff6ff_35%,_#f8fafc_70%)] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-10 left-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
      <div className="absolute top-10 right-10 w-72 h-72 bg-sky-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-10 left-1/2 w-72 h-72 bg-cyan-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={cardClassName}
      >
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">
            {mode === "login" && "Welcome Back"}
            {mode === "forgot" && "Forgot Password"}
            {mode === "reset" && "Reset Password"}
            {mode === "verify" && "Verify Email"}
          </h2>
          <p className="text-gray-500 mt-2 text-sm">
            {mode === "login" && "Sign in to Campus Matrix"}
            {mode === "forgot" && "We will send a reset OTP to your email"}
            {mode === "reset" && "Use the OTP to choose a new password"}
            {mode === "verify" && "Enter the OTP sent to your email to verify your account"}
          </p>
        </div>

        {mode === "login" && (
          <form noValidate onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <input
                type="text"
                name="email"
                value={form.email}
                onChange={(e) => {
                  setForm({ ...form, email: e.target.value });
                  resetStatus();
                }}
                placeholder="Email address or username"
                className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              />
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={(e) => {
                  setForm({ ...form, password: e.target.value });
                  resetStatus();
                }}
                placeholder="Password"
                className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              />
            </div>

            {message && <p className="text-emerald-600 text-sm text-center">{message}</p>}
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 text-sm font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-70"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>
        )}

        {mode === "verify" && (
          <form noValidate onSubmit={handleVerifyEmail} className="space-y-5">
            <input
              type="text"
              name="email"
              value={resetForm.email || form.email}
              onChange={(e) => {
                setResetForm({ ...resetForm, email: e.target.value });
                setForm({ ...form, email: e.target.value });
                resetStatus();
              }}
              placeholder="Email address"
              className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              value={resetForm.otp}
              onChange={(e) => {
                setResetForm({ ...resetForm, otp: e.target.value });
                resetStatus();
              }}
              placeholder="6-digit OTP"
              maxLength={6}
              className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 tracking-[0.3em] text-center"
              required
            />
            {message && <p className="text-emerald-600 text-sm text-center">{message}</p>}
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 text-sm font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-700 transition-all disabled:opacity-70"
            >
              {loading ? "Verifying..." : "Verify Email"}
            </button>

            <button
              type="button"
              onClick={handleResendOtp}
              className="w-full text-sm font-semibold text-blue-600 hover:text-blue-500 transition-colors"
            >
              Didn't receive code? Resend OTP
            </button>
          </form>
        )}

        {mode === "forgot" && (
          <form onSubmit={handleForgotPassword} className="space-y-5">
            <input
              type="email"
              value={resetForm.email}
              onChange={(e) => {
                setResetForm({ ...resetForm, email: e.target.value });
                resetStatus();
              }}
              placeholder="Email address"
              className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            {message && <p className="text-emerald-600 text-sm text-center">{message}</p>}
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 text-sm font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-700 transition-all disabled:opacity-70"
            >
              {loading ? "Sending OTP..." : "Send Reset OTP"}
            </button>
          </form>
        )}

        {mode === "reset" && (
          <form onSubmit={handleResetPassword} className="space-y-5">
            <input
              type="email"
              value={resetForm.email}
              onChange={(e) => {
                setResetForm({ ...resetForm, email: e.target.value });
                resetStatus();
              }}
              placeholder="Email address"
              className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="text"
              value={resetForm.otp}
              onChange={(e) => {
                setResetForm({ ...resetForm, otp: e.target.value });
                resetStatus();
              }}
              placeholder="6-digit OTP"
              maxLength={6}
              className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 tracking-[0.3em]"
              required
            />
            <input
              type="password"
              value={resetForm.newPassword}
              onChange={(e) => {
                setResetForm({ ...resetForm, newPassword: e.target.value });
                resetStatus();
              }}
              placeholder="New password"
              className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            {message && <p className="text-emerald-600 text-sm text-center">{message}</p>}
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 text-sm font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-700 transition-all disabled:opacity-70"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}

        <div className="mt-6 text-center text-sm text-gray-600 space-y-2">
          {mode === "login" && (
            <>
              <button
                type="button"
                className="font-semibold text-blue-600 hover:text-blue-500 transition-colors"
                onClick={() => {
                  setMode("forgot");
                  resetStatus();
                  setResetForm((prev) => ({ ...prev, email: form.email }));
                }}
              >
                Forgot password?
              </button>
              <p>
                Don&apos;t have an account?{" "}
                <Link
                  to="/auth/signup"
                  className="font-semibold text-blue-600 hover:text-blue-500 transition-colors"
                >
                  Sign up now
                </Link>
              </p>
            </>
          )}
          {mode !== "login" && (
            <button
              type="button"
              className="font-semibold text-blue-600 hover:text-blue-500 transition-colors"
              onClick={() => {
                setMode("login");
                resetStatus();
              }}
            >
              Back to login
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
