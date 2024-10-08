import { Metadata } from "next";

export const metadata: Metadata = {
  title: "IC Launch",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
