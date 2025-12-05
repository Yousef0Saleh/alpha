"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/app/hooks/useAuth";
import Toast from "@/components/Toast";
import LoaderOverlay from "@/components/LoaderOverlay";
import { API_BASE_URL } from "@/lib/config";

export default function ResetPassword() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();
  const { user, loading } = useAuth();

  // State for request reset flow
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // State for reset password flow
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [tokenEmail, setTokenEmail] = useState("");
  const [verifyingToken, setVerifyingToken] = useState(false);

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: "success" | "error"; exiting?: boolean } | null>(null);

  // Redirect logged-in user
  useEffect(() => {
    if (!loading && user) {
      router.replace("/");
    }
  }, [user, loading, router]);

  // Verify token if present
  useEffect(() => {
    if (token && !verifyingToken && tokenValid === null) {
      verifyToken(token);
    }
  }, [token]);

  const verifyToken = async (tkn: string) => {
    setVerifyingToken(true);
    try {
      const res = await fetch(`${API_BASE_URL}/routes/verify-reset-token.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: tkn }),
        credentials: "include",
      });

      const data = await res.json();

      if (data.status === "success") {
        setTokenValid(true);
        setTokenEmail(data.email || "");
      } else {
        setTokenValid(false);
        setToast({ message: data.message || "الرابط غير صالح", type: "error" });
      }
    } catch {
      setTokenValid(false);
      setToast({ message: "حدث خطأ. حاول مرة أخرى.", type: "error" });
    } finally {
      setVerifyingToken(false);
    }
  };

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    if (!/\S+@\S+\.\S+/.test(email)) {
      setToast({ message: "أدخل بريد إلكتروني صالح", type: "error" });
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/routes/request-password-reset.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
        credentials: "include",
      });

      const data = await res.json();

      if (data.status === "success") {
        setToast({ message: data.message, type: "success" });
        setEmail("");
      } else {
        setToast({ message: data.message || "حدث خطأ", type: "error" });
      }
    } catch {
      setToast({ message: "حدث خطأ. حاول مرة أخرى.", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    if (newPassword.length < 8) {
      setToast({ message: "كلمة السر يجب أن تكون 8 حروف على الأقل", type: "error" });
      setSubmitting(false);
      return;
    }

    if (!/[A-Za-z]/.test(newPassword) || !/\d/.test(newPassword)) {
      setToast({ message: "كلمة السر يجب أن تحتوي على حروف وأرقام", type: "error" });
      setSubmitting(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setToast({ message: "كلمات السر غير متطابقة", type: "error" });
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/routes/reset-password.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: newPassword }),
        credentials: "include",
      });

      const data = await res.json();

      if (data.status === "success") {
        setToast({ message: data.message, type: "success" });
        setTimeout(() => {
          router.push("/signin");
        }, 2000);
      } else {
        setToast({ message: data.message || "حدث خطأ", type: "error" });
      }
    } catch {
      setToast({ message: "حدث خطأ. حاول مرة أخرى.", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast((t) => (t ? { ...t, exiting: true } : null));
        setTimeout(() => setToast(null), 400);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  if (loading || user) return <LoaderOverlay />;
  if (verifyingToken) return <LoaderOverlay />;

  return (
    <section>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="py-12 md:py-20">
          {/* Section header */}
          <div className="pb-12 text-center">
            <h1 className="animate-[gradient_6s_linear_infinite] bg-[linear-gradient(to_right,var(--color-gray-200),var(--color-indigo-200),var(--color-gray-50),var(--color-indigo-300),var(--color-gray-200))] bg-[length:200%_auto] bg-clip-text text-3xl font-semibold text-transparent md:text-4xl">
              {token ? "إعادة تعيين كلمة السر" : "نسيت كلمة السر؟"}
            </h1>
            <p className="mt-4 text-indigo-200/65">
              {token
                ? tokenValid === false
                  ? "الرابط غير صالح أو منتهي الصلاحية"
                  : tokenValid
                    ? `سيتم إعادة تعيين كلمة السر لـ: ${tokenEmail}`
                    : "جاري التحقق..."
                : "أدخل بريدك الإلكتروني وسنرسل لك رابط لإعادة تعيين كلمة السر"}
            </p>
          </div>

          {/* Show reset form if token is valid, otherwise show request form */}
          {token && tokenValid ? (
            // Reset Password Form
            <form className="mx-auto max-w-[400px]" onSubmit={handleResetPassword}>
              <div className="space-y-5">
                <div>
                  <label htmlFor="newPassword" className="mb-1 block text-sm font-medium text-indigo-200/65">
                    كلمة السر الجديدة
                  </label>
                  <input
                    id="newPassword"
                    type="password"
                    className="form-input w-full"
                    placeholder="أدخل كلمة السر الجديدة"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    disabled={submitting}
                  />
                  <p className="mt-1 text-xs text-indigo-200/50">
                    8 حروف على الأقل، يجب أن تحتوي على حروف وأرقام
                  </p>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium text-indigo-200/65">
                    تأكيد كلمة السر
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    className="form-input w-full"
                    placeholder="أعد إدخال كلمة السر"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className="mt-6">
                <button
                  disabled={submitting}
                  className="btn w-full bg-linear-to-t from-indigo-600 to-indigo-500 text-white"
                >
                  {submitting ? "جاري الحفظ..." : "حفظ كلمة السر الجديدة"}
                </button>
              </div>
            </form>
          ) : token && tokenValid === false ? (
            // Invalid token message
            <div className="mx-auto max-w-[400px] text-center">
              <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-6">
                <p className="text-red-400">الرابط غير صالح أو منتهي الصلاحية</p>
                <Link
                  href="/reset-password"
                  className="mt-4 inline-block text-indigo-500 hover:underline"
                >
                  طلب رابط جديد
                </Link>
              </div>
            </div>
          ) : !token ? (
            // Request Reset Form
            <form className="mx-auto max-w-[400px]" onSubmit={handleRequestReset}>
              <div>
                <label htmlFor="email" className="mb-1 block text-sm font-medium text-indigo-200/65">
                  البريد الإلكتروني
                </label>
                <input
                  id="email"
                  type="email"
                  className="form-input w-full"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={submitting}
                />
              </div>

              <div className="mt-6">
                <button
                  disabled={submitting}
                  className="btn w-full bg-linear-to-t from-indigo-600 to-indigo-500 text-white"
                >
                  {submitting ? "جاري الإرسال..." : "إرسال رابط إعادة التعيين"}
                </button>
              </div>

              <div className="mt-6 text-center text-sm text-indigo-200/65">
                تذكرت كلمة السر؟{" "}
                <Link className="font-medium text-indigo-500" href="/signin">
                  تسجيل دخول
                </Link>
              </div>
            </form>
          ) : null}
        </div>
      </div>
    </section>
  );
}