"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/hooks/useAuth";
import LoaderOverlay from "@/components/LoaderOverlay";
import OnboardingModal from "@/components/OnboardingModal";
import {
  FileText,
  MessageSquare,
  Trophy,
  BookOpen,
  Sparkles,
  Wand2,
  Brain,
  TrendingUp,
  Zap,
  Target,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

interface DashboardData {
  exams_taken: number;
  average_score: number;
  study_materials: number;
  conversations: number;
  recent_exams: Array<{
    id: number;
    exam_id: number;
    exam_title: string;
    score: number;
    correct: number;
    total: number;
    date: string;
  }>;
  recent_activities: Array<{
    type: string;
    title: string;
    date: string;
  }>;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.1.5/alpha/backend/routes';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/');
      return;
    }

    if (user) {
      fetchDashboardData();

      // Check if user is first time visitor
      const hasSeenOnboarding = localStorage.getItem('alpha_onboarding_completed');
      if (!hasSeenOnboarding) {
        setShowOnboarding(true);
      }
    }
  }, [loading, user, router]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleOnboardingClose = () => {
    setShowOnboarding(false);
    localStorage.setItem('alpha_onboarding_completed', 'true');
  };

  const fetchDashboardData = async () => {
    try {
      const response = await fetch(`${API_BASE}/dashboard.php`, {
        credentials: 'include',
      });

      if (response.ok) {
        const result = await response.json();
        setDashboardData(result.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setDataLoading(false);
    }
  };

  if (loading || !user) {
    return <LoaderOverlay />;
  }

  // Featured Tool (Hero Card)
  const featuredTool = {
    icon: Trophy,
    title: "بنك الامتحانات",
    description: "اكتشف نقاط قوتك مع AI ذكي يحلل إجاباتك ويساعدك تتطور - رحلة تعلم ممتعة بدون ضغوط",
    href: "/exams",
    gradient: "from-slate-900 via-purple-900 via-indigo-900 to-blue-950",
  };

  // Other Tools
  const tools = [
    {
      icon: Wand2,
      title: "مولد الامتحانات",
      description: "اصنع امتحانات احترافية من ملفاتك",
      href: "/exam-generator",
      gradient: "from-amber-500/20 via-orange-500/20 to-amber-500/20",
      glow: "group-hover:shadow-amber-500/50",
    },
    {
      icon: Brain,
      title: "رفيق الدراسة",
      description: "اسأل واحصل على إجابات فورية ودقيقة",
      href: "/chat",
      gradient: "from-purple-500/20 via-pink-500/20 to-purple-500/20",
      glow: "group-hover:shadow-purple-500/50",
    },
    {
      icon: FileText,
      title: "ملخص الملفات",
      description: "حول أي ملف لملخص مفيد في ثواني",
      href: "/summarizer",
      gradient: "from-blue-500/20 via-cyan-500/20 to-blue-500/20",
      glow: "group-hover:shadow-blue-500/50",
    },
  ];

  const stats = [
    {
      icon: Trophy,
      label: "امتحانات مكتملة",
      value: dashboardData?.exams_taken || 0,
      suffix: "",
      color: "from-purple-500 to-pink-500",
      bgGlow: "bg-purple-500/10",
    },
    {
      icon: Target,
      label: "متوسط الأداء",
      value: dashboardData?.average_score || 0,
      suffix: "%",
      color: "from-blue-500 to-cyan-500",
      bgGlow: "bg-blue-500/10",
    },
    {
      icon: BookOpen,
      label: "مواد دراسية",
      value: dashboardData?.study_materials || 0,
      suffix: "",
      color: "from-emerald-500 to-green-500",
      bgGlow: "bg-emerald-500/10",
    },
    {
      icon: Zap,
      label: "محادثات",
      value: dashboardData?.conversations || 0,
      suffix: "",
      color: "from-amber-500 to-orange-500",
      bgGlow: "bg-amber-500/10",
    },
  ];

  return (
    <div className="relative min-h-screen bg-gray-950 text-white overflow-hidden">
      {/* Onboarding Modal */}
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={handleOnboardingClose}
        userName={user.name}
      />

      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Animated Gradient Orbs */}
        <motion.div
          className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
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
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
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
          className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl"
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

        {/* Mouse Follow Gradient */}
        <motion.div
          className="absolute w-64 h-64 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full blur-2xl"
          animate={{
            x: mousePosition.x - 128,
            y: mousePosition.y - 128,
          }}
          transition={{
            type: "spring",
            stiffness: 50,
            damping: 20,
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <motion.h1
            className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            مرحباً، {user.name} 👋
          </motion.h1>
          <motion.p
            className="text-gray-400 text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            جاهز لإكمال رحلتك التعليمية؟
          </motion.p>
        </motion.div>

        {/* Hero Stats */}
        < div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-12" >
          {
            stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="group relative"
              >
                <div
                  className={`
                  relative overflow-hidden rounded-3xl p-6
                  bg-white/[0.02]
                  border border-white/[0.05]
                  hover:bg-white/[0.04] hover:border-white/[0.1]
                  backdrop-blur-2xl
                  transition-all duration-500
                  ${stat.bgGlow}
                `}
                  style={{
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                  }}
                >
                  {/* Glow Effect */}
                  <div className="absolute -inset-1 bg-gradient-to-r opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500 rounded-3xl"
                    style={{ backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))` }} />

                  <div className="relative">
                    {/* Icon */}
                    <div className={`inline-flex p-3 rounded-2xl bg-gradient-to-br ${stat.color} mb-4`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>

                    {/* Value */}
                    <div className="mb-2">
                      <motion.span
                        className="text-4xl md:text-5xl font-bold bg-gradient-to-br from-white to-gray-300 bg-clip-text text-transparent"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 + index * 0.1, type: "spring" }}
                      >
                        {stat.value}
                      </motion.span>
                      {stat.suffix && (
                        <span className="text-2xl text-gray-400 mr-1">{stat.suffix}</span>
                      )}
                    </div>

                    {/* Label */}
                    <p className="text-gray-400 text-sm font-medium">{stat.label}</p>

                    {/* Sparkline (if has data) */}
                    {stat.value > 0 && (
                      <div className="mt-3 h-8 flex items-end gap-1">
                        {[...Array(12)].map((_, i) => (
                          <motion.div
                            key={i}
                            className={`flex-1 bg-gradient-to-t ${stat.color} rounded-sm opacity-30`}
                            initial={{ height: 0 }}
                            animate={{ height: `${Math.random() * 100}%` }}
                            transition={{ delay: 0.5 + i * 0.05, duration: 0.5 }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          }
        </div >

        {/* Featured Tool - Exam Bank (Hero Card) */}
        <Link href={featuredTool.href}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.01, y: -5 }}
            whileTap={{ scale: 0.99 }}
            className="group relative cursor-pointer mb-8"
          >
            <div
              className="relative overflow-hidden rounded-3xl p-10 md:p-12 border border-white/10 backdrop-blur-2xl"
              style={{
                boxShadow: '0 25px 70px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
              }}
            >
              {/* Animated Gradient Background - Always Active */}
              <motion.div
                className={`absolute inset-0 bg-gradient-to-br ${featuredTool.gradient} opacity-20`}
                animate={{
                  backgroundPosition: ["0% 0%", "100% 100%", "0% 100%", "100% 0%", "0% 0%"],
                  scale: [1, 1.05, 1, 1.05, 1],
                }}
                transition={{
                  duration: 15,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                style={{
                  backgroundSize: "400% 400%",
                }}
              />

              {/* Shimmer Effect on Hover */}
              <motion.div
                className="absolute inset-0 opacity-0 group-hover:opacity-100"
                style={{
                  background: 'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%)',
                  backgroundSize: '200% 200%',
                }}
                animate={{
                  backgroundPosition: ['0% 0%', '200% 200%'],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
              />

              {/* Floating Particles */}
              <div className="absolute inset-0 overflow-hidden">
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-white/20 rounded-full"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                    }}
                    animate={{
                      y: [0, -30, 0],
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      duration: 3 + Math.random() * 2,
                      repeat: Infinity,
                      delay: Math.random() * 2,
                    }}
                  />
                ))}
              </div>

              {/* Glow Orbs */}
              <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl group-hover:bg-indigo-500/30 transition-all duration-700" />
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl group-hover:bg-purple-500/30 transition-all duration-700" />

              <div className="relative grid md:grid-cols-3 gap-8 items-center">
                {/* Left Section - Icon & Badge */}
                <div className="flex flex-col items-center md:items-start gap-4">
                  {/* Animated Badge */}
                  <motion.div
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border border-purple-500/30 backdrop-blur-sm"
                    animate={{
                      scale: [1, 1.05, 1],
                      boxShadow: [
                        '0 0 20px rgba(168, 85, 247, 0.3)',
                        '0 0 30px rgba(168, 85, 247, 0.5)',
                        '0 0 20px rgba(168, 85, 247, 0.3)',
                      ],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <motion.span
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="text-xl"
                    >
                      ⭐
                    </motion.span>
                    <span className="text-purple-300 font-bold text-sm">الأداة الرئيسية</span>
                  </motion.div>

                  {/* Icon */}
                  <motion.div
                    className="inline-flex p-6 rounded-3xl bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 shadow-2xl"
                    whileHover={{ rotate: [0, -5, 5, 0], scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <featuredTool.icon className="w-12 h-12 text-white" />
                  </motion.div>
                </div>

                {/* Center Section - Content */}
                <div className="md:col-span-2 text-center md:text-right">
                  {/* Title */}
                  <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 group-hover:text-purple-100 transition-colors">
                    {featuredTool.title}
                  </h2>

                  {/* Description */}
                  <p className="text-gray-300 text-lg leading-relaxed mb-6">
                    {featuredTool.description}
                  </p>

                  <div className="flex justify-center md:justify-start">
                    {/* CTA Button */}
                    <motion.button
                      className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-2xl shadow-lg transition-all duration-300"
                      whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(139, 92, 246, 0.4)' }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div className="flex items-center gap-3">
                        <span>تصفح الكل</span>
                        <motion.div
                          animate={{ x: [0, 5, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          ←
                        </motion.div>
                      </div>
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </Link>

        {/* Other Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {tools.map((tool, index) => (
            <Link key={index} href={tool.href}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                whileHover={{ scale: 1.02, y: -8 }}
                whileTap={{ scale: 0.98 }}
                className="group relative h-full cursor-pointer"
              >
                <div
                  className={`
                    relative overflow-hidden rounded-3xl p-8
                    bg-white/[0.02]
                    border border-white/[0.05]
                    hover:bg-white/[0.04] hover:border-white/[0.1]
                    backdrop-blur-2xl
                    transition-all duration-500
                    ${tool.glow}
                  `}
                  style={{
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                  }}
                >
                  {/* Animated Gradient Background */}
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-br ${tool.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                    animate={{
                      backgroundPosition: ["0% 0%", "100% 100%"],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      repeatType: "reverse",
                    }}
                  />

                  {/* Glow orb */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.03] rounded-full blur-3xl group-hover:bg-white/[0.08] transition-all duration-500" />

                  <div className="relative">
                    {/* Icon */}
                    <div className="inline-flex p-4 rounded-2xl bg-white/[0.05] border border-white/[0.1] mb-6 group-hover:scale-110 transition-transform duration-300">
                      <tool.icon className="w-8 h-8 text-white" />
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-white/90 transition-colors">
                      {tool.title}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-400 leading-relaxed mb-6">
                      {tool.description}
                    </p>

                    {/* CTA */}
                    <div className="flex items-center gap-2 text-sm font-medium text-white/60 group-hover:text-white/90 group-hover:gap-3 transition-all">
                      <span>ابدأ الآن</span>
                      <motion.div
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        ←
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>

        {/* Quick Stats Footer */}
        {
          dashboardData && dashboardData.recent_activities.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="
              rounded-3xl p-6
              bg-white/[0.02]
              border border-white/[0.05]
              backdrop-blur-2xl
            "
              style={{
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
              }}
            >
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-bold">آخر نشاطاتك</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {dashboardData.recent_activities.slice(0, 3).map((activity, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.9 + index * 0.1 }}
                    className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05]"
                  >
                    <p className="text-sm text-gray-400 mb-1">
                      {activity.type === 'summary' ? '📄 ملخص' : activity.type === 'conversation' ? '💬 محادثة' : '🎯 امتحان'}
                    </p>
                    <p className="text-white font-medium truncate">{activity.title}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )
        }
      </div >
    </div >
  );
}
