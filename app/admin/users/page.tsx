"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/config";
import {
  Search,
  Eye,
  Ban,
  Trash2,
  Shield,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

interface User {
  id: number;
  name: string;
  email: string;
  grade: string | null;
  role: string;
  is_banned: boolean;
  created_at: string;
  last_activity: string | null;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter, gradeFilter, page]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        ...(search && { search }),
        ...(roleFilter && { role: roleFilter }),
        ...(gradeFilter && { grade: gradeFilter })
      });

      const res = await fetch(
        `${API_BASE_URL}/routes/admin/users/list.php?${params}`,
        { credentials: 'include' }
      );
      const data = await res.json();

      if (data.status === 'success') {
        setUsers(data.data.users);
        setTotalPages(data.data.pagination.total_pages);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">إدارة المستخدمين</h1>
          <p className="text-gray-500">عرض وإدارة جميع مستخدمي المنصة</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="بحث بالاسم أو البريد..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pr-10 pl-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          >
            <option value="">كل الأدوار</option>
            <option value="student">طالب</option>
            <option value="admin">أدمن</option>
          </select>

          {/* Grade Filter */}
          <select
            value={gradeFilter}
            onChange={(e) => {
              setGradeFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          >
            <option value="">كل الصفوف</option>
            <option value="first">أولى ثانوي</option>
            <option value="second">تانية ثانوي</option>
            <option value="third">تالتة ثانوي</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-800 border-t-white"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            مفيش مستخدمين
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-400">ID</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-400">الاسم</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-400">البريد</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-400">الصف</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-400">الدور</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-400">الحالة</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-400">تاريخ التسجيل</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-400">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 text-sm">{user.id}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium">{user.name}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">{user.email}</td>
                    <td className="px-6 py-4 text-sm">{getGradeLabel(user.grade)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${user.role === 'admin'
                        ? 'bg-purple-500/20 text-purple-400'
                        : 'bg-blue-500/20 text-blue-400'
                        }`}>
                        {user.role === 'admin' ? 'أدمن' : 'طالب'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${user.is_banned
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-green-500/20 text-green-400'
                        }`}>
                        {user.is_banned ? 'محظور' : 'نشط'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {new Date(user.created_at).toLocaleDateString('ar-EG')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/users/${user.id}`}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                          title="عرض التفاصيل"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 bg-gray-900/50 border border-white/10 rounded-lg hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <span className="px-4 py-2 bg-gray-900/50 border border-white/10 rounded-lg">
            صفحة {page} من {totalPages}
          </span>

          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 bg-gray-900/50 border border-white/10 rounded-lg hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
