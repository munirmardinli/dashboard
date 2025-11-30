/**
	* Parst eine einfache Cron-Expression (nur Sekunden-Intervall)
	* Unterstützt Format mit Sekunden-Intervall (z.B. alle 30 Sekunden)
	*/
function parseCronExpression(cronExpression: string): number | null {
	const parts = cronExpression.trim().split(/\s+/);
	if (parts.length !== 6) {
		return null;
	}
	const secondsPart = parts[0];
	if (secondsPart && secondsPart.startsWith("*/")) {
		const interval = parseInt(secondsPart.substring(2), 10);
		if (!isNaN(interval) && interval > 0) {
			if (parts.slice(1).every((part) => part === "*")) {
				return interval * 1000;
			}
		}
	}
	return null;
}

/**
	* Erstellt einen periodischen Job basierend auf einer Cron-Expression
	* Unterstützt nur einfache Sekunden-Intervalle
	*/
export function scheduleJob(cronExpression: string, callback: () => void): globalThis.ScheduledJob {
	const intervalMs = parseCronExpression(cronExpression);

	if (!intervalMs) {
		throw new Error(`Unsupported cron expression: ${cronExpression}. Only simple second intervals are supported.`);
	}

	let intervalId: NodeJS.Timeout | null = null;
	let isCancelled = false;

	const job: globalThis.ScheduledJob = {
		cancel() {
			if (intervalId !== null) {
				clearInterval(intervalId);
				intervalId = null;
				isCancelled = true;
			}
		},
	};

	callback();
	intervalId = setInterval(() => {
		if (!isCancelled) {
			callback();
		}
	}, intervalMs);

	return job;
}
