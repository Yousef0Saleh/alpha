"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Plus, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { API_BASE_URL, API_ROUTES, SITE_URL } from "@/lib/config";

interface Question {
  question: string;
  options: string[];
  correct_answer: number;
}

export default function EditExamPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState('30');
  const [grade, setGrade] = useState('first');
  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    fetchExamDetails();
  }, [examId]);

  const fetchExamDetails = async () => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/routes/admin/exams/details.php?id=${examId}`,
        { credentials: 'include' }
      );
      const data = await res.json();

      if (data.status === 'success') {
        setTitle(data.data.title);
        setDuration(data.data.duration.toString());
        setGrade(data.data.grade);

        // Map 'answer' from backend to 'correct_answer' for frontend
        const mappedQuestions = (data.data.questions || []).map((q: any) => ({
          question: q.question,
          options: q.options,
          correct_answer: q.answer ?? q.correct_answer ?? 0
        }));
        setQuestions(mappedQuestions);
      } else {
        alert(data.message);
        router.push('/admin/exams');
      }
    } catch (error) {
      console.error('Failed to fetch exam:', error);
      alert('فشل تحميل البيانات');
      router.push('/admin/exams');
    } finally {
      setLoading(false);
    }
  };

  const addQuestion = () => {
    setQuestions([...questions, { question: '', options: ['', '', '', ''], correct_answer: 0 }]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length === 1) {
      alert('لازم يكون فيه سؤال واحد على الأقل');
      return;
    }
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const updated = [...questions];
    if (field === 'question') {
      updated[index].question = value;
    } else if (field === 'correct_answer') {
      updated[index].correct_answer = value;
    }
    setQuestions(updated);
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updated = [...questions];
    updated[questionIndex].options[optionIndex] = value;
    setQuestions(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('عنوان الامتحان مطلوب');
      return;
    }

    const durationNum = parseInt(duration);
    if (isNaN(durationNum) || durationNum <= 0) {
      alert('المدة غير صحيحة');
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) {
        alert(`السؤال ${i + 1} فاضي`);
        return;
      }

      for (let j = 0; j < 4; j++) {
        if (!q.options[j].trim()) {
          alert(`الاختيار ${j + 1} في السؤال ${i + 1} فاضي`);
          return;
        }
      }
    }

    setSaving(true);
    try {
      const res = await fetch('${API_BASE_URL}/routes/admin/exams/update.php', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exam_id: parseInt(examId),
          title: title.trim(),
          duration: durationNum,
          grade,
          questions
        })
      });

      const data = await res.json();
      if (data.status === 'success') {
        alert('تم تحديث الامتحان بنجاح');
        router.push('/admin/exams');
      } else {
        alert(data.message || 'فشل التحديث');
      }
    } catch (error) {
      alert('حصل خطأ في التحديث');
    } finally {
      setSaving(false);
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
      <div className="flex items-center gap-4">
        <Link
          href="/admin/exams"
          className="p-2 hover:bg-white/5 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold mb-2">تعديل امتحان</h1>
          <p className="text-gray-500">تعديل الامتحان الموجود</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-4">
          <h2 className="text-xl font-bold mb-4">معلومات الامتحان</h2>

          <div>
            <label className="block text-sm font-medium mb-2">عنوان الامتحان</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">المدة (بالدقائق)</label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                min="1"
                max="300"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">الصف الدراسي</label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                required
              >
                <option value="first">أولى ثانوي</option>
                <option value="second">تانية ثانوي</option>
                <option value="third">تالتة ثانوي</option>
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">الأسئلة ({questions.length})</h2>
            <button
              type="button"
              onClick={addQuestion}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 rounded-xl transition-colors"
            >
              <Plus className="w-5 h-5" />
              إضافة سؤال
            </button>
          </div>

          {questions.map((q, qIndex) => (
            <div key={qIndex} className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold">السؤال {qIndex + 1}</h3>
                {questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeQuestion(qIndex)}
                    className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">نص السؤال</label>
                <textarea
                  value={q.question}
                  onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">الاختيارات (اختار الإجابة الصحيحة)</label>
                <div className="space-y-3">
                  {[0, 1, 2, 3].map((optIndex) => (
                    <div
                      key={optIndex}
                      className={`relative flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${q.correct_answer === optIndex
                        ? 'bg-green-500/10 border-green-500/50'
                        : 'bg-white/5 border-white/10 hover:border-white/20'
                        }`}
                    >
                      {/* Option Letter */}
                      <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${q.correct_answer === optIndex
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-white/10 text-gray-400'
                        }`}>
                        {['A', 'B', 'C', 'D'][optIndex]}
                      </div>

                      {/* Option Input */}
                      <input
                        type="text"
                        value={q.options[optIndex]}
                        onChange={(e) => updateOption(qIndex, optIndex, e.target.value)}
                        placeholder={`اكتب الاختيار ${['الأول', 'الثاني', 'الثالث', 'الرابع'][optIndex]}...`}
                        className="flex-1 px-4 py-2.5 bg-transparent border-none text-white placeholder-gray-500 focus:outline-none"
                        required
                      />

                      {/* Correct Answer Selector */}
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="radio"
                          name={`correct-${qIndex}`}
                          checked={q.correct_answer === optIndex}
                          onChange={() => updateQuestion(qIndex, 'correct_answer', optIndex)}
                          className="sr-only"
                        />
                        <div className={`relative w-6 h-6 rounded-full border-2 transition-all ${q.correct_answer === optIndex
                          ? 'bg-green-500 border-green-500'
                          : 'bg-transparent border-gray-600 group-hover:border-gray-500'
                          }`}>
                          {q.correct_answer === optIndex && (
                            <svg className="w-full h-full text-white p-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <span className="text-xs text-gray-400 group-hover:text-gray-300">
                          {q.correct_answer === optIndex ? 'صح ✓' : 'اختار'}
                        </span>
                      </label>

                      {/* Correct Answer Badge */}
                      {q.correct_answer === optIndex && (
                        <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-green-500 text-white text-xs font-bold rounded-full">
                          الإجابة الصحيحة
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-3 flex items-center gap-2">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                  اضغط على الدايرة الخضرا أو على الصف بالكامل لتحديد الإجابة الصحيحة
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-end gap-4">
          <Link
            href="/admin/exams"
            className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
          >
            إلغاء
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-xl transition-all disabled:opacity-50"
          >
            {saving ? 'جاري الحفظ...' : 'حفظ التعديلات'}
          </button>
        </div>
      </form>
    </div>
  );
}
