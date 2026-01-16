"use client";

import { useEffect, useState } from "react";
import { PortfolioAPI } from "@/utils/api";
import { useThemeStore } from "@/stores/themeStore";
import { getTheme } from "@/utils/theme";
import Image from "next/image";
import Link from "next/link";

export default function PortfolioPage() {
	const mode = useThemeStore((state) => state.mode);
	const theme = getTheme(mode);
	const [data, setData] = useState<PortfolioData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		async function loadData() {
			try {
				const portfolioData = await PortfolioAPI.getPortfolioData();
				if (portfolioData) {
					setData(portfolioData);
				} else {
					setError("Keine Daten gefunden");
				}
			} catch (err) {
				setError("Fehler beim Laden der Daten");
				console.error(err);
			} finally {
				setLoading(false);
			}
		}
		loadData();
	}, []);

	if (loading) {
		return (
			<div style={{
				minHeight: "100vh",
				background: theme.bg,
				color: theme.text,
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				fontFamily: "system-ui, -apple-system, sans-serif",
			}}>
				Laden...
			</div>
		);
	}

	if (error || !data) {
		return (
			<div style={{
				minHeight: "100vh",
				background: theme.bg,
				color: theme.text,
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				fontFamily: "system-ui, -apple-system, sans-serif",
			}}>
				<div style={{ textAlign: "center" }}>
					<h1 style={{ marginBottom: "16px" }}>Oops!</h1>
					<p>{error ?? ""}</p>
				</div>
			</div>
		);
	}

	return (
		<div style={{
			minHeight: "100vh",
			background: theme.bg,
			color: theme.text,
			fontFamily: "system-ui, -apple-system, sans-serif",
			scrollBehavior: "smooth"
		}}>
			<nav style={{
				position: "sticky",
				top: 0,
				zIndex: 100,
				background: `${theme.paper}dd`,
				backdropFilter: "blur(16px)",
				borderBottom: `1px solid ${theme.divider}`,
				padding: "16px 20px",
				transition: "background 0.3s"
			}}>
				<div style={{
					maxWidth: "1100px",
					margin: "0 auto",
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center"
				}}>
					<span style={{ fontWeight: 800, fontSize: "1.25rem", letterSpacing: "-0.02em" }}>{data.profile.firstName} {data.profile.lastName}</span>
					<div style={{ display: "flex", gap: "24px", fontSize: "0.9rem", fontWeight: 600 }}>
						{[
							{ label: data.ui?.navigation?.about, href: data.ui?.navigation?.aboutHref ?? "#about" },
							{ label: data.ui?.navigation?.projects, href: data.ui?.navigation?.projectsHref ?? "" },
							{ label: data.ui?.navigation?.skills, href: data.ui?.navigation?.skillsHref ?? "" },
							{ label: data.ui?.navigation?.experience, href: data.ui?.navigation?.experienceHref ?? "" },
							{ label: data.ui?.navigation?.contact, href: data.ui?.navigation?.contactHref ?? "" },
						].map(item => (
							<a key={item.href} href={item.href} style={{ textDecoration: "none", color: theme.text, opacity: 0.9, transition: "opacity 0.2s" }} onMouseEnter={e => e.currentTarget.style.opacity = "1"} onMouseLeave={e => e.currentTarget.style.opacity = "0.9"}>
								{item.label ?? ""}
							</a>
						))}
					</div>
				</div>
			</nav>

			{/* Hero Section */}
			<section style={{
				minHeight: "85vh",
				display: "flex",
				flexDirection: "column",
				justifyContent: "center",
				alignItems: "center",
				textAlign: "center",
				padding: "40px 20px",
				background: `radial-gradient(circle at 50% 40%, ${theme.primary}15 0%, transparent 70%)`
			}}>
				<div style={{
					position: "relative",
					width: "160px",
					height: "160px",
					borderRadius: "50%",
					overflow: "hidden",
					marginBottom: "32px",
					boxShadow: `0 0 60px ${theme.primary}40`,
					border: `4px solid ${theme.paper}`
				}}>
					<Image
						src={data.profile.image ?? ""}
						alt={data.profile.name}
						fill
						style={{ objectFit: "cover" }}
						priority
					/>
				</div>

				<span style={{
					fontSize: "1.25rem",
					color: theme.primary,
					fontWeight: 600,
					marginBottom: "16px",
					display: "block",
					letterSpacing: "0.5px"
				}}>
					{data.ui?.hero?.greeting ?? ""}
				</span>

				<h1 style={{
					fontSize: "4rem",
					fontWeight: 800,
					marginBottom: "20px",
					lineHeight: 1.1,
					background: `linear-gradient(135deg, ${theme.text} 0%, ${theme.primary} 100%)`,
					WebkitBackgroundClip: "text",
					WebkitTextFillColor: "transparent",
					letterSpacing: "-0.03em"
				}}>
					{data.profile.name}
				</h1>
				<h2 style={{
					fontSize: "1.75rem",
					color: theme.textSec,
					marginBottom: "32px",
					fontWeight: 500,
					letterSpacing: "-0.01em"
				}}>
					{data.profile.title}
				</h2>

				<p style={{
					fontSize: "1.15rem",
					color: theme.textSec,
					maxWidth: "600px",
					marginBottom: "48px",
					lineHeight: 1.6
				}}>
					{data.profile.bio}
				</p>

				<div style={{ display: "flex", gap: "16px" }}>
					<a href="#contact" style={{
						padding: "14px 32px",
						borderRadius: "100px",
						background: theme.primary,
						color: "#fff",
						textDecoration: "none",
						fontWeight: 600,
						fontSize: "1rem",
						boxShadow: theme.shadowPrimary,
						transition: "transform 0.2s, box-shadow 0.2s"
					}}>
						{data.ui?.hero?.contactMe ?? ""}
					</a>
					<a href="#about" style={{
						padding: "14px 32px",
						borderRadius: "100px",
						background: theme.paper,
						color: theme.text,
						textDecoration: "none",
						fontWeight: 600,
						fontSize: "1rem",
						border: `1px solid ${theme.divider}`,
						transition: "background 0.2s"
					}}>
						{data.ui?.hero?.learnMore ?? ""}
					</a>
				</div>
			</section>

			<section id="projects" style={{ padding: "100px 20px", maxWidth: "1200px", margin: "0 auto" }}>
				<div style={{ textAlign: "center", marginBottom: "60px" }}>
					<h2 style={{
						fontSize: "2.5rem",
						fontWeight: 800,
						marginBottom: "12px",
						letterSpacing: "-0.02em"
					}}>{data.ui?.projects?.title ?? ""}</h2>
					<p style={{ color: theme.textSec, fontSize: "1.1rem" }}>{data.ui?.projects?.label ?? ""}</p>
				</div>

				<div style={{
					display: "grid",
					gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
					gap: "32px"
				}}>
					{data.projects.map((project) => (
						<div key={project.id} style={{
							background: theme.paper,
							borderRadius: "24px",
							overflow: "hidden",
							border: `1px solid ${theme.divider}`,
							display: "flex",
							flexDirection: "column",
							transition: "transform 0.3s ease, box-shadow 0.3s ease",
							boxShadow: "0 4px 6px rgba(0,0,0,0.02)"
						}}>
							<div style={{
								position: "relative",
								height: "220px",
								background: theme.paperSec,
								borderBottom: `1px solid ${theme.divider}`
							}}>
								{project.image && (
									<Image
										src={project.image}
										alt={project.title}
										fill
										style={{ objectFit: "cover" }}
									/>
								)}
							</div>
							<div style={{ padding: "32px", flex: 1, display: "flex", flexDirection: "column" }}>
								<h3 style={{ fontSize: "1.5rem", marginBottom: "12px", fontWeight: 700 }}>{project.title}</h3>
								<p style={{ color: theme.textSec, marginBottom: "24px", lineHeight: 1.6, fontSize: "1rem", flex: 1 }}>{project.description}</p>

								<div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "32px" }}>
									{project.technologies.map((tech) => (
										<span key={tech} style={{
											padding: "6px 14px",
											borderRadius: "100px",
											background: `${theme.primary}10`,
											color: theme.primary,
											fontSize: "0.8rem",
											fontWeight: 600
										}}>
											{tech}
										</span>
									))}
								</div>

								<div style={{ display: "flex", gap: "12px", marginTop: "auto" }}>
									{project.repoUrl && (
										<Link href={project.repoUrl} target="_blank" style={{
											flex: 1,
											textAlign: "center",
											padding: "12px",
											borderRadius: "14px",
											background: theme.paperSec,
											color: theme.text,
											textDecoration: "none",
											fontSize: "0.95rem",
											fontWeight: 600,
											transition: "background 0.2s"
										}}>Code</Link>
									)}
									{project.demoUrl && (
										<Link href={project.demoUrl} target="_blank" style={{
											flex: 1,
											textAlign: "center",
											padding: "12px",
											borderRadius: "14px",
											background: theme.primary,
											color: "#fff",
											textDecoration: "none",
											fontSize: "0.95rem",
											fontWeight: 600,
											boxShadow: theme.shadowPrimary
										}}>{data.ui?.projects?.demo ?? ""}</Link>
									)}
								</div>
							</div>
						</div>
					))}
				</div>
			</section>

			<section id="skills" style={{
				padding: "100px 20px",
				background: theme.paper,
				margin: "40px 0",
				borderTop: `1px solid ${theme.divider}`,
				borderBottom: `1px solid ${theme.divider}`
			}}>
				<div style={{ maxWidth: "1100px", margin: "0 auto" }}>
					<div style={{ textAlign: "center", marginBottom: "80px" }}>
						<h2 style={{
							fontSize: "2.5rem",
							fontWeight: 800,
							marginBottom: "12px",
							letterSpacing: "-0.02em"
						}}>{data.ui?.skills?.title ?? ""}</h2>
						<p style={{ color: theme.textSec, fontSize: "1.1rem" }}>{data.ui?.skills?.label ?? ""}</p>
					</div>

					<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))", gap: "80px" }}>
						<div>
							<h3 style={{ fontSize: "1.5rem", marginBottom: "32px", color: theme.primary, fontWeight: 700 }}>Technisch</h3>
							<div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
								{data.skills.technicalSkills.map((skill) => (
									<div key={skill.name}>
										<div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
											<span style={{ fontWeight: 600, fontSize: "1rem" }}>{skill.name}</span>
										</div>
										<div style={{
											height: "8px",
											background: theme.divider,
											borderRadius: "4px",
											overflow: "hidden"
										}}>
											<div style={{
												height: "100%",
												width: `${skill.level}%`,
												background: theme.primary,
												borderRadius: "4px"
											}} />
										</div>
									</div>
								))}
							</div>
						</div>

						<div>
							<h3 style={{ fontSize: "1.5rem", marginBottom: "32px", color: theme.primary, fontWeight: 700 }}>{data.ui?.skills?.mediaCompetence}</h3>
							<div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
								{data.skills.mediaCompetence.map((skill) => (
									<div key={skill.name}>
										<div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
											<span style={{ fontWeight: 600, fontSize: "1rem" }}>{skill.name}</span>
										</div>
										<div style={{
											height: "8px",
											background: theme.divider,
											borderRadius: "4px",
											overflow: "hidden"
										}}>
											<div style={{
												height: "100%",
												width: `${skill.proficiency}%`,
												background: theme.primary,
												borderRadius: "4px"
											}} />
										</div>
									</div>
								))}
							</div>
						</div>

						<div style={{ gridColumn: "1 / -1", textAlign: "center", marginTop: "40px" }}>
							<h3 style={{ fontSize: "1.5rem", marginBottom: "32px", color: theme.primary, fontWeight: 700 }}>{data.ui?.skills?.socialCompetence}</h3>
							<div style={{ display: "flex", flexWrap: "wrap", gap: "16px", justifyContent: "center" }}>
								{data.skills.socialCompetence.map((skill) => (
									<div key={skill.name} style={{
										padding: "12px 24px",
										background: theme.bg,
										borderRadius: "100px",
										border: `1px solid ${theme.divider}`,
										fontWeight: 600,
										fontSize: "1rem",
										boxShadow: theme.shadowSm
									}}>
										{skill.name}
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			</section>

			<section id="experience" style={{ padding: "100px 20px", maxWidth: "900px", margin: "0 auto" }}>
				<div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "60px" }}>
					<h2 style={{ fontSize: "2.5rem", fontWeight: 800, letterSpacing: "-0.02em" }}>{data.ui?.experience?.title ?? "Erfahrung"}</h2>
					<span style={{ color: theme.textSec, fontSize: "1.1rem" }}>{data.ui?.experience?.label ?? ""}</span>
				</div>

				<div style={{ position: "relative", paddingLeft: "32px" }}>
					<div style={{
						position: "absolute",
						left: "0",
						top: "12px",
						bottom: "20px",
						width: "2px",
						background: `linear-gradient(to bottom, ${theme.primary}, ${theme.divider})`
					}} />

					{data.experiences.map((exp, index) => (
						<div key={exp.id} style={{
							marginBottom: "60px",
							position: "relative"
						}}>
							<div style={{
								position: "absolute",
								left: "-37px",
								top: "8px",
								width: "12px",
								height: "12px",
								borderRadius: "50%",
								background: theme.bg,
								border: `3px solid ${theme.primary}`
							}} />

							<div style={{ display: "flex", alignItems: "baseline", gap: "16px", marginBottom: "8px", flexWrap: "wrap" }}>
								<h3 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0 }}>{exp.position}</h3>
								<span style={{ fontSize: "1rem", color: theme.primary, fontWeight: 600 }}>{exp.company}</span>
							</div>

							<div style={{
								display: "inline-block",
								fontSize: "0.9rem",
								color: theme.textSec,
								marginBottom: "16px",
								fontFamily: "monospace",
								background: theme.paperSec,
								padding: "6px 12px",
								borderRadius: "8px"
							}}>
								{exp.period}
							</div>

							<p style={{ color: theme.text, lineHeight: 1.8, marginBottom: "20px", fontSize: "1.05rem", paddingLeft: "4px" }}>{exp.description}</p>

							{exp.achievements.length > 0 && (
								<div style={{
									background: theme.paper,
									padding: "32px",
									borderRadius: "24px",
									border: `1px solid ${theme.divider}`,
									boxShadow: theme.shadowSm
								}}>
									<ul style={{ paddingLeft: "20px", color: theme.textSec, lineHeight: 1.8, margin: 0, fontSize: "0.95rem" }}>
										{exp.achievements.map((achievement, i) => (
											<li key={i} style={{ marginBottom: "12px", paddingLeft: "8px" }}>{achievement}</li>
										))}
									</ul>
								</div>
							)}
						</div>
					))}
				</div>
			</section>

			<section style={{ padding: "100px 20px", maxWidth: "1100px", margin: "0 auto", borderTop: `1px solid ${theme.divider}` }}>
				<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))", gap: "80px" }}>

					<div>
						<h2 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "40px", color: theme.text }}>{data.ui?.education?.title ?? "Schulbildung"}</h2>
						<div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
							{data.education.map((edu) => (
								<div key={edu.id} style={{ display: "flex", gap: "24px", alignItems: "flex-start" }}>
									<div style={{
										fontSize: "0.95rem",
										color: theme.primary,
										fontWeight: 700,
										whiteSpace: "nowrap",
										minWidth: "150px",
										paddingTop: "4px"
									}}>
										{edu.period}
									</div>
									<p style={{ fontSize: "1.05rem", lineHeight: 1.7, margin: 0, color: theme.textSec }}>{edu.description}</p>
								</div>
							))}
						</div>
					</div>
					<div>
						<h2 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "40px", color: theme.text }}>{data.ui?.internships?.title ?? "Praktika"}</h2>
						<div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
							{data.internships.map((internship) => (
								<div key={internship.id} style={{
									padding: "32px",
									background: theme.paper,
									borderRadius: "24px",
									border: `1px solid ${theme.divider}`,
									transition: "transform 0.2s",
									boxShadow: theme.shadowSm
								}}>
									<div style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: "8px", lineHeight: 1.4 }}>{internship.description}</div>
									<div style={{ color: theme.textSec, fontSize: "0.95rem", marginTop: "12px", fontFamily: "monospace", background: theme.paperSec, display: "inline-block", padding: "4px 8px", borderRadius: "6px" }}>{internship.period}</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</section>

			<section style={{ padding: "100px 20px", maxWidth: "1100px", margin: "0 auto", borderTop: `1px solid ${theme.divider}` }}>
				<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))", gap: "80px" }}>
					<div>
						<h2 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "40px" }}>{data.ui?.languages?.title}</h2>
						<div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
							{data.languages.map((lang) => (
								<div key={lang.name} style={{
									flex: "1 1 calc(50% - 10px)",
									background: theme.paper,
									padding: "24px",
									borderRadius: "24px",
									border: `1px solid ${theme.divider}`,
									boxShadow: theme.shadowSm
								}}>
									<div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px", alignItems: "center" }}>
										<span style={{ fontWeight: 700, fontSize: "1rem" }}>{lang.name}</span>
										<span style={{ fontSize: "0.85rem", padding: "6px 12px", borderRadius: "100px", background: theme.bg, color: theme.textSec, fontWeight: 600 }}>{lang.level}</span>
									</div>
									<div style={{ height: "8px", background: theme.divider, borderRadius: "4px", overflow: "hidden" }}>
										<div style={{ height: "100%", width: `${lang.proficiency}%`, background: theme.primary, borderRadius: "4px" }} />
									</div>
								</div>
							))}
						</div>
					</div>

					{/* Hobbies */}
					<div>
						<h2 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "40px" }}>{data.ui?.hobbies?.title}</h2>
						<div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
							{data.hobbies.map((hobby) => (
								<div key={hobby.name} style={{
									padding: "16px 28px",
									background: theme.paper,
									borderRadius: "100px",
									border: `1px solid ${theme.divider}`,
									display: "flex",
									alignItems: "center",
									gap: "10px",
									fontSize: "1rem",
									fontWeight: 600,
									transition: "transform 0.2s",
									boxShadow: theme.shadowSm
								}}>
									<span>{hobby.name}</span>
								</div>
							))}
						</div>
					</div>
				</div>
			</section>

			<section id="contact" style={{
				padding: "100px 20px",
				marginTop: "40px",
				marginBottom: "40px"
			}}>
				<div style={{
					maxWidth: "700px",
					margin: "0 auto",
					background: theme.paper,
					padding: "60px",
					borderRadius: "40px",
					border: `1px solid ${theme.divider}`,
					boxShadow: theme.shadowLg
				}}>
					<div style={{ textAlign: "center", marginBottom: "40px" }}>
						<h2 style={{ fontSize: "2.5rem", fontWeight: 800, marginBottom: "12px" }}>{data.ui?.contact?.title}</h2>
						<p style={{ color: theme.textSec, fontSize: "1.1rem" }}>{data.ui?.contact?.description}</p>
					</div>

					<div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
						<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
							<div>
								<label style={{ display: "block", marginBottom: "8px", fontWeight: 600, fontSize: "0.9rem", color: theme.textSec }}>{data.ui?.contact?.form?.name}</label>
								<input type="text" placeholder={data.ui?.contact?.form?.namePlaceholder} style={{
									width: "100%",
									padding: "16px",
									borderRadius: "16px",
									border: `1px solid ${theme.divider}`,
									background: theme.bg,
									color: theme.text,
									fontSize: "1rem",
									outline: "none",
									transition: "border 0.2s"
								}} />
							</div>
							<div>
								<label style={{ display: "block", marginBottom: "8px", fontWeight: 600, fontSize: "0.9rem", color: theme.textSec }}>{data.ui?.contact?.form?.email}</label>
								<input type="email" placeholder={data.ui?.contact?.form?.emailPlaceholder} style={{
									width: "100%",
									padding: "16px",
									borderRadius: "16px",
									border: `1px solid ${theme.divider}`,
									background: theme.bg,
									color: theme.text,
									fontSize: "1rem",
									outline: "none",
									transition: "border 0.2s"
								}} />
							</div>
						</div>
						<div>
							<label style={{ display: "block", marginBottom: "8px", fontWeight: 600, fontSize: "0.9rem", color: theme.textSec }}>{data.ui?.contact?.form?.message}</label>
							<textarea placeholder={data.ui?.contact?.form?.messagePlaceholder} rows={5} style={{
								width: "100%",
								padding: "16px",
								borderRadius: "16px",
								border: `1px solid ${theme.divider}`,
								background: theme.bg,
								color: theme.text,
								fontSize: "1rem",
								outline: "none",
								resize: "vertical",
								fontFamily: "inherit",
								transition: "border 0.2s"
							}} />
						</div>

						<button style={{
							padding: "18px",
							borderRadius: "16px",
							background: theme.primary,
							color: "#fff",
							fontWeight: 700,
							fontSize: "1.1rem",
							border: "none",
							cursor: "pointer",
							transition: "opacity 0.2s, transform 0.2s",
							marginTop: "12px",
							width: "100%",
							boxShadow: theme.shadowPrimary
						}}>
							{data.ui?.contact?.form?.send}
						</button>
					</div>

					<div style={{ marginTop: "40px", display: "flex", justifyContent: "center", gap: "20px" }}>
						{data.contact.social.linkedin && (
							<Link href={data.contact.social.linkedin} target="_blank" style={{
								padding: "16px",
								borderRadius: "50%",
								background: theme.bg,
								color: theme.text,
								border: `1px solid ${theme.divider}`,
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								transition: "transform 0.2s",
								width: "56px",
								height: "56px",
								fontSize: "0.9rem",
								fontWeight: 700
							}}>
								In
							</Link>
						)}
						{data.contact.social.github && (
							<Link href={data.contact.social.github} target="_blank" style={{
								padding: "16px",
								borderRadius: "50%",
								background: theme.bg,
								color: theme.text,
								border: `1px solid ${theme.divider}`,
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								transition: "transform 0.2s",
								width: "56px",
								height: "56px",
								fontSize: "0.9rem",
								fontWeight: 700
							}}>
								Gh
							</Link>
						)}
						<a href={`mailto:${data.contact.email}`} style={{
							padding: "16px",
							borderRadius: "50%",
							background: theme.bg,
							color: theme.text,
							border: `1px solid ${theme.divider}`,
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							transition: "transform 0.2s",
							width: "56px",
							height: "56px",
							fontSize: "1.2rem",
							fontWeight: 700
						}}>
							@
						</a>
					</div>
				</div>
			</section>

			<div style={{
				padding: "60px 0",
				color: theme.textSec,
				fontSize: "0.9rem",
				borderTop: `1px solid ${theme.divider}`,
				textAlign: "center",
				background: theme.bg
			}}>
				<div style={{ maxWidth: "600px", margin: "0 auto" }}>
					<p style={{ marginBottom: "8px", fontWeight: 500 }}>© {new Date().getFullYear()} {data.profile.name}. {data.ui?.footer?.rights ?? ""}</p>
					<p style={{ opacity: 0.7 }}>{data.ui?.footer?.created ?? ""}</p>
				</div>
			</div>
		</div>
	);
}
