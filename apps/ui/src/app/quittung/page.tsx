"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, Image as ImageIcon, Loader2, Check, X } from "lucide-react";

export default function QuittungPage() {
	const [selectedImage, setSelectedImage] = useState<string | null>(null);
	const [imageFile, setImageFile] = useState<File | null>(null);
	const [analyzedData, setAnalyzedData] = useState<AnalyzedData | null>(null);
	const [, setExpenses] = useState<ExpenseData[]>([]);
	const [isAnalyzing, setIsAnalyzing] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		fetchExpenses();
	}, []);

	const API_URL = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:4012');
	async function fetchExpenses() {
		try {
			const response = await fetch(`${API_URL}/api/data/expense`);
			if (response.ok) {
				const data = await response.json();
				setExpenses(data.filter((exp: ExpenseData) => !exp.isArchive));
			}
		} catch (err) {
			console.error("Failed to fetch expenses:", err);
		}
	}

	function handleImageSelect(event: React.ChangeEvent<HTMLInputElement>) {
		const file = event.target.files?.[0];
		if (file) {
			setImageFile(file);
			const reader = new FileReader();
			reader.onloadend = () => {
				setSelectedImage(reader.result as string);
			};
			reader.readAsDataURL(file);
			setAnalyzedData(null);
			setError(null);
			setSuccessMessage(null);
		}
	}

	async function handleAnalyze() {
		if (!selectedImage) return;

		setIsAnalyzing(true);
		setError(null);
		setSuccessMessage(null);

		try {
			const response = await fetch(`${API_URL}/api/receipt/analyze`, {
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
				setError(result.error || "Fehler bei der Analyse");
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : "Netzwerkfehler");
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
			const response = await fetch(`${API_URL}/api/data/expense`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(analyzedData),
			});

			if (response.ok) {
				setSuccessMessage("Ausgabe erfolgreich gespeichert!");
				setSelectedImage(null);
				setImageFile(null);
				setAnalyzedData(null);
				if (fileInputRef.current) {
					fileInputRef.current.value = "";
				}
				await fetchExpenses();
			} else {
				setError("Fehler beim Speichern");
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : "Netzwerkfehler");
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
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	}

	return (
		<div style={{
			padding: "2rem",
			maxWidth: "1200px",
			margin: "0 auto",
			backgroundColor: "#0f172a",
			minHeight: "100vh",
			color: "#e2e8f0"
		}}>
			<h1 style={{
				fontSize: "2rem",
				fontWeight: "bold",
				marginBottom: "2rem",
				color: "#f1f5f9"
			}}>
				Quittung hochladen
			</h1>

			{successMessage && (
				<div
					style={{
						padding: "1rem",
						marginBottom: "1rem",
						backgroundColor: "#059669",
						color: "white",
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
						backgroundColor: "#dc2626",
						color: "white",
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
				{/* Upload Section */}
				<div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
					<h2 style={{
						fontSize: "1.5rem",
						fontWeight: "bold",
						marginBottom: "0",
						color: "#f1f5f9"
					}}>
						Bild hochladen
					</h2>
					<div
						style={{
							border: "2px dashed #475569",
							borderRadius: "0.5rem",
							padding: "2rem",
							textAlign: "center",
							backgroundColor: "#1e293b",
						}}
					>
						<input
							ref={fileInputRef}
							type="file"
							accept="image/jpeg,image/png,image/heic,image/heif"
							onChange={handleImageSelect}
							style={{ display: "none" }}
							id="receipt-upload"
						/>
						<label
							htmlFor="receipt-upload"
							style={{
								cursor: "pointer",
								display: "flex",
								flexDirection: "column",
								alignItems: "center",
								gap: "1rem",
							}}
						>
							{selectedImage ? (
								<ImageIcon size={48} color="#94a3b8" />
							) : (
								<Upload size={48} color="#94a3b8" />
							)}
							<span style={{ color: "#94a3b8" }}>
								{imageFile ? imageFile.name : "Bild auswählen"}
							</span>
						</label>
					</div>

					{selectedImage && (
						<div style={{ marginTop: "1rem" }}>
							<img
								src={selectedImage}
								alt="Receipt preview"
								style={{
									width: "100%",
									borderRadius: "0.5rem",
									border: "1px solid #334155",
								}}
							/>
							<div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
								<button
									onClick={handleAnalyze}
									disabled={isAnalyzing}
									style={{
										flex: 1,
										padding: "0.75rem",
										backgroundColor: isAnalyzing ? "#64748b" : "#3b82f6",
										color: "white",
										border: "none",
										borderRadius: "0.5rem",
										cursor: isAnalyzing ? "not-allowed" : "pointer",
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
											Analysiere...
										</>
									) : (
										"Analysieren"
									)}
								</button>
								<button
									onClick={handleReset}
									style={{
										padding: "0.75rem",
										backgroundColor: "#dc2626",
										color: "white",
										border: "none",
										borderRadius: "0.5rem",
										cursor: "pointer",
										fontWeight: "500",
									}}
								>
									Zurücksetzen
								</button>
							</div>
						</div>
					)}
				</div>

				{/* Preview Section */}
				<div style={{ display: "flex", flexDirection: "column" }}>
					<h2 style={{
						fontSize: "1.5rem",
						fontWeight: "bold",
						marginBottom: "0",
						color: "#f1f5f9"
					}}>
						Vorschau
					</h2>

					{analyzedData ? (
						<div
							style={{
								border: "1px solid #334155",
								borderRadius: "0.5rem",
								padding: "1.5rem",
								backgroundColor: "#1e293b",
								flex: 1,
								display: "flex",
								flexDirection: "column",
								marginTop: "1rem"
							}}
						>
							<div style={{ marginBottom: "1rem", color: "#e2e8f0" }}>
								<strong style={{ color: "#94a3b8" }}>Geschäft:</strong> {analyzedData.store}
							</div>
							<div style={{ marginBottom: "1rem", color: "#e2e8f0" }}>
								<strong style={{ color: "#94a3b8" }}>Datum:</strong> {new Date(analyzedData.date).toLocaleString("de-DE")}
							</div>
							<div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
								<strong style={{ color: "#94a3b8" }}>Artikel:</strong>
								<div style={{ marginTop: "0.5rem", flex: 1, overflowY: "auto" }}>
									{analyzedData.items.length === 0 ? (
										<div style={{
											padding: "2rem",
											textAlign: "center",
											color: "#64748b",
											fontStyle: "italic"
										}}>
											Keine Artikel gefunden
										</div>
									) : (
										analyzedData.items.map((item, idx) => (
											<div
												key={idx}
												style={{
													display: "flex",
													justifyContent: "space-between",
													padding: "0.5rem",
													borderBottom: "1px solid #334155",
													color: "#e2e8f0"
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
											borderTop: "2px solid #475569",
											marginTop: "0.5rem",
											color: "#f1f5f9"
										}}
									>
										<span>Gesamt:</span>
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
									backgroundColor: isSaving ? "#64748b" : "#059669",
									color: "white",
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
										Speichere...
									</>
								) : (
									"Erstellen"
								)}
							</button>
						</div>
					) : (
						<div
							style={{
								border: "1px dashed #475569",
								borderRadius: "0.5rem",
								padding: "2rem",
								textAlign: "center",
								color: "#64748b",
								backgroundColor: "#1e293b",
								flex: 1,
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								marginTop: "1rem"
							}}
						>
							Keine Daten zum Anzeigen. Bitte laden Sie ein Bild hoch und analysieren Sie es.
						</div>
					)}
				</div>
			</div>


			<style jsx>{`
				@keyframes spin {
					from {
						transform: rotate(0deg);
					}
					to {
						transform: rotate(360deg);
					}
				}
				:global(.spin) {
					animation: spin 1s linear infinite;
				}
			`}</style>
		</div>
	);
}
