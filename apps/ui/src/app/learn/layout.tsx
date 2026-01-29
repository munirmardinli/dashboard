import type { Metadata } from "next";

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
    <>{ children }</>
  );
}
