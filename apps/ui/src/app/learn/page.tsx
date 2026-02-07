"use client";

import { useThemeStore } from "@/stores/themeStore";
import { getTheme } from "@/utils/theme";
import { useState, useMemo, useEffect } from "react";
import { LearnAPI } from "@/utils/api";
import { notFound } from "next/navigation";

export default function RandomPie() {
	const mode = useThemeStore((state) => state.mode);
	const theme = getTheme(mode);
	const [data, setData] = useState<RandomPieData | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const loadData = async () => {
			const res = await LearnAPI.getRandomPieData();
			if (res) {
				setData(res);
			}
			setLoading(false);
		};
		loadData();
	}, []);

	const initialItems: WheelItem[] = useMemo(() => {
		if (!data) return [];
		return data.items.map((item, index) => {
			const hue = (index * 360) / data.items.length;
			return {
				id: `item-${index}`,
				key: item.key,
				value: item.value,
				color: `hsl(${hue}, 90%, 65%)`
			};
		});
	}, [data]);

	const [items, setItems] = useState<WheelItem[]>([]);
	const [rotation, setRotation] = useState(0);
	const [isSpinning, setIsSpinning] = useState(false);
	const [selectedItem, setSelectedItem] = useState<WheelItem | null>(null);

	useEffect(() => {
		if (initialItems.length > 0) {
			setItems(initialItems);
		}
	}, [initialItems]);

	if (loading) {
		return (
			<div style={{
				height: "100vh",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				background: mode === 'dark' ? "#0f172a" : "#f8fafc",
				color: theme.text
			}}>
				Lade...
			</div>
		);
	}

	if (!data) return notFound();

	const spinWheel = () => {
		if (isSpinning || items.length === 0) return;
		setIsSpinning(true);
		setSelectedItem(null);

		const randomSpins = 360 * 8 + Math.random() * 360 * 4;
		const newRotation = rotation + randomSpins;
		setRotation(newRotation);

		setTimeout(() => {
			setIsSpinning(false);
			const normalizedRotation = newRotation % 360;
			const effectiveAngle = (360 - normalizedRotation) % 360;
			const sliceAngle = 360 / items.length;
			const winningIndex = Math.floor(effectiveAngle / sliceAngle);
			const winner = items[winningIndex];

			setSelectedItem(winner);
			setItems(prev => prev.filter(item => item.id !== winner.id));
		}, data.spinDuration * 1000);
	};

	const truncateText = (text: string, maxLength: number) => {
		if (text.length <= maxLength) return text;
		return text.slice(0, maxLength) + "...";
	};

	const radius = 220;
	const centerX = 250;
	const centerY = 250;

	const toFixed = (num: number) => Number(num.toFixed(4));

	const getCoordinatesForPercent = (percent: number) => {
		const x = centerX + radius * Math.cos(2 * Math.PI * percent);
		const y = centerY + radius * Math.sin(2 * Math.PI * percent);
		return [toFixed(x), toFixed(y)];
	};

	return (
		<div style={{
			minHeight: "100vh",
			display: "flex",
			flexDirection: "column",
			alignItems: "center",
			justifyContent: "center",
			padding: "20px",
			fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
			position: "relative",
			overflow: "hidden",
		}}>
			<div style={{
				position: "absolute",
				top: "50%",
				left: "50%",
				transform: "translate(-50%, -50%)",
				width: "120vw",
				height: "120vh",
				background: `
            radial-gradient(circle at 50% 50%, ${mode === 'dark' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(99, 102, 241, 0.05)'} 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, ${mode === 'dark' ? 'rgba(236, 72, 153, 0.15)' : 'rgba(236, 72, 153, 0.05)'} 0%, transparent 30%),
            radial-gradient(circle at 20% 80%, ${mode === 'dark' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.05)'} 0%, transparent 30%)
          `,
				zIndex: 0,
				pointerEvents: "none",
				filter: "blur(60px)",
			}}></div>

			<div style={{
				background: mode === 'dark' ? "rgba(15, 23, 42, 0.6)" : "rgba(255, 255, 255, 0.6)",
				backdropFilter: "blur(24px)",
				WebkitBackdropFilter: "blur(24px)",
				padding: "60px",
				borderRadius: "48px",
				border: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.4)'}`,
				boxShadow: mode === 'dark'
					? "0 32px 64px -12px rgba(0, 0, 0, 0.5)"
					: "0 32px 64px -12px rgba(0, 0, 0, 0.1)",
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				maxWidth: "800px",
				width: "100%",
				position: "relative",
				zIndex: 1,
				animation: "float 6s ease-in-out infinite"
			}}>
				<h1 style={{
					marginBottom: "3rem",
					fontSize: "3rem",
					fontWeight: "900",
					background: "linear-gradient(to right, #818cf8, #e879f9, #38bdf8)",
					WebkitBackgroundClip: "text",
					WebkitTextFillColor: "transparent",
					textAlign: "center",
					letterSpacing: "-0.03em",
					filter: "drop-shadow(0 2px 10px rgba(139, 92, 246, 0.3))"
				}}>
					{data.title}
				</h1>

				{items.length > 0 ? (
					<div style={{
						position: "relative",
						width: "500px",
						height: "500px",
						filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.25))"
					}}>
						<div style={{
							position: "absolute",
							top: "50%",
							right: "-30px",
							transform: "translateY(-50%)",
							width: "60px",
							height: "60px",
							background: "white",
							clipPath: "polygon(0 50%, 100% 0, 100% 100%)",
							zIndex: 20,
							filter: "drop-shadow(-4px 0 12px rgba(255,255,255,0.6))",
							animation: "pointerPulse 2s ease-in-out infinite"
						}}></div>

						<div style={{
							position: "relative",
							width: "100%",
							height: "100%",
							borderRadius: "50%",
							overflow: "hidden",
							border: "4px solid rgba(255,255,255,0.1)",
							boxSizing: "content-box",
							margin: "-4px"
						}}>
							<svg
								viewBox="0 0 500 500"
								style={{
									width: "100%",
									height: "100%",
									transform: `rotate(${rotation}deg)`,
									transition: isSpinning ? `transform ${data.spinDuration}s cubic-bezier(0.15, 0.85, 0.35, 1.05)` : "none"
								}}
							>
								{items.map((item, index) => {
									const sliceAngle = 1 / items.length;
									const startAngle = index * sliceAngle;
									const endAngle = (index + 1) * sliceAngle;

									const [startX, startY] = getCoordinatesForPercent(startAngle);
									const [endX, endY] = getCoordinatesForPercent(endAngle);

									const largeArcFlag = sliceAngle > 0.5 ? 1 : 0;

									const pathData = [
										`M ${centerX} ${centerY}`,
										`L ${startX} ${startY}`,
										`A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`,
										"Z"
									].join(" ");

									const midAngle = startAngle + sliceAngle / 2;
									const textRadius = radius * 0.65;
									const textX = toFixed(centerX + textRadius * Math.cos(2 * Math.PI * midAngle));
									const textY = toFixed(centerY + textRadius * Math.sin(2 * Math.PI * midAngle));

									return (
										<g key={item.id}>
											<path
												d={pathData}
												fill={item.color}
												stroke="rgba(255,255,255,0.2)"
												strokeWidth="2"
											/>
											<path
												d={pathData}
												fill="url(#sliceGradient)"
												style={{ mixBlendMode: 'overlay', opacity: 0.3 }}
												pointerEvents="none"
											/>
											<text
												x={textX}
												y={textY}
												fill="#fff"
												fontSize="14"
												fontWeight="800"
												textAnchor="middle"
												alignmentBaseline="middle"
												transform={`rotate(${toFixed(midAngle * 360)}, ${textX}, ${textY})`}
												style={{
													textShadow: "0 2px 8px rgba(0,0,0,0.3)",
													fontSmooth: "always"
												}}
											>
												{truncateText(item.key, 11)}
											</text>
										</g>
									);
								})}

								<defs>
									<radialGradient id="sliceGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
										<stop offset="40%" stopColor="white" stopOpacity="0" />
										<stop offset="100%" stopColor="black" stopOpacity="0.3" />
									</radialGradient>
								</defs>

								<circle cx={centerX} cy={centerY} r="40" fill="#ffffff" style={{ filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.2))" }} />
								<circle cx={centerX} cy={centerY} r="32" fill={theme.bg} />
							</svg>

							<div style={{
								position: "absolute",
								top: 0,
								left: 0,
								right: 0,
								bottom: 0,
								borderRadius: "50%",
								background: "linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 50%, rgba(0,0,0,0.1) 100%)",
								pointerEvents: "none"
							}}></div>
						</div>
					</div>
				) : (
					<div style={{
						width: "300px",
						height: "300px",
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						justifyContent: "center",
						background: "rgba(255,255,255,0.05)",
						borderRadius: "50%",
						border: "2px dashed " + theme.divider,
						boxShadow: "inset 0 0 40px rgba(0,0,0,0.05)",
						animation: "pulse 3s infinite ease-in-out"
					}}>
						<span style={{ fontSize: "50px", marginBottom: "16px", filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.2))" }}>🎉</span>
						<h2 style={{ margin: 0, color: theme.text, fontSize: "1.5rem", fontWeight: "700" }}>{data.ui.result.empty}</h2>
					</div>
				)}

				<button
					onClick={spinWheel}
					disabled={isSpinning || items.length === 0}
					style={{
						marginTop: "60px",
						padding: "20px 60px",
						fontSize: "1.25rem",
						fontWeight: "800",
						borderRadius: "30px",
						border: "none",
						background: isSpinning ? theme.divider : "linear-gradient(to right, #6366f1, #a855f7)",
						color: "#fff",
						cursor: isSpinning ? "not-allowed" : "pointer",
						boxShadow: isSpinning ? "none" : "0 10px 30px rgba(124, 58, 237, 0.4), inset 0 2px 4px rgba(255,255,255,0.2)",
						transform: isSpinning ? "scale(0.95)" : "scale(1)",
						transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
						opacity: isSpinning ? 0.7 : 1,
						letterSpacing: "0.05em",
						textTransform: "uppercase"
					}}
					onMouseEnter={(e) => {
						if (!isSpinning) {
							e.currentTarget.style.transform = "translateY(-4px) scale(1.05)";
							e.currentTarget.style.boxShadow = "0 20px 40px rgba(124, 58, 237, 0.5), inset 0 2px 4px rgba(255,255,255,0.3)";
						}
					}}
					onMouseLeave={(e) => {
						if (!isSpinning) {
							e.currentTarget.style.transform = "translateY(0) scale(1)";
							e.currentTarget.style.boxShadow = "0 10px 30px rgba(124, 58, 237, 0.4), inset 0 2px 4px rgba(255,255,255,0.2)";
						}
					}}
				>
					{isSpinning ? data.ui.spinButton.spinning : data.ui.spinButton.idle}
				</button>

				{selectedItem && !isSpinning && (
					<div style={{
						marginTop: "40px",
						padding: "24px 40px",
						background: mode === 'dark' ? "rgba(30, 41, 59, 0.8)" : "rgba(255, 255, 255, 0.9)",
						borderRadius: "24px",
						border: "1px solid rgba(124, 58, 237, 0.2)",
						animation: "popIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
						boxShadow: "0 20px 50px rgba(0,0,0,0.15)",
						textAlign: "center",
						backdropFilter: "blur(10px)",
						minWidth: "300px"
					}}>
						<h2 style={{
							margin: "0 0 12px 0",
							fontSize: "2.5rem",
							fontWeight: "900",
							background: `linear-gradient(135deg, ${selectedItem.color} 0%, ${theme.primary} 100%)`,
							WebkitBackgroundClip: "text",
							WebkitTextFillColor: "transparent",
							filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
							lineHeight: 1.2
						}}>
							{selectedItem.key}
						</h2>
						<p style={{
							margin: 0,
							fontSize: "1.25rem",
							color: theme.text,
							fontWeight: "500",
							opacity: 0.9
						}}>
							{selectedItem.value}
						</p>
					</div>
				)}

				<style jsx>{`
            @keyframes float {
                0% { transform: translateY(0px); }
                50% { transform: translateY(-10px); }
                100% { transform: translateY(0px); }
            }
            @keyframes pointerPulse {
                0% { filter: drop-shadow(-4px 0 12px rgba(255,255,255,0.6)); transform: translateY(-50%) scale(1); }
                50% { filter: drop-shadow(-4px 0 20px rgba(255,255,255,0.9)); transform: translateY(-50%) scale(1.1); }
                100% { filter: drop-shadow(-4px 0 12px rgba(255,255,255,0.6)); transform: translateY(-50%) scale(1); }
            }
            @keyframes popIn {
                from { opacity: 0; transform: scale(0.5) translateY(40px); }
                to { opacity: 1; transform: scale(1) translateY(0); }
            }
            @keyframes pulse {
                0% { transform: scale(1); opacity: 0.8; }
                50% { transform: scale(1.05); opacity: 1; }
                100% { transform: scale(1); opacity: 0.8; }
            }
          `}</style>
			</div>
		</div>
	);
}
