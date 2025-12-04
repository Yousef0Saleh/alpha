import "./css/style.css";

import { Inter, Cairo } from "next/font/google";
import localFont from "next/font/local";

import { AuthProvider } from "@/app/hooks/useAuth";
import { ThemeProvider } from "@/app/context/ThemeContext";
import LayoutContent from "@/components/LayoutContent";

// Inter Font
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Cairo Font (Arabic)
const cairo = Cairo({
  subsets: ["arabic"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-cairo",
  display: "swap",
});

// Local Font
const nacelle = localFont({
  src: [
    { path: "../public/fonts/nacelle-regular.woff2", weight: "400", style: "normal" },
    { path: "../public/fonts/nacelle-italic.woff2", weight: "400", style: "italic" },
    { path: "../public/fonts/nacelle-semibold.woff2", weight: "600", style: "normal" },
    { path: "../public/fonts/nacelle-semibolditalic.woff2", weight: "600", style: "italic" },
  ],
  variable: "--font-nacelle",
  display: "swap",
});

export const metadata = {
  metadataBase: new URL('http://192.168.1.5:3000'),
  title: {
    default: "ألفا AI - منصة التعليم الذكية الأولى في مصر",
    template: "%s | ألفا AI"
  },
  description: "منصة تعليمية ثورية مدعومة بالذكاء الاصطناعي - بنك امتحانات ذكي، مولد امتحانات AI، رفيق دراسة، وملخص ملفات فوري. كل ما تحتاجه للتفوق الأكاديمي في مكان واحد.",
  keywords: ["ألفا", "منصة تعليمية", "ذكاء اصطناعي", "AI", "امتحانات", "مصر", "تعليم", "دراسة", "طلاب", "مذاكرة", "exam", "education"],
  authors: [{ name: "ألفا AI" }],
  creator: "ألفا AI",
  publisher: "ألفا AI",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'ar_EG',
    url: 'http://192.168.1.5:3000',
    title: "ألفا AI - منصة التعليم الذكية الأولى في مصر",
    description: "منصة تعليمية ثورية مدعومة بالذكاء الاصطناعي - كل ما تحتاجه للتفوق الأكاديمي",
    siteName: "ألفا AI",
  },
  twitter: {
    card: 'summary_large_image',
    title: "ألفا AI - منصة التعليم الذكية",
    description: "منصة تعليمية ثورية مدعومة بالذكاء الاصطناعي",
  },
  verification: {
    // Add Google Search Console verification here when ready
    // google: 'your-verification-code',
  },
  alternates: {
    canonical: 'http://192.168.1.5:3000',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#6366f1" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body
        className={`
          ${inter.variable} 
          ${cairo.variable}
          ${nacelle.variable}
          bg-gray-950
          text-base text-gray-200
          antialiased
          font-cairo
          transition-colors duration-300
        `}
      >
        <ThemeProvider>
          <AuthProvider>
            <LayoutContent>
              {children}
            </LayoutContent>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}