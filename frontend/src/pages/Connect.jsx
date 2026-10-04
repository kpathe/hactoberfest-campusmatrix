import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { MessageSquare, Search, UserPlus, UserRoundCheck } from "lucide-react";
import { toast } from "react-toastify";

const Connect = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [followingState, setFollowingState] = useState({});

  const fetchDirectory = async (search = "") => {
    try {
      const res = await axios.get(`/api/connect${search ? `?search=${encodeURIComponent(search)}` : ""}`, {
        withCredentials: true,
      });
      setStudents(res.data);
      // Backend returns populated Profile objects; index by user._id for follow state
      setFollowingState(
        Object.fromEntries(res.data.map((profile) => [profile.user?._id, false]))
      );
    } catch (err) {
      toast.error("Failed to load student directory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDirectory();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchDirectory(query);
    }, 250);

    return () => clearTimeout(timeout);
  }, [query]);

  const toggleFollow = async (userId, username) => {
    const isFollowing = followingState[userId];
    try {
      if (isFollowing) {
        await axios.delete(`/api/connect/follow/${userId}`, { withCredentials: true });
      } else {
        await axios.post("/api/connect/follow", { targetUserId: userId }, { withCredentials: true });
      }

      setFollowingState((prev) => ({ ...prev, [userId]: !isFollowing }));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update follow state.");
    }
  };

  const startChat = async (username) => {
    try {
      await axios.post("/api/chat", { identifier: username }, { withCredentials: true });
      toast.success("Message request sent.");
      navigate("/messages");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to start chat.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 px-4 py-8 sm:px-6 transition-colors">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Connect</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Follow batchmates and seniors, explore their profiles, and send message requests.
            </p>
          </div>
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={16} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or username"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-3 pl-10 pr-4 text-sm text-slate-800 dark:text-slate-100 outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-600 dark:border-indigo-400" />
          </div>
        ) : students.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-10 text-center text-slate-500 dark:text-slate-400 transition-colors">
            No students found.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {students.map((profile) => {
              const studentUser = profile.user || {};
              const userId = studentUser._id;
              return (
              <div
                key={profile._id}
                className="flex flex-col rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:hover:shadow-indigo-900/10"
              >
                <button
                  onClick={() => navigate(`/${studentUser.username}`)}
                  className="w-full text-left flex-1"
                >
                  <div className="mb-4 flex items-center gap-3">
                    <img
                      src={profile.profileImage || "/avatar.png"}
                      alt={studentUser.name}
                      className="h-14 w-14 rounded-2xl object-cover border border-slate-200 dark:border-slate-700"
                    />
                    <div>
                      <h2 className="font-semibold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 transition-colors">{studentUser.name}</h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400">@{studentUser.username}</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                    <p>Branch: <span className="font-medium text-slate-800 dark:text-slate-200">{profile.department || "Not set"}</span></p>
                    <p>Year: <span className="font-medium text-slate-800 dark:text-slate-200">{studentUser.year}</span></p>
                    <p>
                      Mentor:{" "}
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        {studentUser.roles?.includes("mentor") ? "Yes" : "No"}
                      </span>
                    </p>
                  </div>
                </button>

                <div className="mt-5 flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                  <button
                    onClick={() => toggleFollow(userId, studentUser.username)}
                    className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                      followingState[userId]
                        ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 border border-transparent dark:border-emerald-900/50"
                        : "bg-indigo-600 dark:bg-indigo-600 text-white hover:bg-indigo-700 dark:hover:bg-indigo-500"
                    }`}
                  >
                    {followingState[userId] ? (
                      <span className="inline-flex items-center justify-center gap-2 w-full">
                        <UserRoundCheck size={16} />
                        Following
                      </span>
                    ) : (
                      <span className="inline-flex items-center justify-center gap-2 w-full">
                        <UserPlus size={16} />
                        Follow
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => startChat(studentUser.username)}
                    className="rounded-xl border border-slate-200 dark:border-slate-600 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:border-indigo-300 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    title="Message"
                  >
                    <span className="inline-flex items-center justify-center gap-2 w-full">
                      <MessageSquare size={16} />
                    </span>
                  </button>
                </div>
              </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Connect;
