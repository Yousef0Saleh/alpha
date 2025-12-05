"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/config";
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
  Trash2,
  Edit,
  UserCog,
  X
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
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    grade: '',
    role: ''
  });
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [adminCount, setAdminCount] = useState<number>(0);

  useEffect(() => {
    fetchUserDetails();
    fetchCurrentUser();
    fetchAdminCount();
  }, [userId]);

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/routes/auth/check.php`, {
        credentials: 'include'
      });
      const result = await res.json();
      if (result.loggedIn && result.user) {
        setCurrentUserId(result.user.id);
      }
    } catch (error) {
      console.error('Failed to fetch current user:', error);
    }
  };

  const fetchAdminCount = async () => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/routes/admin/users/count_admins.php`,
        { credentials: 'include' }
      );
      const result = await res.json();
      if (result.status === 'success') {
        setAdminCount(result.data.admin_count);
      }
    } catch (error) {
      console.error('Failed to fetch admin count:', error);
    }
  };

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
      const res = await fetch(`${API_BASE_URL}/routes/admin/users/ban.php`, {
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
      const res = await fetch(`${API_BASE_URL}/routes/admin/users/delete.php`, {
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

  const openEditModal = () => {
    if (!data) return;
    setEditForm({
      name: data.user.name,
      grade: data.user.grade || '',
      role: data.user.role
    });
    setShowEditModal(true);
  };

  const handlePromoteToAdmin = async () => {
    if (!data) return;

    if (!confirm(`متأكد إنك عايز ترقي "${data.user.name}" لأدمن؟\n\nده هيديه صلاحيات كاملة على النظام!`)) return;

    try {
      const res = await fetch(`${API_BASE_URL}/routes/admin/users/update.php`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: data.user.id,
          name: data.user.name,
          grade: data.user.grade,
          role: 'admin'
        })
      });

      const result = await res.json();
      if (result.status === 'success') {
        alert('✅ ' + result.message);
        fetchUserDetails();
        fetchAdminCount();
      } else {
        alert('❌ ' + result.message);
      }
    } catch (error) {
      alert('فشل الترقية');
    }
  };

  const handleUpdate = async () => {
    if (!data) return;

    // Validation
    if (!editForm.name.trim()) {
      alert('من فضلك اكتب الاسم');
      return;
    }

    // Safety checks for admin demotion
    const isDemotingAdmin = data.user.role === 'admin' && editForm.role === 'student';
    const isSelf = currentUserId === data.user.id;

    if (isDemotingAdmin) {
      // Prevent self-demotion
      if (isSelf) {
        alert('⚠️ مينفعش تحول نفسك من أدمن لطالب!\n\nلو عايز تعمل كده، اطلب من أدمن تاني.');
        return;
      }

      // Check admin count
      if (adminCount <= 1) {
        alert('⚠️ لا يمكن تحويل آخر أدمن في النظام!\n\nلازم يكون فيه على الأقل أدمن واحد.');
        return;
      }

      // Strong warning for last 2 admins
      if (adminCount === 2) {
        if (!confirm(
          `⚠️ تحذير مهم!\n\n` +
          `أنت على وشك تحويل "${data.user.name}" من أدمن لطالب.\n` +
          `لو كملت، هيبقى فيه أدمن واحد بس في النظام (أنت).\n\n` +
          `متأكد من القرار ده؟`
        )) {
          return;
        }
      } else {
        // Normal demotion warning
        if (!confirm(
          `⚠️ متأكد إنك عايز تحول "${data.user.name}" من أدمن لطالب؟\n\n` +
          `ده هيخليه يفقد جميع صلاحيات الأدمن!`
        )) {
          return;
        }
      }
    }

    // Confirm role change to admin
    if (data.user.role === 'student' && editForm.role === 'admin') {
      if (!confirm(`متأكد إنك عايز ترقي "${editForm.name}" لأدمن؟\n\nده هيديه صلاحيات كاملة على النظام!`)) {
        return;
      }
    }

    try {
      const res = await fetch(`${API_BASE_URL}/routes/admin/users/update.php`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: data.user.id,
          name: editForm.name.trim(),
          grade: editForm.grade || null,
          role: editForm.role
        })
      });

      const result = await res.json();
      if (result.status === 'success') {
        alert('✅ ' + result.message);
        setShowEditModal(false);
        fetchUserDetails();
        fetchAdminCount();
      } else {
        alert('❌ ' + result.message);
      }
    } catch (error) {
      alert('فشل التحديث');
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
          {/* Edit Button - for all users */}
          <button
            onClick={openEditModal}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 rounded-xl transition-colors"
          >
            <Edit className="w-4 h-4" />
            تعديل البيانات
          </button>

          {/* Promote to Admin - only for students */}
          {data.user.role === 'student' && (
            <button
              onClick={handlePromoteToAdmin}
              className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-xl transition-colors"
            >
              <UserCog className="w-4 h-4" />
              ترقية لأدمن
            </button>
          )}

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

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">تعديل بيانات المستخدم</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Name Field */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  الاسم
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  placeholder="اكتب الاسم"
                />
              </div>

              {/* Grade Field */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  الصف الدراسي
                </label>
                <select
                  value={editForm.grade}
                  onChange={(e) => setEditForm({ ...editForm, grade: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                >
                  <option value="">اختر الصف</option>
                  <option value="first">أولى ثانوي</option>
                  <option value="second">تانية ثانوي</option>
                  <option value="third">تالتة ثانوي</option>
                </select>
              </div>

              {/* Role Field */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  الدور
                </label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                >
                  <option value="student">طالب</option>
                  <option
                    value="admin"
                    disabled={currentUserId === data?.user.id && editForm.role === 'admin'}
                  >
                    أدمن {currentUserId === data?.user.id && editForm.role === 'admin' ? '(مينفعش تحول نفسك)' : ''}
                  </option>
                </select>
                {data?.user.role === 'admin' && editForm.role === 'student' && currentUserId !== data?.user.id && (
                  <p className="text-sm text-orange-400 mt-2">
                    ⚠️ تحويل أدمن لطالب هيخليه يفقد كل صلاحياته
                  </p>
                )}
                {currentUserId === data?.user.id && data?.user.role === 'admin' && (
                  <p className="text-sm text-gray-500 mt-2">
                    💡 لو عايز تحول نفسك لطالب، اطلب من أدمن تاني
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleUpdate}
                  className="flex-1 px-4 py-3 bg-indigo-500 hover:bg-indigo-600 rounded-xl font-medium transition-colors"
                >
                  حفظ التعديلات
                </button>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-medium transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
