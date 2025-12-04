"use client";

export default function LoaderOverlay() {
  return (
    <div  style={{backdropFilter: "blur(20px)"}} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-16 h-16 border-4 border-t-indigo-500 border-r-transparent border-b-indigo-500 border-l-transparent rounded-full animate-spin"></div>
    </div>
  );
}