import { type Metadata } from 'next/types';
import { NotFoundPage } from 'nextra-theme-docs';

export const metadata: Metadata = {
	title: '404 - Page not found',
	description: 'The page is not found',
};

export default async function NotFound() {
	return (
		<NotFoundPage content="Submit an issue" labels="broken-link">
			<h1>The page is not found</h1>
		</NotFoundPage>
	);
}
