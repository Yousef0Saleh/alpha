"use client";

import { useRouter } from "next/navigation";
import { Sparkles, Brain, Wand2, Trophy, FileText } from "lucide-react";
import { motion } from "framer-motion";

export default function HeroHome() {
  const router = useRouter();

  return (
    <section className="relative overflow-hidden">
      {/* Space-themed Background */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Animated Gradient Orbs */}
        <motion.div
          className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="py-12 md:py-24">
          <div className="pb-6 text-center md:pb-10">
            {/* Badge */}
            <motion.div
              className="mb-6 inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/20 px-5 py-2.5 backdrop-blur-sm"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Sparkles className="h-5 w-5 text-purple-400" />
              <span className="bg-gradient-to-r from-purple-400 to-indigo-300 bg-clip-text text-transparent font-bold text-sm">
                مدعوم بالذكاء الاصطناعي المتطور
              </span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              className="mb-6 text-4xl font-bold text-white md:text-6xl lg:text-7xl leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              مستقبل التعليم في مصر بدأ
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-indigo-400 to-blue-400 bg-clip-text text-transparent">
                ألفا AI
              </span>
            </motion.h1>

            {/* Description */}
            <motion.div
              className="mx-auto max-w-3xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <p className="mb-8 text-xl md:text-2xl text-gray-300 leading-relaxed">
                منصة تعليمية ثورية مدعومة بالذكاء الاصطناعي
                <br />
                <span className="text-gray-400">كل ما تحتاجه للتفوق في مكان واحد</span>
              </p>

              {/* Tools Pills */}
              <motion.div
                className="mb-10 flex flex-wrap items-center justify-center gap-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex items-center gap-2 rounded-full bg-slate-900/50 border border-purple-500/30 px-4 py-2.5 text-sm text-purple-300 backdrop-blur-sm hover:bg-slate-900/70 transition-all">
                  <Trophy className="h-4 w-4" />
                  <span className="font-medium">بنك امتحانات ذكي</span>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-slate-900/50 border border-amber-500/30 px-4 py-2.5 text-sm text-amber-300 backdrop-blur-sm hover:bg-slate-900/70 transition-all">
                  <Wand2 className="h-4 w-4" />
                  <span className="font-medium">مولد امتحانات AI</span>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-slate-900/50 border border-pink-500/30 px-4 py-2.5 text-sm text-pink-300 backdrop-blur-sm hover:bg-slate-900/70 transition-all">
                  <Brain className="h-4 w-4" />
                  <span className="font-medium">رفيق الدراسة</span>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-slate-900/50 border border-cyan-500/30 px-4 py-2.5 text-sm text-cyan-300 backdrop-blur-sm hover:bg-slate-900/70 transition-all">
                  <FileText className="h-4 w-4" />
                  <span className="font-medium">ملخص ملفات فوري</span>
                </div>
              </motion.div>

              {/* CTA Buttons */}
              <motion.div
                className="mx-auto max-w-xs sm:flex sm:max-w-none sm:justify-center sm:gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <motion.button
                  onClick={() => router.push("/signup")}
                  className="mb-4 w-full sm:mb-0 sm:w-auto px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-2xl shadow-lg shadow-purple-500/25 transition-all duration-300"
                  whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(139, 92, 246, 0.4)' }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="relative inline-flex items-center gap-2">
                    ابدأ مجاناً الآن
                    <motion.span
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      ←
                    </motion.span>
                  </span>
                </motion.button>

                <motion.button
                  onClick={() => router.push("/signin")}
                  className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-gray-300 hover:text-white font-bold rounded-2xl backdrop-blur-sm transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  تسجيل الدخول
                </motion.button>
              </motion.div>
            </motion.div>
          </div>

          {/* Stats */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto mt-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <div className="text-center p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent mb-2">
                4
              </div>
              <div className="text-gray-400 text-sm font-medium">أدوات AI قوية</div>
            </div>
            <div className="text-center p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent mb-2">
                100%
              </div>
              <div className="text-gray-400 text-sm font-medium">مجاني بالكامل</div>
            </div>
            <div className="text-center p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                24/7
              </div>
              <div className="text-gray-400 text-sm font-medium">متاح دائماً</div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}