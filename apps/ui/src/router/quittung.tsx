"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, Image as ImageIcon, Loader2, Check, X, Camera } from "lucide-react";
import { useI18nStore } from "@/stores/i18nStore";
import { useThemeStore } from "@/stores/themeStore";
import { getTheme } from "@/utils/theme";
import { globalVars } from "@/utils/globalyVar";

function compressImage(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const MAX_PX = 2048;
		const QUALITY = 0.85;
		const url = URL.createObjectURL(file);
		const img = new Image();
		img.onload = () => {
			URL.revokeObjectURL(url);
			let { width, height } = img;
			if (width > MAX_PX || height > MAX_PX) {
				if (width > height) {
					height = Math.round((height * MAX_PX) / width);
					width = MAX_PX;
				} else {
					width = Math.round((width * MAX_PX) / height);
					height = MAX_PX;
				}
			}
			const canvas = document.createElement("canvas");
			canvas.width = width;
			canvas.height = height;
			const ctx = canvas.getContext("2d");
			if (!ctx) return reject(new Error("Canvas nicht verfügbar"));
			ctx.drawImage(img, 0, 0, width, height);
			resolve(canvas.toDataURL("image/jpeg", QUALITY));
		};
		img.onerror = () => reject(new Error("Bild konnte nicht geladen werden"));
		img.src = url;
	});
}

