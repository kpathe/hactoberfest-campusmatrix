import React from "react";
import { motion } from "framer-motion";
import { Newspaper, Instagram, Facebook } from "lucide-react";

const News = () => {
   return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 px-4 sm:px-6 transition-colors">
         <div className="max-w-6xl mx-auto space-y-8">
            <div className="text-center mb-12">
               <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }} className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl shadow-lg mb-6">
                  <Newspaper size={32} className="text-white" />
               </motion.div>
               <h1 className="text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">Campus News Board</h1>
               <p className="text-slate-500 dark:text-slate-400 mt-3 max-w-lg mx-auto leading-relaxed">Stay updated with the latest announcements, results, and campus flashes directly sourced from SATI Vidisha official socials.</p>
            </div>

            <div className="grid md:grid-cols-1 gap-8">
               
               {/* Instagram Box */}
               <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
                  <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-6">
                     <div className="bg-pink-100 dark:bg-pink-900/30 p-2 rounded-lg text-pink-600 dark:text-pink-400"><Instagram size={20}/></div>
                     Instagram Feed
                  </h2>
                  <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-700 h-[600px] flex items-center justify-center relative transition-colors">
                     {/* Safe fallback if standard user embed blocks without access token */}
                     <span className="absolute z-0 text-slate-400 dark:text-slate-500 font-medium animate-pulse flex flex-col items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-indigo-400 dark:text-indigo-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                           <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                           <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Connecting to Instagram...
                     </span>
                     <iframe 
                        src="https://www.instagram.com/satiengg.in/embed" 
                        width="100%" 
                        height="100%" 
                        frameBorder="0" 
                        scrolling="yes" 
                        allowtransparency="true"
                        className="relative z-10 w-full h-full"
                        title="SATI Vidisha Instagram"
                     ></iframe>
                  </div>
               </motion.div>

            </div>
         </div>
      </div>
   );
};

export default News;
