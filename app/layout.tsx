import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import { Toaster } from "@/components/ui/toaster";

const ABC_Diatype = localFont({
  src: "./fonts/ABCDiatype-Medium.woff2",
  display: "swap",
});

export const metadata: Metadata = {};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={ABC_Diatype.className}>
        {children}
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
