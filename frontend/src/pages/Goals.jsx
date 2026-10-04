import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { Award, Calendar, CheckCircle, Circle, Plus, Target, Trash2 } from "lucide-react";
import axios from "../api/axios";

const Goals = () => {
  const [user, setUser] = useState(null);
  const [goals, setGoals] = useState([]);
  const [assignedGoals, setAssignedGoals] = useState([]);
  const [assignableMentees, setAssignableMentees] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [assignedUserId, setAssignedUserId] = useState("");
  const [priority, setPriority] = useState("medium");
  const [loading, setLoading] = useState(true);

  const fetchPageData = async () => {
    try {
      const [userRes, goalsRes, assignedRes, menteesRes] = await Promise.all([
        axios.get("/api/auth/me", { withCredentials: true }),
        axios.get("/api/goals", { withCredentials: true }),
        axios.get("/api/goals/assigned", { withCredentials: true }),
        axios.get("/api/goals/assignable-mentees", { withCredentials: true }),
      ]);

      setUser(userRes.data);
      setGoals(goalsRes.data);
      setAssignedGoals(assignedRes.data);
      setAssignableMentees(menteesRes.data);
    } catch (err) {
      toast.error("Failed to load tasks.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPageData();
  }, []);

  const handleAddGoal = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "/api/goals",
        { title, description, deadline, assignedUserId: assignedUserId || undefined, priority },
        { withCredentials: true }
      );

      toast.success(assignedUserId ? "Task assigned successfully." : "Goal created successfully.");
      setTitle("");
      setDescription("");
      setDeadline("");
      setAssignedUserId("");
      setPriority("medium");
      fetchPageData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create task.");
    }
  };

  const handleDeleteGoal = async (id) => {
    try {
      await axios.delete(`/api/goals/${id}`, { withCredentials: true });
      setGoals((prev) => prev.filter((goal) => goal._id !== id));
      setAssignedGoals((prev) => prev.filter((goal) => goal._id !== id));
      toast.success("Task removed.");
    } catch (err) {
      toast.error("Error deleting task.");
    }
  };

  const toggleComplete = async (id, completed) => {
    try {
      const res = await axios.put(
        `/api/goals/${id}`,
        { completed: !completed },
        { withCredentials: true }
      );

      setGoals((prev) => prev.map((goal) => (goal._id === id ? { ...goal, completed: !completed } : goal)));

      if (!completed) {
        if (res.data.pointsEarned > 0) {
          toast.success(`Task completed! +${res.data.pointsEarned} points`, {
            icon: <Award className="text-yellow-500" />,
          });
        }

        if (res.data.earnedBadges?.length) {
          res.data.earnedBadges.forEach((badge) => toast.success(`New badge earned: ${badge}`));
        }
      }
    } catch (err) {
      toast.error("Failed to update task status.");
    }
  };

  const mentorAssignedTasks = goals.filter((goal) => goal.assigner);
  const personalGoals = goals.filter((goal) => !goal.assigner);
  const completedGoals = goals.filter((goal) => goal.completed);
  const pendingMentorTasks = mentorAssignedTasks.filter((goal) => !goal.completed);
  const pendingPersonalGoals = personalGoals.filter((goal) => !goal.completed);
  const isMentor = user?.roles?.includes("mentor");

  const renderTaskCard = (goal, dimmed = false) => (
    <motion.div key={goal._id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className={`bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex gap-4 group hover:border-indigo-300 dark:hover:border-indigo-500 transition-colors ${dimmed ? "opacity-75" : ""}`}>
      <button onClick={() => toggleComplete(goal._id, goal.completed)} className={`mt-0.5 transition-colors shrink-0 ${goal.completed ? "text-emerald-500 hover:text-slate-400" : "text-slate-300 dark:text-slate-600 hover:text-indigo-600 dark:hover:text-indigo-400"}`}>
        {goal.completed ? <CheckCircle size={24} /> : <Circle size={24} />}
      </button>
      <div className="flex-1 min-w-0">
        <h3 className={`font-medium ${goal.completed ? "text-slate-600 dark:text-slate-400 line-through decoration-slate-300 dark:decoration-slate-600" : "text-slate-800 dark:text-slate-100 truncate"}`}>
          {goal.title}
        </h3>
        <p className={`text-sm mt-1 leading-relaxed ${goal.completed ? "text-slate-400 dark:text-slate-500 line-clamp-1" : "text-slate-500 dark:text-slate-400 line-clamp-2"}`}>{goal.description}</p>
        <div className="flex items-center gap-4 mt-3 flex-wrap">
          {goal.deadline && (
            <span className={`text-xs font-medium flex items-center gap-1 ${new Date(goal.deadline) < new Date() && !goal.completed ? "text-red-500 dark:text-red-400" : "text-slate-400 dark:text-slate-500"}`}>
              <Calendar size={12} />
              {new Date(goal.deadline).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
            </span>
          )}
          {goal.assigner && (
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-md border border-emerald-100 dark:border-emerald-900/30">
              Mentor assigned
            </span>
          )}
        </div>
      </div>
      <button onClick={() => handleDeleteGoal(goal._id)} className="text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 p-2 shrink-0 self-start">
        <Trash2 size={18} />
      </button>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4 sm:px-6 transition-colors">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 tracking-tight">
              <Target className="text-indigo-600 dark:text-indigo-400" />
              Goals & Tasks
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              View mentor-assigned tasks separately from your personal goals.
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-[320px_1fr] gap-8 items-start">
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 sticky top-24 transition-colors">
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-4 tracking-wide uppercase">
              {isMentor ? "New Goal / Task" : "New Goal"}
            </h2>
            <form onSubmit={handleAddGoal} className="space-y-4">
              <input className="w-full text-sm px-3 py-2 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-colors" placeholder="Task title..." value={title} onChange={(e) => setTitle(e.target.value)} required />
              <textarea className="w-full text-sm px-3 py-2 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none min-h-[80px] text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-colors" placeholder="Description..." value={description} onChange={(e) => setDescription(e.target.value)} required />
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={16} />
                <input type="date" className="w-full text-sm pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-600 dark:text-slate-300 transition-colors" value={deadline} onChange={(e) => setDeadline(e.target.value)} required />
              </div>
              <select value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full text-sm px-3 py-2 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100 transition-colors">
                <option value="low">Low priority</option>
                <option value="medium">Medium priority</option>
                <option value="high">High priority</option>
              </select>
              {isMentor && assignableMentees.length > 0 && (
                <select value={assignedUserId} onChange={(e) => setAssignedUserId(e.target.value)} className="w-full text-sm px-3 py-2 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100 transition-colors">
                  <option value="">Keep as my personal goal</option>
                  {assignableMentees.map((mentee) => (
                    <option key={mentee._id} value={mentee._id}>
                      Assign to @{mentee.username} ({mentee.name})
                    </option>
                  ))}
                </select>
              )}
              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm">
                <Plus size={16} />
                {assignedUserId ? "Assign Task" : "Create Goal"}
              </button>
            </form>
          </div>

          <div className="space-y-8">
            {loading ? (
              <div className="flex justify-center py-10">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-600 dark:border-indigo-400" />
              </div>
            ) : (
              <>
                <section className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 pb-2">
                    Mentor Assigned Tasks ({pendingMentorTasks.length})
                  </h3>
                  <AnimatePresence>
                    {pendingMentorTasks.length === 0 ? (
                      <div className="text-sm text-slate-500 dark:text-slate-400 italic py-4">No mentor-assigned tasks yet.</div>
                    ) : (
                      pendingMentorTasks.map((goal) => renderTaskCard(goal))
                    )}
                  </AnimatePresence>
                </section>

                <section className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 pb-2">
                    Personal Goals ({pendingPersonalGoals.length})
                  </h3>
                  <AnimatePresence>
                    {pendingPersonalGoals.length === 0 ? (
                      <div className="text-sm text-slate-500 dark:text-slate-400 italic py-4">No personal goals in progress.</div>
                    ) : (
                      pendingPersonalGoals.map((goal) => renderTaskCard(goal))
                    )}
                  </AnimatePresence>
                </section>

                {completedGoals.length > 0 && (
                  <section className="space-y-3">
                    <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 pb-2">
                      Completed ({completedGoals.length})
                    </h3>
                    {completedGoals.map((goal) => renderTaskCard(goal, true))}
                  </section>
                )}

                {isMentor && (
                  <section className="space-y-3">
                    <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 pb-2">
                      Assigned By You ({assignedGoals.length})
                    </h3>
                    {assignedGoals.length === 0 ? (
                      <div className="text-sm text-slate-500 dark:text-slate-400 italic py-4">No mentee tasks assigned yet.</div>
                    ) : (
                      assignedGoals.map((goal) => (
                        <div key={goal._id} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <h3 className="text-slate-800 dark:text-slate-100 font-medium">{goal.title}</h3>
                              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                Assigned to @{goal.user?.username} • {goal.user?.name}
                              </p>
                            </div>
                            <button onClick={() => handleDeleteGoal(goal._id)} className="text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors">
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </section>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Goals;
