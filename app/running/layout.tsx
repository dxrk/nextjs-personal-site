import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/app/globals.css";

import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ben Talesnik",
  description: "CS @ University of Maryland",
};

export default function RunningLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <section>{children}</section>;
}
