import React from "react";

export default function Avatar({ src, alt, size = "12" }) {
  return (
    <img
      src={src}
      alt={alt}
      className={`w-${size} h-${size} rounded-full object-cover`}
    />
  );
}
