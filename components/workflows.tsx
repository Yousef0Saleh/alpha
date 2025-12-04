"use client";

import { useRouter } from "next/navigation";
import { Trophy, Wand2, Brain, FileText, Sparkles, Zap, TrendingUp, Shield } from "lucide-react";
import { motion } from "framer-motion";

export default function Workflows() {
  const router = useRouter();

  const tools = [
    {
      icon: Trophy,
      title: "بنك الامتحانات",
      description: "اكتشف نقاط قوتك مع AI ذكي يحلل إجاباتك ويساعدك تتطور - رحلة تعلم ممتعة بدون ضغوط",
      gradient: "from-slate-900 via-purple-900 via-indigo-900 to-blue-950",
      features: ["تحليل السلوك", "توصيات ذكية", "متابعة التقدم"],
      iconGradient: "from-purple-600 via-indigo-600 to-blue-600",
      borderColor: "border-purple-500/30",
      glowColor: "purple",
    },
    {
      icon: Wand2,
      title: "مولد الامتحانات",
      description: "حول أي ملف أو محاضرة لامتحان احترافي في ثوان - AI يفهم المحتوى ويولد أسئلة ذكية",
      gradient: "from-amber-900 via-orange-900 to-amber-950",
      features: ["رفع PDF/صور", "أسئلة متنوعة", "درجات صعوبة"],
      iconGradient: "from-amber-500 via-orange-500 to-amber-600",
      borderColor: "border-amber-500/30",
      glowColor: "amber",
    },
    {
      icon: Brain,
      title: "رفيق الدراسة",
      description: "معلم شخصي متاح 24/7 - يشرح، يجاوب، ويساعدك تفهم أي مادة بأسلوبك الخاص",
      gradient: "from-purple-900 via-pink-900 to-purple-950",
      features: ["شرح مخصص", "أمثلة عملية", "محادثات ذكية"],
      iconGradient: "from-purple-500 via-pink-500 to-purple-600",
      borderColor: "border-pink-500/30",
      glowColor: "pink",
    },
    {
      icon: FileText,
      title: "ملخص الملفات",
      description: "وفر ساعات المذاكرة - AI يلخص ملفاتك الطويلة لنقاط مركزة وسهلة الحفظ",
      gradient: "from-blue-900 via-cyan-900 to-blue-950",
      features: ["تلخيص ذكي", "نقاط رئيسية", "توفير الوقت"],
      iconGradient: "from-blue-500 via-cyan-500 to-blue-600",
      borderColor: "border-cyan-500/30",
      glowColor: "cyan",
    },
  ];

  return (
    <section className="relative py-12 md:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="pb-12 md:pb-16">
          {/* Section Header */}
          <div className="mx-auto max-w-3xl pb-12 text-center md:pb-16">
            <motion.div
              className="inline-flex items-center gap-3 pb-4 mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="h-px w-8 bg-gradient-to-r from-transparent to-purple-500/50" />
              <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent font-bold">
                أدوات AI قوية
              </span>
              <div className="h-px w-8 bg-gradient-to-l from-transparent to-purple-500/50" />
            </motion.div>

            <motion.h2
              className="text-3xl md:text-5xl font-bold text-white mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              كل ما تحتاجه للنجاح
            </motion.h2>

            <motion.p
              className="text-lg md:text-xl text-gray-400"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              4 أدوات ذكية مصممة خصيصاً لمساعدتك تتفوق في دراستك
            </motion.p>
          </div>

          {/* Tools Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {tools.map((tool, index) => (
              <motion.div
                key={index}
                className="group relative cursor-pointer"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8 }}
              >
                <div
                  className={`relative overflow-hidden rounded-3xl p-8 md:p-10 border ${tool.borderColor} backdrop-blur-sm h-full`}
                  style={{
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                  }}
                >
                  {/* Animated Gradient Background */}
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-br ${tool.gradient} opacity-40`}
                    animate={{
                      backgroundPosition: ["0% 0%", "100% 100%", "0% 100%", "100% 0%", "0% 0%"],
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

                  {/* Glow Orbs */}
                  <div className={`absolute top-0 right-0 w-48 h-48 bg-${tool.glowColor}-500/20 rounded-full blur-3xl group-hover:bg-${tool.glowColor}-500/30 transition-all duration-700`} />

                  <div className="relative z-10">
                    {/* Icon */}
                    <motion.div
                      className={`inline-flex p-5 rounded-2xl bg-gradient-to-br ${tool.iconGradient} shadow-2xl mb-6`}
                      whileHover={{ rotate: [0, -5, 5, 0], scale: 1.1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <tool.icon className="w-10 h-10 text-white" />
                    </motion.div>

                    {/* Title */}
                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 group-hover:text-purple-100 transition-colors">
                      {tool.title}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-300 leading-relaxed mb-6">
                      {tool.description}
                    </p>

                    {/* Features */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {tool.features.map((feature, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1.5 text-xs font-medium rounded-full bg-white/10 border border-white/20 text-gray-300 backdrop-blur-sm"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>

                    {/* CTA Button */}
                    <motion.button
                      onClick={() => router.push("/signup")}
                      className={`px-6 py-3 bg-gradient-to-r ${tool.iconGradient} hover:opacity-90 text-white font-bold rounded-xl shadow-lg transition-all duration-300 w-full md:w-auto`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <span>جرب الآن</span>
                        <motion.span
                          animate={{ x: [0, 5, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          ←
                        </motion.span>
                      </div>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}