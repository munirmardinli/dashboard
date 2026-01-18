import 'nextra-theme-docs/style.css';
import 'katex/dist/katex.min.css';
import { Layout, Navbar } from 'nextra-theme-docs';
import { getPageMap } from 'nextra/page-map';
import { Search } from 'nextra/components/search';

import packageJson from '../../../package.json';

import { type Metadata } from 'next/types';

export const metadata: Metadata = {
	title: '%s',
	description: '%s',
};


export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {

	const sidebarData = await getPageMap("/docs");
	return (
		<div className="antialiased tracking-tight">
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
		</div>
	);
}
