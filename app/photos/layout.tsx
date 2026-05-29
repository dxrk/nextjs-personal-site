import type { Metadata } from "next";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Ben Talesnik",
  description: "CS @ University of Maryland",
};

export default function PhotosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <section>{children}</section>;
}
