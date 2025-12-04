"use client";

import { motion } from "framer-motion";
import { FileText, MessageSquare, Wand2, Clock } from "lucide-react";

interface Activity {
  type: string;
  title: string;
  date: string;
}

interface RecentActivityProps {
  activities: Activity[];
}

const activityConfig: Record<string, { icon: any; label: string; color: string }> = {
  summary: {
    icon: FileText,
    label: "ملخص جديد",
    color: "text-blue-400"
  },
  generated_exam: {
    icon: Wand2,
    label: "امتحان مولّد",
    color: "text-purple-400"
  },
  conversation: {
    icon: MessageSquare,
    label: "محادثة",
    color: "text-green-400"
  }
};

function getRelativeTime(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / 60000);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 1) return "الآن";
  if (diffInMinutes < 60) return `منذ ${diffInMinutes} دقيقة`;
  if (diffInHours < 24) return `منذ ${diffInHours} ساعة`;
  if (diffInDays < 7) return `منذ ${diffInDays} يوم`;

  return date.toLocaleDateString('ar-EG', {
    month: 'short',
    day: 'numeric'
  });
}

export default function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <div>
      {activities.length > 0 ? (
        <div className="space-y-3">
          {activities.map((activity, index) => {
            const config = activityConfig[activity.type] || activityConfig.summary;
            const Icon = config.icon;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors"
              >
                <div className={`p-2 rounded-lg bg-white/5 ${config.color} flex-shrink-0`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-400 mb-1">{config.label}</p>
                  <p className="text-white font-medium truncate">{activity.title}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {getRelativeTime(activity.date)}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-gray-600" />
          </div>
          <p className="text-gray-500">لا توجد نشاطات حتى الآن</p>
          <p className="text-sm text-gray-600 mt-2">
            ابدأ باستخدام الأدوات لتظهر نشاطاتك هنا
          </p>
        </div>
      )}
    </div>
  );
}
