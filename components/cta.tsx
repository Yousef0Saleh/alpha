"use client";

import { useRouter } from "next/navigation";
import { Sparkles, Rocket, Zap } from "lucide-react";
import { motion } from "framer-motion";

export default function Cta() {
  const router = useRouter();

  return (
    <section className="relative overflow-hidden py-20 md:py-32">
      {/* Space Background */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Stars/Particles */}
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/40 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 2 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}

        {/* Gradient Orbs */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.2, 0.4],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <div className="relative rounded-3xl p-12 md:p-16 border border-purple-500/20 backdrop-blur-xl overflow-hidden">
          {/* Animated Background Gradient */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-950 opacity-50"
            animate={{
              backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{
              backgroundSize: "400% 400%",
            }}
          />

          {/* Content */}
          <div className="relative mx-auto max-w-3xl text-center">
            {/* Icon */}
            <motion.div
              className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 shadow-2xl"
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
            >
              <Rocket className="h-10 w-10 text-white" />
            </motion.div>

            {/* Heading */}
            <motion.h2
              className="mb-6 text-4xl md:text-5xl lg:text-6xl font-bold text-white"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              ابدأ رحلتك اليوم
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-indigo-400 to-blue-400 bg-clip-text text-transparent">
                مع ألفا AI
              </span>
            </motion.h2>

            {/* Description */}
            <motion.p
              className="mb-10 text-xl md:text-2xl text-gray-300 leading-relaxed"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              انضم لمنصة التعليم الأولى بالذكاء الاصطناعي في مصر
              <br />
              <span className="text-gray-400">وحقق أحلامك الأكاديمية مع أقوى الأدوات التعليمية</span>
            </motion.p>

            {/* Benefits */}
            <motion.div
              className="mb-10 flex flex-wrap items-center justify-center gap-4 md:gap-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-emerald-500/30 backdrop-blur-sm">
                <Zap className="h-4 w-4 text-emerald-400" />
                <span className="text-emerald-300 font-medium text-sm">تفعيل فوري</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-blue-500/30 backdrop-blur-sm">
                <Sparkles className="h-4 w-4 text-blue-400" />
                <span className="text-blue-300 font-medium text-sm">مجاني 100%</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-purple-500/30 backdrop-blur-sm">
                <svg className="h-4 w-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="text-purple-300 font-medium text-sm">آمن تماماً</span>
              </div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <motion.button
                onClick={() => router.push("/signup")}
                className="group w-full sm:w-auto px-10 py-5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-2xl shadow-lg shadow-purple-500/30 transition-all duration-300"
                whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(139, 92, 246, 0.5)' }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="relative inline-flex items-center gap-3">
                  <Sparkles className="h-5 w-5" />
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
                className="w-full sm:w-auto px-10 py-5 bg-white/5 hover:bg-white/10 border border-white/20 hover:border-white/30 text-gray-300 hover:text-white font-bold rounded-2xl backdrop-blur-sm transition-all duration-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                عندك حساب؟ ادخل
              </motion.button>
            </motion.div>

            {/* Trust Indicator */}
            <motion.div
              className="mt-12 text-gray-400 text-sm"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
            >
              <p>بدون بطاقة ائتمانية • التسجيل في أقل من دقيقة</p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}