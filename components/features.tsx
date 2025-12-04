"use client";

import { motion } from "framer-motion";
import {
  Sparkles,
  TrendingUp,
  Shield,
  Smartphone,
  Clock,
  Gift,
} from "lucide-react";

export default function Features() {
  const features = [
    {
      icon: Sparkles,
      title: "AI متطور",
      description: "تقنيات ذكاء اصطناعي من أحدث ما توصل له العلم - يفهمك ويتعلم من تفاعلاتك",
      gradient: "from-purple-500 to-indigo-500",
    },
    {
      icon: TrendingUp,
      title: "تحليل شامل",
      description: "فهم عميق لسلوكك التعليمي وتقديم توصيات مخصصة تناسب أسلوب تعلمك",
      gradient: "from-indigo-500 to-blue-500",
    },
    {
      icon: Shield,
      title: "أمان كامل",
      description: "بياناتك محمية 100% ومشفرة بأعلى معايير الأمان - خصوصيتك أولويتنا",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: Smartphone,
      title: "واجهة بسيطة",
      description: "تصميم عصري وسهل الاستخدام - ابدأ فوراً بدون تعقيدات أو تدريب",
      gradient: "from-cyan-500 to-teal-500",
    },
    {
      icon: Clock,
      title: "متاح دائماً",
      description: "24/7 على كل الأجهزة - تعلم في أي وقت ومن أي مكان يناسبك",
      gradient: "from-teal-500 to-green-500",
    },
    {
      icon: Gift,
      title: "مجاني بالكامل",
      description: "كل المميزات متاحة مجاناً للطلاب - لا رسوم خفية، لا اشتراكات",
      gradient: "from-green-500 to-emerald-500",
    },
  ];

  return (
    <section className="relative py-12 md:py-20 border-t border-white/5">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute -top-40 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="py-12 md:py-20">
          {/* Section Header */}
          <div className="mx-auto max-w-3xl pb-12 text-center md:pb-16">
            <motion.div
              className="inline-flex items-center gap-3 pb-4 mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="h-px w-8 bg-gradient-to-r from-transparent to-indigo-500/50" />
              <span className="bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent font-bold">
                مميزاتنا
              </span>
              <div className="h-px w-8 bg-gradient-to-l from-transparent to-indigo-500/50" />
            </motion.div>

            <motion.h2
              className="text-3xl md:text-5xl font-bold text-white mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              لماذا ألفا AI؟
            </motion.h2>

            <motion.p
              className="text-lg md:text-xl text-gray-400"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              منصة متكاملة مصممة لمساعدتك تحقق أفضل النتائج
            </motion.p>
          </div>

          {/* Features Grid */}
          <div className="mx-auto grid max-w-sm gap-8 sm:max-w-none sm:grid-cols-2 md:gap-10 lg:grid-cols-3">
            {features.map((feature, index) => (
              <motion.article
                key={index}
                className="group relative"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="relative p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/[0.07] hover:border-white/20 transition-all duration-300 h-full">
                  {/* Icon with Gradient */}
                  <motion.div
                    className="mb-4"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.gradient}`}>
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                  </motion.div>

                  {/* Title */}
                  <h3 className="mb-2 text-xl font-bold text-white group-hover:text-purple-100 transition-colors">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Hover Glow Effect */}
                  <div className={`absolute -inset-px rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500 -z-10`} />
                </div>
              </motion.article>
            ))}
          </div>

          {/* Bottom CTA */}
          <motion.div
            className="mt-16 text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
          >
            <p className="text-gray-400 mb-6 text-lg">
              جاهز تبدأ رحلتك التعليمية؟
            </p>
            <motion.button
              onClick={() => window.location.href = '/signup'}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-2xl shadow-lg shadow-purple-500/25 transition-all duration-300"
              whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(139, 92, 246, 0.4)' }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="inline-flex items-center gap-2">
                انضم لنا الآن
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  ←
                </motion.span>
              </span>
            </motion.button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
