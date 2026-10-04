import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import {
  BadgeCheck,
  Code2,
  Github,
  Link as LinkIcon,
  KeyRound,
  MailWarning,
  Send,
  Trash2,
  UserPen,
  X,
} from "lucide-react";
import axios from "../api/axios";

const Profile = ({ setUser }) => {
  const [user, setLocalUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verifyingEmail, setVerifyingEmail] = useState(false);
  const [resendingOtp, setResendingOtp] = useState(false);
  const [savingHandles, setSavingHandles] = useState(false);
  const [otp, setOtp] = useState("");
  const [handles, setHandles] = useState({
    githubUsername: "",
    leetcodeUsername: "",
    gfgUsername: "",
  });
  
  const [isEditingIntegrations, setIsEditingIntegrations] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({ currentPassword: "", newPassword: "" });
  const [changingPassword, setChangingPassword] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmUsername, setDeleteConfirmUsername] = useState("");
  const [deletingAccount, setDeletingAccount] = useState(false);
  
  const navigate = useNavigate();

  const integrationItems = useMemo(
    () =>
      [
        { key: "githubUsername", label: "GitHub", icon: Github },
        { key: "leetcodeUsername", label: "LeetCode", icon: Code2 },
        { key: "gfgUsername", label: "GeeksForGeeks", icon: Code2 },
      ].filter((item) => profile?.[item.key]),
    [profile]
  );

  const fetchData = async () => {
    try {
      const userRes = await axios.get("/api/auth/me", { withCredentials: true });
      setLocalUser(userRes.data);

      const profileRes = await axios.get("/api/profile/me", { withCredentials: true });
      setProfile(profileRes.data);
      setHandles({
        githubUsername: profileRes.data.githubUsername || "",
        leetcodeUsername: profileRes.data.leetcodeUsername || "",
        gfgUsername: profileRes.data.gfgUsername || "",
      });
    } catch (err) {
      if (err.response?.status === 404) {
        navigate("/create-profile");
      } else {
        navigate("/");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [navigate]);

  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    if (!user?.email || !otp.trim()) return;

    setVerifyingEmail(true);
    try {
      const res = await axios.post(
        "/api/auth/verify-email",
        { email: user.email, otp },
        { withCredentials: true }
      );

      toast.success(res.data.message || "Email verified successfully.");
      setOtp("");

      const userRes = await axios.get("/api/auth/me", { withCredentials: true });
      setLocalUser(userRes.data);
      setUser?.(userRes.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to verify email.");
    } finally {
      setVerifyingEmail(false);
    }
  };

  const handleResendOtp = async () => {
    if (!user?.email) return;
    setResendingOtp(true);
    try {
      const res = await axios.post(
        "/api/auth/resend-verification-otp",
        { email: user.email },
        { withCredentials: true }
      );
      toast.success(res.data.message || "OTP resent successfully.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to resend OTP.");
    } finally {
      setResendingOtp(false);
    }
  };

  const handleUpdateHandles = async (e) => {
    e.preventDefault();
    setSavingHandles(true);
    try {
      const res = await axios.put("/api/profile/handles", handles, { withCredentials: true });
      setProfile(res.data);
      setHandles({
        githubUsername: res.data.githubUsername || "",
        leetcodeUsername: res.data.leetcodeUsername || "",
        gfgUsername: res.data.gfgUsername || "",
      });
      toast.success("Integrations saved.");
      setIsEditingIntegrations(false);
    } catch (err) {
      toast.error("Failed to save integrations");
    } finally {
      setSavingHandles(false);
    }
  };

  const cancelEditIntegrations = () => {
    setHandles({
      githubUsername: profile?.githubUsername || "",
      leetcodeUsername: profile?.leetcodeUsername || "",
      gfgUsername: profile?.gfgUsername || "",
    });
    setIsEditingIntegrations(false);
  };

  const removeHandle = async (key) => {
    const nextHandles = {
      githubUsername: profile?.githubUsername || "",
      leetcodeUsername: profile?.leetcodeUsername || "",
      gfgUsername: profile?.gfgUsername || "",
      [key]: "",
    };

    try {
      const res = await axios.put("/api/profile/handles", nextHandles, { withCredentials: true });
      setProfile(res.data);
      setHandles({
        githubUsername: res.data.githubUsername || "",
        leetcodeUsername: res.data.leetcodeUsername || "",
        gfgUsername: res.data.gfgUsername || "",
      });
      toast.success("Integration removed.");
    } catch (err) {
      toast.error("Failed to remove integration.");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setChangingPassword(true);
    try {
      await axios.put("/api/auth/change-password", passwordData, { withCredentials: true });
      toast.success("Password changed successfully.");
      setPasswordData({ currentPassword: "", newPassword: "" });
      setIsChangingPassword(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password.");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    if (deleteConfirmUsername !== user.username) {
      return toast.error("Username does not match.");
    }

    setDeletingAccount(true);
    try {
      await axios.delete("/api/auth/account", {
        data: { confirmUsername: deleteConfirmUsername },
        withCredentials: true,
      });
      setUser?.(null);
      toast.success("Account deleted successfully.");
      navigate("/auth/signup");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete account.");
    } finally {
      setDeletingAccount(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-900 transition-colors">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4 sm:px-6 transition-colors">
      <div className="max-w-5xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors">
          <div
            className={`w-full h-32 ${!profile?.coverImage ? "bg-gradient-to-r from-indigo-500 via-sky-500 to-cyan-500" : ""}`}
            style={profile?.coverImage ? { backgroundImage: `url(${profile.coverImage})`, backgroundSize: "cover", backgroundPosition: "center" } : {}}
          />

          <div className="px-6 md:px-10 pb-8 relative z-10 flex flex-col md:flex-row gap-6 items-start">
            <div className="w-32 h-32 bg-white dark:bg-slate-800 rounded-2xl shadow-md flex-shrink-0 border-4 border-white dark:border-slate-800 overflow-hidden -mt-12 z-20 relative transition-colors">
              <img src={profile?.profileImage || "/avatar.png"} alt="User" className="w-full h-full object-cover" />
            </div>

            <div className="flex-1 mt-2 md:mt-4">
              <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">{user.name}</h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium text-sm mt-1">
                @{user.username || "user"} • {profile?.department?.toUpperCase() || "DEPARTMENT NOT SET"} • {user?.roles?.join(", ").toUpperCase()}
              </p>
              <p className="mt-3 text-slate-600 dark:text-slate-300 max-w-2xl text-sm leading-relaxed">
                {profile?.bio || "This user prefers to keep an air of mystery about them."}
              </p>

              <div className="flex gap-2 mt-4 flex-wrap">
                {profile?.skills?.map((skill, index) => (
                  <span key={index} className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs rounded-full font-medium border border-slate-200 dark:border-slate-600">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="shrink-0 flex gap-2 mt-4 md:mt-6">
              {profile?.linkedin && (
                <a href={`https://linkedin.com/in/${profile.linkedin}`} target="_blank" rel="noreferrer" className="p-2 bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors border border-slate-200 dark:border-slate-600 shadow-sm">
                  <LinkIcon size={18} />
                </a>
              )}
              <button
                onClick={() => navigate("/create-profile?mode=edit")}
                className="p-2 bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors border border-slate-200 dark:border-slate-600 shadow-sm"
              >
                <UserPen size={18} />
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition-colors border border-red-100 dark:border-red-900/30 shadow-sm"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="md:col-span-2 space-y-6">
            <div
              className={`rounded-3xl p-6 shadow-sm border ${
                user.isEmailVerified
                  ? "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-900/50"
                  : "bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-900/50"
              }`}
            >
              <div className="flex items-start gap-3 mb-4">
                {user.isEmailVerified ? (
                  <BadgeCheck className="text-emerald-600 dark:text-emerald-500 mt-0.5" size={22} />
                ) : (
                  <MailWarning className="text-amber-600 dark:text-amber-500 mt-0.5" size={22} />
                )}
                <div>
                  <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Email Verification</h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    {user.isEmailVerified
                      ? `Your email ${user.email} is verified.`
                      : `Your email ${user.email} is not verified yet. Enter the OTP sent to your inbox to verify it.`}
                  </p>
                </div>
              </div>

              {!user.isEmailVerified && (
                 <form onSubmit={handleVerifyEmail} className="space-y-3">
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 6-digit OTP"
                    maxLength={6}
                    className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800 dark:text-slate-100 tracking-[0.3em]"
                    required
                  />
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      type="submit"
                      disabled={verifyingEmail}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-amber-600 text-white hover:bg-amber-700 transition-colors disabled:opacity-70"
                    >
                      <BadgeCheck size={16} />
                      {verifyingEmail ? "Verifying..." : "Verify Email"}
                    </button>
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={resendingOtp}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white dark:bg-slate-800 text-amber-700 dark:text-amber-500 border border-amber-200 dark:border-amber-700 hover:bg-amber-50 dark:hover:bg-amber-900/30 transition-colors disabled:opacity-70"
                    >
                      <Send size={16} />
                      {resendingOtp ? "Sending..." : "Resend OTP"}
                    </button>
                  </div>
                </form>
              )}
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Contribution Metrics</h2>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-xl border border-slate-100 dark:border-slate-600 transition-colors">
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider mb-1">Points</p>
                  <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{profile?.totalDynamicScore || profile?.gamificationPoints || 0}</p>
                </div>
                <div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-xl border border-amber-100 dark:border-amber-900/20 transition-colors">
                  <p className="text-xs text-amber-600/70 dark:text-amber-500/70 font-semibold uppercase tracking-wider mb-1">Streak</p>
                  <p className="text-2xl font-bold text-amber-600 dark:text-amber-500">{profile?.combinedStreak || 0}d</p>
                </div>
                <button onClick={() => navigate('/profile/followers')} className="text-left bg-slate-50 dark:bg-slate-700/50 p-4 rounded-xl border border-slate-100 dark:border-slate-600 hover:border-indigo-300 dark:hover:border-indigo-500 transition-colors">
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider mb-1">Followers</p>
                  <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{profile?.followersCount || 0}</p>
                </button>
                <button onClick={() => navigate('/profile/following')} className="text-left bg-slate-50 dark:bg-slate-700/50 p-4 rounded-xl border border-slate-100 dark:border-slate-600 hover:border-indigo-300 dark:hover:border-indigo-500 transition-colors">
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider mb-1">Following</p>
                  <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{profile?.followingCount || 0}</p>
                </button>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Contribution Heatmap</h3>
                <div className="p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl max-w-full overflow-x-auto shadow-inner transition-colors">
                  {profile?.contributionGraph ? (
                    <div className="flex flex-wrap gap-1">
                      {Array.from({ length: 121 }).map((_, index) => {
                        const date = new Date(Date.now() - (120 - index) * 86400000)
                          .toISOString()
                          .split("T")[0];
                        const count = profile?.contributionGraph?.[date] || 0;
                        let colorClass = "bg-slate-100 dark:bg-slate-700";
                        if (count > 0 && count < 3) colorClass = "bg-emerald-200 dark:bg-emerald-900";
                        else if (count >= 3 && count < 6) colorClass = "bg-emerald-400 dark:bg-emerald-600";
                        else if (count >= 6) colorClass = "bg-emerald-600 dark:bg-emerald-400";
                        return <div key={date} className={`h-3 w-3 rounded-sm ${colorClass}`} title={`${count} contributions on ${date}`} />;
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400 dark:text-slate-500 italic">Add coding handles once to populate your heatmap.</p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-4">
                <LinkIcon size={18} className="text-indigo-600 dark:text-indigo-400" />
                Coding Integrations
              </h2>

              {isEditingIntegrations ? (
                <form onSubmit={handleUpdateHandles} className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">GitHub Username</label>
                    <input
                      type="text"
                      value={handles.githubUsername}
                      onChange={(e) => setHandles({ ...handles, githubUsername: e.target.value })}
                      className="mt-1 w-full text-sm px-3 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-slate-100 transition-colors"
                      placeholder="e.g. octocat"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">LeetCode Username</label>
                    <input
                      type="text"
                      value={handles.leetcodeUsername}
                      onChange={(e) => setHandles({ ...handles, leetcodeUsername: e.target.value })}
                      className="mt-1 w-full text-sm px-3 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-slate-100 transition-colors"
                      placeholder="e.g. lc_user"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">GeeksForGeeks Username</label>
                    <input
                      type="text"
                      value={handles.gfgUsername}
                      onChange={(e) => setHandles({ ...handles, gfgUsername: e.target.value })}
                      className="mt-1 w-full text-sm px-3 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-slate-100 transition-colors"
                      placeholder="e.g. gfg_user"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={cancelEditIntegrations}
                      className="flex-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold py-2.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={savingHandles}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm disabled:opacity-50"
                    >
                      {savingHandles ? "Saving..." : "Save"}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-3">
                  {integrationItems.length > 0 ? (
                    integrationItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <div key={item.key} className="flex items-center justify-between rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 px-4 py-3 transition-colors">
                          <div className="flex items-center gap-3">
                            <Icon size={16} className="text-slate-500 dark:text-slate-400" />
                            <div>
                              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{item.label}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">{profile?.[item.key]}</p>
                            </div>
                          </div>
                          <button onClick={() => removeHandle(item.key)} className="rounded-lg p-2 text-slate-400 dark:text-slate-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                            <X size={16} />
                          </button>
                        </div>
                      );
                    })
                  ) : (
                     <p className="text-sm text-slate-400 dark:text-slate-500 italic text-center py-4">No integrations added.</p>
                  )}
                  
                  <button 
                    onClick={() => setIsEditingIntegrations(true)}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-xl transition-colors shadow-sm text-sm"
                  >
                    Edit Integrations
                  </button>
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-4">
                <KeyRound size={18} className="text-indigo-600 dark:text-indigo-400" />
                Security Settings
              </h2>
              <button
                onClick={() => setIsChangingPassword(!isChangingPassword)}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group"
              >
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Change Password</span>
                <KeyRound size={16} className={`text-slate-400 group-hover:text-indigo-500 transition-transform duration-300 ${isChangingPassword ? "rotate-90" : ""}`} />
              </button>

              {isChangingPassword && (
                <motion.form
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  onSubmit={handleChangePassword}
                  className="mt-4 space-y-3 pt-3 border-t border-slate-100 dark:border-slate-700"
                >
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Current Password</label>
                    <input
                      required
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className="mt-1 w-full text-sm px-3 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-slate-100 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">New Password</label>
                    <input
                      required
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="mt-1 w-full text-sm px-3 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-slate-100 transition-colors"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={changingPassword}
                    className="w-full bg-indigo-600 text-white font-semibold py-2.5 rounded-xl hover:bg-indigo-700 transition-colors text-sm disabled:opacity-50"
                  >
                    {changingPassword ? "Updating..." : "Update Password"}
                  </button>
                </motion.form>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setShowDeleteConfirm(false)}
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-2xl border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Delete Account?</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
              This action is <span className="text-red-500 font-bold">permanent</span> and will erase all your data. To confirm, please type your username <span className="font-mono bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-indigo-600 dark:text-indigo-400">{user.username}</span> below:
            </p>

            <form onSubmit={handleDeleteAccount} className="space-y-4">
              <input
                required
                type="text"
                value={deleteConfirmUsername}
                onChange={(e) => setDeleteConfirmUsername(e.target.value)}
                placeholder="Type your username"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-red-500 outline-none text-slate-800 dark:text-slate-100 font-medium transition-colors"
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={deletingAccount || deleteConfirmUsername !== user.username}
                  className="flex-1 px-4 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deletingAccount ? "Deleting..." : "Delete Permanently"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Profile;
