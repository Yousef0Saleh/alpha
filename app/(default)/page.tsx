"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/hooks/useAuth";
import PageIllustration from "@/components/page-illustration";
import Hero from "@/components/hero-home";
import Workflows from "@/components/workflows";
import Features from "@/components/features";
import Cta from "@/components/cta";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirect to dashboard if user is logged in
  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  // Show loader while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-800 border-t-white"></div>
      </div>
    );
  }

  // Show landing page for non-authenticated users
  if (!user) {
    return (
      <>
        <PageIllustration />
        <Hero />
        <Workflows />
        <Features />
        <Cta />
      </>
    );
  }

  // Return null while redirecting
  return null;
}
