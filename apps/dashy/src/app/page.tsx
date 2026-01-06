'use client';

import { useEffect, useState } from 'react';
import { DashyAPI, type DashyData } from '../utils/api';
import {
  Clock,
  Cloud,
  User,
  GraduationCap,
  Mail,
  ShoppingCart,
  MessageCircle,
  Infinity,
  GitBranch,
  Layout,
  Grid,
  UserCheck,
  Shield,
  Home as HomeIcon,
  Briefcase,
  Presentation,
  Wrench,
  Brain,
  Search,
  ChevronDown,
  ChevronRight,
  Code,
  ExternalLink
} from 'lucide-react';

export default function Home() {
  const [data, setData] = useState<DashyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const dashyData = await DashyAPI.getDashyData();
      console.log('Dashy Data Loaded:', dashyData);
      setData(dashyData);
      setLoading(false);
    };
    loadData();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const input = document.querySelector('input[type="text"]') as HTMLInputElement;
        if (input) {
          input.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleSection = (sectionId: string) => {
    setExpandedSection(prev => {
      if (prev === sectionId) {
        return null;
      }
      return sectionId;
    });
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#1e293b',
        color: '#e2e8f0'
      }}>
        Lade...
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#1e293b',
        color: '#e2e8f0'
      }}>
        Fehler beim Laden der Daten
      </div>
    );
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('de-DE', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getIcon = (iconName: string) => {
    const iconMap: Record<string, any> = {
      'clock': Clock,
      'cloud': Cloud,
      'user': User,
      'graduation-cap': GraduationCap,
      'mail': Mail,
      'shopping-cart': ShoppingCart,
      'message-circle': MessageCircle,
      'infinity': Infinity,
      'git-branch': GitBranch,
      'layout': Layout,
      'grid': Grid,
      'user-check': UserCheck,
      'shield': Shield,
      'home': HomeIcon,
      'briefcase': Briefcase,
      'presentation': Presentation,
      'wrench': Wrench,
      'brain': Brain,
      'search': Search,
      'hobby-horse': HomeIcon,
      'code': Code,
      'file-code': Code,
      'server': Wrench,
    };
    return iconMap[iconName] || Grid;
  };

  const filteredWidgets = data?.widgets?.filter(widget =>
    widget.title.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const filteredSections = data?.sections?.filter(section =>
    section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    section.items.some(item => !item.isArchive && item.name.toLowerCase().includes(searchQuery.toLowerCase()))
  ) || [];

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');
        
        body {
          margin: 0;
          padding: 0;
          background: #0f172a;
        }

        .dashy-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }

        .dashy-card:hover {
          transform: translateY(-6px);
          background-color: rgba(51, 65, 85, 0.65) !important;
          border-color: rgba(96, 165, 250, 0.4) !important;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4), 0 0 20px rgba(96, 165, 250, 0.1) !important;
        }

        .dashy-card:active {
          transform: translateY(-2px);
        }

        .dashy-grid {
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          gap: 28px;
        }

        .search-container:focus-within {
          width: 500px !important;
        }

        @media (max-width: 768px) {
          .dashy-grid {
            grid-template-columns: 1fr !important;
            gap: 20px;
          }
          .dashy-widget, .dashy-section {
            grid-column: span 1 !important;
          }
          .dashy-header {
            flex-direction: column !important;
            align-items: center !important;
            text-align: center !important;
            gap: 24px !important;
          }
          .dashy-search {
            width: 100% !important;
          }
          .search-container:focus-within {
            width: 100% !important;
          }
          .dashy-title {
            font-size: 28px !important;
          }
        }
        
        @media (min-width: 769px) and (max-width: 1200px) {
          .dashy-section {
            grid-column: span 6 !important;
          }
        }
      `}} />
      <div style={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at top left, #1e293b, #0f172a, #020617)',
        color: '#e2e8f0',
        fontFamily: "'Outfit', 'Inter', system-ui, -apple-system, sans-serif",
        padding: 0,
        margin: 0,
        position: 'relative',
        overflowX: 'hidden'
      }}>
        <div style={{
          padding: '20px',
          maxWidth: '100%',
          margin: '0 auto'
        }}>
          {/* Header */}
          <div className="dashy-header" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '40px',
            padding: '10px 0'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <h1 className="dashy-title" style={{
                fontSize: '36px',
                fontWeight: '800',
                margin: 0,
                letterSpacing: '-0.04em',
                background: 'linear-gradient(135deg, #f1f5f9 0%, #94a3b8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                lineHeight: '1.1'
              }}>
                {data.title || 'Munir Lab'}
              </h1>
              <div style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>
                {data.user?.greeting || 'Hallo'}, {data.user?.name || 'User'}
              </div>
            </div>

            <div className="dashy-search search-container" style={{
              position: 'relative',
              width: '400px',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
            }}>
              <input
                type="text"
                placeholder={data.header.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 110px 12px 20px',
                  backgroundColor: 'rgba(51, 65, 85, 0.4)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  color: '#f1f5f9',
                  fontSize: '14px',
                  fontWeight: '400',
                  outline: 'none',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(96, 165, 250, 0.4)';
                  e.currentTarget.style.backgroundColor = 'rgba(51, 65, 85, 0.5)';
                  e.currentTarget.style.boxShadow = '0 0 0 4px rgba(96, 165, 250, 0.1), 0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.backgroundColor = 'rgba(51, 65, 85, 0.4)';
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                }}
              />
              <div style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                pointerEvents: 'none'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '6px 10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '8px',
                  fontSize: '11px',
                  color: '#94a3b8',
                  fontWeight: '500',
                  fontFamily: 'monospace'
                }}>
                  <span style={{ fontSize: '12px' }}>⌘</span>
                  <span>K</span>
                </div>
                <div style={{
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '8px',
                }}>
                  <Search size={16} color="#94a3b8" />
                </div>
              </div>
            </div>
          </div>

          {/* Widgets - Uhrzeit and Wetter always visible */}
          <div className="dashy-grid" style={{ marginBottom: '24px' }}>
            {filteredWidgets.filter(w => w.id === 'uhrzeit' || w.id === 'wetter').map((widget) => {
              const IconComponent = getIcon(widget.icon);
              const gridCols = widget.gridColumns || 4;

              if (widget.id === 'uhrzeit') {
                return (
                  <div
                    key={widget.id}
                    className="dashy-widget dashy-card"
                    style={{
                      gridColumn: `span ${gridCols}`,
                      backgroundColor: 'rgba(51, 65, 85, 0.4)',
                      backdropFilter: 'blur(12px)',
                      WebkitBackdropFilter: 'blur(12px)',
                      borderRadius: '16px',
                      padding: '24px',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '15px'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                      }}>
                        <IconComponent size={20} color="#60a5fa" />
                        <h3 style={{
                          margin: 0,
                          fontSize: '16px',
                          fontWeight: '600',
                          color: '#f1f5f9'
                        }}>
                          {widget.title}
                        </h3>
                      </div>
                    </div>
                    <div style={{
                      fontSize: '48px',
                      fontWeight: 'bold',
                      color: '#f1f5f9',
                      marginBottom: '10px',
                      fontFamily: 'monospace'
                    }}>
                      {formatTime(currentTime)}
                    </div>
                    <div style={{
                      fontSize: '14px',
                      color: '#cbd5e1'
                    }}>
                      {widget.data.location}
                    </div>
                    <div style={{
                      fontSize: '14px',
                      color: '#cbd5e1'
                    }}>
                      {formatDate(currentTime)}
                    </div>
                  </div>
                );
              }

              if (widget.id === 'wetter') {
                return (
                  <div
                    key={widget.id}
                    className="dashy-widget dashy-card"
                    style={{
                      gridColumn: `span ${gridCols}`,
                      backgroundColor: 'rgba(51, 65, 85, 0.4)',
                      backdropFilter: 'blur(12px)',
                      WebkitBackdropFilter: 'blur(12px)',
                      borderRadius: '16px',
                      padding: '24px',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '15px'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                      }}>
                        <IconComponent size={20} color="#60a5fa" />
                        <h3 style={{
                          margin: 0,
                          fontSize: '16px',
                          fontWeight: '600',
                          color: '#f1f5f9'
                        }}>
                          {widget.title}
                        </h3>
                      </div>
                    </div>
                    {widget.data.forecast?.map((day: any, idx: number) => (
                      <div key={idx} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px 0',
                        borderBottom: idx < widget.data.forecast.length - 1 ? '1px solid #475569' : 'none'
                      }}>
                        <div style={{ fontSize: '14px', color: '#cbd5e1' }}>{day.day}</div>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          {day.temps ? (
                            day.temps.map((temp: number, tIdx: number) => (
                              <span key={tIdx} style={{ fontSize: '14px', color: '#f1f5f9' }}>
                                {temp}°C
                              </span>
                            ))
                          ) : (
                            <span style={{ fontSize: '14px', color: '#f1f5f9' }}>
                              {day.temp}°C
                            </span>
                          )}
                          <Cloud size={16} color="#94a3b8" />
                        </div>
                      </div>
                    ))}
                  </div>
                );
              }
              return null;
            })}
          </div>

          {/* All other widgets as collapsible sections */}
          <div className="dashy-grid" style={{
            marginBottom: '24px'
          }}>
            {filteredWidgets.filter(w => w.id !== 'uhrzeit' && w.id !== 'wetter').map((widget) => {
              const IconComponent = getIcon(widget.icon);
              const isExpanded = expandedSection === widget.id;
              const gridCols = widget.gridColumns || 4;

              return (
                <div
                  key={widget.id}
                  className="dashy-section dashy-card"
                  style={{
                    gridColumn: `span ${gridCols}`,
                    backgroundColor: 'rgba(51, 65, 85, 0.4)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    borderRadius: '16px',
                    padding: '20px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  <div
                    onClick={() => toggleSection(widget.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      marginBottom: isExpanded ? '16px' : '0',
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}
                  >
                    {isExpanded ? (
                      <ChevronDown size={18} color="#94a3b8" />
                    ) : (
                      <ChevronRight size={18} color="#94a3b8" />
                    )}
                    <IconComponent size={20} color="#60a5fa" />
                    <h4 style={{
                      margin: 0,
                      fontSize: '15px',
                      fontWeight: '600',
                      color: '#f1f5f9',
                      flex: 1
                    }}>
                      {widget.title}
                    </h4>
                  </div>
                  {isExpanded && (
                    <div style={{
                      paddingTop: '12px',
                      borderTop: '1px solid rgba(255, 255, 255, 0.05)'
                    }}>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '12px'
                      }}>
                        {widget.data.items?.map((item: any, idx: number) => (
                          <a
                            key={idx}
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              padding: '16px 12px',
                              backgroundColor: 'rgba(255, 255, 255, 0.05)',
                              borderRadius: '12px',
                              textDecoration: 'none',
                              color: '#e2e8f0',
                              gap: '10px',
                              transition: 'all 0.2s',
                              position: 'relative',
                              border: '1px solid transparent'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                              e.currentTarget.style.borderColor = 'rgba(96, 165, 250, 0.3)';
                              e.currentTarget.style.transform = 'translateY(-2px)';
                              const linkIcon = e.currentTarget.querySelector('.link-icon') as HTMLElement;
                              if (linkIcon) linkIcon.style.opacity = '1';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                              e.currentTarget.style.borderColor = 'transparent';
                              e.currentTarget.style.transform = 'translateY(0)';
                              const linkIcon = e.currentTarget.querySelector('.link-icon') as HTMLElement;
                              if (linkIcon) linkIcon.style.opacity = '0';
                            }}
                          >
                            <div style={{
                              fontSize: '13px',
                              fontWeight: '600',
                              color: '#f1f5f9',
                              textAlign: 'center',
                              lineHeight: '1.2'
                            }}>
                              {item.name}
                            </div>
                            <div style={{
                              width: '40px',
                              height: '40px',
                              backgroundColor: item.iconUrl ? 'transparent' : 'rgba(96, 165, 250, 0.2)',
                              borderRadius: '10px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#60a5fa',
                              fontSize: '18px',
                              fontWeight: 'bold',
                              overflow: 'hidden'
                            }}>
                              {item.iconUrl ? (
                                <img
                                  src={item.iconUrl}
                                  alt={item.name}
                                  style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    borderRadius: '10px'
                                  }}
                                  onError={(e) => {
                                    const target = e.currentTarget;
                                    target.style.display = 'none';
                                    const parent = target.parentElement;
                                    if (parent) {
                                      parent.style.backgroundColor = 'rgba(96, 165, 250, 0.2)';
                                      parent.textContent = item.name.charAt(0);
                                    }
                                  }}
                                />
                              ) : (
                                item.name.charAt(0)
                              )}
                            </div>
                            <div
                              className="link-icon"
                              style={{
                                position: 'absolute',
                                top: '8px',
                                right: '8px',
                                opacity: 0,
                                transition: 'opacity 0.2s'
                              }}
                            >
                              <ExternalLink size={14} color="#60a5fa" />
                            </div>
                          </a>
                        ))}
                      </div>
                      {(!widget.data.items || widget.data.items.length === 0) && (
                        <div style={{ color: '#94a3b8', fontSize: '13px', fontStyle: 'italic', textAlign: 'center', padding: '20px' }}>Keine Einträge</div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Sections with collapse functionality */}
          <div className="dashy-grid">
            {filteredSections.map((section) => {
              const IconComponent = getIcon(section.icon);
              const isExpanded = expandedSection === section.id;

              return (
                <div
                  key={section.id}
                  className="dashy-section dashy-card"
                  style={{
                    gridColumn: 'span 4',
                    backgroundColor: 'rgba(51, 65, 85, 0.4)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    borderRadius: '16px',
                    padding: '20px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  <div
                    onClick={() => toggleSection(section.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      marginBottom: isExpanded ? '16px' : '0',
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}
                  >
                    {isExpanded ? (
                      <ChevronDown size={18} color="#94a3b8" />
                    ) : (
                      <ChevronRight size={18} color="#94a3b8" />
                    )}
                    <IconComponent size={20} color="#60a5fa" />
                    <h4 style={{
                      margin: 0,
                      fontSize: '15px',
                      fontWeight: '600',
                      color: '#f1f5f9',
                      flex: 1
                    }}>
                      {section.title}
                    </h4>
                  </div>
                  {isExpanded && (
                    <div style={{
                      paddingTop: '12px',
                      borderTop: '1px solid rgba(255, 255, 255, 0.05)'
                    }}>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '12px'
                      }}>
                        {section.items.filter(item => !item.isArchive).map((item, idx) => (
                          <a
                            key={idx}
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              padding: '16px 12px',
                              backgroundColor: 'rgba(255, 255, 255, 0.05)',
                              borderRadius: '12px',
                              textDecoration: 'none',
                              color: '#e2e8f0',
                              gap: '10px',
                              transition: 'all 0.2s',
                              position: 'relative',
                              border: '1px solid transparent'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                              e.currentTarget.style.borderColor = 'rgba(96, 165, 250, 0.3)';
                              e.currentTarget.style.transform = 'translateY(-2px)';
                              const linkIcon = e.currentTarget.querySelector('.link-icon') as HTMLElement;
                              if (linkIcon) linkIcon.style.opacity = '1';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                              e.currentTarget.style.borderColor = 'transparent';
                              e.currentTarget.style.transform = 'translateY(0)';
                              const linkIcon = e.currentTarget.querySelector('.link-icon') as HTMLElement;
                              if (linkIcon) linkIcon.style.opacity = '0';
                            }}
                          >
                            <div style={{
                              fontSize: '13px',
                              fontWeight: '600',
                              color: '#f1f5f9',
                              textAlign: 'center',
                              lineHeight: '1.2'
                            }}>
                              {item.name}
                            </div>
                            <div style={{
                              width: '40px',
                              height: '40px',
                              backgroundColor: item.iconUrl ? 'transparent' : 'rgba(96, 165, 250, 0.2)',
                              borderRadius: '10px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#60a5fa',
                              fontSize: '18px',
                              fontWeight: 'bold',
                              overflow: 'hidden'
                            }}>
                              {item.iconUrl ? (
                                <img
                                  src={item.iconUrl}
                                  alt={item.name}
                                  style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    borderRadius: '10px'
                                  }}
                                  onError={(e) => {
                                    const target = e.currentTarget;
                                    target.style.display = 'none';
                                    const parent = target.parentElement;
                                    if (parent) {
                                      parent.style.backgroundColor = 'rgba(96, 165, 250, 0.2)';
                                      parent.textContent = item.name.charAt(0);
                                    }
                                  }}
                                />
                              ) : (
                                item.name.charAt(0)
                              )}
                            </div>
                            <div
                              className="link-icon"
                              style={{
                                position: 'absolute',
                                top: '8px',
                                right: '8px',
                                opacity: 0,
                                transition: 'opacity 0.2s'
                              }}
                            >
                              <ExternalLink size={14} color="#60a5fa" />
                            </div>
                          </a>
                        ))}
                      </div>
                      {section.items.filter(item => !item.isArchive).length === 0 && (
                        <div style={{ color: '#94a3b8', fontSize: '13px', fontStyle: 'italic', textAlign: 'center', padding: '20px' }}>Keine Einträge</div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div style={{
            marginTop: '60px',
            padding: '30px 20px',
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            textAlign: 'center',
            fontSize: '13px',
            color: '#64748b',
            letterSpacing: '0.01em',
            fontWeight: '400'
          }}>
            {data.footer?.text || 'Dashy is free & open source'}
          </div>
        </div>
      </div>
    </>
  );
}
