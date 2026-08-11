import { randomUUID } from 'node:crypto';
import type { TrackMeta } from '$lib/types';
import { dailyTrackForDate, randomTrack } from './pool';
import { todayKey, dayNumberFor } from '$lib/game/constants';

interface HitsRound {
	track: TrackMeta;
	expiresAt: number;
}

const ROUND_TTL_MS = 15 * 60_000;
const hitsRounds = new Map<string, HitsRound>();

function sweep() {
	const now = Date.now();
	for (const [id, r] of hitsRounds) {
		if (r.expiresAt < now) hitsRounds.delete(id);
	}
}

export function startHitsRound(excludeIds: number[] = []): { roundId: string; track: TrackMeta } {
	sweep();
	const track = randomTrack(excludeIds);
	const roundId = randomUUID();
	hitsRounds.set(roundId, { track, expiresAt: Date.now() + ROUND_TTL_MS });
	return { roundId, track };
}

export function resolveHitsRound(roundId: string): TrackMeta | null {
	const round = hitsRounds.get(roundId);
	if (!round) return null;
	return round.track;
}

export function endHitsRound(roundId: string) {
	hitsRounds.delete(roundId);
}

export function dailyRoundForToday(): { roundId: string; track: TrackMeta; dayNumber: number } {
	const now = new Date();
	const roundId = todayKey(now);
	return { roundId, track: dailyTrackForDate(now), dayNumber: dayNumberFor(now) };
}

export function resolveDailyRound(roundId: string): TrackMeta | null {
	// Daily rounds are deterministic by date, so any roundId matching today's
	// key (or a past date, for late guesses near midnight) resolves the same way.
	const date = new Date(`${roundId}T00:00:00Z`);
	if (Number.isNaN(date.getTime())) return null;
	return dailyTrackForDate(date);
}
