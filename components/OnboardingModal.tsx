"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, ArrowLeft, Sparkles, Trophy, MessageSquare, Rocket } from "lucide-react";
import confetti from "canvas-confetti";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
}

const steps = [
  {
    icon: Sparkles,
    title: "مرحباً بك في ألفا! 🎉",
    description: "منصتك الذكية للتفوق الدراسي بمساعدة الذكاء الاصطناعي",
    color: "from-blue-500 to-cyan-500",
    bgGlow: "bg-blue-500/10",
  },
  {
    icon: Rocket,
    title: "أدوات قوية في متناول يدك",
    description: "ملخص الملفات، المساعد الذكي، مولد الامتحانات، وبنك الامتحانات - كل ما تحتاجه للنجاح",
    color: "from-purple-500 to-pink-500",
    bgGlow: "bg-purple-500/10",
  },
  {
    icon: Trophy,
    title: "تتبع تقدمك بسهولة",
    description: "شاهد إحصائياتك، متوسط درجاتك، وامتحاناتك المكتملة في لوحة تحكم واحدة",
    color: "from-amber-500 to-orange-500",
    bgGlow: "bg-amber-500/10",
  },
  {
    icon: MessageSquare,
    title: "جاهز للبدء؟ 🚀",
    description: "ابدأ الآن واستكشف كل الأدوات المتاحة لك. نتمنى لك رحلة تعليمية موفقة!",
    color: "from-emerald-500 to-green-500",
    bgGlow: "bg-emerald-500/10",
  },
];

export default function OnboardingModal({ isOpen, onClose, userName }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Confetti on completion!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      setTimeout(onClose, 500);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  const currentStepData = steps[currentStep];
  const Icon = currentStepData.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={handleSkip}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", duration: 0.5 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl"
          >
            {/* Main Card */}
            <div
              className={`
                relative overflow-hidden rounded-3xl p-8 md:p-12
                bg-gray-900/95
                border border-white/10
                backdrop-blur-2xl
                ${currentStepData.bgGlow}
              `}
              style={{
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
              }}
            >
              {/* Close button */}
              <button
                onClick={handleSkip}
                className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>

              {/* Background glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/[0.03] rounded-full blur-3xl" />

              {/* Content */}
              <div className="relative">
                {/* Icon */}
                <motion.div
                  key={currentStep}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", duration: 0.6 }}
                  className={`inline-flex p-6 rounded-3xl bg-gradient-to-br ${currentStepData.color} mb-6`}
                >
                  <Icon className="w-12 h-12 text-white" />
                </motion.div>

                {/* Step indicator */}
                <div className="flex items-center gap-2 mb-4">
                  {steps.map((_, index) => (
                    <div
                      key={index}
                      className={`h-1 rounded-full transition-all duration-300 ${index === currentStep
                          ? 'w-8 bg-white'
                          : index < currentStep
                            ? 'w-4 bg-white/50'
                            : 'w-4 bg-white/20'
                        }`}
                    />
                  ))}
                </div>

                {/* Title */}
                <AnimatePresence mode="wait">
                  <motion.h2
                    key={`title-${currentStep}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="text-3xl md:text-4xl font-bold text-white mb-4"
                  >
                    {currentStep === 0 ? `${currentStepData.title.split('!')[0]} ${userName}! 🎉` : currentStepData.title}
                  </motion.h2>
                </AnimatePresence>

                {/* Description */}
                <AnimatePresence mode="wait">
                  <motion.p
                    key={`desc-${currentStep}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="text-gray-300 text-lg leading-relaxed mb-8"
                  >
                    {currentStepData.description}
                  </motion.p>
                </AnimatePresence>

                {/* Navigation */}
                <div className="flex items-center justify-between gap-4">
                  {/* Previous button */}
                  {currentStep > 0 ? (
                    <button
                      onClick={handlePrev}
                      className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white transition-all"
                    >
                      <ArrowRight className="w-5 h-5 rotate-180" />
                      <span>السابق</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleSkip}
                      className="px-6 py-3 text-gray-400 hover:text-white transition-colors"
                    >
                      تخطي
                    </button>
                  )}

                  {/* Next/Finish button */}
                  <button
                    onClick={handleNext}
                    className={`
                      flex items-center gap-2 px-8 py-3 rounded-2xl
                      bg-gradient-to-r ${currentStepData.color}
                      text-white font-bold
                      hover:scale-105 active:scale-95
                      transition-all duration-200
                      shadow-lg shadow-${currentStepData.color}/50
                    `}
                  >
                    <span>{currentStep === steps.length - 1 ? 'ابدأ الآن' : 'التالي'}</span>
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
