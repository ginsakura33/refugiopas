import type { Metadata, Viewport } from "next";
import { Fraunces, Albert_Sans } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["300", "400", "600"],
  style: ["normal", "italic"],
});

const albertSans = Albert_Sans({
  variable: "--font-albert-sans",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "Refugio PAS — Guía y Autohipnosis para Personas Altamente Sensibles",
  description:
    "Calma tu sobrecarga sensorial en 2 minutos con el Orbe que Respira: audios de autohipnosis guiada en español, hechos para personas altamente sensibles.",
  appleWebApp: { capable: true, title: "Refugio PAS", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: "#fff9f5",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${fraunces.variable} ${albertSans.variable} h-full antialiased`}>
      <body className="min-h-dvh flex flex-col">{children}</body>
    </html>
  );
}
