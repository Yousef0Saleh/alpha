"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../hooks/useAuth";
import LoaderOverlay from "@/components/LoaderOverlay";
import { API_BASE_URL, API_ROUTES, SITE_URL } from "@/lib/config";

export default function VerifyEmail() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Redirect if already logged in
    if (user) {
      router.push("/dashboard");
      return;
    }

    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      setMessage("رابط التحقق غير صالح");
      return;
    }

    // Verify the token
    verifyEmail(token);
  }, [user, router, searchParams]);

  const verifyEmail = async (token: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/routes/verify-email.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();

      if (res.ok && data.status === "success") {
        setStatus("success");
        setMessage(data.message || "تم تأكيد بريدك الإلكتروني بنجاح!");

        // Redirect to signin after 3 seconds
        setTimeout(() => {
          router.push("/signin");
        }, 3000);
      } else {
        setStatus("error");
        setMessage(data.message || "حدث خطأ أثناء التحقق");
      }
    } catch (error) {
      setStatus("error");
      setMessage("حدث خطأ. حاول مرة أخرى.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {status === "loading" && <LoaderOverlay />}

      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 w-full max-w-md text-center">
        {status === "success" && (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-green-500/20 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white">تم التأكيد بنجاح!</h1>
            <p className="text-gray-300">{message}</p>
            <p className="text-sm text-gray-400">سيتم تحويلك لصفحة تسجيل الدخول...</p>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-red-500/20 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white">خطأ في التحقق</h1>
            <p className="text-gray-300">{message}</p>
            <button
              onClick={() => router.push("/signin")}
              className="mt-4 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
            >
              الذهاب لتسجيل الدخول
            </button>
          </div>
        )}
      </div>
    </div>
  );
}