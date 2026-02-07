"use client";

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getTheme } from '@/utils/theme';
import { useThemeStore } from '@/stores/themeStore';
import { useSearchParams, notFound } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { DocsAPI } from '@/utils/api';

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
					setContent(data);
				} else {
					notFound();
				}
			})
			.catch(() => notFound())
			.finally(() => setLoading(false));
	}, [p]);

	if (loading) return <div style={{ color: theme.text }}>Lade...</div>;

	return (
		<div className="markdown-container" style={{ color: theme.text }}>
			<ReactMarkdown
				remarkPlugins={[remarkGfm]}
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
							color: theme.textSec,
							textAlign: 'justify'
						}}>
							{children}
						</p>
					),
					ul: ({ children }) => (
						<ul style={{
							marginBottom: '1.25rem',
							paddingLeft: '1.5rem',
							color: theme.textSec,
						}}>
							{children}
						</ul>
					),
					li: ({ children }) => (
						<li style={{
							marginBottom: '0.5rem',
							lineHeight: '1.6'
						}}>
							{children}
						</li>
					),
					code: ({ children, className }) => {
						const isInline = !className;
						return isInline ? (
							<code style={{
								background: `${theme.primary}20`,
								color: theme.primary,
								padding: '2px 6px',
								borderRadius: '4px',
								fontSize: '0.9em',
								fontFamily: 'monospace',
							}}>
								{children}
							</code>
						) : (
							<pre style={{
								background: theme.paper,
								backdropFilter: 'blur(16px)',
								padding: '24px',
								borderRadius: '16px',
								border: `1px solid ${theme.divider}`,
								overflowX: 'auto',
								marginBottom: '1.5rem',
								boxShadow: theme.shadowMd,
							}}>
								<code style={{
									color: theme.text,
									fontSize: '0.9em',
									fontFamily: 'monospace',
									lineHeight: '1.5'
								}}>
									{children}
								</code>
							</pre>
						);
					},
					blockquote: ({ children }) => (
						<blockquote style={{
							borderLeft: `4px solid ${theme.primary}`,
							paddingLeft: '20px',
							margin: '2rem 0',
							fontStyle: 'italic',
							color: theme.textSec,
							background: `${theme.primary}05`,
							padding: '20px 24px',
							borderRadius: '0 16px 16px 0',
						}}>
							{children}
						</blockquote>
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
