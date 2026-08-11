import type { GuessEntry, GuessResponse, RoundStartResponse, TrackMeta } from '$lib/types';
import { readJSON, writeJSON } from './storage';

interface HitsStats {
	played: number;
	correct: number;
	streak: number;
	bestStreak: number;
}

const STATS_KEY = 'songless:hits:stats';
const RECENT_LIMIT = 30;
const DEFAULT_STATS: HitsStats = { played: 0, correct: 0, streak: 0, bestStreak: 0 };

export class HitsGame {
	roundId = $state('');
	preview = $state('');
	durations = $state<number[]>([1, 2, 4, 7, 11, 16]);
	maxGuesses = $state(6);
	guesses = $state<GuessEntry[]>([]);
	status = $state<'playing' | 'won' | 'lost'>('playing');
	revealedTrack = $state<TrackMeta | null>(null);
	loading = $state(true);
	error = $state('');
	stats = $state<HitsStats>(DEFAULT_STATS);

	private recentIds: number[] = [];

	constructor() {
		this.stats = readJSON(STATS_KEY, DEFAULT_STATS);
	}

	async nextRound() {
		this.loading = true;
		this.error = '';
		this.guesses = [];
		this.status = 'playing';
		this.revealedTrack = null;

		try {
			const exclude = this.recentIds.join(',');
			const res = await fetch(`/api/hits${exclude ? `?exclude=${exclude}` : ''}`);
			if (!res.ok) throw new Error('Failed to load a song');
			const data = (await res.json()) as RoundStartResponse;
			this.roundId = data.roundId;
			this.preview = data.preview;
			this.durations = data.durations;
			this.maxGuesses = data.maxGuesses;
		} catch (err) {
			this.error = err instanceof Error ? err.message : 'Something went wrong';
		} finally {
			this.loading = false;
		}
	}

	async submitGuess(trackId?: number, skip = false, label?: string) {
		if (this.status !== 'playing') return;
		const attemptNumber = this.guesses.length + 1;

		const res = await fetch('/api/hits/guess', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ roundId: this.roundId, trackId, skip, attemptNumber })
		});
		if (!res.ok) return;
		const data = (await res.json()) as GuessResponse;

		const entryLabel = skip ? 'Skipped' : (label ?? 'Unknown track');
		this.guesses = [...this.guesses, { outcome: data.outcome, label: entryLabel }];
		this.status = data.status;
		if (data.track) {
			this.revealedTrack = data.track;
			this.recentIds = [data.track.id, ...this.recentIds].slice(0, RECENT_LIMIT);
			this.recordResult(data.status === 'won');
		}
	}

	skip() {
		return this.submitGuess(undefined, true);
	}

	private recordResult(won: boolean) {
		this.stats = {
			played: this.stats.played + 1,
			correct: this.stats.correct + (won ? 1 : 0),
			streak: won ? this.stats.streak + 1 : 0,
			bestStreak: won ? Math.max(this.stats.bestStreak, this.stats.streak + 1) : this.stats.bestStreak
		};
		writeJSON(STATS_KEY, this.stats);
	}
}
