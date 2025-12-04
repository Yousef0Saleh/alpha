"use client";

import { useAuth } from "@/app/hooks/useAuth";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminFloatingButton() {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  // Don't show if loading or user is not admin
  if (loading || !user || user.role !== "admin") return null;

  // Don't show if already on admin page
  if (pathname?.startsWith("/admin")) return null;

  return (
    <Link
      href="/admin"
      className="fixed bottom-8 left-8 z-50 group"
      aria-label="لوحة تحكم الأدمن"
    >
      <div className="relative">
        {/* Main Button */}
        <div className="bg-gradient-to-br from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-full p-4 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-110 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </div>

        {/* Tooltip */}
        <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
          <div className="bg-gray-900 text-white px-3 py-2 rounded-lg text-sm font-medium shadow-xl border border-gray-800">
            لوحة تحكم الأدمن
            <div className="absolute right-full top-1/2 -translate-y-1/2 border-8 border-transparent border-l-gray-900"></div>
          </div>
        </div>

        {/* Pulse Animation */}
        <div className="absolute inset-0 rounded-full bg-purple-600 opacity-75 animate-ping"></div>
      </div>
    </Link>
  );
}
