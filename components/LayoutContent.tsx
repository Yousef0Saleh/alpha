"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/ui/header";
import AdminFloatingButton from "@/components/AdminFloatingButton";
import SessionTimeoutWarning from "@/components/SessionTimeoutWarning";
import { useAuth } from "@/app/hooks/useAuth";

export default function LayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user } = useAuth();

  // Check if current path is an exam page
  const isExamPage = pathname?.startsWith("/exam/");
  const isAdminPanel = pathname?.startsWith("/admin");

  return (
    <div className="flex min-h-screen flex-col overflow-hidden supports-[overflow:clip]:overflow-clip">
      {/* Show Header only if NOT on exam page */}
      {!isExamPage && !isAdminPanel && <Header />}
      {children}

      {/* Admin Floating Button - Shows only for admins */}
      <AdminFloatingButton />

      {/* Session Timeout Warning - Shows only for logged-in users */}
      {user && <SessionTimeoutWarning />}
    </div>
  );
}