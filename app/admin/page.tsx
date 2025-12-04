"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { API_BASE_URL, API_ROUTES, SITE_URL } from "@/lib/config";
import {
  Users,
  FileText,
  MessageSquare,
  FileSpreadsheet,
  TrendingUp,
  Clock,
  Plus,
  ArrowRight,
  Activity,
  UserPlus
} from "lucide-react";

interface DashboardStats {
  users: {
    total_users: number;
    admin_count: number;
    student_count: number;
    banned_count: number;
    new_today: number;
    new_this_week: number;
  };
  exams: {
    total_exams: number;
    total_attempts: number;
    completed_attempts: number;
    in_progress_attempts: number;
  };
  chat: {
    total_conversations: number;
    total_messages: number;
    user_messages: number;
    assistant_messages: number;
    conversations_today: number;
    messages_today: number;
  };
  summaries: {
    total_summaries: number;
    summaries_today: number;
    summaries_this_week: number;
  };
  generator: {
    total_generated: number;
    generated_today: number;
    generated_this_week: number;
  };
  recent_users: any[];
  recent_activities: any[];
  users_by_grade: any[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/routes/admin/dashboard.php`, {
        credentials: 'include'
      });
      const data = await res.json();
      if (data.status === 'success') {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-800 border-t-white"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center text-gray-500 py-12">
        فشل تحميل البيانات
      </div>
    );
  }

  const completionRate = stats.exams.total_attempts > 0
    ? Math.round((stats.exams.completed_attempts / stats.exams.total_attempts) * 100)
    : 0;

  const statCards = [
    {
      title: 'المستخدمين',
      value: stats.users.total_users,
      subtitle: `${stats.users.student_count} طالب • ${stats.users.admin_count} أدمن`,
      change: `+${stats.users.new_today} اليوم`,
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
      details: [
        { label: 'جديد هذا الأسبوع', value: stats.users.new_this_week },
        { label: 'محظورين', value: stats.users.banned_count }
      ]
    },
    {
      title: 'الامتحانات',
      value: stats.exams.total_exams,
      subtitle: `${stats.exams.total_attempts} محاولة إجمالية`,
      change: `${completionRate}% نسبة الإكمال`,
      icon: FileText,
      color: 'from-purple-500 to-pink-500',
      details: [
        { label: 'مكتملة', value: stats.exams.completed_attempts },
        { label: 'قيد التنفيذ', value: stats.exams.in_progress_attempts }
      ]
    },
    {
      title: 'المحادثات',
      value: stats.chat.total_conversations,
      subtitle: `${stats.chat.total_messages} رسالة`,
      change: `+${stats.chat.conversations_today} اليوم`,
      icon: MessageSquare,
      color: 'from-green-500 to-emerald-500',
      details: [
        { label: 'رسائل المستخدمين', value: stats.chat.user_messages },
        { label: 'رسائل الذكاء الاصطناعي', value: stats.chat.assistant_messages }
      ]
    },
    {
      title: 'الملخصات',
      value: stats.summaries.total_summaries,
      subtitle: 'ملخصات تم إنشاؤها',
      change: `+${stats.summaries.summaries_today} اليوم`,
      icon: FileSpreadsheet,
      color: 'from-orange-500 to-red-500',
      details: [
        { label: 'هذا الأسبوع', value: stats.summaries.summaries_this_week },
        { label: 'مولد الامتحانات', value: stats.generator.total_generated }
      ]
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">لوحة التحكم</h1>
          <p className="text-gray-500">مرحباً بك في لوحة التحكم الخاصة بمنصة ألفا</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/exams/new"
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors"
          >
            <Plus className="w-5 h-5" />
            امتحان جديد
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <div
            key={index}
            className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-lg`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-white/5 text-gray-400">
                {card.change}
                <TrendingUp className="w-3 h-3" />
              </div>
            </div>

            <h3 className="text-gray-400 text-sm mb-1">{card.title}</h3>
            <p className="text-3xl font-bold mb-1">{card.value}</p>
            <p className="text-xs text-gray-500 mb-4">{card.subtitle}</p>

            <div className="pt-4 border-t border-white/5 space-y-2">
              {card.details.map((detail, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">{detail.label}</span>
                  <span className="font-medium">{detail.value}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/admin/users" className="group p-4 bg-gray-900/50 border border-white/10 rounded-2xl hover:bg-white/5 transition-all flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="font-bold">إدارة المستخدمين</h3>
              <p className="text-xs text-gray-500">عرض وتعديل المستخدمين</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
        </Link>

        <Link href="/admin/exams" className="group p-4 bg-gray-900/50 border border-white/10 rounded-2xl hover:bg-white/5 transition-all flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
              <FileText className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="font-bold">إدارة الامتحانات</h3>
              <p className="text-xs text-gray-500">إنشاء وتعديل الامتحانات</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
        </Link>

        <Link href="/admin/logs" className="group p-4 bg-gray-900/50 border border-white/10 rounded-2xl hover:bg-white/5 transition-all flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
              <Activity className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h3 className="font-bold">سجل النشاطات</h3>
              <p className="text-xs text-gray-500">متابعة الأنشطة</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
        </Link>
      </div>

      {/* Recent Users & Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-blue-400" />
              آخر المستخدمين
            </h2>
            <Link href="/admin/users" className="text-sm text-blue-400 hover:text-blue-300">عرض الكل</Link>
          </div>
          <div className="space-y-3">
            {stats.recent_users.slice(0, 5).map((user: any) => (
              <div key={user.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${user.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
                    }`}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">
                    {new Date(user.created_at).toLocaleDateString('ar-EG')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-400" />
              آخر النشاطات
            </h2>
            <Link href="/admin/logs" className="text-sm text-orange-400 hover:text-orange-300">عرض الكل</Link>
          </div>
          <div className="space-y-4">
            {stats.recent_activities.length > 0 ? (
              stats.recent_activities.slice(0, 5).map((activity: any, index: number) => (
                <div key={index} className="flex gap-3 relative pl-4 border-l border-white/10 last:border-0">
                  <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-gray-700 border-2 border-gray-900"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-300">{activity.description || 'نشاط غير معروف'}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-gray-400">
                        {activity.admin_name || 'النظام'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(activity.created_at).toLocaleString('ar-EG')}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-8">
                مفيش نشاطات مسجلة
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Users by Grade */}
      <div className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <h2 className="text-xl font-bold mb-4">توزيع الطلاب حسب الصف الدراسي</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.users_by_grade.map((grade: any) => (
            <div key={grade.grade} className="p-4 bg-white/5 rounded-xl flex items-center justify-between group hover:bg-white/10 transition-colors">
              <div>
                <p className="text-sm text-gray-500 mb-1">
                  {grade.grade === 'first' ? 'أولى ثانوي' :
                    grade.grade === 'second' ? 'تانية ثانوي' : 'تالتة ثانوي'}
                </p>
                <p className="text-2xl font-bold">{grade.count}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
