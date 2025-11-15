import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ICCIET 2025 - Results & Rankings",
  description: "Final results and rankings for ICCIET 2025 conference judging",
};

export default function ResultsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
