import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Samuel Shadiva — Full Stack & AI Engineer",
  description:
    "Flutter, Python, and AI engineer based in Nairobi, Kenya. Building mobile apps, autonomous AI agents, and scalable backend systems.",
  openGraph: {
    title: "Samuel Shadiva — Full Stack & AI Engineer",
    description:
      "Flutter, Python, and AI engineer based in Nairobi, Kenya.",
    url: "https://shadivahlabs.com",
    siteName: "Samuel Shadiva",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}