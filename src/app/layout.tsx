import type { Metadata } from "next";
import { IBM_Plex_Mono, Manrope } from "next/font/google";
import { InitialSplash } from "@/app/initial-splash";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "SliceQ",
  description:
    "Bedah quran per ayat dengan pendekatan kritis, non-apologis, dan fokus pada anotasi, kritik, serta konteks.",
  icons: {
    icon: "/brand/sliceq-icon.webp",
    shortcut: "/brand/sliceq-icon.webp",
    apple: "/brand/sliceq-icon.webp",
  },
  openGraph: {
    title: "SliceQ",
    description:
      "Bedah quran per ayat dengan pendekatan kritis, non-apologis, dan fokus pada anotasi, kritik, serta konteks.",
    images: [
      {
        url: "/brand/sliceq-icon.webp",
        width: 512,
        height: 512,
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${manrope.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-stone-50 text-slate-950">
        <InitialSplash />
        {children}
      </body>
    </html>
  );
}
