import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import { motion } from "framer-motion";
import { Trophy, Medal, Flame, Code2, Github } from "lucide-react";

const Leaderboard = () => {
   const [leaders, setLeaders] = useState([]);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
     axios.get("/api/leaderboard", { withCredentials: true })
        .then(res => setLeaders(res.data))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
   }, []);

   const getRankStyle = (index) => {
      if(index === 0) return "bg-amber-100 text-amber-600 ring-2 ring-amber-300";
      if(index === 1) return "bg-slate-200 text-slate-600 ring-2 ring-slate-300";
      if(index === 2) return "bg-orange-100 text-orange-600 ring-2 ring-orange-300";
      return "bg-slate-50 text-slate-500 font-medium";
   };

   return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 px-4 sm:px-6 transition-colors">
         <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center mb-12">
               <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }} className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl shadow-lg mb-6">
                  <Trophy size={32} className="text-white" />
               </motion.div>
               <h1 className="text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">Global Leaderboard</h1>
               <p className="text-slate-500 dark:text-slate-400 mt-3 max-w-lg mx-auto">Rankings are calculated dynamically combing internal mentorship Gamification Points with synced GitHub and LeetCode contributions.</p>
            </div>

            {loading ? (
                <div className="flex justify-center mt-20">
                   <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
                </div>
            ) : (
               <div className="bg-white dark:bg-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-700 transition-colors">
                  <div className="hidden sm:grid grid-cols-12 gap-4 p-4 px-6 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                     <div className="col-span-1 text-center">Rank</div>
                     <div className="col-span-5">Engineer</div>
                     <div className="col-span-3">Links</div>
                     <div className="col-span-3 text-right">Glob Score</div>
                  </div>
                  
                  <div className="divide-y divide-slate-100 dark:divide-slate-700">
                     {leaders.map((profile, index) => (
                        <motion.div 
                           initial={{ opacity: 0, y: 10 }}
                           animate={{ opacity: 1, y: 0 }}
                           transition={{ delay: index * 0.05 }}
                           key={profile._id} 
                           className="grid grid-cols-1 sm:grid-cols-12 gap-4 p-4 px-6 items-center hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group"
                        >
                           <div className="col-span-1 hidden sm:flex justify-center">
                              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                 index === 0 ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 ring-2 ring-amber-300 dark:ring-amber-700/50" : 
                                 index === 1 ? "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 ring-2 ring-slate-300 dark:ring-slate-600" :
                                 index === 2 ? "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 ring-2 ring-orange-300 dark:ring-orange-700/50" :
                                 "bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 font-medium"
                              }`}>
                                 {index + 1}
                              </span>
                           </div>
                           
                           <div className="col-span-12 sm:col-span-5 flex items-center gap-4">
                              <div className="relative">
                                 <img src={profile.user?.image || "/avatar.png"} alt="avatar" className="w-12 h-12 rounded-full border-2 border-white dark:border-slate-800 shadow-sm" />
                                 {profile.combinedStreak > 0 && (
                                    <div className="absolute -bottom-1 -right-1 bg-amber-500 w-5 h-5 rounded-full border-2 border-white dark:border-slate-800 flex items-center justify-center" title={`${profile.combinedStreak} day streak!`}>
                                       <Flame size={10} className="text-white"/>
                                    </div>
                                 )}
                              </div>
                              <div className="min-w-0">
                                 <p className="font-bold text-slate-800 dark:text-slate-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{profile.user?.name}</p>
                                 <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{profile.department}</p>
                              </div>
                           </div>
                           
                           <div className="col-span-12 sm:col-span-3 flex items-center gap-3 pl-16 sm:pl-0">
                              {profile.githubUsername ? <a href={`https://github.com/${profile.githubUsername}`} target="_blank" className="text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"><Github size={18}/></a> : <Github size={18} className="text-slate-200 dark:text-slate-700"/>}
                              {profile.leetcodeUsername ? <a href={`https://leetcode.com/${profile.leetcodeUsername}`} target="_blank" className="text-slate-400 dark:text-slate-500 hover:text-orange-500 dark:hover:text-orange-400"><Code2 size={18}/></a> : <Code2 size={18} className="text-slate-200 dark:text-slate-700"/>}
                           </div>
                           
                           <div className="col-span-12 sm:col-span-3 flex sm:justify-end items-center pl-16 sm:pl-0">
                              <div className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-4 py-1.5 rounded-full font-extrabold shadow-sm border border-indigo-100 dark:border-indigo-800/50 flex items-center gap-1.5">
                                 {index < 3 && <Medal size={14}/>}
                                 {profile.totalDynamicScore} <span className="text-xs font-medium text-indigo-400 dark:text-indigo-500">pts</span>
                              </div>
                           </div>
                        </motion.div>
                     ))}
                     {leaders.length === 0 && (
                        <div className="p-12 text-center text-slate-500 dark:text-slate-400">No users ranked yet. Refreshing profiles may take a moment.</div>
                     )}
                  </div>
               </div>
            )}
         </div>
      </div>
   );
};

export default Leaderboard;
