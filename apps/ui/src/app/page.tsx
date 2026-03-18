"use client";

import { useThemeStore } from "@/stores/themeStore";
import { getTheme } from "@/utils/theme";
import { useSearchParams } from 'next/navigation';
import { Suspense, useMemo } from "react";
import { Navigation } from "@/app/default";
import { useIsDesktop } from "@/hooks/useMediaQuery";
import Loading from "@/app/loading";

import DashyPage from "@/router/dashy";
import DocsPage from "@/router/docs";
import LearnPage from "@/router/learn";
import PortfolioPage from "@/router/portfolio";
import QueryPage from "@/router/q";
import QuittungPage from "@/router/quittung";
import RootPage from "@/router/root";

export default function Root() {
  const searchParams = useSearchParams();
  const q = searchParams?.get('q');
  const mode = useThemeStore((state) => state.mode);
  const theme = getTheme(mode);
  const isDesktop = useIsDesktop();
  const viewComponent = useMemo(() => {
    if (!q) return <RootPage />;
    switch (q) {
      case 'dashy': return <DashyPage />;
      case 'docs': return <DocsPage />;
      case 'learn': return <LearnPage />;
      case 'portfolio': return <PortfolioPage />;
      case 'q': return <QueryPage />;
      case 'quittung': return <QuittungPage />;
      default: return <QueryPage />;
    }
  }, [q]);

  if (q && viewComponent) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: isDesktop ? 'row' : 'column',
        minHeight: '100vh',
        background: theme.bg
      }}>
        <Navigation />
        <div style={{
          flex: 1,
          marginLeft: isDesktop ? '280px' : '0',
          width: isDesktop ? 'calc(100% - 280px)' : '100%',
          transition: 'all 0.3s ease',
          paddingTop: isDesktop ? '0' : '0',
          position: 'relative'
        }}>
          {viewComponent}
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={<Loading />}>
      {viewComponent}
    </Suspense>
  );
}
