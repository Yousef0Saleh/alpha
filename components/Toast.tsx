"use client";

import { useEffect, useState } from "react";

interface ToastProps {
  message: string;
  type?: "success" | "error";
  onClose: () => void;
  index?: number; // For stacking
}

export default function Toast({ message, type = "success", onClose, index = 0 }: ToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <>
      {message && (
        <div
          style={{
            position: "fixed",
            top: `${20 + index * 80}px`, // Stack toasts vertically
            right: visible ? "20px" : "-400px",
            zIndex: 9999 - index, // Higher toasts have higher z-index
            padding: "12px 20px",
            borderRadius: "20px",
            background: type === "error"
              ? "linear-gradient(180deg, rgba(255,100,100,0.3) 0%, rgba(200,50,50,0.3) 100%)"
              : "linear-gradient(180deg, rgba(255,255,255,0.2) 0%, rgba(201,201,201,0.2) 9%, rgba(161,161,161,0.2) 32%, rgba(117,117,117,0.2) 73%, rgba(255,255,255,0.2) 100%)",
            backdropFilter: "blur(20px)",
            border: `1px solid ${type === "error" ? "rgba(255,100,100,0.5)" : "rgba(255,255,255,0.3)"}`,
            boxShadow: "0.1px 1px 0.5px rgba(0,0,0,0), 0.16px 2.38px 1.19px rgba(0,0,0,0), 0.29px 4.36px 2.18px rgba(0,0,0,0.01), 0.48px 7.24px 3.62px rgba(0,0,0,0.01), 0.77px 11.69px 5.86px rgba(0,0,0,0.02), 1.27px 19.14px 9.59px rgba(0,0,0,0.03), 2.19px 32.97px 16.52px rgba(0,0,0,0.05), 4px 60px 30px rgba(0,0,0,0.1)",
            color: "white",
            display: "inline-flex",
            justifyContent: "space-between",
            alignItems: "center",
            maxWidth: "calc(100% - 40px)",
            lineHeight: "1.3",
            fontSize: "14px",
            transition: "all 0.3s ease",
            opacity: visible ? 1 : 0,
          }}
        >
          <span>{message}</span>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "rgba(255,255,255,0.8)",
              fontWeight: "bold",
              cursor: "pointer",
              marginRight: "12px",
            }}
          >
            ✕
          </button>
        </div>
      )}
    </>
  );
}