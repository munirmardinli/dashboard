"use client";

import { useState, useEffect, Suspense, ReactNode, ReactElement, isValidElement, cloneElement } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import 'katex/dist/katex.min.css';
import { CheckCircle2, Info, AlertTriangle, AlertCircle, Lightbulb, StickyNote, ChevronDown, FileText, Copy, Check } from 'lucide-react';
import mermaid from 'mermaid';
import matter from 'gray-matter';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';

import { getTheme } from '@/utils/theme';
import { useThemeStore } from '@/stores/themeStore';
import { useSearchParams } from 'next/navigation';
import { useSnackStore } from "@/stores/snackbarStore";
import { DocsAPI, PortfolioAPI } from '@/utils/api';
import { useI18nStore } from '@/stores/i18nStore';
import Image from 'next/image';
import { API_URL } from '@/utils/env';

function CodeBlock({ children, className, node, ...props }: {
  children: ReactNode;
  className?: string;
  node?: any;
}) {
  const mode = useThemeStore((s) => s.mode);
  const theme = getTheme(mode);
  const [copied, setCopied] = useState(false);
  const setSnack = useSnackStore((state) => state.setSnack);
  const match = /language-(\w+)/.exec(className || '');
  const { t } = useI18nStore();
  const language = match ? match[1] : '';
  const meta = (node as { data?: { meta?: string } })?.data?.meta;

  const titleMatch = /title="([^"]+)"/.exec(meta || '');
  const title = titleMatch ? titleMatch[1] : '';

  const codeContent = String(children).replace(/\n$/, '');

  const handleCopy = () => {
    navigator.clipboard.writeText(codeContent);
    setCopied(true);
    setSnack(t("ui.copiedToClipboard"), "success");
    setTimeout(() => setCopied(false), 2000);
  };

  if (language === 'mermaid') {
    return <MermaidDiagram chart={codeContent} />;
  }

  return (
    <div style={{
      margin: '1.5rem 0',
      borderRadius: '12px',
      overflow: 'hidden',
      border: `1px solid ${theme.divider}`,
      background: mode === 'dark' ? '#1e1e1e' : '#ffffff',
      boxShadow: theme.shadowMd
    }}>
      {(title || language) && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 16px',
          background: mode === 'dark' ? '#2d2d2d' : '#f5f5f5',
          borderBottom: `1px solid ${theme.divider}`,
          fontSize: '0.85rem',
          color: theme.textSec,
          fontFamily: 'monospace'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'flex', gap: '6px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ff5f56' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ffbd2e' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#27c93f' }} />
            </div>
            {title && <span style={{ marginLeft: '8px', fontWeight: 600 }}>{title}</span>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {language && <span style={{ textTransform: 'uppercase', opacity: 0.6, fontSize: '0.75rem' }}>{language}</span>}
            <button
              onClick={handleCopy}
              style={{
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                color: copied ? theme.primary : theme.textSec,
                transition: 'color 0.2s'
              }}
              title={t("ui.copiedToClipboard")}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </div>
        </div>
      )}
      <div style={{ fontSize: '0.9rem', overflowX: 'auto' }}>
        <SyntaxHighlighter
          language={language || 'text'}
          style={mode === 'dark' ? vscDarkPlus : vs}
          customStyle={{ margin: 0, padding: '16px', borderRadius: 0, background: 'transparent' }}
          wrapLongLines={false}
        >
          {codeContent}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}

