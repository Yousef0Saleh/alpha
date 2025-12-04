"use client";

import { useEffect, useState } from "react";
import { MessageSquare, TrendingUp, Users, BarChart, Clock, User } from "lucide-react";
import { API_BASE_URL, API_ROUTES, SITE_URL } from "@/lib/config";

interface ChatStats {
  total_conversations: number;
  total_messages: number;
  active_users: number;
  today_conversations: number;
  today_messages: number;
  recent_conversations: Array<{
    id: number;
    title: string;
    created_at: string;
    user_name: string;
    user_email: string;
    message_count: number;
  }>;
}

export default function AdminChatPage() {
  const [stats, setStats] = useState<ChatStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/routes/admin/chat/statistics.php`,
        { credentials: 'include' }
      );
      const data = await res.json();
      if (data.status === 'success') {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch chat stats:', error);
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
        <h1 className="text-3xl font-bold mb-2">إدارة المحادثات</h1>
        <p className="text-gray-500">عرض وإدارة جميع محادثات المستخدمين</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-green-400" />
            </div>
            <h3 className="font-bold">إجمالي المحادثات</h3>
          </div>
          <p className="text-3xl font-bold">{stats?.total_conversations || 0}</p>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <BarChart className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="font-bold">إجمالي الرسائل</h3>
          </div>
          <p className="text-3xl font-bold">{stats?.total_messages || 0}</p>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="font-bold">مستخدمين نشطين</h3>
          </div>
          <p className="text-3xl font-bold">{stats?.active_users || 0}</p>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-orange-400" />
            </div>
            <h3 className="font-bold">محادثات اليوم</h3>
          </div>
          <p className="text-3xl font-bold">{stats?.today_conversations || 0}</p>
          <p className="text-sm text-gray-500">{stats?.today_messages || 0} رسالة</p>
        </div>
      </div>

      {/* Recent Conversations */}
      <div className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          آخر المحادثات
        </h2>
        <div className="space-y-3">
          {stats?.recent_conversations && stats.recent_conversations.length > 0 ? (
            stats.recent_conversations.map((conv) => (
              <div key={conv.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">{conv.title || 'محادثة جديدة'}</h3>
                    <p className="text-sm text-gray-400">
                      {conv.user_name} • {conv.user_email}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
                    <MessageSquare className="w-4 h-4" />
                    {conv.message_count} رسالة
                  </div>
                  <p className="text-xs text-gray-500">
                    {new Date(conv.created_at).toLocaleString('ar-EG')}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-8">
              مفيش محادثات
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
