"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/hooks/useAuth";
import LoaderOverlay from "@/components/LoaderOverlay";
import Toast from "@/components/Toast";
import {
  FileText,
  Upload,
  Sparkles,
  Download,
  Trash2,
  X,
  ChevronDown,
  History,
  Clock,
  Copy,
  Check
} from "lucide-react";

interface SummaryResult {
  original_filename: string;
  file_type: string;
  file_size: string;
  summary: {
    main_points: string[];
    detailed_summary: string;
    key_takeaways: string[];
    topics_covered: string[];
  };
  metadata: {
    page_count?: number;
    word_count?: number;
    language?: string;
  };
}

interface HistoryItem {
  id: number;
  filename: string;
  created_at: string;
  summary_json: string;
  file_type: string;
  file_size: number;
  detail_level: string;
}

export default function SummarizerPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [loading, setLoading] = useState<boolean>(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [summaryResult, setSummaryResult] = useState<SummaryResult | null>(null);
  const [summaryLength, setSummaryLength] = useState<number>(200);
  const [showDownloadMenu, setShowDownloadMenu] = useState<boolean>(false);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
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
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.1.5';
        const res = await fetch(
          `${API_URL}/alpha/backend/routes/get_csrf.php`,
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

  // Load history when showing
  useEffect(() => {
    if (showHistory && history.length === 0) {
      loadHistory();
    }
  }, [showHistory]);

  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.1.5';
      const res = await fetch(
        `${API_URL}/alpha/backend/routes/summarizer/get_history.php`,
        { credentials: "include" }
      );

      if (!res.ok) {
        showToast("فشل تحميل السجل", "error");
        return;
      }

      const data = await res.json();
      if (data.status === "success") {
        setHistory(data.history);
      }
    } catch (error) {
      showToast("فشل الاتصال بالخادم", "error");
    } finally {
      setLoadingHistory(false);
    }
  };

  const loadHistoryItem = (item: HistoryItem) => {
    try {
      const summary = JSON.parse(item.summary_json);
      setSummaryResult({
        original_filename: item.filename,
        file_type: item.file_type === 'application/pdf' ? 'PDF' : 'صورة',
        file_size: `${(item.file_size / 1024).toFixed(2)} كيلوبايت`,
        summary: summary,
        metadata: {
          language: 'العربية'
        }
      });
      setShowHistory(false);
      showToast("تم تحميل الملخص من السجل", "success");
    } catch (error) {
      showToast("فشل تحميل الملخص", "error");
    }
  };

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
      return "نوع الملف غير مدعوم. اختر PDF او صورة";
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
    setSummaryResult(null);

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

  const getDetailLevel = (length: number): string => {
    if (length <= 100) return "short";
    if (length <= 300) return "medium";
    return "detailed";
  };

  const handleSummarize = async () => {
    if (!file || !csrfToken) {
      showToast("اختر ملف اولا", "error");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("detail_level", getDetailLevel(summaryLength));
      formData.append("target_length", summaryLength.toString());

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.1.5';

      const res = await fetch(
        `${API_URL}/alpha/backend/routes/summarizer/summarize_file.php`,
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
        setSummaryResult(data.result);
        showToast("تم التلخيص بنجاح", "success");

        // Reload history
        if (showHistory) {
          loadHistory();
        }
      } else {
        showToast(data.message || "فشل التلخيص. حاول مرة اخرى", "error");
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
    setSummaryResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const copyToClipboard = async () => {
    if (!summaryResult) return;

    const text = `
ملخص الملف: ${summaryResult.original_filename}

النقاط الرئيسية:
${summaryResult.summary.main_points.map((p, i) => `${i + 1}. ${p}`).join("\n")}

الملخص التفصيلي:
${summaryResult.summary.detailed_summary}

الاستنتاجات الرئيسية:
${summaryResult.summary.key_takeaways.map((k, i) => `${i + 1}. ${k}`).join("\n")}

المواضيع المغطاة:
${summaryResult.summary.topics_covered.join(", ")}
    `.trim();

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      showToast("تم النسخ للحافظة", "success");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      showToast("فشل النسخ", "error");
    }
  };

  const downloadAsText = () => {
    if (!summaryResult) return;

    const text = `
===========================================
ملخص الملف: ${summaryResult.original_filename}
===========================================

النقاط الرئيسية:
${summaryResult.summary.main_points.map((p, i) => `${i + 1}. ${p}`).join("\n")}

الملخص التفصيلي:
${summaryResult.summary.detailed_summary}

الاستنتاجات الرئيسية:
${summaryResult.summary.key_takeaways.map((k, i) => `${i + 1}. ${k}`).join("\n")}

المواضيع المغطاة:
${summaryResult.summary.topics_covered.join(", ")}

===========================================
تم الانشاء بواسطة منصة الفا
===========================================
    `.trim();

    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `summary_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setShowDownloadMenu(false);
  };

  const downloadAsPDF = async () => {
    if (!summaryResult) return;

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.1.5';

      const response = await fetch(
        `${API_URL}/alpha/backend/routes/summarizer/generate_summary_pdf.php`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-Token": csrfToken || "",
          },
          body: JSON.stringify({
            summary: summaryResult
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
      a.download = `summary_${Date.now()}.pdf`;
      a.click();
      URL.revokeObjectURL(url);

      showToast("تم تحميل PDF بنجاح", "success");
      setShowDownloadMenu(false);
    } catch (error) {
      showToast("فشل تحميل PDF", "error");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "اليوم";
    if (days === 1) return "امس";
    if (days < 7) return `منذ ${days} ايام`;
    return date.toLocaleDateString('ar-EG');
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

      <div className="max-w-6xl mx-auto">
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                <Sparkles className="w-8 h-8 text-indigo-400" />
                اداة التلخيص الذكي
              </h1>
              <p className="text-gray-400">
                ارفع PDF او صورة واحصل على ملخص دقيق بالذكاء الاصطناعي
              </p>
            </div>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <History className="w-5 h-5" />
              السجل
            </button>
          </div>
        </div>

        {/* History Sidebar */}
        {showHistory && (
          <div className="mb-6 bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Clock className="w-5 h-5" />
                سجل التلخيصات
              </h2>
              <button
                onClick={() => setShowHistory(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingHistory ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-600 border-t-white"></div>
              </div>
            ) : history.length === 0 ? (
              <p className="text-gray-400 text-center py-8">لا يوجد تلخيصات سابقة</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-custom">
                {history.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => loadHistoryItem(item)}
                    className="w-full text-right p-4 bg-gray-800/50 hover:bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">{item.filename}</p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                          <FileText className="w-3 h-3" />
                          <span>{item.file_type === 'application/pdf' ? 'PDF' : 'صورة'}</span>
                          <span>•</span>
                          <span>{(item.file_size / 1024).toFixed(0)} KB</span>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {formatDate(item.created_at)}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload Section */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">رفع الملف</h2>

            {/* Drag & Drop Area */}
            <div className="mb-6">
              <div
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 cursor-pointer transition-all ${isDragging
                    ? "border-indigo-500 bg-indigo-500/10"
                    : "border-gray-600 hover:border-indigo-500"
                  }`}
              >
                <div className="flex flex-col items-center justify-center gap-3">
                  <Upload className="w-12 h-12 text-gray-400" />
                  <p className="text-white font-medium text-center">
                    {file ? file.name : isDragging ? "اسقط الملف هنا" : "اضغط او اسحب الملف هنا"}
                  </p>
                  <p className="text-sm text-gray-400">
                    PDF او صورة (JPG, PNG, WEBP)
                  </p>
                  <p className="text-xs text-gray-500">
                    الحد الاقصى: 10 ميجا
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

            {/* Preview */}
            {preview && (
              <div className="mb-6 relative">
                <p className="text-sm text-gray-400 mb-2">معاينة الصورة:</p>
                <div className="relative">
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
              </div>
            )}

            {file && !preview && (
              <div className="mb-6 flex items-center gap-3 bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <FileText className="w-8 h-8 text-indigo-400" />
                <div className="flex-1">
                  <p className="text-white font-medium">{file.name}</p>
                  <p className="text-sm text-gray-400">
                    {(file.size / 1024).toFixed(2)} كيلوبايت
                  </p>
                </div>
                <button
                  onClick={handleClear}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            )}

            {/* Summary Length Slider */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-3">
                طول الملخص المطلوب: {summaryLength} كلمة
              </label>
              <input
                type="range"
                min="50"
                max="500"
                step="50"
                value={summaryLength}
                onChange={(e) => setSummaryLength(parseInt(e.target.value))}
                disabled={loading}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>قصير (50)</span>
                <span>متوسط (250)</span>
                <span>مفصل (500)</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {summaryLength <= 100 && "ملخص قصير ومركز"}
                {summaryLength > 100 && summaryLength <= 300 && "ملخص متوازن بتفاصيل معقولة"}
                {summaryLength > 300 && "ملخص مفصل وشامل"}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleSummarize}
                disabled={!file || loading}
                className="flex-1 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-xl transition-all duration-200 font-medium flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    جاري التلخيص...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    لخص الملف
                  </>
                )}
              </button>
              {file && (
                <button
                  onClick={handleClear}
                  disabled={loading}
                  className="px-4 py-3 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:opacity-50 text-white rounded-xl transition-all duration-200"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Results Section */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">النتيجة</h2>
              {summaryResult && (
                <div className="flex gap-2">
                  <button
                    onClick={copyToClipboard}
                    className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors flex items-center gap-2"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        تم النسخ
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        نسخ
                      </>
                    )}
                  </button>
                  <div className="relative" ref={downloadMenuRef}>
                    <button
                      onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                      className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm transition-colors flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      تحميل
                      <ChevronDown className={`w-4 h-4 transition-transform ${showDownloadMenu ? 'rotate-180' : ''}`} />
                    </button>
                    {showDownloadMenu && (
                      <div className="absolute left-0 mt-2 w-40 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-10 overflow-hidden">
                        <button
                          onClick={downloadAsPDF}
                          className="w-full px-4 py-3 text-right text-white hover:bg-gray-700 transition-colors flex items-center gap-2"
                        >
                          <FileText className="w-4 h-4" />
                          PDF
                        </button>
                        <div className="h-px bg-gray-700"></div>
                        <button
                          onClick={downloadAsText}
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
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-600 border-t-white"></div>
                <p className="text-gray-300">الذكاء الاصطناعي يحلل الملف...</p>
                <p className="text-sm text-gray-500">قد يستغرق بعض الوقت</p>
              </div>
            )}

            {!loading && !summaryResult && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mb-4">
                  <FileText className="w-8 h-8 text-gray-500" />
                </div>
                <p className="text-gray-400">ارفع ملف واضغط لخص الملف</p>
                <p className="text-sm text-gray-500 mt-2">
                  النتيجة ستظهر هنا
                </p>
              </div>
            )}

            {summaryResult && (
              <div className="space-y-6 max-h-[700px] overflow-y-auto pl-2 scrollbar-custom">
                {/* File Info */}
                <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                  <p className="text-sm text-gray-400 mb-1">الملف:</p>
                  <p className="text-white font-medium">{summaryResult.original_filename}</p>
                  <div className="flex gap-4 mt-2 text-xs text-gray-500">
                    <span>النوع: {summaryResult.file_type}</span>
                    <span>الحجم: {summaryResult.file_size}</span>
                  </div>
                </div>

                {/* Main Points */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <span className="w-1 h-6 bg-indigo-500 rounded-full"></span>
                    النقاط الرئيسية
                  </h3>
                  <div className="space-y-2">
                    {summaryResult.summary.main_points.map((point, idx) => (
                      <div
                        key={idx}
                        className="flex gap-3 bg-gray-800/50 rounded-lg p-3 border border-gray-700"
                      >
                        <span className="shrink-0 w-6 h-6 bg-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center text-sm font-medium">
                          {idx + 1}
                        </span>
                        <p className="text-gray-300 text-sm">{point}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Detailed Summary */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
                    الملخص التفصيلي
                  </h3>
                  <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                    <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                      {summaryResult.summary.detailed_summary}
                    </p>
                  </div>
                </div>

                {/* Key Takeaways */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <span className="w-1 h-6 bg-green-500 rounded-full"></span>
                    الاستنتاجات الرئيسية
                  </h3>
                  <div className="space-y-2">
                    {summaryResult.summary.key_takeaways.map((takeaway, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2 text-gray-300 text-sm"
                      >
                        <span className="text-green-400 mt-1 shrink-0">✓</span>
                        <span>{takeaway}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Topics Covered */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <span className="w-1 h-6 bg-purple-500 rounded-full"></span>
                    المواضيع المغطاة
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {summaryResult.summary.topics_covered.map((topic, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm border border-purple-500/30"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .scrollbar-custom::-webkit-scrollbar {
          width: 8px;
        }
        
        .scrollbar-custom::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .scrollbar-custom::-webkit-scrollbar-thumb {
          background: #4B5563;
          border-radius: 4px;
        }
        
        .scrollbar-custom::-webkit-scrollbar-thumb:hover {
          background: #6B7280;
        }
      `}</style>
    </section>
  );
}