import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Munir Lab - Learn",
  description: "Personal Dashboard",
};

export default function LearnLayout({
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
