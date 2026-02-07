import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Munir Lab - Portfolio",
  description: "Personal Dashboard",
};

export default function PortfolioLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Suspense>
      {children}
    </Suspense>
  );
}
