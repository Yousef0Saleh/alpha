"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: number | string;
  suffix?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export default function StatsCard({
  icon: Icon,
  label,
  value,
  suffix = "",
  trend,
}: StatsCardProps) {
  const [displayValue, setDisplayValue] = useState(0);

  // Animate number counting
  useEffect(() => {
    if (typeof value === "number") {
      const duration = 1000;
      const steps = 30;
      const increment = value / steps;
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= value) {
          setDisplayValue(value);
          clearInterval(timer);
        } else {
          setDisplayValue(Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [value]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02 }}
      className="
        relative overflow-hidden rounded-2xl p-5
        bg-white/[0.03]
        border border-white/[0.05]
        hover:bg-white/[0.05] hover:border-white/[0.08]
        backdrop-blur-xl
        transition-all duration-300
      "
      style={{
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
      }}
    >
      {/* Subtle glow */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-white/[0.02] rounded-full blur-2xl -mr-12 -mt-12" />

      <div className="relative">
        {/* Icon */}
        <div className="inline-flex p-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] mb-3">
          <Icon className="w-5 h-5 text-white/80" />
        </div>

        {/* Value */}
        <div className="mb-1">
          <span className="text-2xl font-bold text-white">
            {typeof value === "number" ? displayValue : value}
          </span>
          {suffix && (
            <span className="text-lg text-gray-400 mr-1">{suffix}</span>
          )}
        </div>

        {/* Label */}
        <p className="text-gray-400 text-sm">{label}</p>

        {/* Trend indicator */}
        {trend && (
          <div className="mt-2 flex items-center gap-1">
            <span
              className={`text-xs font-medium ${trend.isPositive ? "text-green-400" : "text-red-400"
                }`}
            >
              {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
            </span>
            <span className="text-xs text-gray-500">من الشهر الماضي</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
