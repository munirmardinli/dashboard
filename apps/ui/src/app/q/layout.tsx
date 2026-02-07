"use client";
import { Navigation } from "@/app/default";
import { ReactNode, Suspense } from "react";
import { useIsDesktop } from "@/hooks/useMediaQuery";

export default function QueryLayout({ children }: Readonly<{ children: ReactNode }>) {
  const isDesktop = useIsDesktop();

  return (
    <Suspense>
      <Navigation />
      <div style={{
        marginLeft: isDesktop ? '280px' : '0',
        width: isDesktop ? 'calc(100% - 280px)' : '100%',
        transition: 'margin-left 0.3s ease',
      }}>
        {children}
      </div>
    </Suspense>
  );
}
