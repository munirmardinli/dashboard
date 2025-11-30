"use client";
import { ReactNode, useEffect } from "react";
import { useGlobalLoadingStore } from "@/stores/globalLoadingStore";
import { useSnackStore } from "@/stores/snackbarStore";
import { useSoundStore } from "@/stores/soundStore";
import { initializeThemeFromCookie, useThemeStore } from "@/stores/themeStore";
import Loading from "@/app/loading";
import { initializeLanguageFromCookie, useI18nStore } from "@/stores/i18nStore";
import { FontCampany } from "@/utils/font";
import { getTheme } from "@/utils/theme";

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const { isLoading } = useGlobalLoadingStore();
  const snack = useSnackStore((s) => s.snack);
  const closeSnack = useSnackStore((s) => s.closeSnack);
  const mode = useThemeStore((s) => s.mode);
  const language = useI18nStore((s) => s.language);
  const direction = useThemeStore((s) => s.direction);
  const theme = getTheme(mode);

  useEffect(() => {
    initializeThemeFromCookie();
    initializeLanguageFromCookie();
  }, []);

  useEffect(() => {
    const unsub = useSnackStore.subscribe((s) => {
      if (s.snack.open && s.snack.severity) {
        try { useSoundStore.getState().playSnack(s.snack.severity as SnackSeverity); } catch { }
      }
    });
    return unsub;
  }, []);

  useEffect(() => {
    const unlock = () => {
      try { useSoundStore.getState().unlock(); } catch { }
      document.removeEventListener('pointerdown', unlock);
      document.removeEventListener('keydown', unlock);
      document.removeEventListener('touchstart', unlock);
    };
    document.addEventListener('pointerdown', unlock, { passive: true });
    document.addEventListener('keydown', unlock, { passive: true });
    document.addEventListener('touchstart', unlock, { passive: true });
    return () => {
      document.removeEventListener('pointerdown', unlock);
      document.removeEventListener('keydown', unlock);
      document.removeEventListener('touchstart', unlock);
    };
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("dir", direction);
    document.documentElement.setAttribute("lang", language);
    document.body.style.background = theme.bg;
    document.body.style.backgroundAttachment = 'fixed';
    document.body.style.color = theme.text;
    const style = document.createElement('style');
    style.innerHTML = `
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${theme.divider}; borderRadius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: ${theme.textSec}; }

        .main-content {
          flex-grow: 1;
          padding: 24px;
          width: 100%;
          margin-left: 0;
          min-height: 100vh;
          transition: margin 0.2s;
        }
        @media (min-width: 1024px) {
          .main-content {
            width: calc(100% - 280px);
            margin-left: 280px;
          }
        }
      `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, [direction, language, theme]);

  return (
    <html lang={language} suppressHydrationWarning dir={direction} className={FontCampany.className}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <title>Management Dashboard - Todos, Kalender & Passwörter</title>
        <meta name="description" content="Verwalten Sie Ihre Todos, Kalendereinträge, Passwörter und Kontakte effizient mit unserem Management Dashboard. Organisieren Sie Ihr Leben an einem Ort." />
      </head>
      <body style={{ margin: 0, padding: 0, display: 'flex', flexDirection: 'column', minHeight: '100vh' }} suppressHydrationWarning>
        <main className="main-content">
          {children}
        </main>
        {isLoading && <Loading />}
        {snack.open && (
          <div style={{
            position: 'fixed', bottom: '24px', right: '24px', minWidth: '300px', padding: '16px 24px',
            borderRadius: '12px', background: theme.paper, boxShadow: '0 24px 48px rgba(0,0,0,0.2)',
            display: 'flex', alignItems: 'center', gap: '12px', zIndex: 1400,
            borderLeft: `4px solid ${snack.severity === 'error' ? '#ef4444' : snack.severity === 'success' ? '#10b981' : snack.severity === 'warning' ? '#f59e0b' : '#3b82f6'}`
          }}>
            <span style={{ color: theme.text }}>{snack.message}</span>
            <button onClick={closeSnack} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: theme.textSec }}>×</button>
          </div>
        )}
      </body>
    </html>
  );
}
