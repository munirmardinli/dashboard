import type { Metadata } from "next";

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
    <>{ children }</>
  );
}
