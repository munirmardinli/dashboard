"use client";

import { FC, useState, useEffect, useCallback, useTransition, Suspense, useMemo } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import {
  Menu, ChevronUp, ChevronDown, Globe, Settings, Shield, Cookie, Palette, X
} from 'lucide-react';

import { useI18nStore } from '@/stores/i18nStore';
import { useSnackStore } from '@/stores/snackbarStore';
import { useSoundStore } from '@/stores/soundStore';
import { useThemeStore } from '@/stores/themeStore';
import { useSidebarStore, initializeSidebarFromCookie } from '@/stores/sidebarStore';
import Loading from '@/app/loading';
import { getTheme } from '@/utils/theme';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { useNavigation } from '@/hooks/useNavigation';

const DRAWER_WIDTH = 280;

export const Navigation: FC = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isDesktop = useIsDesktop();
  const { navigationItems, handleNavigation } = useNavigation();
  const { isOpen: mobileDrawerOpen, setIsOpen: setMobileDrawerOpen, toggleSidebar, setActivePath } = useSidebarStore();
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const { language, setLanguage, translations, loadTranslations } = useI18nStore();
  const setSnack = useSnackStore((state) => state.setSnack);
  const { mode: themeMode, setMode: setThemeMode } = useThemeStore();
  const mode = useThemeStore((s) => s.mode);
  const theme = getTheme(mode);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [activeSettingsSection, setActiveSettingsSection] = useState<'general' | 'security'>('general');
  const [, startTransition] = useTransition();

  const t = useCallback((key: string): string => {
    const keys = key.split(".");
    let current: unknown = translations;
    for (const k of keys) {
      if (current == null || typeof current !== "object") return key;
      const next = (current as Record<string, unknown>)[k];
      if (next === undefined) return key;
      current = next;
    }
    return typeof current === "string" ? current : key;
  }, [translations]);

  useEffect(() => {
    initializeSidebarFromCookie();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (Object.keys(translations).length === 0) startTransition(() => { loadTranslations(language); });
    }, 0);
    return () => clearTimeout(timer);
  }, [translations, language, loadTranslations]);

  const handleExpandToggle = useCallback((key: string) => {
    setExpandedItems(prev => {
      if (prev[key]) {
        const next = { ...prev };
        delete next[key];
        return next;
      }
      const next: Record<string, boolean> = {};
      const parts = key.split('/');
      let currentPath = '';
      for (const part of parts) {
        currentPath = currentPath ? `${currentPath}/${part}` : part;
        next[currentPath] = true;
      }
      return next;
    });
  }, []);

  const { activePath } = useSidebarStore();

  useEffect(() => {
    let pathObjKey = '';
    const currentView = searchParams?.get('view') || searchParams?.get('q');
    const p = searchParams?.get('p');
    if (searchParams?.get('q') === 'docs' && p) {
      pathObjKey = `docs/${p}`;
    } else if (currentView) {
      pathObjKey = activePath || currentView;
    } else if (pathname && pathname !== '/') {
      pathObjKey = pathname.slice(1);
    } else if (activePath) {
      pathObjKey = activePath;
    }

    if (pathObjKey) {
      setExpandedItems(prev => {
        const next: Record<string, boolean> = {};
        const parts = pathObjKey.split('/');
        let currentPath = '';
        let changed = false;

        for (let i = 0; i < parts.length - 1; i++) {
          currentPath = currentPath ? `${currentPath}/${parts[i]}` : parts[i];
          if (!prev[currentPath]) changed = true;
          next[currentPath] = true;
        }

        if (changed || Object.keys(prev).length !== Object.keys(next).length) {
          return next;
        }
        return prev;
      });
    }
  }, [searchParams, pathname, activePath]);



  const languageMenuItems = useMemo(() => [
    { code: "de" as const, flag: "🇩🇪", menuLabel: () => t("language.menu.de") },
    { code: "en" as const, flag: "🇺🇸", menuLabel: () => t("language.menu.en") },
    { code: "fr" as const, flag: "🇫🇷", menuLabel: () => t("language.menu.fr") },
    { code: "ar" as const, flag: "🇸🇦", menuLabel: () => t("language.menu.ar") },
  ], [t]);

  const drawerContent = (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', color: theme.text }}>
      <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Image src="/dashboard.png" alt={t("ui.navigationTitle")} width={40} height={40} priority unoptimized />
        <h6 style={{ margin: 0, fontWeight: 700, fontSize: '1.25rem', background: 'linear-gradient(45deg, #6366f1, #ec4899)', backgroundClip: 'text', WebkitBackgroundClip: 'text', color: 'transparent' }}>
          {t("ui.navigationTitle")}
        </h6>
      </div>
      <div style={{ margin: '0 16px 16px', height: '1px', background: theme.divider }} />
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px' }}>
        <nav>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {navigationItems.map((item, index) => {
              const renderNavItem = (navItem: TranslationNavigationItem, depth: number, itemIndex: number) => {
                const isDropdown = navItem.type === 'dropdown';
                const isExpanded = expandedItems[navItem.key];
                const currentView = searchParams?.get('view') || searchParams?.get('q');
                const p = searchParams?.get('p');

                const isSelected = !isDropdown && (
                  (navItem.type === 'doc' && searchParams?.get('q') === 'docs' && p === (navItem.path?.startsWith('docs/') ? navItem.path.slice(5) : navItem.path)) ||
                  (navItem.type === 'data' && (currentView === navItem.path || currentView === navItem.key)) ||
                  (navItem.path && (`${pathname}?${searchParams?.toString()}` === navItem.path || pathname === navItem.path)) ||
                  (!navItem.type && currentView === navItem.key)
                );
                const paddingLeft = `${16 + (depth * 14)}px`;

                let displayTitle = navItem.title;
                if (!navItem.key.startsWith('docs')) {
                  const basename = navItem.key.split('/').pop() || navItem.key;
                  const navTranslations = Array.isArray(translations.navigation) ? translations.navigation : [];
                  const translationObj = navTranslations.find((n: { key: string; title: string }) => n.key === navItem.key || n.key === basename);

                  if (translationObj && translationObj.title) {
                    displayTitle = translationObj.title;
                  } else {
                    const simpleT = t(`navigation.${basename}`);
                    if (simpleT !== `navigation.${basename}`) {
                      displayTitle = simpleT;
                    } else {
                      const fullT = t(`navigation.${navItem.key}`);
                      if (fullT !== `navigation.${navItem.key}`) {
                        displayTitle = fullT;
                      }
                    }
                  }
                }

                return (
                  <li key={`${depth}-${itemIndex}`} style={{ marginBottom: '2px' }}>
                    <div
                      onClick={() => isDropdown ? handleExpandToggle(navItem.key) : navItem.path && handleNavigation(navItem.path, navItem.type as 'doc' | 'data' | 'nav')}
                      style={{
                        display: 'flex', alignItems: 'center', padding: `8px 16px 8px ${paddingLeft}`,
                        borderRadius: '6px', cursor: 'pointer', transition: 'all 0.15s ease-in-out',
                        background: isSelected ? `${theme.primary}20` : 'transparent',
                        color: isSelected ? theme.primary : (depth === 0 ? theme.text : theme.textSec),
                        fontWeight: isSelected ? 600 : (depth === 0 ? 500 : 400),
                        borderLeft: isSelected ? `3px solid ${theme.primary}` : `3px solid transparent`,
                        userSelect: 'none'
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.background = `${theme.text}08`;
                          e.currentTarget.style.color = theme.text;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.color = depth === 0 ? theme.text : theme.textSec;
                        }
                      }}
                    >
                      {navItem.icon && <span style={{ marginRight: '10px', display: 'flex', fontSize: depth === 0 ? '1.1rem' : '0.95rem' }}>{navItem.icon}</span>}
                      <span style={{ flex: 1, fontSize: depth === 0 ? '0.95rem' : '0.875rem', lineHeight: '1.3' }}>
                        {displayTitle}
                      </span>
                      {isDropdown && (
                        <span style={{ opacity: 0.6 }}>
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </span>
                      )}
                    </div>
                    {isDropdown && isExpanded && (
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        {navItem.subItems?.map((subItem, subIndex) => renderNavItem(subItem, depth + 1, subIndex))}
                      </ul>
                    )}
                  </li>
                );
              };
              return renderNavItem(item, 0, index);
            })}
          </ul>
        </nav>
      </div>
      <div style={{ padding: '16px' }}>
        <div
          onClick={() => setSettingsOpen(true)}
          style={{
            display: 'flex', alignItems: 'center', padding: '12px 16px', borderRadius: '16px',
            cursor: 'pointer', color: theme.textSec, transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = `${theme.text}0d`;
            e.currentTarget.style.color = theme.text;
            e.currentTarget.style.transform = 'translateX(4px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = theme.textSec;
            e.currentTarget.style.transform = 'translateX(0)';
          }}
        >
          <Settings size={20} style={{ marginRight: '16px' }} />
          <span>{t("settings.title")}</span>
        </div>
      </div>
    </div>
  );

  return (
    <Suspense fallback={<Loading />}>
      {isDesktop && (
        <div style={{
          width: DRAWER_WIDTH, position: 'fixed', top: 0, left: 0, bottom: 0,
          background: theme.paper,
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          borderRight: `1px solid ${theme.divider}`, zIndex: 1200,
          boxShadow: `20px 0 40px ${theme.primary}05`
        }}>
          {drawerContent}
        </div>
      )}

      {!isDesktop && (
        <>
          <div style={{
            position: 'sticky', top: 0, zIndex: 1100,
            backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
            background: `${theme.paper}cc`,
            borderBottom: `1px solid ${theme.divider}`, padding: '8px 16px', display: 'flex', alignItems: 'center',
            width: '100%'
          }}>
            <button
              onClick={() => toggleSidebar()}
              aria-label={t("ui.openMenu")}
              style={{ background: 'none', border: 'none', color: theme.text, padding: '8px', cursor: 'pointer' }}
            >
              <Menu />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: '16px' }}>
              <Image src="/dashboard.png" alt={t("ui.navigationTitle")} width={32} height={32} />
              <span style={{ fontWeight: 700, fontSize: '1.25rem', color: theme.text }}>{t("ui.navigationTitle")}</span>
            </div>
          </div>
          <div style={{ height: '64px' }} /> {/* Spacer for sticky header */}
          {mobileDrawerOpen && (
            <div style={{ position: 'fixed', inset: 0, zIndex: 1300 }}>
              <div onClick={() => setMobileDrawerOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} />
              <div style={{
                position: 'absolute', top: 0, left: 0, bottom: 0, width: DRAWER_WIDTH,
                background: theme.bg,
                backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
                boxShadow: `0 0 60px ${theme.primary}20`,
                overflowY: 'auto'
              }}>
                {drawerContent}
              </div>
            </div>
          )}
        </>
      )}

      {settingsOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1400, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div onClick={() => setSettingsOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} />
          <div style={{
            position: 'relative', width: '100%', maxWidth: isDesktop ? '1000px' : 'calc(100vw - 32px)', height: isDesktop ? '85vh' : '90vh',
            background: theme.paper,
            backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
            borderRadius: '24px',
            boxShadow: `0 24px 60px ${theme.primary}15`,
            border: `1px solid ${theme.divider}`,
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
            margin: 'auto'
          }}>
            <div style={{ padding: '16px 24px', borderBottom: `1px solid ${theme.divider}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: theme.text }}>{t("settings.title")}</h2>
                <p style={{ margin: 0, color: theme.textSec, fontSize: '0.875rem' }}>{t("settings.subtitle")}</p>
              </div>
              <button onClick={() => setSettingsOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.textSec }}><X /></button>
            </div>
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden', flexDirection: isDesktop ? 'row' : 'column' }}>
              <div style={{
                width: isDesktop ? '260px' : '100%', borderRight: isDesktop ? `1px solid ${theme.divider}` : 'none',
                borderBottom: !isDesktop ? `1px solid ${theme.divider}` : 'none',
                background: `${theme.bg}4d`, padding: '16px'
              }}>
                <div
                  onClick={() => setActiveSettingsSection('general')}
                  style={{
                    display: 'flex', alignItems: 'center', padding: '12px', borderRadius: '12px', cursor: 'pointer',
                    background: activeSettingsSection === 'general' ? `${theme.primary}1a` : 'transparent',
                    color: activeSettingsSection === 'general' ? theme.primary : theme.textSec
                  }}
                >
                  <Settings size={20} style={{ marginRight: '12px' }} />
                  <span style={{ fontWeight: 500 }}>{t("settings.general")}</span>
                </div>
                <div
                  onClick={() => setActiveSettingsSection('security')}
                  style={{
                    display: 'flex', alignItems: 'center', padding: '12px', borderRadius: '12px', cursor: 'pointer',
                    background: activeSettingsSection === 'security' ? `${theme.primary}1a` : 'transparent',
                    color: activeSettingsSection === 'security' ? theme.primary : theme.textSec, marginTop: '8px'
                  }}
                >
                  <Shield size={20} style={{ marginRight: '12px' }} />
                  <span style={{ fontWeight: 500 }}>{t("settings.security")}</span>
                </div>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
                {activeSettingsSection === 'general' && (
                  <div style={{ maxWidth: '600px' }}>
                    <div style={{ marginBottom: '32px' }}>
                      <h3 style={{ margin: '0 0 8px', fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', color: theme.text }}>
                        <Globe size={18} /> {t("settings.language.title")}
                      </h3>
                      <p style={{ margin: '0 0 16px', color: theme.textSec, fontSize: '0.875rem' }}>{t("settings.language.description")}</p>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
                        {languageMenuItems.map((item) => (
                          <div
                            key={item.code}
                            onClick={async () => {
                              if (language !== item.code) {
                                await setLanguage(item.code);
                                document.cookie = `languageSelected=${item.code}; max-age=${30 * 24 * 60 * 60}; path=/`;
                                try { useSoundStore.getState().playEvent("create"); } catch { }
                                setSnack(`${t("language.menu." + item.code)} ${t("ui.successfully")} ${t("ui.updated")}`, 'success');
                              }
                            }}
                            style={{
                              padding: '12px', borderRadius: '12px', border: `1px solid ${language === item.code ? theme.primary : theme.divider}`,
                              background: language === item.code ? `${theme.primary}1a` : 'transparent', cursor: 'pointer',
                              display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.2s ease'
                            }}
                          >
                            <span style={{ fontSize: '1.5rem' }}>{item.flag}</span>
                            <span style={{ fontWeight: 500, color: language === item.code ? theme.primary : theme.text }}>{item.menuLabel()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div style={{ margin: '32px 0', height: '1px', background: theme.divider }} />
                    <div>
                      <h3 style={{ margin: '0 0 8px', fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', color: theme.text }}>
                        <Palette size={18} /> {t("settings.theme.title")}
                      </h3>
                      <p style={{ margin: '0 0 16px', color: theme.textSec, fontSize: '0.875rem' }}>{t("settings.theme.description")}</p>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        {(['light', 'dark', 'contrast'] as const).map((m) => (
                          <div
                            key={m}
                            onClick={() => {
                              setThemeMode(m);
                              try { useSoundStore.getState().playEvent("create"); } catch { }
                              setSnack(`${t("settings.theme.updated")} ${t("ui.successfully")} ${t("ui.updated")}`, 'success');
                            }}
                            style={{
                              flex: 1, padding: '12px', borderRadius: '12px', border: `1px solid ${themeMode === m ? theme.primary : theme.divider}`,
                              background: themeMode === m ? `${theme.primary}0d` : 'transparent', cursor: 'pointer', textAlign: 'center',
                              fontWeight: 500, color: themeMode === m ? theme.primary : theme.text, textTransform: 'capitalize'
                            }}
                          >
                            {t(`settings.theme.${m}`)}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                {activeSettingsSection === 'security' && (
                  <div style={{ maxWidth: '600px' }}>
                    <h3 style={{ margin: '0 0 8px', fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', color: theme.text }}>
                      <Cookie size={18} /> {t("settings.cookies.title")}
                    </h3>
                    <p style={{ margin: '0 0 16px', color: theme.textSec, fontSize: '0.875rem' }}>{t("settings.cookies.description")}</p>
                    <div style={{ border: `1px solid ${theme.divider}`, borderRadius: '12px', overflow: 'hidden' }}>
                      {typeof window !== 'undefined' && document.cookie ? (
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          {document.cookie.split(';').map((cookie, index) => {
                            const [name, ...valueParts] = cookie.trim().split('=');
                            const value = valueParts.join('=');
                            return (
                              <div key={index} style={{ padding: '12px', borderBottom: index < document.cookie.split(';').length - 1 ? `1px solid ${theme.divider}` : 'none' }}>
                                <div style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '4px', background: `${theme.primary}1a`, color: theme.primary, fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>{name}</div>
                                <div style={{ fontSize: '0.875rem', color: theme.textSec, fontFamily: 'monospace', wordBreak: 'break-all' }}>{value || '(leer)'}</div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div style={{ padding: '24px', textAlign: 'center', color: theme.textSec, fontSize: '0.875rem' }}>{t("settings.cookies.noCookies")}</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </Suspense>
  );
};
