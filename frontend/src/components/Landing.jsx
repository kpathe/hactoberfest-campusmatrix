import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Features from "./Features";
import Testimonials from "./Testimonials";

// Animation variants
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const Landing = () => {
  return (
    <>
      <motion.main
        initial="hidden"
        animate="show"
        variants={container}
        className="flex flex-col items-center justify-center min-h-[90vh] bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-12"
      >
        <motion.h1
          variants={item}
          className="text-5xl md:text-6xl font-extrabold text-blue-700 mb-6 text-center leading-tight"
          transition={{ duration: 0.8 }}
        >
          Empower Your Campus Journey
        </motion.h1>

        <motion.p
          variants={item}
          className="text-xl text-gray-700 max-w-2xl text-center mb-10"
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          Connect with mentors and buddies, set your goals, track your progress,
          and thrive together at Campus Matrix.
        </motion.p>

        <motion.div
          variants={item}
          className="flex flex-col sm:flex-row gap-4"
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <Link to="/auth/signup">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-blue-600 text-white px-8 py-3 rounded-full shadow-lg cursor-pointer text-center"
            >
              Get Started
            </motion.div>
          </Link>
          <Link to="/auth/login">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-blue-600 border border-blue-600 px-8 py-3 rounded-full shadow cursor-pointer text-center"
            >
              Log In
            </motion.div>
          </Link>
        </motion.div>
      </motion.main>
    </>
  );
};

export default Landing;
