"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/app/hooks/useAuth";
import LoaderOverlay from "../LoaderOverlay";
import { API_BASE_URL } from "@/lib/config";

export default function LogoutButton() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/routes/logout.php`,
        {
          method: "POST",
          credentials: "include",
        }
      );
      const data = await res.json();

      if (data.status === "success") {
        setUser(null);
        router.replace("/signin");
      } else {
        alert(data.message || "Logout failed");
      }
    } catch {
      alert("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && <LoaderOverlay />}
      <button
        onClick={handleLogout}
        className="btn-sm relative bg-linear-to-b from-gray-800 to-gray-800/60 bg-[length:100%_100%] bg-[bottom] py-[5px] text-gray-300 
                               before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:border before:border-transparent 
                               before:[background:linear-gradient(to_right,var(--color-gray-800),var(--color-gray-700),var(--color-gray-800))_border-box] 
                               before:[mask-composite:exclude_!important] before:[mask:linear-gradient(white_0_0)_padding-box,_linear-gradient(white_0_0)] 
                               hover:bg-[length:100%_150%]"
      >
        تسجيل خروج
      </button>
    </>
  );
}
