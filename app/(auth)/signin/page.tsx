"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/hooks/useAuth";
import Toast from "@/components/Toast";
import LoaderOverlay from "@/components/LoaderOverlay";
import { API_BASE_URL } from "@/lib/config";

export default function SignIn() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [clientError, setClientError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error"; exiting?: boolean } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Redirect logged-in user to dashboard
  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/dashboard");
    }
  }, [user, authLoading, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/routes/login.php`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, rememberMe }),
      });

      // قراءة الـ response كـ text أولاً
      const responseText = await res.text();
      let data;
      let errorDetails = "";

      // محاولة قراءة الـ response كـ JSON
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        // لو السيرفر رجع حاجة مش JSON (مثلاً HTML error page)
        console.group("❌ خطأ في السيرفر - محتوى غير صحيح");
        console.error("HTTP Status:", res.status, res.statusText);
        console.error("Content-Type:", res.headers.get("content-type"));
        console.error("المحتوى الكامل من السيرفر:");
        console.log(responseText);
        console.groupEnd();

        setToast({
          message: `خطأ في السيرفر (${res.status}): السيرفر رجع محتوى غير صحيح.\n\nافتح Console (F12) وشوف تفاصيل المحتوى الكامل`,
          type: "error"
        });
        setLoading(false);
        return;
      }

      if (res.ok && data.status === "success") {
        setToast({ message: "تم تسجيل الدخول بنجاح!", type: "success" });
        setTimeout(() => {
          window.location.href = "/";
        }, 500);
      } else {
        // السيرفر رجع JSON لكن فيه مشكلة
        console.group("❌ خطأ من السيرفر");
        console.error("HTTP Status:", res.status, res.statusText);
        console.error("رسالة السيرفر:", data.message || 'لا توجد رسالة');
        console.error("حالة الاستجابة:", data.status || 'غير محدد');

        // إضافة تفاصيل إضافية لو موجودة
        if (data.error) {
          console.error("تفاصيل الخطأ:", data.error);
        }
        if (data.details) {
          console.error("معلومات إضافية:", data.details);
        }

        console.error("الـ Response الكامل:", data);
        console.groupEnd();

        // عرض رسالة مفصلة للمستخدم
        const userMessage = data.message || "فشل تسجيل الدخول";
        const statusInfo = res.status !== 200 ? ` (خطأ ${res.status})` : '';

        setToast({
          message: `${userMessage}${statusInfo}\n\nافتح Console (F12) للتفاصيل الكاملة`,
          type: "error"
        });
      }
    } catch (error) {
      // مشكلة في الاتصال نفسه (network error)
      console.group("❌ مشكلة في الاتصال بالسيرفر");
      console.error("نوع الخطأ:", "Network Error");
      console.error("التفاصيل:", error instanceof Error ? error.message : 'خطأ غير معروف');
      console.error("السيرفر:", `${API_BASE_URL}/routes/login.php`);
      console.error("الخطأ الكامل:", error);
      console.groupEnd();

      setToast({
        message: "مشكلة في الاتصال بالسيرفر.\nتأكد من الإنترنت أو إن السيرفر شغال.\n\nافتح Console (F12) للتفاصيل",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast((t) => (t ? { ...t, exiting: true } : null));
        setTimeout(() => setToast(null), 400);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  if (authLoading || user || loading) return <LoaderOverlay />;

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
          <div className="pb-12 text-center">
            <h1 className="animate-[gradient_6s_linear_infinite] bg-[linear-gradient(to_right,var(--color-gray-200),var(--color-indigo-200),var(--color-gray-50),var(--color-indigo-300),var(--color-gray-200))] bg-[length:200%_auto] bg-clip-text text-3xl font-semibold text-transparent md:text-4xl">
              حمدلله عـ السلامة!
            </h1>
          </div>

          <form className="mx-auto max-w-[400px]" onSubmit={handleSubmit}>
            <div className="space-y-5">
              <div>
                <label htmlFor="email" className="mb-1 block text-sm font-medium text-indigo-200/65">البريد الإلكتروني</label>
                <input id="email" type="email" className="form-input w-full" value={formData.email} onChange={handleChange} required />
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between gap-3">
                  <label htmlFor="password" className="block text-sm font-medium text-indigo-200/65">كلمة السر</label>
                  <Link className="text-sm text-gray-600 hover:underline" href="/reset-password">نسيت كلمة السر؟</Link>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className="form-input w-full pl-10"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>



            <div className="mt-4 flex items-center">
              <input
                id="rememberMe"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-indigo-600 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0"
              />
              <label htmlFor="rememberMe" className="mr-2 text-sm text-gray-300 cursor-pointer">
                تذكرني لمدة 30 يوم
              </label>
            </div>

            <div className="mt-6 space-y-5">
              <button disabled={loading} className="btn w-full bg-linear-to-t from-indigo-600 to-indigo-500 text-white">
                {loading ? "ثواني بنسجلك..." : "تسجيل دخول"}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm text-indigo-200/65">
            معندكش حساب؟ <Link className="font-medium text-indigo-500" href="/signup">اعمل واحد دلوقتي!</Link>
          </div>
        </div>
      </div>
    </section>
  );
}