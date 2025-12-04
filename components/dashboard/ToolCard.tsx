"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface ToolCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
  index?: number;
}

export default function ToolCard({
  icon: Icon,
  title,
  description,
  href,
  index = 0,
}: ToolCardProps) {
  return (
    <Link href={href}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        whileHover={{ scale: 1.02, y: -2 }}
        className="
          group relative overflow-hidden rounded-2xl p-6 h-full
          bg-white/[0.03] 
          border border-white/[0.05]
          hover:bg-white/[0.05] hover:border-white/[0.08]
          backdrop-blur-xl
          transition-all duration-300
          cursor-pointer
        "
        style={{
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        }}
      >
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Glow effect on hover */}
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />

        <div className="relative">
          {/* Icon container */}
          <div className="
            inline-flex p-3 rounded-xl mb-4
            bg-white/[0.05] 
            border border-white/[0.08]
            group-hover:bg-white/[0.08]
            transition-all duration-300
          ">
            <Icon className="w-6 h-6 text-white/90" />
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-white mb-2 group-hover:text-white/95 transition-colors">
            {title}
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-400 leading-relaxed mb-4">
            {description}
          </p>

          {/* Arrow indicator */}
          <div className="flex items-center gap-2 text-sm text-white/60 group-hover:text-white/80 group-hover:gap-3 transition-all">
            <span>ابدأ الآن</span>
            <ArrowLeft className="w-4 h-4 group-hover:translate-x-[-2px] transition-transform" />
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
