"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function PageIllustration() {
  const [stars, setStars] = useState<Array<{ left: string; top: string; delay: number; duration: number }>>([]);
  const [shootingStars, setShootingStars] = useState<Array<{ left: string; top: string; delay: number }>>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Generate random positions only on client
    setStars(
      Array.from({ length: 50 }, () => ({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        delay: Math.random() * 3,
        duration: 3 + Math.random() * 4,
      }))
    );

    setShootingStars(
      Array.from({ length: 3 }, (_, i) => ({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 50}%`,
        delay: i * 5 + Math.random() * 5,
      }))
    );

    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // Avoid SSR mismatch
  }

  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
      {/* Animated Stars Background */}
      {stars.map((star, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-white rounded-full"
          style={{
            left: star.left,
            top: star.top,
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

      {/* Large Gradient Orbs */}
      <motion.div
        className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute top-1/2 -right-40 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.4, 0.2, 0.4],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute -bottom-40 left-1/3 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Medium Floating Orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-400/5 rounded-full blur-2xl"
        animate={{
          x: [0, 50, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-indigo-400/5 rounded-full blur-2xl"
        animate={{
          x: [0, -40, 0],
          y: [0, 40, 0],
        }}
        transition={{
          duration: 14,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Shooting Stars */}
      {shootingStars.map((star, i) => (
        <motion.div
          key={`shooting-${i}`}
          className="absolute h-px w-20 bg-gradient-to-r from-transparent via-white to-transparent"
          style={{
            left: star.left,
            top: star.top,
          }}
          animate={{
            x: [0, -300],
            y: [0, 200],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: star.delay,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}
