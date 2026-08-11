export const SNIPPET_DURATIONS = [1, 2, 4, 7, 11, 16] as const;
export const MAX_GUESSES = SNIPPET_DURATIONS.length;

// Day 1 of the daily rotation.
export const LAUNCH_DATE = Date.UTC(2026, 0, 1);

export function dayNumberFor(date: Date): number {
	const utcMidnight = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
	return Math.floor((utcMidnight - LAUNCH_DATE) / 86_400_000) + 1;
}

export function todayKey(date: Date = new Date()): string {
	return date.toISOString().slice(0, 10);
}
