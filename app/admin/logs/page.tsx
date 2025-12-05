"use client";

import { useEffect, useState } from "react";
import { Activity, Calendar, User, AlertCircle, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, FileText, Settings, Trash2 } from "lucide-react";
import { API_BASE_URL } from "@/lib/config";

interface ActivityLog {
  id: number;
  activity_type: string;
  description: string;
  user_name: string | null;
  admin_name: string;
  target_type: string | null;
  target_id: number | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedLog, setExpandedLog] = useState<number | null>(null);

  useEffect(() => {
    fetchLogs();
  }, [page]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/routes/admin/logs/activity.php?page=${page}`,
        { credentials: 'include' }
      );
      const data = await res.json();
      if (data.status === 'success') {
        setLogs(data.data.logs);
        setTotalPages(data.data.pagination.total_pages);
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    if (type.includes('banned')) return <AlertCircle className="w-4 h-4" />;
    if (type.includes('user')) return <User className="w-4 h-4" />;
    if (type.includes('exam')) return <FileText className="w-4 h-4" />;
    if (type.includes('settings')) return <Settings className="w-4 h-4" />;
    if (type.includes('deleted')) return <Trash2 className="w-4 h-4" />;
    return <Activity className="w-4 h-4" />;
  };

  const getActivityColor = (type: string) => {
    if (type.includes('banned')) return 'bg-red-500/20 text-red-400';
    if (type.includes('unbanned')) return 'bg-green-500/20 text-green-400';
    if (type.includes('deleted')) return 'bg-red-500/20 text-red-400';
    if (type.includes('created')) return 'bg-blue-500/20 text-blue-400';
    if (type.includes('updated')) return 'bg-yellow-500/20 text-yellow-400';
    return 'bg-gray-500/20 text-gray-400';
  };

  const getActivityLabel = (type: string) => {
    const labels: Record<string, string> = {
      user_banned: 'حظر مستخدم',
      user_unbanned: 'إلغاء حظر مستخدم',
      user_updated: 'تحديث بيانات مستخدم',
      user_deleted: 'حذف مستخدم',
      exam_created: 'إنشاء امتحان',
      exam_updated: 'تحديث امتحان',
      exam_deleted: 'حذف امتحان',
      settings_updated: 'تحديث الإعدادات'
    };
    return labels[type] || type;
  };

  const toggleExpanded = (id: number) => {
    setExpandedLog(expandedLog === id ? null : id);
  };

  if (loading && logs.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-800 border-t-white"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">سجل النشاطات</h1>
        <p className="text-gray-500">عرض جميع أنشطة الأدمن في المنصة</p>
      </div>

      {logs.length === 0 ? (
        <div className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center">
          <Activity className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">مفيش نشاطات</h2>
          <p className="text-gray-500">لسه مفيش أي نشاطات مسجلة</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {logs.map((log) => (
              <div key={log.id} className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-4 hover:bg-gray-900/70 transition-colors">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${getActivityColor(log.activity_type)}`}>
                    {getActivityIcon(log.activity_type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getActivityColor(log.activity_type)}`}>
                          {getActivityLabel(log.activity_type)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 flex-shrink-0">
                        <Calendar className="w-3 h-3" />
                        {new Date(log.created_at).toLocaleString('ar-EG')}
                      </div>
                    </div>

                    <p className="text-sm text-gray-300 mb-2">
                      <span className="font-medium text-white">{log.admin_name}</span>
                      {' - '}
                      <span className="text-gray-400">{log.description}</span>
                    </p>

                    <button
                      onClick={() => toggleExpanded(log.id)}
                      className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      {expandedLog === log.id ? (
                        <>
                          <ChevronUp className="w-3 h-3" />
                          إخفاء التفاصيل
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-3 h-3" />
                          عرض التفاصيل
                        </>
                      )}
                    </button>

                    {expandedLog === log.id && (
                      <div className="mt-3 pt-3 border-t border-white/10 space-y-2 text-xs">
                        {log.target_type && (
                          <div className="flex gap-2">
                            <span className="text-gray-500">نوع الهدف:</span>
                            <span className="text-gray-300">{log.target_type === 'user' ? 'مستخدم' : log.target_type === 'exam' ? 'امتحان' : log.target_type}</span>
                          </div>
                        )}
                        {log.target_id && (
                          <div className="flex gap-2">
                            <span className="text-gray-500">معرف الهدف:</span>
                            <span className="text-gray-300">{log.target_id}</span>
                          </div>
                        )}
                        {log.ip_address && (
                          <div className="flex gap-2">
                            <span className="text-gray-500">عنوان IP:</span>
                            <span className="text-gray-300 font-mono">{log.ip_address}</span>
                          </div>
                        )}
                        {log.user_agent && (
                          <div className="flex gap-2">
                            <span className="text-gray-500">المتصفح:</span>
                            <span className="text-gray-300 truncate max-w-md">{log.user_agent}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
                className="p-2 bg-gray-900/50 border border-white/10 rounded-lg hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              <span className="px-4 py-2 bg-gray-900/50 border border-white/10 rounded-lg">
                صفحة {page} من {totalPages}
              </span>

              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || loading}
                className="p-2 bg-gray-900/50 border border-white/10 rounded-lg hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
