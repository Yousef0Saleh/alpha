"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/hooks/useAuth";
import Toast from "@/components/Toast";
import LoaderOverlay from "@/components/LoaderOverlay";
import { API_BASE_URL } from "@/lib/config";

export default function SignUp() {
  const [formData, setFormData] = useState({ name: "", email: "", password: "", grade: "" });
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error"; exiting?: boolean } | null>(null);

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
        setToast({ message: data.message || "تم التسجيل بنجاح", type: "success" });
        setFormData({ name: "", email: "", password: "", grade: "" });
        router.replace("/signin"); // redirect to login after successful signup
      } else {
        setToast({ message: data.message || "فشل التسجيل", type: "error" });
      }
    } catch {
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
                <input id="password" type="password" className="form-input w-full" value={formData.password} onChange={handleChange} placeholder="Password (min 8 chars)" required />
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
            عندك حساب فعلا؟ <Link className="font-medium text-indigo-500" href="/signin">سجل دخول!</Link>
          </div>
        </div>
      </div>
    </section>
  );
}