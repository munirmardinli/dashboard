"use client";
import { FC, useState, useEffect, useRef, useMemo, useTransition, useCallback } from "react";
import { ChevronLeft, ChevronRight, Check, X, Calendar } from "lucide-react";

import { useI18nStore } from "@/stores/i18nStore";
import { useThemeStore } from "@/stores/themeStore";
import { getTheme } from '@/utils/theme';

const getDigitMap = (language: string): Record<string, string> => {
	return language === 'ar' ? { '0': '٠', '1': '١', '2': '٢', '3': '٣', '4': '٤', '5': '٥', '6': '٦', '7': '٧', '8': '٨', '9': '٩' }
		: { '0': '0', '1': '1', '2': '2', '3': '3', '4': '4', '5': '5', '6': '6', '7': '7', '8': '8', '9': '9' };
};

const formatNumber = (num: number, language: string): string => {
	const digitMap = getDigitMap(language);
	return String(num).split('').map(digit => digitMap[digit] || digit).join('');
};

export const DateTimePicker: FC<DateTimePickerProps> = ({
	value, onChange, label, placeholder, required, error, helperText, disabled, customInputStyle, onFocus, onBlur
}) => {
	const { language, t, isRTL, formatDateTime: formatDateTimeFromStore } = useI18nStore();
	const mode = useThemeStore((s) => s.mode);
	const theme = getTheme(mode);
	const [isOpen, setIsOpen] = useState(false);
	const [selectedDate, setSelectedDate] = useState<Date>(new Date());
	const [selectedHour24, setSelectedHour24] = useState(12);
	const [selectedMinute, setSelectedMinute] = useState(0);
	const [selectedSecond, setSelectedSecond] = useState(0);
	const [, setIsAm] = useState(true);
	const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
	const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
	const pickerRef = useRef<HTMLDivElement>(null);
	const [, startTransition] = useTransition();

	useEffect(() => {
		if (value) {
			const date = new Date(value.includes('T') ? value : `${value}T00:00`);
			if (!isNaN(date.getTime())) {
				setSelectedDate(date);
				setCurrentMonth(date.getMonth());
				setCurrentYear(date.getFullYear());
				if (value.includes('T')) {
					const [_, timePart] = value.split('T');
					if (timePart) {
						const parts = timePart.split(':');
						const h = Number(parts[0]);
						setSelectedHour24(h);
						setSelectedMinute(Number(parts[1]) || 0);
						setSelectedSecond(Number(parts[2]) || 0);
						setIsAm(h < 12);
					}
				}
			}
		}
	}, [value]);

	const formatDateForInput = (date: Date, h: number, m: number, s: number) => {
		const pad = (n: number) => String(n).padStart(2, '0');
		return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(h)}:${pad(m)}:${pad(s)}`;
	};

	const [isFocused, setIsFocused] = useState(false);

	const handleDateSelect = useCallback((day: number) => {
		startTransition(() => {
			const newDate = new Date(currentYear, currentMonth, day);
			setSelectedDate(newDate);
			onChange(formatDateForInput(newDate, selectedHour24, selectedMinute, selectedSecond));
		});
	}, [currentYear, currentMonth, selectedHour24, selectedMinute, selectedSecond, onChange]);

	const handleTimeSelect = useCallback((h: number, m: number, s: number) => {
		startTransition(() => {
			setSelectedHour24(h); setSelectedMinute(m); setSelectedSecond(s); setIsAm(h < 12);
			onChange(formatDateForInput(selectedDate, h, m, s));
		});
	}, [selectedDate, onChange]);

	const calendarDays = useMemo(() => {
		const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
		const firstDay = (new Date(currentYear, currentMonth, 1).getDay() + 6) % 7;
		return [...Array(firstDay).fill(null), ...Array(daysInMonth).keys()].map(i => i === null ? null : (i as number) + 1);
	}, [currentMonth, currentYear]);

	const displayValue = useMemo(() => {
		if (!value) return '';
		try {
			const [d, t] = value.split('T');
			if (d && t) {
				const dt = formatDateTimeFromStore(value);
				return `${dt.date} ${dt.time}`;
			}
		} catch { }
		return value;
	}, [value, formatDateTimeFromStore]);

	return (
		<div ref={pickerRef} style={{ position: 'relative', width: '100%' }}>
			<div style={{ marginBottom: '8px', position: 'relative' }}>
				{label && <label style={{ display: 'block', marginBottom: '4px', color: theme.textSec, fontSize: '0.875rem' }}>{label}</label>}
				<div style={{ position: 'relative' }}>
					<input
						type="text" readOnly value={value ? displayValue : ''}
						placeholder={isOpen || isFocused ? placeholder : ''}
						disabled={disabled}
						onFocus={() => {
							setIsFocused(true);
							if (onFocus) onFocus();
						}}
						onBlur={() => {
							setIsFocused(false);
							setTimeout(() => {
								if (!pickerRef.current?.contains(document.activeElement)) {
									if (onBlur) onBlur();
									setIsOpen(false);
								}
							}, 100);
						}}
						style={{
							width: '100%', padding: '16px 40px 16px 14px', borderRadius: '4px',
							background: theme.bg, color: theme.text, cursor: 'default', outline: 'none',
							...customInputStyle
						}}
					/>
					<div
						onClick={() => {
							if (!disabled) {
								setIsOpen(!isOpen);
								if (!isOpen && onFocus) onFocus();
								if (isOpen && onBlur) onBlur();
							}
						}}
						style={{
							position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
							cursor: disabled ? 'not-allowed' : 'pointer', color: theme.textSec,
							display: 'flex', alignItems: 'center', justifyContent: 'center'
						}}
					>
						<Calendar size={18} />
					</div>
				</div>
				{helperText && <div style={{ color: error ? '#ef4444' : theme.textSec, fontSize: '0.75rem', marginTop: '4px' }}>{helperText}</div>}
			</div>
			{isOpen && (
				<div style={{
					position: 'absolute', top: '100%', left: 0, zIndex: 1000, marginTop: '8px', padding: '16px',
					background: theme.paper, borderRadius: '16px', boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
					border: `1px solid ${theme.divider}`, width: '320px', backdropFilter: 'blur(20px)'
				}}>
					<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
						<button
							onClick={() => {
								startTransition(() => {
									if (currentMonth === 0) {
										setCurrentMonth(11);
										setCurrentYear(y => y - 1);
									} else {
										setCurrentMonth(m => m - 1);
									}
								});
							}}
							style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.text, padding: '4px', borderRadius: '4px', transition: 'all 0.2s' }}
							onMouseEnter={(e) => { e.currentTarget.style.background = `${theme.primary}15`; }}
							onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
							title={t("datetimePicker.previousMonth")}
						>
							<ChevronLeft size={20} />
						</button>
						<span style={{ fontWeight: 600, color: theme.text, fontSize: '1rem' }}>{new Date(currentYear, currentMonth).toLocaleString(language, { month: 'long', year: 'numeric' })}</span>
						<button
							onClick={() => {
								startTransition(() => {
									if (currentMonth === 11) {
										setCurrentMonth(0);
										setCurrentYear(y => y + 1);
									} else {
										setCurrentMonth(m => m + 1);
									}
								});
							}}
							style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.text, padding: '4px', borderRadius: '4px', transition: 'all 0.2s' }}
							onMouseEnter={(e) => { e.currentTarget.style.background = `${theme.primary}15`; }}
							onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
							title={t("datetimePicker.nextMonth")}
						>
							<ChevronRight size={20} />
						</button>
					</div>

					<div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '8px' }}>
						{[
							t("datetimePicker.weekdays.monday"),
							t("datetimePicker.weekdays.tuesday"),
							t("datetimePicker.weekdays.wednesday"),
							t("datetimePicker.weekdays.thursday"),
							t("datetimePicker.weekdays.friday"),
							t("datetimePicker.weekdays.saturday"),
							t("datetimePicker.weekdays.sunday")
						].map((d, idx) => <div key={idx} style={{ textAlign: 'center', fontSize: '0.75rem', color: theme.textSec, fontWeight: 500 }}>{d}</div>)}
						{calendarDays.map((day, i) => (
							<button
								key={i} disabled={day === null}
								onClick={() => day && handleDateSelect(day)}
								style={{
									width: '100%',
									aspectRatio: '1',
									borderRadius: '50%',
									border: 'none',
									background: 'transparent',
									cursor: day ? 'pointer' : 'default',
									backgroundColor:
										day === selectedDate.getDate() &&
											currentMonth === selectedDate.getMonth() &&
											currentYear === selectedDate.getFullYear()
											? theme.primary
											: 'transparent',
									color:
										day === selectedDate.getDate() &&
											currentMonth === selectedDate.getMonth() &&
											currentYear === selectedDate.getFullYear()
											? '#fff'
											: (day ? theme.text : 'transparent')
								}}
							>
								{day}
							</button>
						))}
					</div>
					<div style={{ borderTop: `1px solid ${theme.divider}`, paddingTop: '16px', display: 'flex', gap: '8px', overflowX: 'auto' }}>
						<select
							value={selectedHour24} onChange={(e) => handleTimeSelect(Number(e.target.value), selectedMinute, selectedSecond)}
							style={{ flex: 1, padding: '8px', borderRadius: '8px', border: `1px solid ${theme.divider}`, background: theme.bg, color: theme.text }}
						>
							{Array.from({ length: 24 }, (_, i) => <option key={i} value={i}>{formatNumber(i, language).padStart(2, '0')}</option>)}
						</select>
						<span style={{ color: theme.text }}>:</span>
						<select
							value={selectedMinute} onChange={(e) => handleTimeSelect(selectedHour24, Number(e.target.value), selectedSecond)}
							style={{ flex: 1, padding: '8px', borderRadius: '8px', border: `1px solid ${theme.divider}`, background: theme.bg, color: theme.text }}
						>
							{Array.from({ length: 60 }, (_, i) => <option key={i} value={i}>{formatNumber(i, language).padStart(2, '0')}</option>)}
						</select>
					</div>
					<div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px', gap: '8px' }}>
						<button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.textSec }}><X size={20} /></button>
						<button onClick={() => setIsOpen(false)} style={{ background: theme.primary, border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer' }}><Check size={16} /></button>
					</div>
				</div>
			)}
		</div>
	);
};
