'use client';
import { Page, Text, View, Image } from '@react-pdf/renderer';
import React, { useEffect, useState } from 'react';

import { styles } from '@/styles/cv';
import { get } from '@/utils/get';
import { renderCompetenceSection } from '@/components/cv/renderCompetenceSection';

export const Cv: React.FC<{ filename: string }> = ({ filename }) => {
	const [cvData, setCvData] = useState<CvProps>({
		user: null,
		transmitter: null,
		cv: null,
	});
	const [, setLoading] = useState(true);

	useEffect(() => {
		const loadCvData = async () => {
			try {
				setLoading(true);
				const data = (await get(filename)) as CvProps;
				setCvData(data);
			} catch (err) {
				console.error('Fehler beim Laden der CV-Daten:', err);
			} finally {
				setLoading(false);
			}
		};

		loadCvData();
	}, [filename]);

	return (
		<Page size="A4" style={styles.page}>
			<View style={styles.header}>
				<View style={styles.profileBlock}>
					<View style={styles.profileImageContainer}>
						{cvData.user?.image && (
							<Image
								style={styles.profileImage}
								src={cvData.user.image}
							/>
						)}
					</View>
					<Text style={styles.name}>
						{cvData.user?.firstName + ' ' + cvData.user?.lastName}
					</Text>
				</View>
			</View>

			<View style={styles.contentGrid}>
				<View style={styles.leftColumn}>
					{cvData.cv?.contactCaption && (
						<View style={styles.section}>
							<Text style={styles.sectionTitle}>
								{cvData.cv.contactCaption}
							</Text>

							<View style={styles.contactBlockLeft}>
								{cvData.user?.mail && (
									<Text style={styles.contactText}>{cvData.user.mail}</Text>
								)}
								{cvData.transmitter?.phone && (
									<Text style={styles.contactText}>
										{cvData.transmitter.phone}
									</Text>
								)}
								{cvData.transmitter?.zipCity && (
									<Text style={styles.contactText}>
										{cvData.transmitter.zipCity}
									</Text>
								)}
								{cvData.transmitter?.address && (
									<Text style={styles.contactText}>
										{cvData.transmitter.address}
									</Text>
								)}
							</View>
						</View>
					)}

					{renderCompetenceSection(
						cvData.cv?.languagesCaption,
						cvData.cv?.language
					)}
					{renderCompetenceSection(
						cvData.cv?.mediacompetenceCaption,
						cvData.cv?.mediaCompetence
					)}
					{renderCompetenceSection(
						cvData.cv?.socialCompetenceCaption,
						cvData.cv?.socialCompetence
					)}
					{renderCompetenceSection(
						cvData.cv?.socialMediaCaption,
						cvData.cv?.socialMedia
					)}

					{cvData.cv?.hobbiesCaption && cvData.cv.hobbies?.length && (
						<View
							style={[styles.section, { marginBottom: 0, paddingBottom: 8 }]}
						>
							<Text style={styles.sectionTitle}>
								{cvData.cv.hobbiesCaption}
							</Text>
							<View style={styles.hobbiesWrap}>
								{cvData.cv.hobbies.map(
									(h, idx) =>
										h?.key1 && (
											<Text key={idx} style={styles.hobbyItem}>
												{h.key2}
											</Text>
										)
								)}
							</View>
						</View>
					)}
				</View>

				<View style={styles.rightColumn}>
					{cvData.cv?.aboutMeCaption && cvData.cv.aboutMeText && (
						<View style={styles.section}>
							<Text style={styles.sectionTitle}>
								{cvData.cv.aboutMeCaption}
							</Text>
							<Text style={styles.text}>{cvData.cv.aboutMeText}</Text>
						</View>
					)}
					{renderCompetenceSection(
						cvData.cv?.workExperienceCaption,
						cvData.cv?.workExperience,
						'practicum-style'
					)}
					{renderCompetenceSection(
						cvData.cv?.schoolEducationCaption,
						cvData.cv?.schoolEducation,
						'practicum-style'
					)}
					{renderCompetenceSection(
						cvData.cv?.practisCaption,
						cvData.cv?.practis,
						'practicum-style'
					)}
				</View>
			</View>
		</Page>
	);
};
