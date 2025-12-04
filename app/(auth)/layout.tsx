"use client";

import PageIllustration from "@/components/page-illustration";
import { AuthProvider } from "@/app/hooks/useAuth";
import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <main className="relative flex grow flex-col">
        <PageIllustration />
        {children}
      </main>
    </AuthProvider>
  );
}