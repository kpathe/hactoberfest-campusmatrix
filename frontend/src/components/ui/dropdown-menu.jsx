import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function DropdownMenu({ title, items }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        className="px-4 py-2 bg-gray-200 rounded-md"
      >
        {title}
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul
            className="absolute mt-2 right-0 bg-white border rounded-md shadow-lg z-10"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {items.map((item, index) => (
              <li
                key={index}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => setOpen(false)}
              >
                {item}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
