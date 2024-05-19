import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/app/globals.css";

import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BBYO Assignments",
  description: "Automated Assignments",
};

export default function AssignmentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <section>{children}</section>;
}
