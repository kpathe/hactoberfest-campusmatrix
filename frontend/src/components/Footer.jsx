import React from "react";

export default function Footer() {
  return (
    <footer className="text-center py-6 bg-gray-100 text-gray-600">
      © {new Date().getFullYear()} Campus Matrix. All rights reserved.
    </footer>
  );
}
