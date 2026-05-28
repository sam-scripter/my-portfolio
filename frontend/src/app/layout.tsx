import type { Metadata } from "next"
import { DM_Sans, Space_Grotesk, Geist_Mono } from "next/font/google"
import "./globals.css"

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
})

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  metadataBase: new URL("https://shadivahlabs.com"),
  title: {
    default: "Samuel Shadiva — Full Stack & AI Engineer",
    template: "%s | Samuel Shadiva",
  },
  description:
    "Flutter, Python, and AI engineer based in Nairobi, Kenya. " +
    "Building mobile apps, autonomous AI agents, and scalable backend systems.",
  keywords: [
    "Samuel Shadiva",
    "Flutter developer",
    "Python developer",
    "AI engineer",
    "full stack engineer",
    "mobile app developer",
    "Nairobi",
    "Kenya",
    "software engineer",
    "autonomous AI agents",
  ],
  authors: [{ name: "Samuel Shadiva", url: "https://shadivahlabs.com" }],
  creator: "Samuel Shadiva",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    title: "Samuel Shadiva — Full Stack & AI Engineer",
    description:
      "Flutter, Python, and AI engineer based in Nairobi, Kenya. " +
      "Building mobile apps, autonomous AI agents, and scalable backend systems.",
    url: "https://shadivahlabs.com",
    siteName: "Samuel Shadiva",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Samuel Shadiva — Full Stack & AI Engineer",
    description:
      "Flutter, Python, and AI engineer based in Nairobi, Kenya. " +
      "Building mobile apps, autonomous AI agents, and scalable backend systems.",
    creator: "@samuelshadiva",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body
        className={`${dmSans.variable} ${spaceGrotesk.variable} ${geistMono.variable} antialiased`}
        style={{ background: '#020c1b', color: '#ccd6f6' }}
      >
        {children}
      </body>
    </html>
  )
}