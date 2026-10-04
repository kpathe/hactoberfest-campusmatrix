import React from "react";
import { motion } from "framer-motion";
import { CalendarDays, MapPin, Clock, ArrowRight, Sparkles, Code, Briefcase } from "lucide-react";

export default function Events() {
  const primaryEvents = [
    {
      title: "FLUXWave Hackathon 2.0",
      type: "Online Hackathon",
      icon: <Code size={20} />,
      gradient: "from-indigo-500 to-purple-600",
      status: "Active",
      details: [
         "Round 0 — Team Formation: Form a team of 3–4 members from any year.",
         "Round 1 — PPT Submission: Submit a PPT explaining your idea and approach.",
         "Round 2 — Prototype Submission: Submit your GitHub repo or ZIP with a video.",
         "Round 3 — Final Interview: Team interview based on project clarity."
      ],
      tags: ["Open Innovation", "Healthcare", "Education", "Environment"],
      dates: "July 8 - July 27, 2025"
    },
    {
      title: "WordPress Build Tour",
      type: "Workshop & Ideation",
      icon: <Sparkles size={20} />,
      gradient: "from-blue-500 to-cyan-500",
      status: "Upcoming",
      details: [
         "Hands-on Website Development & Ideation.",
         "Intro to Open Source & Community Culture.",
         "Connect with WordPress Professionals.",
         "Live Demos | Real-Time Guidance | Interactive Workshops."
      ],
      tags: ["WordPress", "Web Dev", "E-Cell SATI"],
      dates: "July 26, 2025",
      location: "VV Natu Computer Centre",
      link: "https://tinyurl.com/EcellSATIxWordPress"
    }
  ];

  const upcomingEvents = [
    {
      title: "Resume & Portfolio Workshop",
      date: "30 July 2025",
      desc: "Learn how to build a professional resume and LinkedIn profile.",
      icon: <Briefcase size={18} />
    },
    {
      title: "Competitive Coding Bootcamp",
      date: "5 August 2025",
      desc: "Sharpen your coding skills with hands-on problems and expert guidance.",
      icon: <Code size={18} />
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 px-4 sm:px-6 transition-colors">
      <div className="max-w-5xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center">
           <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }} className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl shadow-lg mb-6">
              <CalendarDays size={32} className="text-white" />
           </motion.div>
           <h1 className="text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">Campus Events</h1>
           <p className="text-slate-500 dark:text-slate-400 mt-3 max-w-lg mx-auto leading-relaxed">Discover hackathons, bootcamps, and networking sessions. Upgrade your skills beyond the classroom.</p>
        </div>

        {/* Featured Events */}
        <div className="space-y-6">
          <h2 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider pl-2">Featured Highlights</h2>
          <div className="grid md:grid-cols-2 gap-6">
             {primaryEvents.map((event, idx) => (
                <motion.div 
                   key={idx}
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: idx * 0.1 }}
                   className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow group flex flex-col"
                >
                   <div className={`h-2 w-full bg-gradient-to-r ${event.gradient}`}></div>
                   <div className="p-8 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-4">
                         <div className={`p-2 rounded-xl bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors`}>
                            {event.icon}
                         </div>
                         <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${event.status === 'Active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                            {event.status}
                         </span>
                      </div>
                      
                      <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1">{event.title}</h3>
                      <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-6">{event.type}</p>
                      
                      <ul className="space-y-3 mb-8 flex-1">
                         {event.details.map((detail, dIdx) => (
                            <li key={dIdx} className="text-sm text-slate-600 dark:text-slate-300 flex items-start gap-2">
                               <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 mt-1.5 shrink-0"></div>
                               <span className="leading-relaxed">{detail}</span>
                            </li>
                         ))}
                      </ul>

                      <div className="pt-6 border-t border-slate-100 dark:border-slate-700 space-y-3">
                         <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
                            <Clock size={16} className="text-slate-400 dark:text-slate-500" /> {event.dates}
                         </div>
                         {event.location && (
                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
                               <MapPin size={16} className="text-slate-400 dark:text-slate-500" /> {event.location}
                            </div>
                         )}
                         <div className="flex flex-wrap gap-2 mt-4">
                            {event.tags.map(tag => (
                               <span key={tag} className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 rounded-md">
                                  {tag}
                               </span>
                            ))}
                         </div>
                         {event.link && (
                            <a href={event.link} target="_blank" rel="noreferrer" className="mt-6 w-full flex items-center justify-center gap-2 bg-slate-900 dark:bg-indigo-600 text-white py-3 rounded-xl hover:bg-slate-800 dark:hover:bg-indigo-700 transition-colors text-sm font-medium">
                               Register Now <ArrowRight size={16}/>
                            </a>
                         )}
                      </div>
                   </div>
                </motion.div>
             ))}
          </div>
        </div>

        {/* Other Upcoming */}
        <div className="space-y-6 pt-8">
           <h2 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider pl-2">Upcoming Schedule</h2>
           <div className="grid sm:grid-cols-2 gap-4">
              {upcomingEvents.map((ev, idx) => (
                 <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + (idx * 0.1) }}
                    className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-start gap-4 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
                 >
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl shrink-0">
                       {ev.icon}
                    </div>
                    <div>
                       <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-1">{ev.title}</h4>
                       <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-3">{ev.desc}</p>
                       <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 dark:text-slate-500">
                          <CalendarDays size={14} /> {ev.date}
                       </div>
                    </div>
                 </motion.div>
              ))}
           </div>
        </div>

      </div>
    </div>
  );
}
