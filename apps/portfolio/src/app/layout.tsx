import type { Metadata } from "next";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Providers } from "@/app/providers";
import { GoogleTagManager, GoogleTagManagerNoScript } from '@/utils/googleTag';
import FontManager from '@/utils/font';
import "../index.css";

export const metadata: Metadata = {
  title: "Munir Mardinli – Portfolio",
  description: "Professionelles Portfolio von Munir Mardinli – Entwickler, kreativ, analytisch und lösungsorientiert. Entdecken Sie meine Projekte und Fähigkeiten.",
  authors: [{ name: "Munir Mardinli" }],
  openGraph: {
    title: "Munir Mardinli – Portfolio",
    description: "Professionelles Portfolio – Projekte, Skills und Erfahrung auf einen Blick.",
    type: "website",
    images: ["/api/portfolio/opengraph.png"],
  },
  twitter: {
    card: "summary_large_image",
    site: "@munirmardinli",
    images: ["/api/portfolio/opengraph.png"]
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" suppressHydrationWarning data-scroll-behavior="smooth" dir="ltr" className={`${FontManager.FontCompany.className}`}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link
          rel="sitemap"
          type="application/xml"
          href="/portfolio/sitemap.xml"
        />
        <link
          rel="manifest"
          href="/portfolio/manifest.webmanifest"
        />
        <meta name="robots" content="index, follow" />
        <meta name="theme-color" content="#000000" />
        <GoogleTagManager />
      </head>
      <body className="antialiased tracking-tight">
        <GoogleTagManagerNoScript />
        <Providers>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            {children}
          </TooltipProvider>
        </Providers>
      </body>
    </html>
  );
}
