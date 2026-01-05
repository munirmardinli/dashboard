import 'nextra-theme-docs/style.css';
import 'katex/dist/katex.min.css';
import { Layout, Navbar } from 'nextra-theme-docs';
import { getPageMap } from 'nextra/page-map';
import { Head } from 'nextra/components/head';
import { Search } from 'nextra/components/search';
import FontManager from '@/utils/font';

import '@/app/_metadata';
import packageJson from 'package.json';

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {

	const sidebarData = await getPageMap();
	return (
		<html
			lang="en"
			className={`${FontManager.FontCompany.className}`}
			suppressHydrationWarning
		>
			<Head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<meta name="robots" content="index, follow" />
				<meta name="theme-color" content="#000000" />
			</Head>
			<body className="antialiased tracking-tight">
				<Layout
					sidebar={{ autoCollapse: true }}
					navbar={
						<Navbar
							logoLink="/"
							projectLink={packageJson.preview.repoUrl}
							logo={
								<span className="ml-[0.4em] font-extrabold">
									{packageJson.preview.headerTitel}
								</span>
							}
							align="left"
						/>
					}
					docsRepositoryBase={packageJson.preview.repoUrl}
					pageMap={sidebarData}
					feedback={{ content: null }}
					search={<Search placeholder="Suche..." />}
					editLink={false}
				>
					{children}
				</Layout>
			</body>
		</html>
	);
}