function formatBytes(bytes: number) {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function QuittungPage() {
	const { t } = useI18nStore();
	const [selectedImage, setSelectedImage] = useState<string | null>(null);
	const [imageFile, setImageFile] = useState<File | null>(null);
	const [analyzedData, setAnalyzedData] = useState<AnalyzedData | null>(null);
	const [, setExpenses] = useState<ExpenseData[]>([]);
	const [isAnalyzing, setIsAnalyzing] = useState(false);
	const [isCompressing, setIsCompressing] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const cameraInputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		fetchExpenses();
	}, []);

	async function fetchExpenses() {
		try {
			const response = await fetch(`${globalVars.API_URL}/api/data/expense`);
			if (response.ok) {
				const data = await response.json();
				setExpenses(data.filter((exp: ExpenseData) => !exp.isArchive));
			}
		} catch (err) {
			console.error(t("ui.errorDetails"), err);
		}
	}

	async function handleImageSelect(event: React.ChangeEvent<HTMLInputElement>) {
		const file = event.target.files?.[0];
		if (!file) return;

		setImageFile(file);
		setAnalyzedData(null);
		setError(null);
		setSuccessMessage(null);
		setIsCompressing(true);

		try {
			const compressed = await compressImage(file);
			setSelectedImage(compressed);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Bild konnte nicht verarbeitet werden");
		} finally {
			setIsCompressing(false);
		}
	}

	async function handleAnalyze() {
		if (!selectedImage) return;

		setIsAnalyzing(true);
		setError(null);
		setSuccessMessage(null);

		try {
			const response = await fetch(`${globalVars.API_URL}/api/receipt/analyze`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ image: selectedImage }),
			});

			const result = await response.json();

			if (result.success && result.data) {
				setAnalyzedData(result.data);
			} else {
				setError(result.error || t("ui.errorDetails"));
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : t("ui.errorDetails"));
		} finally {
			setIsAnalyzing(false);
		}
	}

	async function handleCreate() {
		if (!analyzedData) return;

		setIsSaving(true);
		setError(null);
		setSuccessMessage(null);

		try {
			const response = await fetch(`${globalVars.API_URL}/api/data/expense`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(analyzedData),
			});

			if (response.ok) {
				setSuccessMessage(t("ui.copiedToClipboard"));
				setSelectedImage(null);
				setImageFile(null);
				setAnalyzedData(null);
				if (fileInputRef.current) {
					fileInputRef.current.value = "";
				}
				await fetchExpenses();
			} else {
				setError(t("ui.errorDetails"));
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : t("ui.errorDetails"));
		} finally {
			setIsSaving(false);
		}
	}

	function handleReset() {
		setSelectedImage(null);
		setImageFile(null);
		setAnalyzedData(null);
		setError(null);
		setSuccessMessage(null);
		if (fileInputRef.current) fileInputRef.current.value = "";
		if (cameraInputRef.current) cameraInputRef.current.value = "";
	}

	const mode = useThemeStore((s) => s.mode);
	const theme = getTheme(mode);

	return (
		<div style={{
			padding: "2rem",
			maxWidth: "1200px",
			margin: "0 auto",
			backgroundColor: theme.bg,
			minHeight: "100vh",
			color: theme.text,
			fontFamily: theme.fontFamily,
		}}>
			<h1 style={{
				fontSize: theme.fontSizeHero,
				fontWeight: "800",
				marginBottom: "2rem",
				background: theme.brandGradient,
				WebkitBackgroundClip: "text",
				WebkitTextFillColor: "transparent",
				lineHeight: "1.2"
			}}>
				{t("ui.receipt")}
			</h1>

			{successMessage && (
				<div
					style={{
						padding: "1rem",
						marginBottom: "1rem",
						backgroundColor: theme.success,
						color: theme.white,
						borderRadius: "0.5rem",
						display: "flex",
						alignItems: "center",
						gap: "0.5rem",
					}}
				>
					<Check size={20} />
					{successMessage}
				</div>
			)}

			{error && (
				<div
					style={{
						padding: "1rem",
						marginBottom: "1rem",
						backgroundColor: theme.error,
						color: theme.white,
						borderRadius: "0.5rem",
						display: "flex",
						alignItems: "center",
						gap: "0.5rem",
					}}
				>
					<X size={20} />
					{error}
				</div>
			)}

			<div style={{
				display: "grid",
				gap: "2rem",
				gridTemplateColumns: "1fr 1fr",
				alignItems: "stretch"
			}}>
				<div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
					<h2 style={{
						fontSize: "1.5rem",
						fontWeight: "bold",
						marginBottom: "0",
						color: theme.text,
					}}>
						{t("ui.uploadReceipt")}
					</h2>
					<div
						style={{
							border: `2px dashed ${theme.divider}`,
							borderRadius: "0.5rem",
							padding: "2rem",
							textAlign: "center",
							backgroundColor: theme.paperSec,
						}}
					>
						<input
							ref={fileInputRef}
							type="file"
							accept="image/jpeg,image/png,image/heic,image/heif,image/webp,image/*"
							onChange={handleImageSelect}
							style={{ display: "none" }}
							id="receipt-upload"
						/>
						<input
							ref={cameraInputRef}
							type="file"
							accept="image/*"
							capture="environment"
							onChange={handleImageSelect}
							style={{ display: "none" }}
							id="receipt-camera"
						/>
						<div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem", width: "100%" }}>
							{isCompressing ? (
								<>
									<Loader2 size={48} color={theme.primary} className="spin" />
									<span style={{ color: theme.textSec }}>Bild wird komprimiert…</span>
								</>
							) : selectedImage ? (
								<ImageIcon size={48} color={theme.textSec} />
							) : (
								<Upload size={48} color={theme.textSec} />
							)}
							<span style={{ color: theme.textSec, fontSize: "0.9rem", textAlign: "center" }}>
								{imageFile
									? `${imageFile.name} (${formatBytes(imageFile.size)})`
									: t("ui.selectImage")}
							</span>
							<div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", justifyContent: "center" }}>
								<label
									htmlFor="receipt-upload"
									style={{
										cursor: "pointer",
										padding: "0.5rem 1rem",
										borderRadius: "0.5rem",
										background: theme.paperSec,
										border: `1px solid ${theme.divider}`,
										color: theme.text,
										fontSize: "0.85rem",
										display: "flex",
										alignItems: "center",
										gap: "0.4rem",
									}}
								>
									<Upload size={14} /> Datei wählen
								</label>
								<label
									htmlFor="receipt-camera"
									style={{
										cursor: "pointer",
										padding: "0.5rem 1rem",
										borderRadius: "0.5rem",
										background: theme.primary,
										border: "none",
										color: theme.white,
										fontSize: "0.85rem",
										display: "flex",
										alignItems: "center",
										gap: "0.4rem",
									}}
								>
									<Camera size={14} /> Foto aufnehmen
								</label>
							</div>
						</div>
					</div>

					{selectedImage && (
						<div style={{ marginTop: "1rem" }}>
							<img
								src={selectedImage}
								alt="Receipt preview"
								style={{
									width: "100%",
									borderRadius: "0.5rem",
									border: `1px solid ${theme.divider}`,
								}}
							/>
							<div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
								<button
									onClick={handleAnalyze}
									disabled={isAnalyzing || isCompressing}
									style={{
										flex: 1,
										padding: "0.75rem",
										backgroundColor: (isAnalyzing || isCompressing) ? theme.textSec : theme.primary,
										color: theme.white,
										border: "none",
										borderRadius: "0.5rem",
										cursor: (isAnalyzing || isCompressing) ? "not-allowed" : "pointer",
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										gap: "0.5rem",
										fontWeight: "500",
									}}
								>
									{isAnalyzing ? (
										<>
											<Loader2 size={20} className="spin" />
											{t("ui.analyzing")}
										</>
									) : (
										t("ui.analyze")
									)}
								</button>
								<button
									onClick={handleReset}
									style={{
										padding: "0.75rem",
										backgroundColor: theme.error,
										color: theme.white,
										border: "none",
										borderRadius: "0.5rem",
										cursor: "pointer",
										fontWeight: "500",
									}}
								>
									{t("ui.reset")}
								</button>
							</div>
						</div>
					)}
				</div>

				<div style={{ display: "flex", flexDirection: "column" }}>
					<h2 style={{
						fontSize: "1.5rem",
						fontWeight: "bold",
						marginBottom: "0",
						color: theme.text
					}}>
						{t("ui.preview")}
					</h2>

					{analyzedData ? (
						<div
							style={{
								border: `1px solid ${theme.divider}`,
								borderRadius: "0.5rem",
								padding: "1.5rem",
								backgroundColor: theme.paper,
								flex: 1,
								display: "flex",
								flexDirection: "column",
								marginTop: "1rem"
							}}
						>
							<div style={{ marginBottom: "1rem", color: theme.text }}>
								<strong style={{ color: theme.textSec }}>{t("ui.store")}:</strong> {analyzedData.store}
							</div>
							<div style={{ marginBottom: "1rem", color: theme.text }}>
								<strong style={{ color: theme.textSec }}>{t("ui.date")}:</strong> {new Date(analyzedData.date).toLocaleString("de-DE")}
							</div>
							<div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
								<strong style={{ color: theme.textSec }}>{t("ui.items")}:</strong>
								<div style={{ marginTop: "0.5rem", flex: 1, overflowY: "auto" }}>
									{analyzedData.items.length === 0 ? (
										<div style={{
											padding: "2rem",
											textAlign: "center",
											color: theme.textSec,
											fontStyle: "italic"
										}}>
											{t("ui.noEntries")}
										</div>
									) : (
										analyzedData.items.map((item, idx) => (
											<div
												key={idx}
												style={{
													display: "flex",
													justifyContent: "space-between",
													padding: "0.5rem",
													borderBottom: `1px solid ${theme.divider}`,
													color: theme.text
												}}
											>
												<span>{item.key}</span>
												<span style={{ fontWeight: "500" }}>
													{item.value.toFixed(2)} €
												</span>
											</div>
										))
									)}
								</div>
								{analyzedData.items.length > 0 && (
									<div
										style={{
											display: "flex",
											justifyContent: "space-between",
											padding: "0.75rem 0.5rem",
											fontWeight: "bold",
											fontSize: "1.1rem",
											borderTop: `2px solid ${theme.divider}`,
											marginTop: "0.5rem",
											color: theme.text
										}}
									>
										<span>{t("ui.total")}:</span>
										<span>
											{analyzedData.items
												.reduce((sum, item) => sum + item.value, 0)
												.toFixed(2)}{" "}
											€
										</span>
									</div>
								)}
							</div>

							<button
								onClick={handleCreate}
								disabled={isSaving}
								style={{
									width: "100%",
									marginTop: "1rem",
									padding: "0.75rem",
									backgroundColor: isSaving ? theme.textSec : theme.success,
									color: theme.white,
									border: "none",
									borderRadius: "0.5rem",
									cursor: isSaving ? "not-allowed" : "pointer",
									fontWeight: "500",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									gap: "0.5rem",
								}}
							>
								{isSaving ? (
									<>
										<Loader2 size={20} className="spin" />
										{t("ui.saving")}
									</>
								) : (
									t("ui.create")
								)}
							</button>
						</div>
					) : (
						<div
							style={{
								border: `1px dashed ${theme.divider}`,
								borderRadius: "0.5rem",
								padding: "2rem",
								textAlign: "center",
								color: theme.textSec,
								backgroundColor: theme.paperSec,
								flex: 1,
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								marginTop: "1rem"
							}}
						>
							{t("ui.noData")}
						</div>
					)}
				</div>
			</div>

			<style>{`
			@keyframes spin {
				from {
					transform: rotate(0deg);
				}
				to {
					transform: rotate(360deg);
				}
			}
			.spin {
				animation: spin 1s linear infinite;
			}
		`}</style>
		</div>
	);
}
