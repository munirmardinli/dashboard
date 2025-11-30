export class EmailTemplateStyles {
	static generateStyles(isDarkMode = false): string {
		const primaryColor = isDarkMode ? "#6366f1" : "#6366f1";
		const primaryLight = isDarkMode ? "#818cf8" : "#818cf8";
		const primaryDark = isDarkMode ? "#4f46e5" : "#4f46e5";

		const background = isDarkMode ? "#0f172a" : "#f8fafc";
		const paper = isDarkMode ? "#1e293b" : "#ffffff";
		const textPrimary = isDarkMode ? "#f8fafc" : "#1e293b";
		const textSecondary = isDarkMode ? "#cbd5e1" : "#475569";
		const textMuted = isDarkMode ? "#94a3b8" : "#64748b";
		const divider = isDarkMode ? "rgba(100, 116, 139, 0.2)" : "rgba(148, 163, 184, 0.2)";
		const footerBg = isDarkMode ? "#1e293b" : "#f1f5f9";
		const headerBg = primaryColor;
		const headerText = textPrimary;

		return `
			* {
				margin: 0;
				padding: 0;
				box-sizing: border-box;
			}
			
			html {
				height: 100%;
				width: 100%;
			}
			
			body {
				font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
				line-height: 1.6;
				color: ${textPrimary};
				background-color: ${background};
				margin: 0;
				padding: 20px;
				-webkit-font-smoothing: antialiased;
				-moz-osx-font-smoothing: grayscale;
			}
			
			.container {
				max-width: 600px;
				margin: 0 auto;
				background-color: ${paper};
				border-radius: 16px;
				overflow: hidden;
				box-shadow: ${isDarkMode
			? "0 8px 32px rgba(0, 0, 0, 0.4)"
			: "0 8px 32px rgba(31, 38, 135, 0.15)"};
				border: 1px solid ${divider};
				backdrop-filter: blur(10px);
			}
			
			.header {
				background-color: ${headerBg};
				color: ${headerText};
				padding: 32px 24px;
				text-align: center;
			}
			
			.header h1 {
				margin: 0;
				font-size: 28px;
				font-weight: 700;
				letter-spacing: -0.5px;
				color: ${headerText};
			}
			
			.content {
				padding: 32px 24px;
				background-color: ${paper};
			}
			
			.content p {
				white-space: pre-wrap;
				color: ${textPrimary};
				font-size: 16px;
				line-height: 1.7;
				margin: 0 0 16px 0;
			}
			
			.content p:last-child {
				margin-bottom: 0;
			}
			
			.content h1 {
				color: ${primaryColor};
				font-size: 28px;
				font-weight: 700;
				margin: 0 0 20px 0;
				letter-spacing: -0.5px;
			}
			
			.content h2 {
				color: ${textPrimary};
				font-size: 24px;
				font-weight: 600;
				margin: 0 0 16px 0;
				letter-spacing: -0.3px;
			}
			
			.content h3 {
				color: ${textPrimary};
				font-size: 20px;
				font-weight: 600;
				margin: 0 0 14px 0;
			}
			
			.content h4 {
				color: ${textPrimary};
				font-size: 18px;
				font-weight: 600;
				margin: 0 0 12px 0;
			}
			
			.content .text-muted {
				color: ${textSecondary};
				font-size: 16px;
			}
			
			.content .text-small {
				color: ${textMuted};
				font-size: 14px;
				margin-top: 20px;
			}
			
			.content strong {
				font-weight: 600;
				color: ${textPrimary};
			}
			
			.content em {
				font-style: italic;
				color: ${textSecondary};
			}
			
			.content a {
				color: ${primaryColor};
				text-decoration: none;
				border-bottom: 1px solid ${primaryLight};
				transition: all 0.2s ease;
			}
			
			.content a:hover {
				color: ${primaryDark};
				border-bottom-color: ${primaryColor};
			}
			
			.content ul,
			.content ol {
				margin: 0 0 16px 0;
				padding-left: 24px;
				color: ${textPrimary};
			}
			
			.content li {
				margin-bottom: 8px;
			}
			
			.content code {
				background-color: ${isDarkMode ? "#1e293b" : "#f1f5f9"};
				color: ${primaryColor};
				padding: 2px 6px;
				border-radius: 4px;
				font-family: "Monaco", "Courier New", monospace;
				font-size: 14px;
			}
			
			.content blockquote {
				border-left: 4px solid ${primaryColor};
				padding-left: 16px;
				margin: 16px 0;
				color: ${textSecondary};
				font-style: italic;
			}
			
			.footer {
				padding: 24px;
				background-color: ${footerBg};
				border-top: 1px solid ${divider};
				text-align: center;
				font-size: 14px;
				color: ${textSecondary};
			}
			
			.footer-text {
				margin: 0;
				padding: 4px 0;
				line-height: 1.6;
			}
			
			.footer-text:first-child {
				padding-top: 0;
			}
			
			.footer-text:last-child {
				padding-bottom: 0;
			}
			
			@media only screen and (max-width: 600px) {
				body {
					padding: 12px;
				}
				
				.container {
					border-radius: 12px;
				}
				
				.header {
					padding: 24px 20px;
				}
				
				.header h1 {
					font-size: 24px;
				}
				
				.content {
					padding: 24px 20px;
				}
				
				.content h1 {
					font-size: 24px;
				}
				
				.content h2 {
					font-size: 20px;
				}
				
				.content h3 {
					font-size: 18px;
				}
				
				.footer {
					padding: 20px;
				}
			}
			
			@media only screen and (max-width: 480px) {
				body {
					padding: 8px;
				}
				
				.container {
					border-radius: 8px;
				}
				
				.header {
					padding: 20px 16px;
				}
				
				.header h1 {
					font-size: 22px;
				}
				
				.content {
					padding: 20px 16px;
				}
				
				.content p {
					font-size: 15px;
				}
				
				.footer {
					padding: 16px;
					font-size: 13px;
				}
			}
			
			@media (prefers-color-scheme: dark) {
				body {
					background-color: ${isDarkMode ? "#0f172a" : "#f8fafc"};
				}
			}
		`;
	}
}

