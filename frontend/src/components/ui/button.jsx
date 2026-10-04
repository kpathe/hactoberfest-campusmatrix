import React from "react";
import { motion } from "framer-motion";

export default function Button({ children, onClick, className }) {
  return (
    <motion.button
      whileHover={{ scale: 1.00 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`px-6 py-2 bg-blue-600 text-white rounded-md font-semibold ${className}`}
    >
      {children}
    </motion.button>
  );
}
