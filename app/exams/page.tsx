"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/hooks/useAuth";
import LoaderOverlay from "@/components/LoaderOverlay";
import Toast from "@/components/Toast";
import { API_BASE_URL } from "@/lib/config";

interface Exam {
  id: number;
  title: string;
  duration: number;
  questions_count: number;
  exam_status: "not_started" | "in_progress" | "completed";
  score?: number;
  total_questions?: number;
}

export default function ExamsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [exams, setExams] = useState<Exam[]>([]);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/signin");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;

    const fetchExams = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${API_BASE_URL}/routes/get_exams.php`,
          { credentials: "include" }
        );

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();

        if (data.status === "success") {
          setExams(data.exams || []);
        } else {
          showToast(data.message || "فشل تحميل الامتحانات", "error");
        }
      } catch (error) {
        showToast("خطأ في الاتصال بالسيرفر", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, [user]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium border border-green-500/30">
            مكتمل
          </span>
        );
      case "in_progress":
        return (
          <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm font-medium border border-yellow-500/30">
            جاري
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium border border-blue-500/30">
            لم يبدأ
          </span>
        );
    }
  };

  if (authLoading || loading) return <LoaderOverlay />;

  return (
    <section className="relative w-full min-h-screen flex items-start justify-center px-6 py-20 bg-gray-950">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Background subtle glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-6xl w-full">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
                الامتحانات
              </h1>
              <p className="text-gray-500 text-lg">
                اختر الامتحان اللي عاوز تبدأه
              </p>
            </div>
            <button
              onClick={() => router.push("/")}
              className="px-6 py-3 bg-gray-900/50 hover:bg-gray-900 backdrop-blur-sm border border-gray-800 hover:border-gray-700 text-white rounded-xl transition-all duration-300"
            >
              رجوع للرئيسية
            </button>
          </div>
        </div>

        {/* Exams Grid */}
        {exams.length === 0 ? (
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-16 text-center">
            <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              مفيش امتحانات متاحة دلوقتي
            </h3>
            <p className="text-gray-500">
              اتواصل مع الدعم للتفاصيل
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {exams.map((exam) => (
              <div
                key={exam.id}
                onClick={() => router.push(`/exam/${exam.id}`)}
                className="group bg-gray-900/50 backdrop-blur-sm border border-gray-800 hover:border-gray-700 rounded-3xl p-8 transition-all duration-300 hover:-translate-y-1 cursor-pointer"
              >
                <div className="flex flex-col h-full">
                  {/* Status Badge */}
                  <div className="mb-4">
                    {getStatusBadge(exam.exam_status)}
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-purple-400 transition-colors">
                    {exam.title}
                  </h3>

                  {/* Info */}
                  <div className="space-y-3 mb-6 flex-grow">
                    <div className="flex items-center gap-3 text-gray-500">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{exam.duration} دقيقة</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-500">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>{exam.questions_count} سؤال</span>
                    </div>
                  </div>

                  {/* Score if completed */}
                  {exam.exam_status === "completed" && exam.score !== undefined && (
                    <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-sm">النتيجة</span>
                        <span className="text-2xl font-bold text-white">
                          {exam.score} / {exam.total_questions}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  <button className="w-full py-3 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded-xl transition-all duration-300 border border-purple-500/30 font-medium">
                    {exam.exam_status === "completed"
                      ? "عرض النتيجة"
                      : exam.exam_status === "in_progress"
                        ? "استكمل الامتحان"
                        : "ابدأ الامتحان"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
