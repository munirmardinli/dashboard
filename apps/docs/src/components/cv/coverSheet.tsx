'use client';
import { Page, Text, View, Image } from '@react-pdf/renderer';
import React, { ReactElement, useEffect, useState } from 'react';
import { get } from '@/utils/get';
import { styles } from '@/styles/cv';

export default function CoverSheetOverwie({
	filename,
}: {
	filename: string;
}): ReactElement {
	const currentDate = new Date().toLocaleDateString('de-DE', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	});

	const [data, setData] = useState<CvProps>({
		user: null,
		transmitter: null,
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

	return (
		<Page size="A4" style={styles.coverSheetPage}>
			<View style={styles.headerSection}>
				<View style={styles.profileContainer}>
					{data.user?.image && (
						<View style={styles.imageContainer}>
							<Image
								style={styles.coverSheetProfileImage}
								src={data.user.image}
							/>
						</View>
					)}

					<View style={styles.nameSection}>
						<Text style={styles.coverSheetName}>
							{data.user?.firstName} {data.user?.lastName}
						</Text>

						<View style={{ height: 12 }} />
						<View style={styles.contactInfo}>
							<View style={styles.contactItem}>
								<Text>📍</Text>
								<Text style={styles.coverSheetContactText}>
									{data.transmitter?.address}, {data.transmitter?.zipCity}
								</Text>
							</View>

							<View style={styles.contactItem}>
								<Text>📞</Text>
								<Text style={styles.coverSheetContactText}>
									{data.transmitter?.phone}
								</Text>
							</View>

							<View style={styles.contactItem}>
								<Text>✉️</Text>
								<Text style={styles.coverSheetContactText}>
									{data.user?.mail}
								</Text>
							</View>
						</View>
					</View>
				</View>
			</View>

			<View style={styles.contentSection}>
				{data.coverSheet?.attachments &&
					data.coverSheet.attachments.length > 0 && (
						<View style={styles.attachmentsSection}>
							<Text style={styles.coverSheetSectionTitle}>
								{data.coverSheet.attachmentCaption}
							</Text>

							<View style={styles.attachmentsList}>
								{data.coverSheet.attachments.map((item, index) => (
									<View key={index} style={styles.attachmentItem}>
										<Text>📄 </Text>
										<Text style={styles.attachmentText}>{item?.name}</Text>
									</View>
								))}
							</View>
						</View>
					)}
			</View>
			<View style={styles.footer}>
				<Text style={styles.footerText}>
					{data.coverSheet?.suggestion} von {data.user?.firstName}{' '}
					{data.user?.lastName}
				</Text>
				<Text style={styles.footerText}>{currentDate}</Text>
			</View>
		</Page>
	);
}
