import poolData from '$lib/data/pool.json';
import { dayNumberFor } from '$lib/game/constants';
import type { TrackMeta } from '$lib/types';

interface PoolTrack {
	id: number;
	title: string;
	artist: string;
	album: string;
	cover: string;
	coverBig: string;
	duration: number;
	explicit: boolean;
}

interface Pool {
	tracks: PoolTrack[];
	dailyOrder: number[];
}

const pool = poolData as unknown as Pool;

export function poolTrackToMeta(t: PoolTrack): TrackMeta {
	return { ...t };
}

export function dailyTrackForDate(date: Date): TrackMeta {
	const day = dayNumberFor(date);
	const n = pool.dailyOrder.length;
	// dayNumberFor starts at 1; wrap around once the rotation is exhausted.
	const orderIdx = ((((day - 1) % n) + n) % n) as number;
	const poolIdx = pool.dailyOrder[orderIdx];
	return poolTrackToMeta(pool.tracks[poolIdx]);
}

export function randomTrack(excludeIds: number[] = []): TrackMeta {
	const exclude = new Set(excludeIds);
	let candidates = pool.tracks.filter((t) => !exclude.has(t.id));
	if (candidates.length === 0) candidates = pool.tracks;
	const pick = candidates[Math.floor(Math.random() * candidates.length)];
	return poolTrackToMeta(pick);
}

export function poolSize(): number {
	return pool.tracks.length;
}
