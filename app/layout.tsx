/** @format */

import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "../components/ThemeProvider";
import AuthProvider from "../components/AuthProvider";
import { Toaster } from "react-hot-toast";

// Inter Font - Normal
const inter = localFont({
  src: [
    {
      path: "../fonts/Inter/Inter-VariableFont_opsz,wght.ttf",
      weight: "100 900",
      style: "normal",
    },
  ],
  variable: "--font-inter",
  display: "swap",
  preload: false, // Disable preload to avoid browser warning
  adjustFontFallback: "Arial",
  fallback: [
    "system-ui",
    "-apple-system",
    "BlinkMacSystemFont",
    "Segoe UI",
    "sans-serif",
  ],
});

// Inter Font - Italic (loaded on-demand, not preloaded to avoid warning)
const interItalic = localFont({
  src: [
    {
      path: "../fonts/Inter/Inter-Italic-VariableFont_opsz,wght.ttf",
      weight: "100 900",
      style: "italic",
    },
  ],
  variable: "--font-inter-italic",
  display: "swap",
  preload: false, // Don't preload italic to avoid preload warning
  adjustFontFallback: false,
});

export const metadata: Metadata = {
  title: "UPPD/SAMSAT JAYAPURA - Prediksi Pendapatan Pajak Kendaraan Bermotor",
  description:
    "Sistem Prediksi Pendapatan Pajak Kendaraan Bermotor di UPPD/SAMSAT JAYAPURA Menggunakan Metode Exponential Smoothing",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={`${inter.variable} ${interItalic.variable}`}
      style={{
        fontFamily: "var(--font-inter), system-ui, -apple-system, sans-serif",
      }}
    >
      <body
        className={`${inter.variable} ${interItalic.variable} bg-base-100`}
        style={{
          fontFamily: "var(--font-inter), system-ui, -apple-system, sans-serif",
        }}
      >
        <ThemeProvider>
          <AuthProvider>
            {children}
            <Toaster position="top-right" />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
