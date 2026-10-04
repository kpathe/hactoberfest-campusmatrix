import React from "react";
import { motion } from "framer-motion";
import { BookOpen, Download, ExternalLink, FileText, Code2, Map, Briefcase, ChevronRight } from "lucide-react";

export default function Resources() {
  const resources = [
    {
      title: "Programming Resources",
      desc: "Free online platforms to learn coding: LeetCode, GeeksforGeeks, HackerRank, Codeforces, FreeCodeCamp.",
      link: "https://www.geeksforgeeks.org/",
      icon: <Code2 size={24} className="text-indigo-500" />,
      color: "bg-indigo-50 border-indigo-100",
      action: "Visit Platform"
    },
    {
      title: "College Notes",
      desc: "Semester-wise notes for CSE, ECE, ME, IT. Download PDFs and handwritten notes.",
      link: "#",
      icon: <FileText size={24} className="text-emerald-500" />,
      color: "bg-emerald-50 border-emerald-100",
      action: "Download Zip"
    },
    {
      title: "Previous Year Papers (PYQ)",
      desc: "Access structured Previous Year Questions for all branches and years. Crucial for exam prep.",
      link: "https://saticollege.online/",
      icon: <Download size={24} className="text-amber-500" />,
      color: "bg-amber-50 border-amber-100",
      action: "Access PYQs"
    },
    {
      title: "Campus Guide & Maps",
      desc: "FAQs, detailed campus maps, hostel info, and essential tips for new 1st year students.",
      link: "#",
      icon: <Map size={24} className="text-rose-500" />,
      color: "bg-rose-50 border-rose-100",
      action: "View Guide"
    },
    {
      title: "Career & Placements",
      desc: "Verified Resume templates, automated interview tips, and LinkedIn profile building guides.",
      link: "#",
      icon: <Briefcase size={24} className="text-blue-500" />,
      color: "bg-blue-50 border-blue-100",
      action: "Explore Tools"
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 px-4 sm:px-6 transition-colors">
      <div className="max-w-5xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center">
           <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }} className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg mb-6">
              <BookOpen size={32} className="text-white" />
           </motion.div>
           <h1 className="text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">Student Knowledge Base</h1>
           <p className="text-slate-500 dark:text-slate-400 mt-3 max-w-lg mx-auto leading-relaxed">Everything you need to excel at SATI Vidisha. From previous year exam question banks to highly rated technical setups.</p>
        </div>

        {/* Resources Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
           {resources.map((res, idx) => {
              // Map background and border colors to dark mode variants
              const darkColor = res.color.replace(/bg-[a-z]+-50/g, match => `dark:${match.replace('50', '900/30')}`).replace(/border-[a-z]+-100/g, match => `dark:${match.replace('100', '900/50')}`);
              
              return (
              <motion.div 
                 key={idx}
                 initial={{ opacity: 0, y: 15 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: idx * 0.05 }}
                 className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all group cursor-pointer flex flex-col"
              >
                 <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border ${res.color} ${darkColor} group-hover:scale-110 transition-transform`}>
                    {res.icon}
                 </div>
                 
                 <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">{res.title}</h2>
                 <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed flex-1 mb-6">{res.desc}</p>
                 
                 <div className="pt-4 border-t border-slate-100 dark:border-slate-700 mt-auto">
                    <a
                      href={res.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors"
                    >
                      {res.action} 
                      {res.link !== "#" ? <ExternalLink size={14} /> : <ChevronRight size={16} />}
                    </a>
                 </div>
              </motion.div>
              );
           })}
        </div>

      </div>
    </div>
  );
}
