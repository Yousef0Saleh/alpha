"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/config";
import {
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  BarChart,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

interface Exam {
  id: number;
  title: string;
  duration: number;
  grade: string;
  created_at: string;
  questions_count: number;
  students_count: number;
  completed_count: number;
}

export default function AdminExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [gradeFilter, setGradeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchExams();
  }, [gradeFilter, page]);

  const fetchExams = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        ...(gradeFilter && { grade: gradeFilter })
      });

      const res = await fetch(
        `${API_BASE_URL}/routes/admin/exams/list.php?${params}`,
        { credentials: 'include' }
      );
      const data = await res.json();

      if (data.status === 'success') {
        setExams(data.data.exams);
        setTotalPages(data.data.pagination.total_pages);
      }
    } catch (error) {
      console.error('Failed to fetch exams:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (examId: number, examTitle: string) => {
    if (!confirm(`متأكد إنك عايز تمسح امتحان "${examTitle}"؟`)) return;

    try {
      const res = await fetch(`${API_BASE_URL}/routes/admin/exams/delete.php`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exam_id: examId })
      });

      const data = await res.json();
      if (data.status === 'success') {
        alert('تم حذف الامتحان بنجاح');
        fetchExams();
      } else {
        alert(data.message || 'فشل الحذف');
      }
    } catch (error) {
      alert('حصل خطأ في الحذف');
    }
  };

  const getGradeLabel = (grade: string) => {
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
          <h1 className="text-3xl font-bold mb-2">إدارة الامتحانات</h1>
          <p className="text-gray-500">عرض وإدارة جميع الامتحانات</p>
        </div>
        <Link
          href="/admin/exams/new"
          className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-xl transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>إنشاء امتحان جديد</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

      {/* Exams Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-800 border-t-white"></div>
        </div>
      ) : exams.length === 0 ? (
        <div className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center">
          <p className="text-gray-500">مفيش امتحانات</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map((exam) => (
            <div
              key={exam.id}
              className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold mb-2">{exam.title}</h3>
                  <span className="px-3 py-1 bg-indigo-500/20 text-indigo-400 rounded-full text-xs">
                    {getGradeLabel(exam.grade)}
                  </span>
                </div>
              </div>

              <div className="space-y-2 mb-4 text-sm text-gray-400">
                <div className="flex items-center justify-between">
                  <span>المدة</span>
                  <span className="text-white">{exam.duration} دقيقة</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>الأسئلة</span>
                  <span className="text-white">{exam.questions_count} سؤال</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>الطلاب</span>
                  <span className="text-white">{exam.students_count} طالب</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>المكتمل</span>
                  <span className="text-white">{exam.completed_count} امتحان</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={`/admin/exams/${exam.id}/statistics`}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-lg transition-colors text-sm"
                >
                  <BarChart className="w-4 h-4" />
                  إحصائيات
                </Link>
                <Link
                  href={`/admin/exams/${exam.id}/edit`}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-colors text-sm"
                >
                  <Edit className="w-4 h-4" />
                  تعديل
                </Link>
                <button
                  onClick={() => handleDelete(exam.id, exam.title)}
                  className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

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
