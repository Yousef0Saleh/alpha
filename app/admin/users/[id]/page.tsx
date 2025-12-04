"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { API_BASE_URL, API_ROUTES, SITE_URL } from "@/lib/config";
import {
  ArrowLeft,
  Mail,
  Calendar,
  Shield,
  MessageSquare,
  FileText,
  FileSpreadsheet,
  Wand2,
  Ban,
  Trash2
} from "lucide-react";

interface UserDetails {
  user: {
    id: number;
    name: string;
    email: string;
    grade: string | null;
    role: string;
    is_banned: boolean;
    created_at: string;
    last_activity: string | null;
  };
  stats: {
    chat: {
      conversations_count: number;
      messages_count: number;
    };
    exams: {
      total_attempts: number;
      completed_exams: number;
    };
    summaries: {
      summaries_count: number;
    };
    generator: {
      generated_exams_count: number;
    };
  };
}

export default function UserDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [data, setData] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserDetails();
  }, [userId]);

  const fetchUserDetails = async () => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/routes/admin/users/details.php?id=${userId}`,
        { credentials: 'include' }
      );
      const result = await res.json();

      if (result.status === 'success') {
        setData(result.data);
      } else {
        alert(result.message);
        router.push('/admin/users');
      }
    } catch (error) {
      console.error('Failed to fetch user details:', error);
      alert('فشل تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleBan = async (shouldBan: boolean) => {
    if (!data) return;

    const action = shouldBan ? 'حظر' : 'إلغاء حظر';
    if (!confirm(`متأكد إنك عايز ${action} المستخدم "${data.user.name}"؟`)) return;

    try {
      const res = await fetch('${API_BASE_URL}/routes/admin/users/ban.php', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: data.user.id,
          is_banned: shouldBan
        })
      });

      const result = await res.json();
      if (result.status === 'success') {
        alert(result.message);
        fetchUserDetails();
      } else {
        alert(result.message);
      }
    } catch (error) {
      alert('فشل العملية');
    }
  };

  const handleDelete = async () => {
    if (!data) return;

    if (!confirm(`⚠️ متأكد إنك عايز تمسح المستخدم "${data.user.name}"؟\nالعملية دي مش ممكن الرجوع فيها!`)) return;

    try {
      const res = await fetch('${API_BASE_URL}/routes/admin/users/delete.php', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: data.user.id })
      });

      const result = await res.json();
      if (result.status === 'success') {
        alert(result.message);
        router.push('/admin/users');
      } else {
        alert(result.message);
      }
    } catch (error) {
      alert('فشل الحذف');
    }
  };

  const getGradeLabel = (grade: string | null) => {
    if (!grade) return '-';
    const labels: Record<string, string> = {
      first: 'أولى ثانوي',
      second: 'تانية ثانوي',
      third: 'تالتة ثانوي'
    };
    return labels[grade] || grade;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-800 border-t-white"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center text-gray-500 py-12">
        المستخدم مش موجود
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/users"
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold mb-2">{data.user.name}</h1>
            <p className="text-gray-500">تفاصيل المستخدم</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {data.user.role !== 'admin' && (
            <>
              {data.user.is_banned ? (
                <button
                  onClick={() => handleBan(false)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-xl transition-colors"
                >
                  <Shield className="w-4 h-4" />
                  إلغاء الحظر
                </button>
              ) : (
                <button
                  onClick={() => handleBan(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-xl transition-colors"
                >
                  <Ban className="w-4 h-4" />
                  حظر
                </button>
              )}

              <button
                onClick={handleDelete}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                حذف
              </button>
            </>
          )}
        </div>
      </div>

      {/* User Info */}
      <div className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <h2 className="text-xl font-bold mb-4">المعلومات الأساسية</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 mb-1">البريد الإلكتروني</p>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-400" />
              <p className="font-medium">{data.user.email}</p>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-1">الصف الدراسي</p>
            <p className="font-medium">{getGradeLabel(data.user.grade)}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-1">الدور</p>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${data.user.role === 'admin'
              ? 'bg-purple-500/20 text-purple-400'
              : 'bg-blue-500/20 text-blue-400'
              }`}>
              {data.user.role === 'admin' ? 'أدمن' : 'طالب'}
            </span>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-1">الحالة</p>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${data.user.is_banned
              ? 'bg-red-500/20 text-red-400'
              : 'bg-green-500/20 text-green-400'
              }`}>
              {data.user.is_banned ? 'محظور' : 'نشط'}
            </span>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-1">تاريخ التسجيل</p>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <p className="font-medium">
                {new Date(data.user.created_at).toLocaleDateString('ar-EG')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-green-400" />
            </div>
            <h3 className="font-bold">المحادثات</h3>
          </div>
          <p className="text-2xl font-bold mb-1">{data.stats.chat.conversations_count}</p>
          <p className="text-sm text-gray-500">{data.stats.chat.messages_count} رسالة</p>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <FileText className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="font-bold">الامتحانات</h3>
          </div>
          <p className="text-2xl font-bold mb-1">{data.stats.exams.total_attempts}</p>
          <p className="text-sm text-gray-500">{data.stats.exams.completed_exams} مكتمل</p>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5 text-orange-400" />
            </div>
            <h3 className="font-bold">الملخصات</h3>
          </div>
          <p className="text-2xl font-bold">{data.stats.summaries.summaries_count}</p>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Wand2 className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="font-bold">مولد الامتحانات</h3>
          </div>
          <p className="text-2xl font-bold">{data.stats.generator.generated_exams_count}</p>
        </div>
      </div>
    </div>
  );
}
