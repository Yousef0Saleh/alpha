"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function PageIllustration() {
  const [stars, setStars] = useState<Array<{ left: string; top: string; delay: number; duration: number }>>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setStars(
      Array.from({ length: 15 }, () => ({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        delay: Math.random() * 3,
        duration: 4 + Math.random() * 6,
      }))
    );

    setMounted(true);
  }, []);

  // Return static background immediately to prevent mobile flashing
  // This ensures bg-gray-950 is always covered, even before hydration
  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden bg-gray-950">
      {/* Static gradient background - always visible */}
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 left-1/3 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl" />

      {/* Animated content - only after mount */}
      {mounted && (
        <>
          {stars.map((star, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                left: star.left,
                top: star.top,
                willChange: "opacity, transform", // Performance optimization
              }}
              animate={{
                opacity: [0.1, 0.6, 0.1],
                scale: [0.5, 1.2, 0.5],
              }}
              transition={{
                duration: star.duration,
                repeat: Infinity,
                delay: star.delay,
                ease: "easeInOut",
              }}
            />
          ))}

          {/* Animated Gradient Orbs */}
          <motion.div
            className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-3xl"
            style={{ willChange: "transform, opacity" }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 20, // Slower = less CPU
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          <motion.div
            className="absolute -bottom-40 left-1/3 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl"
            style={{ willChange: "transform, opacity" }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </>
      )}
    </div>
  );
}
