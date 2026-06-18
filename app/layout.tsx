import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import { Toaster } from "@/components/ui/toaster";
import { Background } from "@/components/ui/background";

const ABC_Diatype = localFont({
  src: "./fonts/ABCDiatype-Medium.woff2",
  display: "swap",
});

const HeadingNow = localFont({
  src: "./fonts/HeadingNow-87Extrabold.otf",
  display: "swap",
  variable: "--font-heading",
});

export const metadata: Metadata = {};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={HeadingNow.variable}>
      <body className={ABC_Diatype.className}>
        <Background>{children}</Background>
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
