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
  const [submitting, setSubmitting] = useState(false);
  const [clientError, setClientError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error"; exiting?: boolean } | null>(null);

  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirect logged-in user to home
  useEffect(() => {
    if (!loading && user) {
      router.replace("/");
    }
  }, [user, loading, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setToast({ message: "Please enter a valid email", type: "error" });
      setSubmitting(false);
      return;
    }
    if (formData.password.length < 8) {
      setToast({ message: "Password must be at least 8 characters", type: "error" });
      setSubmitting(false);
      return;
    }


    setClientError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/routes/login.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: "include",
      });

      const data = await res.json();

      if (data.status === "success") {
        setToast({ message: data.message || "Login successful", type: "success" });
        setFormData({ email: "", password: "" });
        router.replace("/"); // redirect after login
      } else {
        setToast({ message: data.message || "Invalid credentials", type: "error" });
      }
    } catch {
      setToast({ message: "Server error. Please try again.", type: "error" });
    } finally {
      setSubmitting(false);
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

  if (loading || user || submitting) return <LoaderOverlay />;

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
                <input id="password" type="password" className="form-input w-full" value={formData.password} onChange={handleChange} required />
              </div>
              {clientError && <p className="text-red-500 text-sm">{clientError}</p>}
            </div>

            <div className="mt-6 space-y-5">
              <button disabled={submitting} className="btn w-full bg-linear-to-t from-indigo-600 to-indigo-500 text-white">
                {submitting ? "ثواني بنسجلك..." : "تسجيل دخول"}
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