function MermaidDiagram({ chart }: { chart: string }) {
  const mode = useThemeStore((s) => s.mode);
  const theme = getTheme(mode);
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<boolean>(false);
  const { t } = useI18nStore();

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: mode === 'dark' ? 'dark' : (mode === 'contrast' ? 'base' : 'default'),
      themeVariables: {
        primaryColor: theme.primary,
        primaryTextColor: theme.text,
        primaryBorderColor: theme.primary,
        lineColor: theme.textSec,
        secondaryColor: theme.paperSec,
        tertiaryColor: theme.paper,
      },
      securityLevel: 'loose',
      fontFamily: 'Inter, system-ui, sans-serif',
    });

    const renderChart = async () => {
      try {
        const id = `mermaid-${Math.random().toString(36).substring(2, 11)}`;
        const { svg } = await mermaid.render(id, chart);
        setSvg(svg);
        setError(false);
      } catch (err) {
        console.error('Mermaid render error:', err);
        setError(true);
      }
    };

    renderChart();
  }, [chart, mode, theme]);

  if (error) {
    return (
      <div style={{
        padding: '1rem',
        border: `1px solid ${theme.divider}`,
        borderRadius: '8px',
        background: `${theme.primary}05`,
        color: theme.textSec,
        fontSize: '0.9rem',
        fontFamily: 'monospace',
        margin: '1rem 0'
      }}>
        {t("ui.mermaidSyntaxError")}
      </div>
    );
  }

  return (
    <div
      className="mermaid"
      dangerouslySetInnerHTML={{ __html: svg }}
      style={{
        display: 'flex',
        justifyContent: 'center',
        margin: '2rem 0',
        padding: '24px',
        background: mode === 'dark' ? '#00000020' : '#ffffff20',
        borderRadius: '16px',
        border: `1px solid ${theme.divider}`,
        overflowX: 'auto',
        backdropFilter: 'blur(8px)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
      }}
    />
  );
}

