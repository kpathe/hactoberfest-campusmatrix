import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../api/axios";
import { Link as LinkIcon, MessageSquare, UserPlus, UserRoundCheck } from "lucide-react";
import { toast } from "react-toastify";

const PublicProfile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`/api/profile/user/${username}`, { withCredentials: true });
      if (res.data.isOwnProfile) {
        navigate("/profile");
        return;
      }
      setData(res.data);
    } catch (err) {
      toast.error("Failed to load profile.");
      navigate("/connect");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [username]);

  const toggleFollow = async () => {
    if (!data) return;
    try {
      if (data.isFollowing) {
        await axios.delete(`/api/connect/follow/${data.user._id}`, { withCredentials: true });
      } else {
        await axios.post("/api/connect/follow", { userId: data.user._id }, { withCredentials: true });
      }

      setData((prev) => ({
        ...prev,
        isFollowing: !prev.isFollowing,
        followersCount: prev.followersCount + (prev.isFollowing ? -1 : 1),
      }));
    } catch (err) {
      toast.error("Failed to update follow state.");
    }
  };

  const startChat = async () => {
    try {
      await axios.post("/api/chat", { identifier: data.user.username }, { withCredentials: true });
      toast.success("Message request sent.");
      navigate("/messages");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to start chat.");
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!data) return null;

  const { user, profile } = data;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4 sm:px-6 transition-colors">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors">
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
                {profile?.bio || "No bio added yet."}
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
                onClick={toggleFollow}
                className={`p-2 rounded-lg transition-colors border shadow-sm ${
                  data.isFollowing
                    ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/40"
                    : "bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700"
                }`}
                title={data.isFollowing ? "Following" : "Follow"}
              >
                {data.isFollowing ? <UserRoundCheck size={18} /> : <UserPlus size={18} />}
              </button>
              <button
                onClick={startChat}
                className="p-2 bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors border border-slate-200 dark:border-slate-600 shadow-sm"
                title="Message"
              >
                <MessageSquare size={18} />
              </button>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Contribution Metrics</h2>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-xl border border-slate-100 dark:border-slate-600">
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider mb-1">Points</p>
                  <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{profile?.totalDynamicScore || profile?.gamificationPoints || 0}</p>
                </div>
                <div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-xl border border-amber-100 dark:border-amber-900/20">
                  <p className="text-xs text-amber-600/70 dark:text-amber-500/70 font-semibold uppercase tracking-wider mb-1">Streak</p>
                  <p className="text-2xl font-bold text-amber-600 dark:text-amber-500">{profile?.combinedStreak || 0}d</p>
                </div>
                <button onClick={() => navigate(`/${user.username}/followers`)} className="text-left bg-slate-50 dark:bg-slate-700/50 p-4 rounded-xl border border-slate-100 dark:border-slate-600 hover:border-indigo-300 dark:hover:border-indigo-500 transition-colors">
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider mb-1">Followers</p>
                  <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{data.followersCount || 0}</p>
                </button>
                <button onClick={() => navigate(`/${user.username}/following`)} className="text-left bg-slate-50 dark:bg-slate-700/50 p-4 rounded-xl border border-slate-100 dark:border-slate-600 hover:border-indigo-300 dark:hover:border-indigo-500 transition-colors">
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider mb-1">Following</p>
                  <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{data.followingCount || 0}</p>
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
                    <p className="text-sm text-slate-400 dark:text-slate-500 italic">No contribution data.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {profile?.languages && profile.languages.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">
                  Languages
                </h2>
                <div className="flex flex-wrap gap-2">
                  {profile.languages.map((lang, index) => (
                    <span key={index} className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-xs rounded-full font-medium border border-indigo-100 dark:border-indigo-800">
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicProfile;
