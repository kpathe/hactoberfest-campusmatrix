import React from "react";
import { motion } from "framer-motion";

export default function Testimonials() {
  const students = [
    {
      name: "Aditi Sharma",
      role: "1st Year, CSE",
      quote:
        "Campus Matrix helped me find a mentor who guided me through my first year. Truly a game changer!",
    },
    {
      name: "Rahul Verma",
      role: "2nd Year, ECE",
      quote:
        "The goal tracking and event scheduling features kept me organized and motivated.",
    },
    {
      name: "Sneha Patil",
      role: "3rd Year, ME",
      quote:
        "Loved the badges and certificates! Made the whole learning experience more fun.",
    },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
          What Students Say
        </h2>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        >
          {students.map((student, i) => (
            <motion.div
              key={i}
              className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ rotateX: -3, rotateY: 5, scale: 1.05 }}
              transition={{ delay: i * 0.1, duration: 0.1 }}
              viewport={{ once: false }}
              style={{ transformStyle: "preserve-3d" }}
            >
              <p className="text-gray-700 mb-4">{student.quote}</p>
              <h3 className="text-blue-600 font-semibold">{student.name}</h3>
              <p className="text-sm text-gray-500">{student.role}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
