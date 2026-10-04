"use client";
import React from "react";
import { motion } from "framer-motion";

export default function Features() {
  const features = [
    {
      title: "Mentor-Mentee Matching",
      desc: "Smart matching based on interests, streams & language.",
    },
    {
      title: "Secure Messaging",
      desc: "Chat safely within the app, with moderation tools.",
    },
    {
      title: "Goal Tracking",
      desc: "Set goals, track progress, and celebrate success.",
    },
    {
      title: "Event Scheduling",
      desc: "Plan mentorship meets & workshops easily.",
    },
    {
      title: "Badges & Rewards",
      desc: "Earn points, badges, and certificates.",
    },
    {
      title: "Resource Library",
      desc: "Access guides, FAQs & campus help anytime.",
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
          Key Features of Campus Matrix
        </h2>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        >
          {features.map((feature, i) => (
            <motion.div
              key={i}
              className="p-6 bg-gray-50 rounded-lg shadow hover:shadow-lg transition"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ rotateX: 5, rotateY: -5, scale: 1.05 }}
              transition={{ duration: 0.1, delay: i * 0.05 }}
              viewport={{ once: false }}
              style={{ transformStyle: "preserve-3d" }}
            >
              <h3 className="text-xl font-semibold mb-2 text-blue-600">{feature.title}</h3>
              <p className="text-gray-600">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
