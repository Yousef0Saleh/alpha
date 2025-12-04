"use client";

import { useEffect, useState } from "react";
import { Wand2, TrendingUp, Users, Calendar, FileQuestion, User, Clock } from "lucide-react";
import { API_BASE_URL, API_ROUTES, SITE_URL } from "@/lib/config";

interface GeneratorStats {
  total_generated: number;
  today_generated: number;
  week_generated: number;
  active_users: number;
  recent_generated: Array<{
    id: number;
    filename: string;
    created_at: string;
    user_name: string;
    user_email: string;
  }>;
}

export default function AdminExamGeneratorPage() {
  const [stats, setStats] = useState<GeneratorStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch(
        '${API_BASE_URL}/routes/admin/generator/statistics.php',
        { credentials: 'include' }
      );
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">إدارة مولد الامتحانات</h1>
        <p className="text-gray-500">عرض إحصائيات استخدام مولد الامتحانات</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Wand2 className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="font-bold">إجمالي الامتحانات</h3>
          </div>
          <p className="text-3xl font-bold">{stats?.total_generated || 0}</p>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="font-bold">اليوم</h3>
          </div>
          <p className="text-3xl font-bold">{stats?.today_generated || 0}</p>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-green-400" />
            </div>
            <h3 className="font-bold">هذا الأسبوع</h3>
          </div>
          <p className="text-3xl font-bold">{stats?.week_generated || 0}</p>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-orange-400" />
            </div>
            <h3 className="font-bold">مستخدمين نشطين</h3>
          </div>
          <p className="text-3xl font-bold">{stats?.active_users || 0}</p>
        </div>
      </div>

      {/* Recent Generated Exams */}
      <div className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          آخر الامتحانات المولدة
        </h2>
        <div className="space-y-3">
          {stats?.recent_generated && stats.recent_generated.length > 0 ? (
            stats.recent_generated.map((exam) => (
              <div key={exam.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <FileQuestion className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">{exam.filename}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <User className="w-3 h-3" />
                      {exam.user_name}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">
                    {new Date(exam.created_at).toLocaleString('ar-EG')}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-8">
              مفيش امتحانات مولدة
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
