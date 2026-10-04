import React, { useEffect, useState } from "react";
import axios from "../api/axios";

const AdminDashboard = () => {
   const [stats, setStats] = useState({ users: 0, mentors: 0, mentees: 0, connections: 0 });
   const [loading, setLoading] = useState(true);

   useEffect(() => {
     // We will fetch real stats when the backend is ready. For now it's a structural mockup hooked into nothing or basic fetching.
     setLoading(false);
   }, []);

   return (
      <div className="p-6 max-w-6xl mx-auto min-h-screen">
         <h1 className="text-3xl font-bold mb-6 text-red-700 dark:text-red-500">Admin Control Panel</h1>
         <p className="text-gray-500 dark:text-slate-400 mb-8">Supervise mentors, manage events, and monitor platform health.</p>

         <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4 mb-8">
             <div className="bg-white dark:bg-slate-800 p-6 shadow rounded-lg border-l-4 border-blue-500 transition-colors">
                <h3 className="text-gray-500 dark:text-slate-400 text-sm font-semibold">Total Users</h3>
                <p className="text-3xl font-bold mt-2 text-gray-800 dark:text-slate-100">124</p>
             </div>
             <div className="bg-white dark:bg-slate-800 p-6 shadow rounded-lg border-l-4 border-green-500 transition-colors">
                <h3 className="text-gray-500 dark:text-slate-400 text-sm font-semibold">Active Mentors</h3>
                <p className="text-3xl font-bold mt-2 text-gray-800 dark:text-slate-100">45</p>
             </div>
             <div className="bg-white dark:bg-slate-800 p-6 shadow rounded-lg border-l-4 border-purple-500 transition-colors">
                <h3 className="text-gray-500 dark:text-slate-400 text-sm font-semibold">Active Mentees</h3>
                <p className="text-3xl font-bold mt-2 text-gray-800 dark:text-slate-100">79</p>
             </div>
             <div className="bg-white dark:bg-slate-800 p-6 shadow rounded-lg border-l-4 border-red-500 transition-colors">
                <h3 className="text-gray-500 dark:text-slate-400 text-sm font-semibold">Active Connections</h3>
                <p className="text-3xl font-bold mt-2 text-gray-800 dark:text-slate-100">32</p>
             </div>
         </div>
         
         <div className="bg-white dark:bg-slate-800 shadow rounded-lg p-6 transition-colors">
            <h2 className="text-xl font-bold mb-4 dark:text-slate-100">Supervised Chat Logs</h2>
            <p className="text-gray-500 dark:text-slate-400 text-sm mb-4">You have clearance to monitor potentially flagged conversations.</p>
            <div className="border border-dashed border-gray-300 dark:border-slate-600 p-8 text-center text-gray-400 dark:text-slate-500 bg-gray-50 dark:bg-slate-700/50 rounded transition-colors">
               No flagged messages detected in the last 24 hours.
            </div>
         </div>
      </div>
   );
};

export default AdminDashboard;
