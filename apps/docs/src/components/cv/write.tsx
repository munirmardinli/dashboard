'use client';
import { Page, Text, View } from '@react-pdf/renderer';
import React, { ReactElement, useEffect, useState } from 'react';

import { get } from '@/utils/get';
import { styles } from '@/styles/cv';

export default function ApplicationLetterOverview({
	filename,
}: {
	filename: string;
}): ReactElement {
	const [data, setData] = useState<CvProps>({
		user: null,
		transmitter: null,
		applicationLetter: null,
	});
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const loadData = async () => {
			try {
				setLoading(true);
				const loadedData = (await get(filename)) as CvProps;
				setData(loadedData);
			} catch (err) {
				console.error('Fehler beim Laden der Bewerbungsdaten:', err);
			} finally {
				setLoading(false);
			}
		};

		loadData();
	}, [filename]);

	const dateFormatted = new Date().toLocaleDateString('de-DE', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	});
	const location = data.transmitter?.zipCity?.split(' ')[1] || '';

	return (
		<Page size="A4" style={styles.writePage}>
			<View style={styles.headerContainer}>
				<View style={[styles.leftBlock, { flex: 1 }]}>
					<View style={{ marginTop: 'auto' }}>
						<View style={styles.senderInfoRow}>
							<Text style={styles.senderInfoText}>
								{data?.user?.firstName} {data?.user?.lastName}
							</Text>
							<Text style={styles.senderInfoText}>•</Text>
							<Text style={styles.senderInfoText}>
								{data?.transmitter?.address}
							</Text>
							<Text style={styles.senderInfoText}>•</Text>
							<Text style={styles.senderInfoText}>
								{data?.transmitter?.zipCity}
							</Text>
						</View>
						<View style={styles.receiverBlockBottomLeft}>
							{data?.applicationLetter?.recipient?.companyName && (
								<Text style={styles.senderContactText}>
									{data?.applicationLetter?.recipient?.companyName}
								</Text>
							)}
							{data?.applicationLetter?.recipient?.contactPerson === true && (
								<Text style={styles.senderContactText}>
									{data?.applicationLetter?.recipient?.name}{' '}
								</Text>
							)}
							<Text style={styles.senderContactText}>
								{data?.applicationLetter?.recipient?.zipCity}
							</Text>
							<Text style={styles.senderContactText}>
								{data?.applicationLetter?.recipient?.address}
							</Text>
						</View>
					</View>
				</View>
				<View style={styles.rightBlockWrapper}>
					<View style={styles.verticalLine} />
					<View style={styles.rightBlock}>
						<Text style={styles.rightName}>
							{data?.user?.firstName} {data?.user?.lastName}
						</Text>
						<View style={styles.smallGap} />
						<Text style={styles.writeSectionTitle}>Kontaktdaten</Text>
						{data?.transmitter?.phone && (
							<Text style={styles.writeContactText}>
								{data?.transmitter?.phone}
							</Text>
						)}
						{data?.user?.mail && (
							<Text style={styles.writeContactText}>{data?.user?.mail}</Text>
						)}
						<View style={styles.smallGap} />
						<Text style={styles.writeSectionTitle}>Anschrift</Text>
						<Text style={styles.writeContactText}>
							{data?.user?.firstName} {data?.user?.lastName}
						</Text>
						<Text style={styles.writeContactText}>
							{data?.transmitter?.address}
						</Text>
						<Text style={styles.writeContactText}>
							{data?.transmitter?.zipCity}
						</Text>
						<Text style={styles.writeContactText}>Deutschland</Text>
					</View>
				</View>
			</View>
			<Text style={styles.dateBlock}>
				{location}, {dateFormatted}
			</Text>
			<View style={styles.subjectBlock}>
				<Text style={styles.subjectText}>
					{data?.applicationLetter?.subject}
				</Text>
			</View>
			<View style={styles.messageBlock}>
				<Text>{data?.applicationLetter?.salutation}</Text>
				<Text>{'\n'}</Text>
				<Text>{data?.events?.[0]?.message}</Text>
				<Text>{'\n'}</Text>
				<Text>{data?.applicationLetter?.farewellFormula}</Text>
				<Text>{'\n'}</Text>
				<Text>
					{data?.user?.firstName} {data?.user?.lastName}
				</Text>
			</View>
		</Page>
	);
}
