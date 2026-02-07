"use client";

import { useState, useEffect, Suspense, ReactNode, HTMLAttributes, ReactElement, isValidElement, cloneElement } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import 'katex/dist/katex.min.css';
import { CheckCircle2, Info, AlertTriangle, AlertCircle, Lightbulb, StickyNote, ChevronDown, FileText, Copy, Check } from 'lucide-react';
import mermaid from 'mermaid';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';

import { getTheme } from '@/utils/theme';
import { useThemeStore } from '@/stores/themeStore';
import { useSearchParams } from 'next/navigation';
import { useSnackStore } from "@/stores/snackbarStore";
import { DocsAPI } from '@/utils/api';
import { useI18nStore } from '@/stores/i18nStore';

function CodeBlock({ children, className, node, ...props }: CodeBlockProps) {
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
							title="Copy code"
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

	useEffect(() => {
		const isDark = mode === 'dark' || mode === 'contrast';
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
				[Mermaid Syntax Fehler]
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

function DocContent() {
	const searchParams = useSearchParams();
	const p = searchParams.get('p') || 'index';
	const [content, setContent] = useState<string>('');
	const [loading, setLoading] = useState(true);
	const API_URL = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:4012');

	const mode = useThemeStore((s) => s.mode);
	const theme = getTheme(mode);

	useEffect(() => {
		setLoading(true);
		DocsAPI.getContent(p)
			.then(data => {
				if (data) {
					const lines = data.split('\n');
					const processedLines = [];
					let inAdmonition = false;

					for (let i = 0; i < lines.length; i++) {
						const line = lines[i];
						const trimmed = line.trim();
						const isAdmonitionStart = /^(\?{3}|!{3})[+-]?\s+\w+.*$/.test(trimmed);

						if (isAdmonitionStart) {
							processedLines.push('> ' + trimmed);
							inAdmonition = true;
						} else if (inAdmonition && (line.startsWith('    ') || line.startsWith('\t') || line.startsWith('  ') || trimmed === '')) {
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
				}
			})
			.catch(() => setContent(''))
			.finally(() => setLoading(false));
	}, [p]);

	if (loading) return <div style={{ color: theme.text }}>Lade...</div>;

	if (!content) {
		return (
			<div style={{
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				height: '60vh',
				color: theme.text,
				opacity: 0.6,
				textAlign: 'center'
			}}>
				<FileText size={48} style={{ marginBottom: '1rem' }} />
				<h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Dokumentation nicht gefunden</h2>
				<p>Bitte wähle ein anderes Thema aus der Seitenleiste.</p>
			</div>
		);
	}

	return (
		<div className="markdown-container" style={{ color: theme.text }}>
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
					ul: ({ children }) => (
						<ul style={{
							marginBottom: '1.25rem',
							paddingLeft: '1.5rem',
							color: theme.text,
						}}>
							{children}
						</ul>
					),
					li: ({ children }) => (
						<li style={{
							marginBottom: '0.4rem',
							lineHeight: '1.8',
							color: theme.text,
							textAlign: 'justify'
						}}>
							{children}
						</li>
					),
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
			</ReactMarkdown >
		</div >
	);
}

export default function DocPage() {
	return (
		<Suspense fallback={<div>Lade...</div>}>
			<DocContent />
		</Suspense>
	);
}
