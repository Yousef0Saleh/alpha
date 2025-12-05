"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/config";

interface SessionTimeoutWarningProps {
  warningMinutes?: number; // Minutes before timeout to show warning
  sessionDuration?: number; // Total session duration in minutes
}

export default function SessionTimeoutWarning({
  warningMinutes = 5,
  sessionDuration = 30
}: SessionTimeoutWarningProps) {
  const [showWarning, setShowWarning] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const router = useRouter();

  // Update last activity on user interaction
  useEffect(() => {
    const updateActivity = () => {
      setLastActivity(Date.now());
      setShowWarning(false);
    };

    // Listen to user activity
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      window.addEventListener(event, updateActivity);
    });

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, updateActivity);
      });
    };
  }, []);

  // Check session timeout
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const timeSinceActivity = (now - lastActivity) / 1000 / 60; // minutes
      const timeUntilTimeout = sessionDuration - timeSinceActivity;

      if (timeUntilTimeout <= 0) {
        // Session expired
        clearInterval(interval);
        router.push('/signin?session_expired=true');
      } else if (timeUntilTimeout <= warningMinutes && !showWarning) {
        // Show warning
        setShowWarning(true);
        setRemainingTime(Math.ceil(timeUntilTimeout));
      } else if (timeUntilTimeout > warningMinutes && showWarning) {
        // Hide warning if user became active
        setShowWarning(false);
      }

      if (showWarning) {
        setRemainingTime(Math.ceil(timeUntilTimeout));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lastActivity, sessionDuration, warningMinutes, showWarning, router]);

  const handleExtendSession = async () => {
    try {
      // Call backend to extend session
      await fetch(`${API_BASE_URL}/routes/session.php`, {
        method: "GET",
        credentials: "include",
      });

      setLastActivity(Date.now());
      setShowWarning(false);
    } catch (error) {
      console.error("Failed to extend session:", error);
    }
  };

  const handleLogout = () => {
    router.push('/signin');
  };

  if (!showWarning) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="mx-4 max-w-md rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 p-6 shadow-2xl border border-gray-700">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-full bg-yellow-500/20 p-3">
            <svg className="h-6 w-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">انتهاء الجلسة قريباً</h3>
            <p className="text-sm text-gray-400">
              ستنتهي جلستك خلال {remainingTime} {remainingTime === 1 ? 'دقيقة' : 'دقائق'}
            </p>
          </div>
        </div>

        <p className="mb-6 text-sm text-gray-300">
          هل تريد الاستمرار في استخدام المنصة؟
        </p>

        <div className="flex gap-3">
          <button
            onClick={handleExtendSession}
            className="flex-1 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-500 px-4 py-2.5 text-sm font-medium text-white hover:from-indigo-700 hover:to-indigo-600 transition"
          >
            تمديد الجلسة
          </button>
          <button
            onClick={handleLogout}
            className="rounded-lg border border-gray-600 px-4 py-2.5 text-sm font-medium text-gray-300 hover:bg-gray-800 transition"
          >
            تسجيل خروج
          </button>
        </div>
      </div>
    </div>
  );
}
