"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/hooks/useAuth";
import LoaderOverlay from "@/components/LoaderOverlay";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  FileText,
  MessageSquare,
  FileSpreadsheet,
  Wand2,
  Settings,
  Activity,
  LogOut,
  Home,
  Menu,
  X
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.replace('/');
    }
  }, [loading, user, router]);

  if (loading || !user || user.role !== 'admin') {
    return <LoaderOverlay />;
  }

  const menuItems = [
    { icon: LayoutDashboard, label: 'لوحة التحكم', href: '/admin' },
    { icon: Users, label: 'المستخدمين', href: '/admin/users' },
    { icon: FileText, label: 'الامتحانات', href: '/admin/exams' },
    { icon: MessageSquare, label: 'المحادثات', href: '/admin/chat' },
    { icon: FileSpreadsheet, label: 'الملخصات', href: '/admin/summarizer' },
    { icon: Wand2, label: 'مولد الامتحانات', href: '/admin/exam-generator' },
    { icon: Activity, label: 'سجل النشاطات', href: '/admin/logs' },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white flex">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-4 right-4 z-50 p-2 rounded-xl bg-gray-900/50 backdrop-blur-xl border border-white/10 hover:bg-white/5 transition-colors"
      >
        {isSidebarOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </button>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 right-0 z-40
        w-64 bg-gray-900/50 backdrop-blur-xl border-l lg:border-r lg:border-l-0 border-white/10 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
              <span className="text-xl font-bold">أ</span>
            </div>
            <div>
              <h1 className="text-xl font-bold">لوحة التحكم</h1>
              <p className="text-xs text-gray-500">منصة ألفا</p>
            </div>
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsSidebarOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-colors group"
            >
              <item.icon className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
              <span className="text-gray-300 group-hover:text-white transition-colors">
                {item.label}
              </span>
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 space-y-2">
          <Link
            href="/"
            onClick={() => setIsSidebarOpen(false)}
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-colors group w-full"
          >
            <Home className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
            <span className="text-gray-300 group-hover:text-white transition-colors">
              الموقع الرئيسي
            </span>
          </Link>
          <button
            onClick={() => {
              setIsSidebarOpen(false);
              logout();
            }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 transition-colors group w-full"
          >
            <LogOut className="w-5 h-5 text-gray-400 group-hover:text-red-400 transition-colors" />
            <span className="text-gray-300 group-hover:text-red-400 transition-colors">
              تسجيل الخروج
            </span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
          {children}
        </div>
      </main>
    </div>
  );
}
