import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "../api/axios";
import { ArrowLeft, UserPlus, UserRoundCheck, MessageSquare } from "lucide-react";
import { toast } from "react-toastify";

const FollowList = () => {
  const { username, type } = useParams(); // type is 'followers' or 'following'
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followingState, setFollowingState] = useState({});

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        let targetId = "me";
        
        // If viewing another user's followers
        if (username) {
          const profileRes = await axios.get(`/api/profile/user/${username}`, { withCredentials: true });
          targetId = profileRes.data.user._id;
        }

        const res = await axios.get(`/api/connect/${type}/${targetId}`, { withCredentials: true });
        setUsers(res.data);
        setFollowingState(
          Object.fromEntries(res.data.map((u) => [u._id, u.isFollowing]))
        );
      } catch (err) {
        toast.error(`Failed to load ${type}.`);
      } finally {
        setLoading(false);
      }
    };

    if (type === "followers" || type === "following") {
      fetchUsers();
    }
  }, [username, type]);

  const toggleFollow = async (user) => {
    const isFollowing = followingState[user._id];
    try {
      if (isFollowing) {
        await axios.delete(`/api/connect/follow/${user._id}`, { withCredentials: true });
      } else {
        await axios.post("/api/connect/follow", { userId: user._id }, { withCredentials: true });
      }
      setFollowingState((prev) => ({ ...prev, [user._id]: !isFollowing }));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update follow state.");
    }
  };

  const startChat = async (user) => {
    try {
      await axios.post("/api/chat", { identifier: user.username }, { withCredentials: true });
      navigate("/messages");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to start chat.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 px-4 py-8 sm:px-6 transition-colors">
      <div className="mx-auto max-w-4xl space-y-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Profile
        </button>

        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 capitalize">
          {username ? `${username}'s ` : "Your "}{type}
        </h1>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-600" />
          </div>
        ) : users.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-10 text-center text-slate-500 dark:text-slate-400">
            No {type} found.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {users.map((user) => (
              <div
                key={user._id}
                className="flex items-center justify-between rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm transition hover:shadow-md"
              >
                <Link to={`/${user.username}`} className="flex items-center gap-4 flex-1 min-w-0">
                  <img
                    src={user.profileImage || "/avatar.png"}
                    alt={user.name}
                    className="h-12 w-12 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                  />
                  <div className="truncate">
                    <h2 className="font-semibold text-slate-800 dark:text-slate-100 truncate">{user.name}</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 truncate">@{user.username}</p>
                  </div>
                </Link>

                <div className="flex items-center gap-2 shrink-0 ml-4">
                  <button
                    onClick={() => startChat(user)}
                    className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    title="Message"
                  >
                    <MessageSquare size={18} />
                  </button>
                  <button
                    onClick={() => toggleFollow(user)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                      followingState[user._id]
                        ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50"
                        : "bg-indigo-600 text-white hover:bg-indigo-700"
                    }`}
                  >
                    {followingState[user._id] ? (
                      <span className="flex items-center gap-1"><UserRoundCheck size={14} /> Following</span>
                    ) : (
                      <span className="flex items-center gap-1"><UserPlus size={14} /> Follow</span>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FollowList;
