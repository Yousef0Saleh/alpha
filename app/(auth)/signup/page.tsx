"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/hooks/useAuth";
import Toast from "@/components/Toast";
import LoaderOverlay from "@/components/LoaderOverlay";
import PasswordStrengthIndicator from "@/components/PasswordStrengthIndicator";
import { API_BASE_URL } from "@/lib/config";

export default function SignUp() {
  const [formData, setFormData] = useState({ name: "", email: "", password: "", grade: "" });
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error"; exiting?: boolean } | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirect logged-in user away
  useEffect(() => {
    if (!loading && user) {
      router.replace("/");
    }
  }, [user, loading, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingSubmit(true);

    if (formData.password.length < 8 || !/\d/.test(formData.password) || !/[A-Za-z]/.test(formData.password)) {
      setToast({ message: "الباسوورد لازم تكون 8 حروف وارقام على الاقل", type: "error" });
      setLoadingSubmit(false);
      return;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setToast({ message: "اكتب ايميل حقيقي", type: "error" });
      setLoadingSubmit(false);
      return;
    }
    if (!formData.grade) {
      setToast({ message: "اختار صفك الدراسي", type: "error" });
      setLoadingSubmit(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/routes/register.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.status === "success" || res.ok) {
        setToast({ message: data.message || "تم إنشاء الحساب بنجاح!", type: "success" });
        setFormData({ name: "", email: "", password: "", grade: "" });
        // Redirect to signin after 1 second
        setTimeout(() => {
          router.push("/signin");
        }, 1000);
      } else {
        setToast({ message: data.message || "فشل التسجيل", type: "error" });
      }
    } catch (err) {
      console.error(err);
      setToast({ message: "مشكلة في السيرفر. جرب تاني بعد شوية.", type: "error" });
    } finally {
      setLoadingSubmit(false);
    }
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(t => t ? { ...t, exiting: true } : null);
        setTimeout(() => setToast(null), 400);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  if (loading || user || loadingSubmit) return <LoaderOverlay />;



  return (
    <section>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="py-12 md:py-20">
          <div className="pb-12 text-center">
            <h1 className="animate-[gradient_6s_linear_infinite] bg-[linear-gradient(to_right,var(--color-gray-200),var(--color-indigo-200),var(--color-gray-50),var(--color-indigo-300),var(--color-gray-200))] bg-[length:200%_auto] bg-clip-text text-3xl font-semibold text-transparent md:text-4xl">
              إنشاء حساب جديد
            </h1>
          </div>

          <form className="mx-auto max-w-[400px]" onSubmit={handleSubmit}>
            <div className="space-y-5">
              <div>
                <label htmlFor="name" className="mb-1 block text-sm font-medium text-indigo-200/65">الإسم *</label>
                <input id="name" type="text" className="form-input w-full" value={formData.name} onChange={handleChange} required />
              </div>
              <div>
                <label htmlFor="email" className="mb-1 block text-sm font-medium text-indigo-200/65">الإيميل الالكتروني *</label>
                <input id="email" type="email" className="form-input w-full" value={formData.email} onChange={handleChange} required />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-indigo-200/65">كلمة السر *</label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className="form-input w-full pl-10"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="كلمة السر (8 حروف على الاقل)"
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
                <PasswordStrengthIndicator password={formData.password} />
              </div>
              <div>
                <label htmlFor="grade" className="block text-sm font-medium text-indigo-200/65">السنة الدراسية *</label>
                <select id="grade" className="form-input w-full pr-8" value={formData.grade} onChange={handleChange} required>
                  <option value="">اختار السنة</option>
                  <option value="first">الاول الثانوي</option>
                  <option value="second">الثاني الثانوي</option>
                  <option value="third">الثالث الثانوي</option>
                </select>
              </div>
            </div>

            <div className="mt-6 space-y-5">
              <button disabled={loadingSubmit} className="btn w-full bg-linear-to-t from-indigo-600 to-indigo-500 text-white">
                {loadingSubmit ? "بنسجلك..." : "إنشاء حساب"}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm text-indigo-200/65">
            عندك حساب فعلا? <Link className="font-medium text-indigo-500" href="/signin">سجل دخول!</Link>
          </div>
        </div>
      </div>
    </section>
  );
}