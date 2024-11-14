import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/app/globals.css";

import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BBYO August Execs 2024",
  description: "Room Checks",
};

export default function CheckInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <section>{children}</section>;
}
