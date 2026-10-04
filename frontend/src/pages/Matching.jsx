import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from "../api/axios";

const Matching = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState([]);
  const [connections, setConnections] = useState({
    acceptedConnections: [],
    incomingRequests: [],
    outgoingRequests: [],
  });
  const [activeTab, setActiveTab] = useState("mentee"); // Default to mentee if dual

  const fetchConnections = async () => {
    try {
      const res = await axios.get("/api/matches/my-connections", { withCredentials: true });
      setConnections(res.data);
    } catch (err) {
      toast.error("Failed to load connection requests.");
    }
  };

  const fetchMatches = async (targetRole) => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/matches/potential?targetRole=${targetRole}`, {
        withCredentials: true,
      });
      setMatches(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load matches");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const getUser = async () => {
      try {
        const res = await axios.get("/api/auth/me", { withCredentials: true });
        setUser(res.data);
        
        const isMentee = res.data.roles.includes("mentee");
        const isMentor = res.data.roles.includes("mentor");
        
        if (isMentee && isMentor) {
          setActiveTab("mentee");
          fetchMatches("mentor");
        } else if (isMentee) {
          setActiveTab("mentee");
          fetchMatches("mentor");
        } else if (isMentor) {
          setActiveTab("mentor");
          setLoading(false);
        }
        
        fetchConnections();
      } catch (err) {
        toast.error("Failed to load matching context.");
      }
    };

    getUser();
  }, []);

  const requestConnection = async (targetUserId) => {
    try {
      await axios.post(
        "/api/matches/request",
        { targetUserId, targetRole: "mentor" },
        { withCredentials: true }
      );
      toast.success("Request sent successfully!");
      setMatches((prev) => prev.filter((match) => match.profile.user._id !== targetUserId));
      fetchConnections();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send request");
    }
  };

  const updateConnectionStatus = async (connectionId, status) => {
    try {
      await axios.put(
        "/api/matches/status",
        { connectionId, status },
        { withCredentials: true }
      );
      toast.success(`Request ${status}.`);
      fetchConnections();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update request.");
    }
  };

  const isDualRole = user?.roles?.includes("mentor") && user?.roles?.includes("mentee");
  const currentView = activeTab;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 min-h-screen">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2 text-slate-900 dark:text-slate-100">Mentor-Mentee Matching</h1>
        <p className="text-slate-500 dark:text-slate-400">
          Discover strong matches, track pending requests, and support both mentor and mentee journeys.
        </p>
      </div>

      {isDualRole && (
        <div className="flex justify-center border-b border-slate-200 dark:border-slate-700">
          <div className="flex gap-8">
            <button
              onClick={() => {
                setActiveTab("mentee");
                fetchMatches("mentor");
              }}
              className={`pb-4 font-medium transition-colors relative ${
                activeTab === "mentee"
                  ? "text-indigo-600 dark:text-indigo-400"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
              }`}
            >
              Find a Mentor
              {activeTab === "mentee" && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 dark:bg-indigo-400" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("mentor")}
              className={`pb-4 font-medium transition-colors relative ${
                activeTab === "mentor"
                  ? "text-indigo-600 dark:text-indigo-400"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
              }`}
            >
              Manage Mentees
              {activeTab === "mentor" && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 dark:bg-indigo-400" />
              )}
            </button>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-[1fr_320px] gap-8">
        {/* Left Column: Main View */}
        <div className="space-y-6">
          {currentView === "mentee" ? (
            <>
              {loading ? (
                <div className="flex flex-col items-center justify-center min-h-[40vh]">
                  <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-indigo-600 border-solid mb-4" />
                  <p className="text-xl font-medium text-gray-600 dark:text-gray-400">Calculating Compatibility...</p>
                </div>
              ) : matches.length === 0 ? (
                <div className="text-center text-gray-500 dark:text-gray-400 mt-10 bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                  <p className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">No mentors available right now.</p>
                  <p>You may already have an accepted mentor, or there are no seniors matching your criteria.</p>
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {matches.map((matchData) => {
                    const profile = matchData.profile;
                    const targetUser = profile.user;
                    return (
                      <div key={profile._id} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition transform hover:-translate-y-1">
                        <img src={targetUser?.image || "/avatar.png"} alt={targetUser?.name} className="w-20 h-20 mx-auto rounded-full mb-4 object-cover border-2 border-indigo-100 dark:border-indigo-900" />
                        <h2 className="text-xl font-semibold text-center text-gray-800 dark:text-gray-100">{targetUser?.name}</h2>
                        <p className="text-center text-gray-500 dark:text-gray-400 text-sm mb-1">@{targetUser?.username}</p>
                        <p className="text-center text-gray-500 dark:text-gray-400 text-sm mb-2">{profile.department}</p>
                        <div className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-xs font-bold text-center py-1 rounded mb-3">
                          Match Score: {matchData.score}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 text-center line-clamp-2" title={matchData.matchReason}>{matchData.matchReason}</p>
                        <button className="mt-4 w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition" onClick={() => requestConnection(targetUser._id)}>
                          Send Request
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <div className="bg-white dark:bg-slate-800 p-10 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col items-center justify-center text-center mt-10">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Mentor Dashboard</h2>
              <p className="text-slate-500 dark:text-slate-400 max-w-md">
                You can accept up to 5 mentees. Manage your incoming mentorship requests in the sidebar. Mentees discover you based on compatibility!
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Requests sidebar based on view */}
        <aside className="space-y-5">
          {currentView === "mentor" && (
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm rounded-2xl p-5">
              <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-3">Incoming Requests</h3>
              {connections.incomingRequests?.length ? (
                <div className="space-y-3">
                  {connections.incomingRequests.map((connection) => {
                    const requester =
                      connection.mentor?._id === user?._id || connection.mentor?._id === user?._id?.toString()
                        ? connection.mentee
                        : connection.mentor;

                    return (
                      <div key={connection._id} className="border border-slate-200 dark:border-slate-700 rounded-xl p-3 bg-slate-50 dark:bg-slate-700/30">
                        <p className="font-medium text-slate-800 dark:text-slate-200">{requester?.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">@{requester?.username}</p>
                        <div className="flex gap-2 mt-3">
                          <button onClick={() => updateConnectionStatus(connection._id, "accepted")} className="flex-1 bg-emerald-600 text-white rounded-lg py-2 text-sm font-semibold hover:bg-emerald-700 transition-colors">
                            Accept
                          </button>
                          <button onClick={() => updateConnectionStatus(connection._id, "declined")} className="flex-1 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg py-2 text-sm font-semibold hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors">
                            Decline
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400">No incoming requests.</p>
              )}
            </div>
          )}

          {currentView === "mentee" && (
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm rounded-2xl p-5">
              <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-3">Outgoing Requests</h3>
              {connections.outgoingRequests?.length ? (
                <div className="space-y-3">
                  {connections.outgoingRequests.map((connection) => {
                    const target =
                      connection.mentor?._id === user?._id || connection.mentor?._id === user?._id?.toString()
                        ? connection.mentee
                        : connection.mentor;

                    return (
                      <div key={connection._id} className="border border-slate-200 dark:border-slate-700 rounded-xl p-3 bg-slate-50 dark:bg-slate-700/30">
                        <p className="font-medium text-slate-800 dark:text-slate-200">{target?.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">@{target?.username}</p>
                        <span className="inline-block mt-2 text-xs px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-500 rounded font-medium">Pending</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400">No pending outgoing requests.</p>
              )}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

export default Matching;
