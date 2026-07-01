import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from '@/components/ThemeProvider'

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ExamPlanner | Smart Study System",
  description: "AI-powered exam preparation and study planning",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable} h-full antialiased dark`}
      suppressHydrationWarning
    >
      <head>
        {/* Inline script to prevent FOUC */}
        <script dangerouslySetInnerHTML={{
          __html: `
            try {
              const t = localStorage.getItem('exam-planner-theme') || 'dark';
              document.documentElement.classList.toggle('dark', t === 'dark');
            } catch(e) {}
          `
        }} />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased transition-colors duration-300 flex flex-col">
        <ThemeProvider>
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              className: '!bg-white/10 !backdrop-blur-xl !text-white !border !border-white/20 !rounded-2xl !shadow-2xl',
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
