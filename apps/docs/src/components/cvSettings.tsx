'use client';
import { ReactElement, useEffect, useState } from 'react';
import { PDFViewer, Document } from '@react-pdf/renderer';

import { Cv } from '@/components/cv/cv';
import ApplicationLetterOverview from '@/components/cv/write';
import CoverSheetOverwie from '@/components/cv/coverSheet';
import Certification from '@/components/cv/certification';

export default function CVSettings({ filename }: ComponentProps): ReactElement {
	const [isClient, setIsClient] = useState(false);

	useEffect(() => {
		setIsClient(true);
	}, []);

	if (!isClient) {
		return (
			<div
				style={{
					width: '100%',
					height: '100vh',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
				}}
			>
				<div>PDF wird geladen...</div>
			</div>
		);
	}

	return (
		<>
			<div style={{ width: '100%', height: '100vh' }}>
				<PDFViewer width="100%" height="100%" showToolbar={false}>
					<Document>
						<CoverSheetOverwie filename={filename} />
						<Cv filename={filename} />
						<ApplicationLetterOverview filename={filename} />
						<Certification />
					</Document>
				</PDFViewer>
			</div>
		</>
	);
}
