"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BarChart3, Users, Target, TrendingDown } from "lucide-react";
import { API_BASE_URL, API_ROUTES, SITE_URL } from "@/lib/config";

interface ExamStats {
  exam: {
    id: number;
    title: string;
    duration: number;
    grade: string;
    questions_count: number;
  };
  general: {
    total_students: number;
    total_attempts: number;
    completed_count: number;
    in_progress_count: number;
  };
  scores: {
    average: number;
    max: number;
    min: number;
    total_questions: number;
    completion_rate: number;
  };
  hardest_questions: Array<{
    question_num: number;
    question_text: string;
    success_rate: number;
  }>;
  recent_scores: Array<{
    student_name: string;
    score: number;
    submitted_at: string;
  }>;
}

export default function ExamStatisticsPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params.id as string;

  const [stats, setStats] = useState<ExamStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [examId]);

  const fetchStats = async () => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/routes/admin/exams/statistics.php?id=${examId}`,
        { credentials: 'include' }
      );
      const data = await res.json();

      if (data.status === 'success') {
        setStats(data.data);
      } else {
        alert(data.message);
        router.push('/admin/exams');
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
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
        الامتحان مش موجود
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/exams"
          className="p-2 hover:bg-white/5 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold mb-2">{stats.exam.title}</h1>
          <p className="text-gray-500">
            {getGradeLabel(stats.exam.grade)} • {stats.exam.questions_count} سؤال • {stats.exam.duration} دقيقة
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="font-bold">الطلاب</h3>
          </div>
          <p className="text-3xl font-bold">{stats.general.total_students}</p>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-green-400" />
            </div>
            <h3 className="font-bold">متوسط الدرجات</h3>
          </div>
          <p className="text-3xl font-bold">{stats.scores.average}</p>
          <p className="text-sm text-gray-500">من {stats.scores.total_questions}</p>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <Target className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="font-bold">نسبة الإكمال</h3>
          </div>
          <p className="text-3xl font-bold">{stats.scores.completion_rate}%</p>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-orange-400" />
            </div>
            <h3 className="font-bold">النطاق</h3>
          </div>
          <p className="text-2xl font-bold">{stats.scores.min} - {stats.scores.max}</p>
        </div>
      </div>

      {/* Hardest Questions */}
      {stats.hardest_questions.length > 0 && (
        <div className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-4">الأسئلة الأصعب</h2>
          <div className="space-y-3">
            {stats.hardest_questions.map((q) => (
              <div key={q.question_num} className="p-4 bg-white/5 rounded-xl">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-medium mb-1">السؤال {q.question_num}</p>
                    <p className="text-sm text-gray-400">{q.question_text}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{q.success_rate}%</p>
                    <p className="text-xs text-gray-500">نسبة النجاح</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Scores */}
      {stats.recent_scores.length > 0 && (
        <div className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-4">آخر النتائج</h2>
          <div className="space-y-2">
            {stats.recent_scores.map((score, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                <div>
                  <p className="font-medium">{score.student_name}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(score.submitted_at).toLocaleString('ar-EG')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold">{score.score}/{stats.scores.total_questions}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
