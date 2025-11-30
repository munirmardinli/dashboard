import { Navigation } from "@/app/default";
import { ReactNode } from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  authors: [
    {
      name: "Munir Mardinli",
      url: "https://munirmardinli.github.io",
    }
  ],
  publisher: "Munir Mardinli",
  icons: {
    icon: "/favicon.ico",
  },
  manifest: "/site.webmanifest",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    }
  }
}

export default function QueryLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <>
      <Navigation />
      {children}</>
  );
}