export default function DocPage() {
  const searchParams = useSearchParams();
  const p = searchParams.get('p') || 'index';
  const [data, setData] = useState<PortfolioData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState<string>('');
  const [frontmatter, setFrontmatter] = useState<Frontmatter>({});
  const [loading, setLoading] = useState(true);
  const { t } = useI18nStore();

  const mode = useThemeStore((s) => s.mode);
  const theme = getTheme(mode);

  useEffect(() => {
    setLoading(true);

    DocsAPI.getContent(p)
      .then(data => {
        if (data) {
          const parsed = matter(data);
          setFrontmatter(parsed.data || {});
          let rawContent = parsed.content;

          if (parsed.data?.title) {
            rawContent = rawContent.replace(/^\s*#\s+.+\r?\n/, '');
          }

          const lines = rawContent.split('\n');
          const processedLines = [];
          let inAdmonition = false;

          for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmed = line.trim();
            const isAdmonitionStart = /^(\?{3}|!{3})[+-]?\s+\w+.*$/.test(trimmed);

            if (isAdmonitionStart) {
              processedLines.push('> ' + trimmed);
              inAdmonition = true;
            } else if (
              inAdmonition &&
              (line.startsWith('    ') ||
                line.startsWith('\t') ||
                line.startsWith('  ') ||
                trimmed === '')
            ) {
              let contentLine = line;
              if (line.startsWith('    ')) contentLine = line.substring(4);
              else if (line.startsWith('\t')) contentLine = line.substring(1);
              else if (line.startsWith('  ')) contentLine = line.substring(2);

              processedLines.push('> ' + contentLine);
            } else {
              processedLines.push(line);
              if (trimmed !== '') inAdmonition = false;
            }
          }

          setContent(processedLines.join('\n'));
        } else {
          setContent('');
          setFrontmatter({});
        }
      })
      .catch(() => {
        setContent('');
        setFrontmatter({});
      })
      .finally(() => setLoading(false));
  }, [p]);

  useEffect(() => {
    if (frontmatter.title) {
      document.title = `${frontmatter.title}`;
    }
  }, [frontmatter]);

  useEffect(() => {
    if (frontmatter.description) {
      const meta = document.querySelector('meta[name="description"]');
      if (meta) {
        meta.setAttribute('content', frontmatter.description);
      }
    }
  }, [frontmatter]);

  useEffect(() => {
    async function loadData() {
      try {
        const portfolioData = await PortfolioAPI.getPortfolioData();
        if (portfolioData) {
          setData(portfolioData);
        } else {
          setError(t("ui.noEntries"));
        }
      } catch (err) {
        //notFound();
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const formatDate = (d?: string) =>
    d ? new Date(d).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) : null;

  if (loading) return <div style={{ color: theme.text }}>{t("ui.loading")}</div>;

  if (error || !data) {
    return (
      <div style={{
        color: theme.text,
        padding: '2rem',
        textAlign: 'center',
        border: `1px solid ${theme.divider}`,
        borderRadius: '12px',
        margin: '2rem'
      }}>
        <AlertCircle size={40} style={{ marginBottom: '1rem', color: '#ef4444' }} />
        <p>{error || t("ui.noEntries")}</p>
      </div>
    );
  }


  if (!content) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '60vh',
          color: theme.text,
          opacity: 0.6,
          textAlign: 'center'
        }}
      >
        <FileText size={48} style={{ marginBottom: '1rem' }} />
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
          {t("ui.documenationNotFound")}
        </h2>
        <p>{t("ui.selectADifferentTopicFromTheSidebar")}</p>
      </div>
    );
  }

  return (
    <Suspense fallback={<div>{t("ui.applicationIsBeingReloaded")}</div>}>
      <div className="markdown-container" style={{ color: theme.text }}>
        {frontmatter.title && (
          <div style={{ marginBottom: '2.5rem' }}>
            <h1 style={{
              fontSize: 'clamp(1.8rem, 4vw, 3rem)',
              fontWeight: 800,
              marginBottom: '1.5rem',
              background: 'linear-gradient(to right, #818cf8, #e879f9)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.02em',
            }}>
              {frontmatter.title}
            </h1>

            {frontmatter.image && (
              <div style={{
                position: 'relative',
                width: '100%',
                height: 'clamp(300px, 50vh, 450px)',
                borderRadius: '24px',
                overflow: 'hidden',
                border: `1px solid ${theme.divider}`,
                boxShadow: theme.shadowLg,
              }}>
                <Image
                  src={frontmatter.image ?? ""}
                  alt={frontmatter.title ?? ""}
                  fill
                  priority
                  style={{ objectFit: 'cover' }}
                />

                {frontmatter.authors && (
                  <div style={{
                    position: 'absolute',
                    bottom: '0',
                    right: '0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '6px 6px 6px 14px',
                    background: 'rgba(0, 0, 0, 0.25)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '20px 0 0 0',
                    borderTop: '1px solid rgba(255,255,255,0.1)',
                    borderLeft: '1px solid rgba(255,255,255,0.1)',
                  }}>
                    <span style={{ fontSize: '11px', fontWeight: 500, color: 'rgba(255,255,255,0.8)' }}>
                      {Array.isArray(frontmatter.authors) ? frontmatter.authors[0] : frontmatter.authors}
                    </span>
                    <Image
                      src={data.profile.image ?? ""}
                      alt={data.profile.name ?? ""}
                      width={30}
                      height={30}
                      style={{
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '10px',
                        fontWeight: 700,
                        color: '#fff',
                        border: '1px solid rgba(255,255,255,0.2)'
                      }} />
                  </div>
                )}
              </div>
            )}

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
              gap: '20px',
              marginTop: '16px',
              padding: '0 4px',
              borderTop: `1px solid ${theme.divider}40`,
              paddingTop: '16px'
            }}>
              {frontmatter.created && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '9px', fontWeight: 800, color: theme.textSec, opacity: 0.6, letterSpacing: '0.05em' }}>{t("ui.created")}</span>
                  <span style={{ fontSize: '12px', color: theme.text, fontWeight: 500 }}>{formatDate(frontmatter.created)}</span>
                </div>
              )}

              {frontmatter.updated && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '9px', fontWeight: 800, color: theme.textSec, opacity: 0.6, letterSpacing: '0.05em' }}>{t("ui.updated")}</span>
                  <span style={{ fontSize: '12px', color: theme.text, fontWeight: 500 }}>{formatDate(frontmatter.updated)}</span>
                </div>
              )}


              {frontmatter.tags && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '9px', fontWeight: 800, color: theme.textSec, opacity: 0.6, letterSpacing: '0.05em' }}>{t("ui.category")}</span>
                  <div>
                    <span style={{
                      padding: '2px 8px',
                      background: `${theme.text}10`,
                      borderRadius: '6px',
                      fontSize: '10px',
                      fontWeight: 700,
                      color: theme.text,
                      border: `1px solid ${theme.divider}`
                    }}>
                      {Array.isArray(frontmatter.tags) ? frontmatter.tags[0] : frontmatter.tags}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[rehypeKatex, rehypeRaw]}
          components={{
            h1: ({ children }) => (
              <h1 style={{
                fontSize: '2.5rem',
                fontWeight: 800,
                marginBottom: '1.5rem',
                background: 'linear-gradient(to right, #818cf8, #e879f9)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.02em',
              }}>
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 style={{
                fontSize: '1.8rem',
                fontWeight: 700,
                marginTop: '2.5rem',
                marginBottom: '1rem',
                color: theme.text,
                borderBottom: `1px solid ${theme.divider}`,
                paddingBottom: '0.5rem',
              }}>
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 style={{
                fontSize: '1.4rem',
                fontWeight: 600,
                marginTop: '2rem',
                marginBottom: '0.75rem',
                color: theme.text,
              }}>
                {children}
              </h3>
            ),
            p: ({ children }) => (
              <p style={{
                fontSize: '1rem',
                lineHeight: '1.8',
                marginBottom: '1.25rem',
                color: theme.text,
                textAlign: 'justify'
              }}>
                {children}
              </p>
            ),
            ul: ({ children, className }) => {
              const isTaskList = className?.includes('contains-task-list');
              return (
                <ul style={{
                  marginBottom: '1.25rem',
                  paddingLeft: isTaskList ? '0.5rem' : '1.5rem',
                  listStyleType: isTaskList ? 'none' : 'disc',
                  color: theme.text,
                }}>
                  {children}
                </ul>
              );
            },
            input: ({ node, ...props }) => {
              if (props.type === 'checkbox') return null;
              return <input {...props} />;
            },
            li: ({ children, checked, className, ...props }: MarkdownLiProps) => {
              let isChecked = checked;
              if (typeof isChecked === 'undefined') {
                const childrenArray = Array.isArray(children) ? children : [children];
                const inputChild = childrenArray.find((child: any) =>
                  child?.props?.type === 'checkbox' ||
                  (child?.props?.className?.includes('task-list-item-checkbox'))
                );
                if (inputChild) {
                  isChecked = inputChild.props.checked;
                }
              }

              const isTaskListItem = className?.includes('task-list-item') || typeof isChecked !== 'undefined';

              if (isTaskListItem) {
                return (
                  <li style={{
                    listStyleType: 'none',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    marginBottom: '8px',
                    marginLeft: 0,
                    transition: 'all 0.2s ease',
                  }}>
                    <div style={{
                      marginTop: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      width: '18px',
                      height: '18px',
                      borderRadius: '4px',
                      background: isChecked ? '#10b981' : 'transparent',
                      border: `2px solid ${isChecked ? '#10b981' : theme.divider}`,
                      transition: 'all 0.2s ease',
                    }}>
                      {isChecked ? (
                        <Check size={12} color="#ffffff" strokeWidth={4} />
                      ) : null}
                    </div>
                    <div style={{
                      flex: 1,
                      color: isChecked ? '#10b981' : theme.text,
                      fontSize: '0.95rem',
                      lineHeight: '1.5',
                      fontWeight: isChecked ? 600 : 400,
                      transition: 'color 0.2s ease',
                    }}>
                      {children}
                    </div>
                  </li>
                );
              }

              return (
                <li style={{
                  color: theme.text,
                  marginBottom: '4px',
                  marginLeft: '0.5rem',
                  listStyleType: 'disc'
                }}>
                  {children}
                </li>
              );
            },
            code: ({ children, className, node, ...props }) => {
              const isInline = !className;
              const match = /language-(\w+)/.exec(className || '');
              const language = match ? match[1] : '';

              if (language === 'mermaid') {
                return <MermaidDiagram chart={String(children).replace(/\n$/, '')} />;
              }

              if (isInline) {
                return (
                  <code style={{
                    color: theme.text,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '1em',
                    fontFamily: 'monospace',
                    background: `${theme.text}10`,
                  }}>
                    {children}
                  </code>
                );
              }

              return (
                <CodeBlock className={className} node={node} {...props}>
                  {children}
                </CodeBlock>
              );
            },
            blockquote: ({ children }) => {
              let type: 'default' | 'success' | 'info' | 'warning' | 'error' | 'tip' | 'note' = 'default';
              let isAdmonition = false;
              let initiallyOpen = false;
              let customTitle = '';

              const findTextContent = (node: ReactNode): string => {
                if (typeof node === 'string') return node;
                if (Array.isArray(node)) return node.map(findTextContent).join(' ');
                if (isValidElement(node)) {
                  const element = node as ReactElement<{ children?: ReactNode }>;
                  if (element.props.children) {
                    return findTextContent(element.props.children);
                  }
                }
                return '';
              };

              const textContent = findTextContent(children).trim();

              const admonitionMatch = textContent.match(/^(\?{3}|!{3})\s*([+-])?\s*(\w+)(?:\s+"([^"]+)")?/i);
              if (admonitionMatch) {
                isAdmonition = true;
                initiallyOpen = admonitionMatch[2] === '+';
                const typeStr = admonitionMatch[3].toLowerCase();
                customTitle = admonitionMatch[4] || admonitionMatch[3].charAt(0).toUpperCase() + admonitionMatch[3].slice(1);

                if (typeStr === 'success' || typeStr === 'check') type = 'success';
                else if (typeStr === 'info' || typeStr === 'abstract' || typeStr === 'todo') type = 'info';
                else if (typeStr === 'warning' || typeStr === 'caution' || typeStr === 'attention') type = 'warning';
                else if (typeStr === 'error' || typeStr === 'danger' || typeStr === 'failure') type = 'error';
                else if (typeStr === 'tip' || typeStr === 'hint' || typeStr === 'important') type = 'tip';
                else if (typeStr === 'note' || typeStr === 'quote' || typeStr === 'cite') type = 'note';
              } else {
                const tags = ['[!SUCCESS]', '[!INFO]', '[!WARNING]', '[!ERROR]', '[!TIP]', '[!NOTE]'];
                const matchedTag = tags.find(tag => textContent.toUpperCase().includes(tag));

                if (matchedTag) {
                  const upperTag = matchedTag.toUpperCase();
                  if (upperTag === '[!SUCCESS]') type = 'success';
                  else if (upperTag === '[!INFO]') type = 'info';
                  else if (upperTag === '[!WARNING]') type = 'warning';
                  else if (upperTag === '[!ERROR]') type = 'error';
                  else if (upperTag === '[!TIP]') type = 'tip';
                  else if (upperTag === '[!NOTE]') type = 'note';
                }
              }

              const stripTag = (node: ReactNode): ReactNode => {
                if (typeof node === 'string') {
                  let cleaned = node.replace(/\[!(SUCCESS|INFO|WARNING|ERROR|TIP|NOTE)\]/gi, '');
                  cleaned = cleaned.replace(/^(\?{3}|!{3})\s*[+-]?\s*\w+(?:\s+"[^"]+")?/gi, '');
                  return cleaned.trimStart();
                }
                if (Array.isArray(node)) {
                  return node.map(stripTag);
                }
                if (isValidElement(node)) {
                  const element = node as ReactElement<{ children?: ReactNode }>;
                  if (element.props.children) {
                    return cloneElement(element, {
                      children: stripTag(element.props.children)
                    });
                  }
                }
                return node;
              };

              const cleanChildren = (isAdmonition || textContent.includes('[!')) ? stripTag(children) : children;

              const getStyles = () => {
                switch (type) {
                  case 'success': return { border: '#10b981', bg: '#10b98112', icon: <CheckCircle2 size={20} color="#10b981" /> };
                  case 'info': return { border: '#3b82f6', bg: '#3b82f612', icon: <Info size={20} color="#3b82f6" /> };
                  case 'warning': return { border: '#f59e0b', bg: '#f59e0b12', icon: <AlertTriangle size={20} color="#f59e0b" /> };
                  case 'error': return { border: '#ef4444', bg: '#ef444412', icon: <AlertCircle size={20} color="#ef4444" /> };
                  case 'tip': return { border: '#8b5cf6', bg: '#8b5cf612', icon: <Lightbulb size={20} color="#8b5cf6" /> };
                  case 'note': return { border: '#64748b', bg: '#64748b12', icon: <StickyNote size={20} color="#64748b" /> };
                  default: return { border: theme.primary, bg: `${theme.primary}05`, icon: null };
                }
              };

              const { border, bg, icon } = getStyles();

              if (isAdmonition) {
                return (
                  <details
                    open={initiallyOpen}
                    style={{
                      margin: '1.5rem 0',
                      background: `${border}05`,
                      borderRadius: '12px',
                      border: `1px solid ${border}20`,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                      backdropFilter: 'blur(12px)',
                      width: '100%',
                    }}
                  >
                    <summary style={{
                      padding: '14px 16px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      borderLeft: `4px solid ${border}`,
                      fontWeight: 700,
                      listStyle: 'none',
                      userSelect: 'none',
                      background: `${border}08`,
                      transition: 'background 0.2s ease',
                    }}>
                      <style>{`
           summary::-webkit-details-marker { display: none; }
           summary::marker { display: none; }
          `}</style>
                      <div style={{ flexShrink: 0, marginTop: '4px', display: 'flex' }}>
                        {icon}
                      </div>
                      <span style={{
                        flex: 1,
                        color: theme.text,
                        fontSize: '0.95rem',
                        lineHeight: '1.4',
                        letterSpacing: '-0.01em',
                        minWidth: 0,
                        overflowWrap: 'break-word'
                      }}>
                        {customTitle}
                      </span>
                      <div className="chevron" style={{ marginTop: '4px', opacity: 0.5, flexShrink: 0 }}>
                        <ChevronDown size={18} color={theme.text} />
                      </div>
                    </summary>
                    <div style={{
                      padding: '16px 20px',
                      borderLeft: `4px solid ${border}`,
                      lineHeight: '1.7',
                      color: theme.text,
                      textAlign: 'justify',
                      fontSize: '0.95rem',
                      minWidth: 0,
                      overflowWrap: 'break-word'
                    }}>
                      {cleanChildren}
                    </div>
                  </details>
                );
              }

              return (
                <blockquote style={{
                  borderLeft: `4px solid ${border}`,
                  margin: '1.5rem 0',
                  color: theme.text,
                  background: `${border}05`,
                  padding: '16px 20px',
                  borderRadius: '0 12px 12px 0',
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'flex-start',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                  backdropFilter: 'blur(8px)',
                  width: '100%',
                }}>
                  <div style={{ flexShrink: 0, marginTop: '4px' }}>
                    {icon || <Info size={20} color={border} />}
                  </div>
                  <div style={{
                    flex: 1,
                    minWidth: 0,
                    fontSize: '1rem',
                    lineHeight: '1.8',
                    color: theme.text,
                    textAlign: 'justify',
                    overflowWrap: 'break-word'
                  }}>
                    {cleanChildren}
                  </div>
                </blockquote>
              );
            },
            table: ({ children }) => (
              <div style={{ overflowX: 'auto', marginBottom: '2rem' }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  border: `1px solid ${theme.divider}`,
                  borderRadius: '12px',
                  overflow: 'hidden'
                }}>
                  {children}
                </table>
              </div>
            ),
            thead: ({ children }) => (
              <thead style={{ background: `${theme.primary}10` }}>
                {children}
              </thead>
            ),
            th: ({ children }) => (
              <th style={{
                padding: '12px 16px',
                textAlign: 'left',
                fontWeight: 700,
                color: theme.text,
                borderBottom: `2px solid ${theme.divider}`,
              }}>
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td style={{
                padding: '12px 16px',
                borderBottom: `1px solid ${theme.divider}`,
                color: theme.text,
                fontSize: '1rem',
                lineHeight: '1.6'
              }}>
                {children}
              </td>
            ),
            img: ({ src, alt }) => {
              if (typeof src !== 'string') return null;
              let finalSrc: string = src;
              if (src.includes('assets/images/')) {
                const filename = src.split('assets/images/').pop();
                finalSrc = `${API_URL}/api/docs/assets/images?p=${filename}`;
              }
              return (
                <img
                  src={finalSrc}
                  alt={alt}
                  style={{
                    maxWidth: '100%',
                    height: 'auto',
                    borderRadius: '12px',
                    marginTop: '1.5rem',
                    marginBottom: '1.5rem',
                    boxShadow: theme.shadowMd,
                    border: `1px solid ${theme.divider}`
                  }}
                />
              );
            },
            a: ({ href, children }) => {
              if (typeof href !== 'string') return <a href={href}>{children}</a>;
              let finalHref = href;
              if (href.includes('assets/pdf/')) {
                const filename = href.split('assets/pdf/').pop();
                finalHref = `${API_URL}/api/docs/assets/pdf?p=${filename}`;
              }
              return (
                <a
                  href={finalHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: theme.primary,
                    textDecoration: 'none',
                    borderBottom: `1px solid ${theme.primary}50`,
                    transition: 'all 0.2s ease',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderBottomColor = theme.primary;
                    e.currentTarget.style.background = `${theme.primary}10`;
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderBottomColor = `${theme.primary}50`;
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  {children}
                </a>
              );
            }
          }}
        >
          {content || ''}
        </ReactMarkdown>
      </div>
    </Suspense>
  );
}
