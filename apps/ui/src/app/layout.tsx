"use client";
import { ReactNode, Suspense, useEffect } from "react";
import { useGlobalLoadingStore } from "@/stores/globalLoadingStore";
import { useSnackStore } from "@/stores/snackbarStore";
import { useSoundStore } from "@/stores/soundStore";
import { initializeThemeFromCookie, useThemeStore } from "@/stores/themeStore";
import Loading from "@/app/loading";
import { initializeLanguageFromCookie, useI18nStore } from "@/stores/i18nStore";
import { getTheme } from "@/utils/theme";
import { Roboto_Condensed } from "next/font/google";

const robotoCondensed = Roboto_Condensed({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
  variable: "--font-roboto-condensed",
});

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const { isLoading } = useGlobalLoadingStore();
  const snack = useSnackStore((s) => s.snack);
  const closeSnack = useSnackStore((s) => s.closeSnack);
  const mode = useThemeStore((s) => s.mode);
  const language = useI18nStore((s) => s.language);
  const direction = useThemeStore((s) => s.direction);
  const { t } = useI18nStore();
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
    if (snack.open) {
      const timer = setTimeout(() => {
        closeSnack();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [snack.open, closeSnack]);

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
        ::-webkit-scrollbar-thumb { background: ${theme.divider}; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: ${theme.textSec}; }
      `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, [direction, language, theme]);

  return (
    <html lang={language} suppressHydrationWarning dir={direction} className={robotoCondensed.variable}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=2" user-scalable="yes"/>
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <title>{t("ui.title")}</title>
        <meta name="description" content={t("ui.description")} />
      </head>
      <body style={{ margin: 0, padding: 0, display: 'flex', flexDirection: 'column', minHeight: '100vh' }} suppressHydrationWarning>
        <main className="main-content">
          <Suspense fallback={<Loading />}>
            {children}
          </Suspense>
        </main>
        <Footer />
        {isLoading && <Loading />}
        {snack.open && (
          <div style={{
            position: 'fixed', bottom: '24px', right: '24px', minWidth: '320px', maxWidth: '500px',
            borderRadius: '12px', background: theme.paper,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)',
            zIndex: 1400, overflow: 'hidden',
            animation: 'slideInRight 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 20px',
            }}>
              <div style={{
                width: '24px', height: '24px', borderRadius: '50%',
                background: snack.severity === 'error' ? theme.error : snack.severity === 'success' ? theme.success : snack.severity === 'warning' ? theme.warning : theme.primary,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                {snack.severity === 'success' && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={theme.white} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                )}
                {snack.severity === 'error' && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={theme.white} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                )}
                {snack.severity === 'warning' && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={theme.white} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                    <line x1="12" y1="9" x2="12" y2="13"></line>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                  </svg>
                )}
                {snack.severity === 'info' && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={theme.white} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                )}
              </div>
              <span style={{ color: theme.text, flex: 1, fontSize: '14px', fontWeight: 500 }}>{snack.message}</span>
              <button
                onClick={closeSnack}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: '20px', color: theme.textSec, padding: '4px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'color 0.2s ease',
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = theme.text}
                onMouseLeave={(e) => e.currentTarget.style.color = theme.textSec}
              >
                ×
              </button>
            </div>
            <div style={{
              height: '3px', width: '100%',
              background: snack.severity === 'error' ? theme.error : snack.severity === 'success' ? theme.success : snack.severity === 'warning' ? theme.warning : theme.primary,
              animation: 'progressBar 4s linear forwards',
            }}></div>
            <style>{`
              @keyframes slideInRight {
                from {
                  transform: translateX(400px);
                  opacity: 0;
                }
                to {
                  transform: translateX(0);
                  opacity: 1;
                }
              }
              @keyframes progressBar {
                from {
                  width: 100%;
                }
                to {
                  width: 0%;
                }
              }
            `}</style>
          </div>
        )}
      </body>
    </html>
  );
}

const Footer = () => {
  const { t } = useI18nStore();
  const mode = useThemeStore((s) => s.mode);
  const theme = getTheme(mode);
  return (
    <div>
      <div style={{
        marginTop: "auto",
        padding: "40px 0",
        color: theme.textSec,
        fontSize: "0.875rem",
        borderTop: `1px solid ${theme.divider}`,
        width: "100%",
        textAlign: "center"
      }}>
        <p>{t("ui.footer")}</p>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
