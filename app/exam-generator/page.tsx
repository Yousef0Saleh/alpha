"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/hooks/useAuth";
import LoaderOverlay from "@/components/LoaderOverlay";
import Toast from "@/components/Toast";
import { API_BASE_URL } from "@/lib/config";
import {
  FileText,
  Upload,
  Brain,
  Download,
  Trash2,
  X,
  CheckCircle2,
  Circle,
  AlertCircle,
  ChevronDown
} from "lucide-react";

interface Question {
  type: "mcq" | "true_false" | "short_answer" | "essay";
  question: string;
  options?: string[];
  correct_answer: string;
  explanation?: string;
  difficulty?: "easy" | "medium" | "hard";
}

interface ExamResult {
  original_filename: string;
  file_type: string;
  questions: Question[];
  exam_info: {
    total_questions: number;
    question_types: string[];
    difficulty_levels: string[];
    subject_area: string;
  };
}

export default function ExamGeneratorPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [loading, setLoading] = useState<boolean>(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [examResult, setExamResult] = useState<ExamResult | null>(null);
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard" | "mixed">("mixed");
  const [questionTypes, setQuestionTypes] = useState<string[]>(["mcq", "true_false"]);
  const [showAnswers, setShowAnswers] = useState<boolean>(false);
  const [showDownloadMenu, setShowDownloadMenu] = useState<boolean>(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef<number>(0);
  const downloadMenuRef = useRef<HTMLDivElement>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 5000);
  };

  // Get CSRF token
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/routes/get_csrf.php`,
          { credentials: "include" }
        );
        const data = await res.json();
        if (data.status === "ok" && data.csrf_token)
          setCsrfToken(data.csrf_token);
      } catch (err) {
        console.error("Failed to get CSRF token");
      }
    })();
  }, []);

  // Auth check
  useEffect(() => {
    if (!authLoading && !user) router.replace("/signin");
  }, [authLoading, user, router]);

  // Close download menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (downloadMenuRef.current && !downloadMenuRef.current.contains(event.target as Node)) {
        setShowDownloadMenu(false);
      }
    };

    if (showDownloadMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDownloadMenu]);

  const validateFile = (selectedFile: File): string | null => {
    const fileType = selectedFile.type;
    const validTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/webp"
    ];

    if (!validTypes.includes(fileType)) {
      return "نوع الملف غير مدعوم. اختر PDF أو صورة";
    }

    const maxSize = 10 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      return "حجم الملف كبير جدا. الحد الاقصى 10 ميجا";
    }

    return null;
  };

  const processFile = (selectedFile: File) => {
    const error = validateFile(selectedFile);
    if (error) {
      showToast(error, "error");
      return;
    }

    setFile(selectedFile);
    setExamResult(null);

    if (selectedFile.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreview(event.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    processFile(selectedFile);
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      processFile(droppedFiles[0]);
    }
  };

  const handleGenerate = async () => {
    if (!file || !csrfToken) {
      showToast("اختر ملف اولا", "error");
      return;
    }

    if (questionCount < 5 || questionCount > 50) {
      showToast("عدد الاسئلة يجب ان يكون بين 5 و 50", "error");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("question_count", questionCount.toString());
      formData.append("difficulty", difficulty);
      formData.append("question_types", JSON.stringify(questionTypes));

      const res = await fetch(
        `${API_BASE_URL}/routes/exam_generator/generate_exam.php`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "X-CSRF-Token": csrfToken,
          },
          body: formData,
        }
      );

      if (!res.ok) {
        showToast("حدث خطا في الخادم", "error");
        return;
      }

      const data = await res.json();

      if (data.status === "success") {
        setExamResult(data.result);
        showToast("تم توليد الاسئلة بنجاح", "success");
      } else {
        showToast(data.message || "فشل توليد الاسئلة. حاول مرة اخرى", "error");
      }
    } catch (error) {
      showToast("فشل الاتصال بالخادم", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFile(null);
    setPreview(null);
    setExamResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const toggleQuestionType = (type: string) => {
    if (questionTypes.includes(type)) {
      if (questionTypes.length > 1) {
        setQuestionTypes(questionTypes.filter(t => t !== type));
      }
    } else {
      setQuestionTypes([...questionTypes, type]);
    }
  };

  const downloadExam = (format: "txt" | "pdf") => {
    if (!examResult) return;

    if (format === "txt") {
      downloadAsText();
    } else {
      downloadAsPDF();
    }
  };

  const downloadAsText = () => {
    if (!examResult) return;

    let text = `
