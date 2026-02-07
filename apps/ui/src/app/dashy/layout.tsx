import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Munir Lab - Dashy",
  description: "Personal Dashboard",
};

export default function DashyLayout({
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
