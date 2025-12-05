// app/hooks/useAdmin.ts
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/config";

interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

export function useAdmin() {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/routes/admin/auth/check_admin.php`,
        { credentials: "include" }
      );

      const data = await res.json();

      if (data.status === "success" && data.user) {
        setAdmin(data.user);
      } else {
        setAdmin(null);
      }
    } catch (error) {
      console.error("Admin check failed:", error);
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch(
        `${API_BASE_URL}/routes/admin/auth/admin_logout.php`,
        {
          method: "POST",
          credentials: "include"
        }
      );

      setAdmin(null);
      router.push("/admin/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return { admin, loading, logout, checkAdmin };
}