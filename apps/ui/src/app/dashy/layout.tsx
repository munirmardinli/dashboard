import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Munir Lab - Dashy",
  description: "Personal Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>{ children }</>
  );
}
