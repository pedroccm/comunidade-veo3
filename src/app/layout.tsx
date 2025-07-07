import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Criadores de Vídeos",
  description: "Comunidade para criadores de vídeos com IA",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Garantir que as classes sejam consistentes entre servidor e cliente
  const fontClasses = `${geistSans.variable} ${geistMono.variable} antialiased`;

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={fontClasses} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
