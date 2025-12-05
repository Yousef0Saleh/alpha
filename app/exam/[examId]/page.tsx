"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/app/hooks/useAuth";
import LoaderOverlay from "@/components/LoaderOverlay";
import Toast from "@/components/Toast";
import { API_BASE_URL } from "@/lib/config";

interface Question {
  id: number;
  question: string;
  options: string[];
}

type AnswersMap = Record<number, number>;

interface AIAnalysis {
  score: {
    correct: number;
    total: number;
    percentage: number;
  };
  wrong_answers_explanation: Array<{
    question_id: number;
    question: string;
    student_answer: string;
    correct_answer: string;
    explanation: string;
  }>;
  unanswered_explanation: Array<{
    question_id: number;
    question: string;
    correct_answer: string;
    explanation: string;
  }>;
  behavior_analysis: {
    speed: string;
    confidence: string;
    navigation_pattern: string;
    answer_changes: number;
    average_time_per_question: string;
    details: string;
  };
  cheating_suspicion: {
    level: string;
    indicators: string[];
    explanation: string;
  };
  recommendations: string[];
  overall_summary: string;
}

export default function ExamPage() {
  const { examId } = useParams() as { examId?: string };
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [loading, setLoading] = useState<boolean>(true);
  const [examTitle, setExamTitle] = useState<string>("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [totalTime, setTotalTime] = useState<number>(0);
  const [answers, setAnswers] = useState<AnswersMap>({});
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [started, setStarted] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [autoSubmitting, setAutoSubmitting] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [actions, setActions] = useState<any[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState<boolean>(false);
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [examError, setExamError] = useState<string | null>(null);
  const [tabId] = useState<string>(() => `tab_${Date.now()}_${Math.random()}`);
  const [retryingSubmit, setRetryingSubmit] = useState<boolean>(false);

  // 🔥 Fullscreen & Blur states
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showBlurWarning, setShowBlurWarning] = useState<boolean>(false);
  const [warningCountdown, setWarningCountdown] = useState<number>(15);
  const [exitAttempts, setExitAttempts] = useState<number>(0);

  // 🔥 NEW: Custom modals
  const [showStartConfirm, setShowStartConfirm] = useState<boolean>(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState<boolean>(false);

  const timerRef = useRef<number | null>(null);
  const autosaveRef = useRef<number | null>(null);
  const warnedRef = useRef<boolean>(false);
  const submitAttemptedRef = useRef<boolean>(false);
  const heartbeatRef = useRef<number | null>(null);
  const submitRetryRef = useRef<number | null>(null);
  const warningTimerRef = useRef<number | null>(null);

  const intentionalExitRef = useRef<boolean>(false);

  const AUTO_SAVE_INTERVAL_MS = 5_000;
  const END_WARNING_SECONDS = 30;
  const HEARTBEAT_INTERVAL = 5000;
  const SUBMIT_RETRY_INTERVAL = 15000;
  const EXIT_WARNING_DURATION = 10;

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 5000);
  };

  // Fullscreen API
  const enterFullscreen = async () => {
    try {
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        await elem.requestFullscreen();
      } else if ((elem as any).webkitRequestFullscreen) {
        await (elem as any).webkitRequestFullscreen();
      } else if ((elem as any).msRequestFullscreen) {
        await (elem as any).msRequestFullscreen();
      }
      setIsFullscreen(true);
      return true;
    } catch (err: any) {
      console.error("Fullscreen failed:", err);
      if (err.message?.includes('request') || err.message?.includes('denied')) {
        showToast("⚠️ رفضت إذن الشاشة الكاملة. اسمح للصفحة بالشاشة الكاملة.", "error");
      } else {
        showToast("⚠️ متصفحك مش بيدعم الشاشة الكاملة", "error");
      }
      return false;
    }
  };

  const exitFullscreen = async () => {
    try {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).msFullscreenElement
      );

      if (!isCurrentlyFullscreen) {
        console.log('Already not in fullscreen');
        setIsFullscreen(false);
        return;
      }

      // 🔥 Mark this as intentional exit
      intentionalExitRef.current = true;

      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        await (document as any).webkitExitFullscreen();
      } else if ((document as any).msExitFullscreen) {
        await (document as any).msExitFullscreen();
      }
      setIsFullscreen(false);

      // 🔥 Reset flag after a short delay
      setTimeout(() => {
        intentionalExitRef.current = false;
      }, 500);
    } catch (err) {
      console.error("Exit fullscreen failed:", err);
      setIsFullscreen(false);
      intentionalExitRef.current = false;
    }
  };

  // Countdown timer for warning
  useEffect(() => {
    if (!showBlurWarning) return;

    setWarningCountdown(EXIT_WARNING_DURATION);

    const intervalId = window.setInterval(() => {
      setWarningCountdown(prev => {
        const newCount = prev - 1;

        if (newCount <= 0) {
          clearInterval(intervalId);
          return 0;
        }

        return newCount;
      });
    }, 1000) as unknown as number;

    warningTimerRef.current = intervalId;

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [showBlurWarning]);

  // Submit when countdown reaches zero
  useEffect(() => {
    if (showBlurWarning && warningCountdown === 0) {
      console.log('Time is up! Submitting...');
      void submitInternal(true);
    }
  }, [warningCountdown, showBlurWarning]);

  // Monitor fullscreen changes
  useEffect(() => {
    if (!started || submitted) return;

    const handleFullscreenChange = () => {
      const isNowFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).msFullscreenElement
      );

      setIsFullscreen(isNowFullscreen);

      if (!isNowFullscreen && !showBlurWarning && !showStartConfirm && !showSubmitConfirm && !intentionalExitRef.current) {
        setExitAttempts(prev => {
          const newAttempts = prev + 1;

          setActions(prevActions => [
            ...prevActions,
            {
              type: "fullscreen_exit",
              timestamp: Date.now(),
              attempt: newAttempts,
            },
          ]);

          return newAttempts;
        });

        setShowBlurWarning(true);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("msfullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.removeEventListener("msfullscreenchange", handleFullscreenChange);
    };
  }, [started, submitted, showBlurWarning, showStartConfirm, showSubmitConfirm]);

  // Handle return to fullscreen
  const handleReturnToExam = async () => {
    if (warningTimerRef.current) {
      clearInterval(warningTimerRef.current);
      warningTimerRef.current = null;
    }
    setShowBlurWarning(false);
    await enterFullscreen();

    setActions(prev => [
      ...prev,
      {
        type: "returned_to_fullscreen",
        timestamp: Date.now(),
        after_seconds: EXIT_WARNING_DURATION - warningCountdown,
      },
    ]);
  };

  // Multiple tabs prevention
  useEffect(() => {
    if (!examId || !started) return;

    const tabKey = `exam_${examId}_active_tab`;
    const heartbeatKey = `exam_${examId}_heartbeat`;

    const existingTab = sessionStorage.getItem(tabKey);
    const lastHeartbeat = parseInt(sessionStorage.getItem(heartbeatKey) || "0");
    const now = Date.now();

    if (existingTab && existingTab !== tabId && (now - lastHeartbeat) < 3000) {
      showToast("⚠️ الامتحان مفتوح في تاب تاني! هيتقفل هنا", "error");
      setTimeout(() => {
        router.replace("/");
      }, 2000);
      return;
    }

    sessionStorage.setItem(tabKey, tabId);
    sessionStorage.setItem(heartbeatKey, now.toString());

    const heartbeatInterval = setInterval(() => {
      sessionStorage.setItem(heartbeatKey, Date.now().toString());
    }, 1000);

    const checkInterval = setInterval(() => {
      const currentTab = sessionStorage.getItem(tabKey);
      const currentHeartbeat = parseInt(sessionStorage.getItem(heartbeatKey) || "0");

      if (currentTab && currentTab !== tabId && (Date.now() - currentHeartbeat) < 3000) {
        showToast("⚠️ الامتحان اتفتح في تاب تاني!", "error");
        clearInterval(checkInterval);
        clearInterval(heartbeatInterval);
        router.replace("/");
      }
    }, 2000);

    return () => {
      clearInterval(checkInterval);
      clearInterval(heartbeatInterval);

      const currentTab = sessionStorage.getItem(tabKey);
      if (currentTab === tabId) {
        sessionStorage.removeItem(tabKey);
        sessionStorage.removeItem(heartbeatKey);
      }
    };
  }, [examId, started, tabId, router]);

  // Heartbeat
  useEffect(() => {
    if (!started || submitted) return;

    const sendHeartbeat = () => {
      setActions((prev) => [
        ...prev,
        {
          type: "heartbeat",
          timestamp: Date.now(),
        },
      ]);
    };

    heartbeatRef.current = window.setInterval(
      sendHeartbeat,
      HEARTBEAT_INTERVAL
    ) as unknown as number;

    return () => {
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    };
  }, [started, submitted]);

  // Prevent DevTools and Right Click
  useEffect(() => {
    if (!started || submitted) return;

    const preventDevTools = (e: KeyboardEvent) => {
      // منع F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
        (e.ctrlKey && e.key === 'U')
      ) {
        e.preventDefault();
        showToast("⚠️ ممنوع فتح Developer Tools أثناء الامتحان!", "error");

        setActions(prev => [...prev, {
          type: "devtools_attempt",
          timestamp: Date.now(),
        }]);
      }
    };

    const preventContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      showToast("⚠️ ممنوع الضغط بالزر الأيمن!", "error");

      setActions(prev => [...prev, {
        type: "right_click_attempt",
        timestamp: Date.now(),
      }]);
    };

    const preventCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      showToast("⚠️ ممنوع النسخ أثناء الامتحان!", "error");

      setActions(prev => [...prev, {
        type: "copy_attempt",
        timestamp: Date.now(),
      }]);
    };

    document.addEventListener('keydown', preventDevTools);
    document.addEventListener('contextmenu', preventContextMenu);
    document.addEventListener('copy', preventCopy);

    return () => {
      document.removeEventListener('keydown', preventDevTools);
      document.removeEventListener('contextmenu', preventContextMenu);
      document.removeEventListener('copy', preventCopy);
    };
  }, [started, submitted]);

  // Track tab visibility
  useEffect(() => {
    if (!started || submitted) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setActions(prev => [...prev, {
          type: "tab_hidden",
          timestamp: Date.now(),
        }]);

        showToast("⚠️ مكنتش في صفحة الامتحان!", "error");
      } else {
        setActions(prev => [...prev, {
          type: "tab_visible",
          timestamp: Date.now(),
        }]);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [started, submitted]);

  // Track question time
  useEffect(() => {
    if (questions.length === 0 || !started || currentIndex >= questions.length) return;

    const startTime = Date.now();
    setQuestionStartTime(startTime);

    return () => {
      const now = Date.now();
      const questionId = questions[currentIndex]?.id;

      if (questionId) {
        setActions((prev) => [
          ...prev,
          {
            type: "time_spent",
            questionId: questionId,
            durationMs: now - startTime,
            timestamp: now,
          },
        ]);
      }
    };
  }, [currentIndex, started, questions]);

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
      } catch { }
    })();
  }, []);

  // Auth check
  useEffect(() => {
    if (!authLoading && !user) router.replace("/signin");
  }, [authLoading, user, router]);

  // Load exam
  useEffect(() => {
    if (!examId || !user) return;
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${API_BASE_URL}/routes/exam/get_exam.php?exam_id=${examId}`,
          { credentials: "include" }
        );
        const data = await res.json();
        if (data.status === "success") {
          if (cancelled) return;
          setExamError(null);
          setExamTitle(data.exam.title || "");
          setQuestions(
            Array.isArray(data.exam.questions) ? data.exam.questions : []
          );
          const durationMin = Number(data.exam.duration) || 0;

          switch (data.exam.exam_status) {
            case "completed":
              setSubmitted(true);
              setStarted(false);
              setTimeLeft(0);

              if (data.exam.ai_analysis) {
                try {
                  const analysis = typeof data.exam.ai_analysis === 'string'
                    ? JSON.parse(data.exam.ai_analysis)
                    : data.exam.ai_analysis;
                  setAiAnalysis(analysis);
                } catch (e) {
                  console.error("Failed to parse ai_analysis:", e);
                }
              }
              break;
            case "in_progress":
              setSubmitted(true);
              setStarted(false);
              setTimeLeft(0);
              showToast("الامتحان اتسلم تلقائياً لأنك طلعت من الصفحة", "error");
              break;
            default:
              setStarted(false);
              setTimeLeft(durationMin * 60);
          }

          setTotalTime(durationMin * 60);
        } else {
          setExamError(data.message || "Exam not found");
          showToast(data.message || "Exam not found", "error");
        }
      } catch {
        setExamError("Server connection error");
        showToast("Server connection error", "error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [examId, user]);

  // Autosave
  useEffect(() => {
    if (!started || submitted || !csrfToken) return;

    const saveToServer = async () => {
      setSaving(true);
      try {
        await fetch(
          `${API_BASE_URL}/routes/exam/save_progress.php`,
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
              "X-CSRF-Token": csrfToken,
            },
            body: JSON.stringify({
              exam_id: examId,
              answers_json: answers,
              actions_json: actions,
            }),
          }
        );
      } catch (err) {
        console.error("Autosave failed:", err);
      } finally {
        setSaving(false);
      }
    };

    saveToServer();

    autosaveRef.current = window.setInterval(
      saveToServer,
      AUTO_SAVE_INTERVAL_MS
    ) as unknown as number;

    return () => {
      if (autosaveRef.current) clearInterval(autosaveRef.current);
      autosaveRef.current = null;
    };
  }, [started, submitted, answers, actions, examId, csrfToken, AUTO_SAVE_INTERVAL_MS]);

  // Timer countdown
  useEffect(() => {
    if (!started || submitted || timeLeft <= 0) return;
    timerRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          void submitInternal(true);
          return 0;
        }
        if (!warnedRef.current && prev <= END_WARNING_SECONDS) {
          warnedRef.current = true;
          showToast(
            `باقي ${END_WARNING_SECONDS} ثانية بس! الامتحان هيتسلم تلقائياً`,
            "error"
          );
        }
        return prev - 1;
      });
    }, 1000) as unknown as number;
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [started, submitted, timeLeft, END_WARNING_SECONDS]);

  // Retry mechanism
  useEffect(() => {
    const onOnline = async () => {
      showToast("✅ الإنترنت رجع!", "success");

      if (submitAttemptedRef.current && !submitted && retryingSubmit) {
        showToast("🔄 بنحاول نسلم الامتحان...", "success");
        await submitInternal(true);
      }
    };

    const onOffline = () => {
      showToast("النت مقطوع! لو قفلت الصفحة، الامتحان هيتسلم فاضي, استنى هنا لحد ما يرجع.", "error");
    };

    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, [submitted, retryingSubmit]);

  useEffect(() => {
    if (!retryingSubmit || submitted) return;

    submitRetryRef.current = window.setInterval(async () => {
      if (navigator.onLine) {
        console.log("Retrying submit...");
        await submitInternal(true);
      }
    }, SUBMIT_RETRY_INTERVAL) as unknown as number;

    return () => {
      if (submitRetryRef.current) clearInterval(submitRetryRef.current);
      submitRetryRef.current = null;
    };
  }, [retryingSubmit, submitted]);

  // Beforeunload - IMPROVED
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!submitted && started && !submitAttemptedRef.current) {
        submitAttemptedRef.current = true;

        // بس لو النت شغال، سلم
        if (navigator.onLine) {
          const payload = {
            exam_id: examId,
            answers_json: answers,
            actions_json: actions,
          };

          fetch(`${API_BASE_URL}/routes/exam/submit_exam.php`, {
            method: 'POST',
            keepalive: true,
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              'X-CSRF-Token': csrfToken || '',
            },
            body: JSON.stringify(payload),
          }).catch((err) => {
            console.error("Submit on unload failed:", err);
          });
        } else {
          console.log("Cannot submit on unload: offline");
        }

        e.preventDefault();
        e.returnValue = "⚠️ الامتحان هيتسلم تلقائياً لما تطلع من الصفحة!";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [submitted, started, answers, actions, examId, csrfToken]);

  const handleSelect = (questionId: number, optionIndex: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
    setActions((prev) => [
      ...prev,
      {
        type: "answer_selected",
        questionId,
        optionIndex,
        timestamp: Date.now(),
      },
    ]);
  };

  const handleStartClick = () => {
    setShowStartConfirm(true);
  };

  const handleStartConfirmed = async () => {
    setShowStartConfirm(false);

    if (!csrfToken) {
      showToast("Missing CSRF token. Reload the page.", "error");
      return;
    }

    try {
      await enterFullscreen();
    } catch (err) {
      showToast("⚠️ لازم تسمح بالشاشة الكاملة عشان تبدأ الامتحان", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/routes/exam/start_exam.php`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-Token": csrfToken,
          },
          body: JSON.stringify({ exam_id: examId }),
        }
      );
      const data = await res.json();
      if (data.status === "started") {
        setStarted(true);
        setActions((prev) => [
          ...prev,
          { type: "exam_started", timestamp: Date.now() },
        ]);
        setTimeLeft(data.time_left || totalTime);
        showToast("الامتحان بدأ - بالتوفيق! 🚀", "success");
      } else {
        showToast(data.message || "Unable to start exam", "error");
        await exitFullscreen();
      }
      warnedRef.current = false;
    } catch {
      showToast("Server error when starting exam", "error");
      await exitFullscreen();
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitClick = () => {
    setShowSubmitConfirm(true);
  };

  const handleSubmitConfirmed = async () => {
    setShowSubmitConfirm(false);

    if (isFullscreen) {
      await exitFullscreen();
    }

    await submitInternal(false);
  };

  const submitInternal = async (auto = false) => {
    if (autoSubmitting) return;

    if (submitAttemptedRef.current && !retryingSubmit) return;

    setAutoSubmitting(true);
    submitAttemptedRef.current = true;

    if (showBlurWarning) {
      setShowBlurWarning(false);
      if (warningTimerRef.current) {
        clearInterval(warningTimerRef.current);
        warningTimerRef.current = null;
      }
    }

    if (isFullscreen) {
      await exitFullscreen();
    }

    const payload = {
      exam_id: examId,
      answers_json: answers,
      actions_json: actions,
    };

    if (!navigator.onLine) {
      showToast("⚠️ الإنترنت قاطع! هنحاول نسلم لما يرجع...", "error");
      setRetryingSubmit(true);
      setAutoSubmitting(false);
      return false;
    }

    try {
      if (!csrfToken) throw new Error("no-csrf");

      const res = await fetch(
        `${API_BASE_URL}/routes/exam/submit_exam.php`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-Token": csrfToken,
          },
          body: JSON.stringify(payload),
        }
      );

      const j = await res.json();

      if (j.status === "success") {
        setSubmitted(true);
        setRetryingSubmit(false);
        submitAttemptedRef.current = false;

        if (submitRetryRef.current) clearInterval(submitRetryRef.current);

        showToast(
          auto ? "⏰ الوقت خلص! الامتحان اتسلم تلقائياً" : "✅ الامتحان اتسلم بنجاح!",
          "success"
        );
        void analyzeExam();
        return true;
      } else {
        throw new Error(j.message || "submit-failed");
      }
    } catch (err) {
      console.error("Submit error:", err);

      setRetryingSubmit(true);
      showToast(
        "⚠️ فشل التسليم. هنحاول تاني تلقائياً...",
        "error"
      );
      setAutoSubmitting(false);
      return false;
    }
  };

  const analyzeExam = async () => {
    if (!csrfToken || !examId) return;

    setLoadingAnalysis(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/routes/exam/analyze_exam.php`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-Token": csrfToken,
          },
          body: JSON.stringify({ exam_id: examId }),
        }
      );

      const responseText = await res.text();

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError);
        showToast("Server returned invalid response", "error");
        setLoadingAnalysis(false);
        return;
      }

      if (data.status === "success") {
        setAiAnalysis(data.analysis);
      } else {
        console.error("Analysis Error:", data.message);
        showToast(data.message || "Failed to analyze exam", "error");
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      showToast("Error analyzing exam", "error");
    } finally {
      setLoadingAnalysis(false);
    }
  };

  const progressPercent =
    questions.length > 0
      ? (Object.keys(answers).length / questions.length) * 100
      : 0;
  const currentQuestion =
    questions[currentIndex] ??
    ({ id: 0, question: "No questions", options: [] } as Question);
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  if (authLoading || loading) return <LoaderOverlay />;

  // 🔥 Start Confirmation Modal
  if (showStartConfirm) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <div className="relative max-w-lg w-full bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-indigo-500/50 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">⚠️ تحذير مهم قبل البدء</h2>
          </div>

          <div className="space-y-3 mb-6 text-right">
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <p className="text-indigo-400 font-semibold mb-2">🔒 الشاشة الكاملة:</p>
              <p className="text-gray-300 text-sm">الامتحان هيفتح في الشاشة الكاملة وهيفضل كده طول الوقت</p>
            </div>

            <div className="bg-red-900/20 rounded-lg p-4 border border-red-500/30">
              <p className="text-red-400 font-semibold mb-2">⚠️ لو طلعت من الشاشة الكاملة:</p>
              <ul className="text-gray-300 text-sm space-y-1 mr-4">
                <li>• الامتحان هيتعمله Blur</li>
                <li>• هيبدأ عداد 15 ثانية</li>
                <li>• لو مرجعتش = الامتحان هيتسلم تلقائياً</li>
              </ul>
            </div>

            <div className="bg-green-900/20 rounded-lg p-4 border border-green-500/30">
              <p className="text-green-400 font-semibold mb-2">✓ ملاحظات مهمة:</p>
              <ul className="text-gray-300 text-sm space-y-1 mr-4">
                <li>• إجاباتك بتتحفظ تلقائي كل 10 ثواني</li>
                <li>• متفتحش الامتحان في أكتر من تاب</li>
              </ul>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleStartConfirmed}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-xl font-bold hover:from-indigo-700 hover:to-indigo-600 transition-all duration-200 shadow-lg"
            >
              مستعد - ابدأ الامتحان
            </button>
            <button
              onClick={() => setShowStartConfirm(false)}
              className="px-6 py-3 bg-gray-700 text-white rounded-xl font-medium hover:bg-gray-600 transition-all duration-200"
            >
              إلغاء
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 🔥 Submit Confirmation Modal
  if (showSubmitConfirm) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <div className="relative max-w-md w-full bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-red-500/50 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">تأكيد التسليم</h2>
            <p className="text-gray-300 text-sm">متأكد إنك عاوز تسلم الامتحان؟</p>
          </div>

          <div className="bg-yellow-900/20 rounded-lg p-4 border border-yellow-500/30 mb-6">
            <p className="text-yellow-300 text-sm text-center font-medium">
              ⚠️ التسليم نهائي ومفيش رجوع!
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSubmitConfirmed}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-xl font-bold hover:from-red-700 hover:to-red-600 transition-all duration-200 shadow-lg"
            >
              نعم، سلم الامتحان
            </button>
            <button
              onClick={() => setShowSubmitConfirm(false)}
              className="px-6 py-3 bg-gray-700 text-white rounded-xl font-medium hover:bg-gray-600 transition-all duration-200"
            >
              إلغاء
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Blur Warning Overlay
  if (showBlurWarning && started && !submitted) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div className="absolute inset-0 backdrop-blur-3xl bg-gradient-to-br from-black via-red-950/40 to-black">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,0,0,0.1),transparent_50%)] animate-pulse"></div>
        </div>

        <div className="relative z-10 w-full max-w-xl">
          <div className="absolute -inset-1 bg-gradient-to-r from-red-600 via-red-500 to-red-600 rounded-2xl sm:rounded-3xl blur-xl opacity-75 animate-pulse"></div>

          <div className="relative bg-gradient-to-br from-red-950/95 via-red-900/95 to-red-950/95 backdrop-blur-2xl border-4 border-red-500 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(255,0,0,0.5)]">
            <div className="text-center">
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-5">
                <div className="absolute inset-0 bg-red-500/30 rounded-full animate-ping"></div>
                <div className="relative w-full h-full bg-gradient-to-br from-red-600/40 to-red-800/40 rounded-full flex items-center justify-center border-4 border-red-500/50">
                  <svg className="w-12 h-12 sm:w-14 sm:h-14 text-red-200 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-3 sm:mb-4 drop-shadow-[0_0_30px_rgba(255,255,255,0.5)] animate-pulse">
                ⚠️ تحذير !
              </h1>

              <div className="bg-red-500/20 border-2 border-red-400 rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-4 sm:mb-5">
                <p className="text-base sm:text-lg md:text-xl font-bold text-red-100 mb-1 sm:mb-2 leading-relaxed">
                  خرجت من الشاشة الكاملة!
                </p>
                <p className="text-sm sm:text-base md:text-lg text-red-200 leading-relaxed">
                  ارجع فوراً وإلا الامتحان هيتسلم تلقائياً
                </p>
              </div>

              <div className="mb-4 sm:mb-5 relative">
                <div className="relative inline-block">
                  <svg className="w-32 h-32 sm:w-40 sm:h-40 transform -rotate-90" viewBox="0 0 120 120">
                    <circle
                      cx="60"
                      cy="60"
                      r="54"
                      fill="none"
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth="8"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r="54"
                      fill="none"
                      stroke="url(#gradient)"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${(warningCountdown / EXIT_WARNING_DURATION) * 339.292} 339.292`}
                      className="transition-all duration-1000 ease-linear"
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#ef4444" />
                        <stop offset="100%" stopColor="#dc2626" />
                      </linearGradient>
                    </defs>
                  </svg>

                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-4xl sm:text-5xl md:text-6xl font-black text-white tabular-nums drop-shadow-[0_0_20px_rgba(255,255,255,0.8)] animate-pulse">
                      {warningCountdown}
                    </div>
                    <div className="text-xs sm:text-sm text-red-200 font-semibold mt-1">ثانية متبقية</div>
                  </div>
                </div>
              </div>

              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-900/50 to-red-900/50 border-2 border-yellow-500/50 rounded-full px-4 sm:px-6 py-2 sm:py-2.5 mb-4 sm:mb-5">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="text-yellow-200 text-xs sm:text-sm font-semibold">
                  محاولة خروج رقم: <span className="font-black text-white text-sm sm:text-base">{exitAttempts}</span>
                </span>
              </div>

              <button
                onClick={handleReturnToExam}
                className="w-full group relative px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-white to-gray-100 text-red-900 rounded-xl font-black text-base sm:text-lg md:text-xl shadow-2xl overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.8)]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-100 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z" />
                  </svg>
                  <span>ارجع للامتحان فوراً</span>
                </div>
              </button>

              <p className="mt-3 sm:mt-4 text-red-300 text-xs font-medium animate-pulse">
                لو مرجعتش قبل ما الوقت يخلص، الامتحان هيتسلم تلقائياً!
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (submitted)
    return (
      <section className="w-full min-h-screen flex flex-col items-center justify-start px-4 py-12">
        <div className="max-w-5xl w-full">
          <div className="bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">{examTitle || "Exam"}</h1>
                <p className="text-gray-400">تم تسليم امتحانك بنجاح ✅</p>
                {exitAttempts > 0 && (
                  <p className="text-yellow-400 text-sm mt-2">
                    ⚠️ عدد محاولات الخروج من الشاشة الكاملة: {exitAttempts}
                  </p>
                )}
              </div>
              <button
                onClick={() => router.replace("/")}
                className="px-6 py-3 bg-gray-700/50 hover:bg-gray-700 text-white rounded-xl transition-all duration-200 border border-gray-600/50"
              >
                رجوع للوحة التحكم
              </button>
            </div>
          </div>

          {loadingAnalysis ? (
            <div className="bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-12">
              <div className="flex flex-col items-center justify-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-600 border-t-white"></div>
                <p className="text-gray-300 text-lg">بنحلل امتحانك بالذكاء الاصطناعي...</p>
                <p className="text-gray-500 text-sm">ممكن ياخد شوية وقت</p>
              </div>
            </div>
          ) : aiAnalysis ? (
            <div className="space-y-6">
              {/* Score Card */}
              <div className="bg-gradient-to-br from-gray-800/60 to-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-gray-400 text-sm font-medium mb-2">درجتك</h2>
                    <div className="flex items-baseline gap-3">
                      <span className="text-5xl font-bold text-white">{aiAnalysis.score.correct}</span>
                      <span className="text-2xl text-gray-400">/ {aiAnalysis.score.total}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-6xl font-bold text-white">{aiAnalysis.score.percentage}%</div>
                  </div>
                </div>
                <div className="mt-6 w-full bg-gray-700/50 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-400 h-full rounded-full transition-all duration-1000"
                    style={{ width: `${aiAnalysis.score.percentage}%` }}
                  ></div>
                </div>
              </div>

              {/* Wrong Answers */}
              {aiAnalysis.wrong_answers_explanation.length > 0 && (
                <div className="bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8">
                  <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                    <span className="w-1 h-6 bg-red-500 rounded-full"></span>
                    الإجابات الخاطئة
                  </h3>
                  <div className="space-y-4">
                    {aiAnalysis.wrong_answers_explanation.map((item, idx) => (
                      <div key={idx} className="bg-gray-900/50 rounded-xl p-6 border border-gray-700/30">
                        <p className="text-white font-medium mb-4">{item.question}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                            <span className="text-red-400 text-xs font-medium">اجابتك</span>
                            <p className="text-white mt-1">{item.student_answer}</p>
                          </div>
                          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                            <span className="text-green-400 text-xs font-medium">الإجابة الصحيحة</span>
                            <p className="text-white mt-1">{item.correct_answer}</p>
                          </div>
                        </div>
                        <div className="bg-gray-800/50 rounded-lg p-4 border-l-4 border-blue-500">
                          <p className="text-gray-300 text-sm leading-relaxed">{item.explanation}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Unanswered Questions */}
              {aiAnalysis.unanswered_explanation.length > 0 && (
                <div className="bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8">
                  <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                    <span className="w-1 h-6 bg-yellow-500 rounded-full"></span>
                    الاسئلة اللي مجاوبتش عليها
                  </h3>
                  <div className="space-y-4">
                    {aiAnalysis.unanswered_explanation.map((item, idx) => (
                      <div key={idx} className="bg-gray-900/50 rounded-xl p-6 border border-gray-700/30">
                        <p className="text-white font-medium mb-4">{item.question}</p>
                        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 mb-4">
                          <span className="text-green-400 text-xs font-medium">الإجابة الصحيحة</span>
                          <p className="text-white mt-1">{item.correct_answer}</p>
                        </div>
                        <div className="bg-gray-800/50 rounded-lg p-4 border-l-4 border-blue-500">
                          <p className="text-gray-300 text-sm leading-relaxed">{item.explanation}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Behavior Analysis */}
              <div className="bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                  <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
                  تحليل سلوكك
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700/30">
                    <p className="text-gray-400 text-xs font-medium mb-1">السرعة</p>
                    <p className="text-white font-semibold capitalize">{aiAnalysis.behavior_analysis.speed}</p>
                  </div>
                  <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700/30">
                    <p className="text-gray-400 text-xs font-medium mb-1">الثقة</p>
                    <p className="text-white font-semibold capitalize">{aiAnalysis.behavior_analysis.confidence}</p>
                  </div>
                  <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700/30">
                    <p className="text-gray-400 text-xs font-medium mb-1">تصفح الأسئلة</p>
                    <p className="text-white font-semibold capitalize">{aiAnalysis.behavior_analysis.navigation_pattern}</p>
                  </div>
                  <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700/30">
                    <p className="text-gray-400 text-xs font-medium mb-1">تغييرات الإجابة</p>
                    <p className="text-white font-semibold">{aiAnalysis.behavior_analysis.answer_changes}</p>
                  </div>
                  <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700/30 col-span-2">
                    <p className="text-gray-400 text-xs font-medium mb-1">متوسط وقت السؤال</p>
                    <p className="text-white font-semibold">{aiAnalysis.behavior_analysis.average_time_per_question}</p>
                  </div>
                </div>
                <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700/30">
                  <p className="text-gray-300 text-sm leading-relaxed">{aiAnalysis.behavior_analysis.details}</p>
                </div>
              </div>

              {/* Cheating Suspicion */}
              {aiAnalysis.cheating_suspicion.level !== "none" && (
                <div className="bg-red-500/5 backdrop-blur-xl border border-red-500/20 rounded-2xl p-8">
                  <h3 className="text-xl font-semibold text-red-400 mb-6 flex items-center gap-2">
                    <span className="w-1 h-6 bg-red-500 rounded-full"></span>
                    نشاط الغش
                  </h3>
                  <div className="bg-gray-900/50 rounded-xl p-6 border border-red-500/20 mb-4">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-gray-400 text-sm">مستوى محاولة الغش:</span>
                      <span className="px-4 py-1 bg-red-500/20 text-red-400 rounded-full text-sm font-medium capitalize">
                        {aiAnalysis.cheating_suspicion.level}
                      </span>
                    </div>
                    {aiAnalysis.cheating_suspicion.indicators.length > 0 && (
                      <div className="space-y-2">
                        {aiAnalysis.cheating_suspicion.indicators.map((ind, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <span className="text-red-400 mt-1">•</span>
                            <span className="text-gray-300 text-sm">{ind}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700/30">
                    <p className="text-gray-300 text-sm leading-relaxed">{aiAnalysis.cheating_suspicion.explanation}</p>
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {aiAnalysis.recommendations.length > 0 && (
                <div className="bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8">
                  <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                    <span className="w-1 h-6 bg-purple-500 rounded-full"></span>
                    اقتراحات
                  </h3>
                  <div className="space-y-3">
                    {aiAnalysis.recommendations.map((rec, idx) => (
                      <div key={idx} className="flex items-start gap-3 bg-gray-900/50 rounded-xl p-4 border border-gray-700/30">
                        <span className="flex-shrink-0 w-6 h-6 bg-purple-500/20 text-purple-400 rounded-full flex items-center justify-center text-sm font-medium">
                          {idx + 1}
                        </span>
                        <p className="text-gray-300 text-sm leading-relaxed flex-1">{rec}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Overall Summary */}
              <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-8">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
                  الخلاصة
                </h3>
                <p className="text-gray-300 leading-relaxed">{aiAnalysis.overall_summary}</p>
              </div>
            </div>
          ) : (
            <div className="bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <p className="text-gray-400 text-lg font-semibold mb-2">تحليل الذكاء الاصطناعي غير متاح</p>
                <p className="text-gray-500 text-sm mb-6">حصل خطأ أثناء تحليل امتحانك</p>
                <button
                  onClick={() => analyzeExam()}
                  disabled={loadingAnalysis}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-xl transition-all duration-200 font-medium flex items-center justify-center gap-2 mx-auto"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  إعادة المحاولة
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    );

  if (!started)
    return (
      <section className="w-full min-h-screen flex flex-col items-center justify-start px-4 pt-12">
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
        <div className="max-w-2xl w-full bg-white/5 backdrop-blur-xl border border-white/20 shadow-lg rounded-2xl p-8 text-gray-100 relative overflow-hidden">
          <h1 className="text-2xl font-semibold mb-2">{examTitle || "اختبار"}</h1>
          <p className="text-sm text-gray-100 mb-4">
            الوقت: {Math.ceil(totalTime / 60)} دقائق
          </p>
          <p className="text-sm text-gray-100 mb-6">
            الاسئلة: {questions.length}
          </p>

          {examError && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm">{examError}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleStartClick}
              disabled={!!examError}
              className={`px-5 py-2 rounded-md transition-all ${examError
                ? "bg-gray-600 text-gray-400 cursor-not-allowed opacity-50"
                : "bg-indigo-600 text-white hover:bg-indigo-700"
                }`}
            >
              ابدا الامتحان
            </button>
            <button
              onClick={() => router.replace("/")}
              className="px-4 py-2 border border-white/40 rounded-md text-white hover:bg-white/5"
            >
              إلغاء
            </button>
          </div>
        </div>
      </section>
    );

  return (
    <section className="min-h-screen py-8 px-4">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <div className="max-w-5xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-white">{examTitle}</h2>
            {!isFullscreen && (
              <p className="text-xs text-yellow-400 mt-1">⚠️ مش في الشاشة الكاملة</p>
            )}
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400">الوقت الباقي</div>
            <div className={`text-lg font-mono ${timeLeft <= 30 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
              {minutes}:{String(seconds).padStart(2, "0")}
            </div>
          </div>
        </header>

        <div className="w-full h-2 bg-gray-700 rounded mb-6 overflow-hidden">
          <div
            className="h-2 bg-indigo-600 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="mb-4 flex gap-3 justify-center text-sm">
          {!navigator.onLine && (
            <div className="text-red-400 flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              غير متصل بالإنترنت
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 transition-all max-w-2xl w-full bg-white/5 backdrop-blur-xl border border-white/20 shadow-lg rounded-2xl text-gray-100 relative overflow-hidden p-6">
            <div className="mb-4 text-lg font-medium">
              {currentIndex + 1}. {currentQuestion.question}
            </div>
            <div className="space-y-3">
              {currentQuestion.options.map((opt, i) => {
                const selected = answers[currentQuestion.id] === i;
                return (
                  <button
                    key={i}
                    onClick={() => handleSelect(currentQuestion.id, i)}
                    className={`w-full text-left p-4 rounded-lg border transition ${selected
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-[#030712] border-[#030712] hover:bg-indigo-600 text-white"
                      }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>

          <aside className="max-w-2xl w-full bg-white/5 backdrop-blur-xl border border-white/20 shadow-lg rounded-2xl text-gray-100 relative overflow-hidden p-6 h-fit">
            <div className="mb-4">
              <div className="font-medium">الملخص</div>
              <div className="text-sm text-gray-300 mt-2">
                الاسئلة المجابة: {Object.keys(answers).length} / {questions.length}
              </div>
              <div className="text-xs text-gray-300 mt-1">
                الحفظ التلقائي: {saving ? "يتم الحفظ..." : "✓ تم الحفظ"}
              </div>
              {exitAttempts > 0 && (
                <div className="text-xs text-yellow-400 mt-2">
                  ⚠️ محاولات الخروج: {exitAttempts}
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => {
                  setCurrentIndex((p) => {
                    const newIndex = Math.max(0, p - 1);
                    setActions((prev) => [
                      ...prev,
                      {
                        type: "navigate",
                        from: p,
                        to: newIndex,
                        timestamp: Date.now(),
                      },
                    ]);
                    return newIndex;
                  });
                }}
                className="btn-sm relative bg-linear-to-b from-gray-800 to-gray-800/60 bg-[length:100%_100%] bg-[bottom] py-[5px] text-gray-300 
                               before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:border before:border-transparent 
                               before:[background:linear-gradient(to_right,var(--color-gray-800),var(--color-gray-700),var(--color-gray-800))_border-box] 
                               before:[mask-composite:exclude_!important] before:[mask:linear-gradient(white_0_0)_padding-box,_linear-gradient(white_0_0)] 
                               hover:bg-[length:100%_150%]"
              >
                السابق
              </button>
              <button
                onClick={() => {
                  setCurrentIndex((p) => {
                    const newIndex = Math.min(questions.length - 1, p + 1);
                    setActions((prev) => [
                      ...prev,
                      {
                        type: "navigate",
                        from: p,
                        to: newIndex,
                        timestamp: Date.now(),
                      },
                    ]);
                    return newIndex;
                  });
                }}
                className="btn-sm relative bg-linear-to-b from-gray-800 to-gray-800/60 bg-[length:100%_100%] bg-[bottom] py-[5px] text-gray-300 
                               before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:border before:border-transparent 
                               before:[background:linear-gradient(to_right,var(--color-gray-800),var(--color-gray-700),var(--color-gray-800))_border-box] 
                               before:[mask-composite:exclude_!important] before:[mask:linear-gradient(white_0_0)_padding-box,_linear-gradient(white_0_0)] 
                               hover:bg-[length:100%_150%]"
              >
                التالي
              </button>
              <button
                onClick={handleSubmitClick}
                disabled={retryingSubmit}
                className="mr-auto btn-sm bg-linear-to-t from-indigo-600 to-indigo-500 bg-[length:100%_100%] bg-[bottom] py-[5px] text-white 
                               shadow-[inset_0px_1px_0px_0px_--theme(--color-white/.16)] hover:bg-[length:100%_150%] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                تسليم الامتحان
              </button>
            </div>

            <div className="text-sm text-gray-300 mb-2">الاسئلة</div>
            <div className="flex flex-wrap gap-2">
              {questions.map((q, idx) => {
                const answered = Object.prototype.hasOwnProperty.call(
                  answers,
                  q.id
                );
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`w-10 h-10 rounded flex items-center justify-center text-sm ${idx === currentIndex
                      ? "bg-indigo-600 text-white"
                      : answered
                        ? "bg-green-600 text-white"
                        : "bg-gray-100 text-gray-700"
                      }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
