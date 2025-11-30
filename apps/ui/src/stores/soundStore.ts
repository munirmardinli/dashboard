"use client";

import { create } from "zustand";

let audioContext: AudioContext | null = null;

function getActiveSoundFlag(): boolean {
	const v = process.env.NEXT_PUBLIC_ACTIVE_SOUND;
	if (!v) {
		throw new Error("NEXT_PUBLIC_ACTIVE_SOUND environment variable is not set");
	}
	const s = String(v).toLowerCase().trim();
	return s === 'true' || s === '1' || s === 'yes' || s === 'on';
}

function getAudioContext(): AudioContext {
	if (typeof window === "undefined") throw new Error("Audio only on client");
	if (!audioContext) {
		const Ctx = (window.AudioContext ?? window.webkitAudioContext)!;
		audioContext = new Ctx();
	}
	return audioContext;
}

function playBeep(frequency: number, volume: number, durationMs: number): void {
	const ctx = getAudioContext();
	const oscillator = ctx.createOscillator();
	const gain = ctx.createGain();

	oscillator.type = "sine";
	oscillator.frequency.value = frequency;

	const now = ctx.currentTime;
	const attack = 0.01;
	const decay = Math.max(0.08, durationMs / 1000 - attack);
	gain.gain.setValueAtTime(0, now);
	gain.gain.linearRampToValueAtTime(volume, now + attack);
	gain.gain.exponentialRampToValueAtTime(Math.max(0.0005, volume * 0.02), now + attack + decay);

	oscillator.connect(gain);
	gain.connect(ctx.destination);
	oscillator.start(now);
	oscillator.stop(now + attack + decay + 0.01);
}

export const useSoundStore = create<SoundStore>()((set, get) => ({
	enabled: getActiveSoundFlag(),
	volume: 0.5,
	setEnabled: (enabled) => set({ enabled }),
	setVolume: (volume) => set({ volume: Math.min(1, Math.max(0, volume)) }),
	playSnack: (severity) => {
		const { enabled, volume, playTone } = get();
		if (!enabled) return;
		switch (severity) {
			case "success":
				playTone(880, 120);
				setTimeout(() => playTone(1320, 120), 110);
				break;
			case "error":
				playTone(220, 150);
				break;
			case "warning":
				playTone(520, 140);
				break;
			case "info":
				playTone(660, 120);
				break;
			default:
				break;
		}
	},
	playTone: (frequency: number, durationMs = 120) => {
		const { enabled, volume } = get();
		if (!enabled) return;
		try {
			const ctx = getAudioContext();
			if (ctx.state === 'suspended') {
				void ctx.resume();
			}
			playBeep(frequency, volume, durationMs);
		} catch {
		}
	},
	playEvent: (event) => {
		const { playTone, enabled } = get();
		if (!enabled) return;
		switch (event) {
			case "create": {
				const t = 70;
				playTone(1318.51, t);
				setTimeout(() => playTone(1567.98, t), t);
				setTimeout(() => playTone(2093.0, t + 20), t * 2);
				break;
			}
			case "update": {
				const t = 60;
				playTone(987.77, t);
				setTimeout(() => playTone(1318.51, t), t);
				setTimeout(() => playTone(1760.0, t), t * 2);
				setTimeout(() => playTone(2349.32, t + 10), t * 3);
				break;
			}
			case "delete": {
				const t = 140;
				playTone(392, t);
				setTimeout(() => playTone(330, t), t);
				setTimeout(() => playTone(262, t + 20), t * 2);
				break;
			}
			default:
				break;
		}
	},
	unlock: async () => {
		try {
			const ctx = getAudioContext();
			if (ctx.state === 'suspended') {
				await ctx.resume();
			}
		} catch { }
	},
}));