===========================================
امتحان مولد من: ${examResult.original_filename}
===========================================
المادة: ${examResult.exam_info.subject_area}
عدد الاسئلة: ${examResult.exam_info.total_questions}
انواع الاسئلة: ${examResult.exam_info.question_types.map(t => getQuestionTypeLabel(t)).join(", ")}
===========================================

`;

    examResult.questions.forEach((q, idx) => {
      text += `\nسؤال ${idx + 1}`;
      if (q.difficulty) {
        text += ` [${q.difficulty === "easy" ? "سهل" : q.difficulty === "medium" ? "متوسط" : "صعب"}]`;
      }
      text += `:\n${q.question}\n`;

      if (q.type === "mcq" && q.options) {
        q.options.forEach((opt, i) => {
          text += `${String.fromCharCode(65 + i)}) ${opt}\n`;
        });
      } else if (q.type === "true_false") {
        text += "أ) صح\nب) خطأ\n";
      }

      if (showAnswers) {
        text += `\n✓ الاجابة الصحيحة: ${q.correct_answer}\n`;
        if (q.explanation) {
          text += `التوضيح: ${q.explanation}\n`;
        }
      }
      text += "\n---\n";
    });

    text += `\n===========================================\nتم الانشاء بواسطة منصة الفا\n===========================================`;

    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `exam_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadAsPDF = async () => {
    if (!examResult) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/routes/exam_generator/generate_pdf.php`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-Token": csrfToken || "",
          },
          body: JSON.stringify({
            exam: examResult,
            show_answers: showAnswers
          }),
        }
      );

      if (!response.ok) {
        showToast("فشل تحميل PDF", "error");
        return;
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `exam_${Date.now()}.pdf`;
      a.click();
      URL.revokeObjectURL(url);

      showToast("تم تحميل PDF بنجاح", "success");
    } catch (error) {
      showToast("فشل تحميل PDF", "error");
    }
  };

  const getQuestionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      mcq: "اختيار من متعدد",
      true_false: "صح/خطأ",
      short_answer: "اجابة قصيرة",
      essay: "مقالي"
    };
    return labels[type] || type;
  };

  const getDifficultyColor = (difficulty?: string) => {
    if (!difficulty) return "text-gray-400";
    const colors: Record<string, string> = {
      easy: "text-green-400",
      medium: "text-yellow-400",
      hard: "text-red-400"
    };
    return colors[difficulty] || "text-gray-400";
  };

  if (authLoading) return <LoaderOverlay />;

  return (
    <section className="w-full min-h-screen px-4 py-12">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="text-gray-400 hover:text-white mb-4 flex items-center gap-2 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            رجوع
          </button>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Brain className="w-8 h-8 text-purple-400" />
            مولد الامتحانات الذكي
          </h1>
          <p className="text-gray-400">
            ارفع محتوى دراسي واحصل على امتحان كامل بالذكاء الاصطناعي
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upload & Settings Section */}
          <div className="lg:col-span-1 space-y-6">
            {/* Upload */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">رفع الملف</h2>

              <div className="mb-4">
                <div
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-6 cursor-pointer transition-all ${isDragging
                      ? "border-purple-500 bg-purple-500/10"
                      : "border-gray-600 hover:border-purple-500"
                    }`}
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Upload className="w-10 h-10 text-gray-400" />
                    <p className="text-white font-medium text-center text-sm">
                      {file ? file.name : isDragging ? "اسقط الملف" : "ارفع ملف دراسي"}
                    </p>
                    <p className="text-xs text-gray-400">
                      PDF او صورة (حد اقصى 10MB)
                    </p>
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf,image/jpeg,image/png,image/jpg,image/webp"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {preview && (
                <div className="relative mb-4">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full rounded-lg border border-gray-700"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClear();
                    }}
                    className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              )}

              {file && !preview && (
                <div className="mb-4 flex items-center gap-3 bg-gray-800/50 rounded-lg p-3 border border-gray-700">
                  <FileText className="w-6 h-6 text-purple-400" />
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-gray-400">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                  <button
                    onClick={handleClear}
                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              )}
            </div>

            {/* Settings */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">اعدادات الامتحان</h2>

              {/* Question Count */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  عدد الاسئلة: {questionCount}
                </label>
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="5"
                  value={questionCount}
                  onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>5</span>
                  <span>25</span>
                  <span>50</span>
                </div>
              </div>

              {/* Difficulty */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  مستوى الصعوبة:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(["easy", "medium", "hard", "mixed"] as const).map((level) => (
                    <button
                      key={level}
                      onClick={() => setDifficulty(level)}
                      disabled={loading}
                      className={`px-3 py-2 rounded-lg border text-sm transition-all ${difficulty === level
                          ? "bg-purple-600 text-white border-purple-600"
                          : "bg-gray-800/50 text-gray-300 border-gray-700 hover:border-gray-600"
                        }`}
                    >
                      {level === "easy" && "سهل"}
                      {level === "medium" && "متوسط"}
                      {level === "hard" && "صعب"}
                      {level === "mixed" && "مختلط"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question Types */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  انواع الاسئلة:
                </label>
                <div className="space-y-2">
                  {["mcq", "true_false", "short_answer", "essay"].map((type) => (
                    <button
                      key={type}
                      onClick={() => toggleQuestionType(type)}
                      disabled={loading}
                      className={`w-full px-3 py-2 rounded-lg border text-sm transition-all flex items-center gap-2 ${questionTypes.includes(type)
                          ? "bg-purple-600/20 text-purple-300 border-purple-600"
                          : "bg-gray-800/50 text-gray-400 border-gray-700 hover:border-gray-600"
                        }`}
                    >
                      {questionTypes.includes(type) ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <Circle className="w-4 h-4" />
                      )}
                      {getQuestionTypeLabel(type)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={!file || loading}
                className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-xl transition-all duration-200 font-medium flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    جاري التوليد...
                  </>
                ) : (
                  <>
                    <Brain className="w-5 h-5" />
                    ولد الامتحان
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-2 bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">الامتحان</h2>
              {examResult && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowAnswers(!showAnswers)}
                    className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors flex items-center gap-2"
                  >
                    {showAnswers ? "اخفاء" : "اظهار"} الاجابات
                  </button>
                  <div className="relative" ref={downloadMenuRef}>
                    <button
                      onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                      className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition-colors flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      تحميل
                      <ChevronDown className={`w-4 h-4 transition-transform ${showDownloadMenu ? 'rotate-180' : ''}`} />
                    </button>
                    {showDownloadMenu && (
                      <div className="absolute left-0 mt-2 w-40 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-10 overflow-hidden">
                        <button
                          onClick={() => {
                            downloadExam("pdf");
                            setShowDownloadMenu(false);
                          }}
                          className="w-full px-4 py-3 text-right text-white hover:bg-gray-700 transition-colors flex items-center gap-2"
                        >
                          <FileText className="w-4 h-4" />
                          PDF
                        </button>
                        <div className="h-px bg-gray-700"></div>
                        <button
                          onClick={() => {
                            downloadExam("txt");
                            setShowDownloadMenu(false);
                          }}
                          className="w-full px-4 py-3 text-right text-white hover:bg-gray-700 transition-colors flex items-center gap-2"
                        >
                          <FileText className="w-4 h-4" />
                          Text
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {loading && (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-600 border-t-purple-500"></div>
                <p className="text-gray-300">الذكاء الاصطناعي يولد الاسئلة...</p>
                <p className="text-sm text-gray-500">قد يستغرق دقيقة او اثنتين</p>
              </div>
            )}

            {!loading && !examResult && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mb-4">
                  <Brain className="w-8 h-8 text-gray-500" />
                </div>
                <p className="text-gray-400">ارفع ملف وولد الامتحان</p>
                <p className="text-sm text-gray-500 mt-2">
                  الاسئلة ستظهر هنا
                </p>
              </div>
            )}

            {examResult && (
              <div className="space-y-4 max-h-[960px] overflow-y-auto pr-2 scrollbar-custom">
                {/* Exam Info */}
                <div className="bg-linear-to-r from-purple-500/10 to-blue-500/10 rounded-xl p-4 border border-purple-500/30">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">المادة</p>
                      <p className="text-white font-medium">{examResult.exam_info.subject_area}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">عدد الاسئلة</p>
                      <p className="text-white font-medium">{examResult.exam_info.total_questions}</p>
                    </div>
                  </div>
                </div>

                {/* Questions */}
                {examResult.questions.map((q, idx) => (
                  <div
                    key={idx}
                    className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 hover:border-gray-600 transition-colors"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <span className="shrink-0 w-8 h-8 bg-purple-500/20 text-purple-400 rounded-lg flex items-center justify-center text-sm font-bold">
                        {idx + 1}
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs">
                            {getQuestionTypeLabel(q.type)}
                          </span>
                          {q.difficulty && (
                            <span className={`text-xs font-medium ${getDifficultyColor(q.difficulty)}`}>
                              {q.difficulty === "easy" ? "سهل" : q.difficulty === "medium" ? "متوسط" : "صعب"}
                            </span>
                          )}
                        </div>
                        <p className="text-white font-medium leading-relaxed">{q.question}</p>
                      </div>
                    </div>

                    {/* MCQ Options */}
                    {q.type === "mcq" && q.options && (
                      <div className="space-y-2 mr-11">
                        {q.options.map((opt, i) => (
                          <div
                            key={i}
                            className={`p-3 rounded-lg border transition-colors ${showAnswers && opt === q.correct_answer
                                ? "bg-green-500/10 border-green-500/50"
                                : "bg-gray-900/50 border-gray-700"
                              }`}
                          >
                            <span className="text-gray-300 text-sm">
                              <span className="font-semibold text-gray-400 mr-2">
                                {String.fromCharCode(65 + i)})
                              </span>
                              {opt}
                              {showAnswers && opt === q.correct_answer && (
                                <CheckCircle2 className="inline w-4 h-4 text-green-400 mr-2" />
                              )}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* True/False */}
                    {q.type === "true_false" && (
                      <div className="space-y-2 mr-11">
                        {["صح", "خطأ"].map((opt, i) => (
                          <div
                            key={i}
                            className={`p-3 rounded-lg border transition-colors ${showAnswers && opt === q.correct_answer
                                ? "bg-green-500/10 border-green-500/50"
                                : "bg-gray-900/50 border-gray-700"
                              }`}
                          >
                            <span className="text-gray-300 text-sm">
                              <span className="font-semibold text-gray-400 mr-2">
                                {String.fromCharCode(65 + i)})
                              </span>
                              {opt}
                              {showAnswers && opt === q.correct_answer && (
                                <CheckCircle2 className="inline w-4 h-4 text-green-400 mr-2" />
                              )}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Answer & Explanation */}
                    {showAnswers && (
                      <div className="mt-3 mr-11 space-y-2">
                        {(q.type === "short_answer" || q.type === "essay") && (
                          <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/30">
                            <p className="text-xs text-green-400 mb-1 font-semibold">الاجابة النموذجية:</p>
                            <p className="text-gray-300 text-sm">{q.correct_answer}</p>
                          </div>
                        )}
                        {q.explanation && (
                          <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
                            <p className="text-xs text-blue-400 mb-1 font-semibold flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              التوضيح:
                            </p>
                            <p className="text-gray-300 text-sm">{q.explanation}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}