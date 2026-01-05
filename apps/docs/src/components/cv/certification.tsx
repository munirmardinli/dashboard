'use client';
import { Page, Image } from '@react-pdf/renderer';
import { ReactElement, useEffect, useState } from 'react';
import { get } from '@/utils/get';

export default function Certification(): ReactElement {
	const [data, setData] = useState<CvProps>({
		coverSheet: null,
	});

	useEffect(() => {
		const loadCvData = async () => {
			try {
				const cvData = await get<CvProps>('cv.json');
				setData(cvData);
			} catch (error) {
				console.error('Fehler beim Laden der CV-Daten:', error);
			}
		};

		loadCvData();
	}, []);

	return (
		<>
			{data.coverSheet?.documents?.map((item, index) => (
				<Page
					key={index}
					size="A4"
					style={{
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
					}}
				>
					<Image
						src={item?.url ?? ''}
						style={{ width: '100%', height: '100%' }}
					/>
				</Page>
			))}
		</>
	);
}
