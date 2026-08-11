import type { GuessEntry, GuessResponse, RoundStartResponse, TrackMeta } from '$lib/types';
import { readJSON, writeJSON } from './storage';
import { todayKey } from '$lib/game/constants';

interface DailySave {
	date: string;
	dayNumber: number;
	guesses: GuessEntry[];
	status: 'playing' | 'won' | 'lost';
	track: TrackMeta | null;
	preview: string;
	durations: number[];
	maxGuesses: number;
	roundId: string;
}

interface DailyStats {
	played: number;
	won: number;
	streak: number;
	maxStreak: number;
	lastCompletedDate: string | null;
}

const SAVE_PREFIX = 'songless:daily:';
const STATS_KEY = 'songless:daily:stats';

function statsKey() {
	return STATS_KEY;
}

function saveKeyFor(date: string) {
	return `${SAVE_PREFIX}${date}`;
}

export class DailyGame {
	roundId = $state('');
	dayNumber = $state(0);
	preview = $state('');
	durations = $state<number[]>([1, 2, 4, 7, 11, 16]);
	maxGuesses = $state(6);
	guesses = $state<GuessEntry[]>([]);
	status = $state<'playing' | 'won' | 'lost'>('playing');
	revealedTrack = $state<TrackMeta | null>(null);
	loading = $state(true);
	error = $state('');
	stats = $state<DailyStats>({
		played: 0,
		won: 0,
		streak: 0,
		maxStreak: 0,
		lastCompletedDate: null
	});

	async init() {
		this.loading = true;
		this.error = '';
		this.stats = readJSON(statsKey(), this.stats);

		const date = todayKey();
		const saved = readJSON<DailySave | null>(saveKeyFor(date), null);
		if (saved && saved.date === date) {
			this.roundId = saved.roundId;
			this.dayNumber = saved.dayNumber;
			this.preview = saved.preview;
			this.durations = saved.durations;
			this.maxGuesses = saved.maxGuesses;
			this.guesses = saved.guesses;
			this.status = saved.status;
			this.revealedTrack = saved.track;
			this.loading = false;
			return;
		}

		try {
			const res = await fetch('/api/daily');
			if (!res.ok) throw new Error('Failed to load today’s song');
			const data = (await res.json()) as RoundStartResponse;
			this.roundId = data.roundId;
			this.dayNumber = data.dayNumber ?? 0;
			this.preview = data.preview;
			this.durations = data.durations;
			this.maxGuesses = data.maxGuesses;
			this.guesses = [];
			this.status = 'playing';
			this.revealedTrack = null;
			this.persist();
		} catch (err) {
			this.error = err instanceof Error ? err.message : 'Something went wrong';
		} finally {
			this.loading = false;
		}
	}

	private persist() {
		const date = todayKey();
		const save: DailySave = {
			date,
			dayNumber: this.dayNumber,
			guesses: this.guesses,
			status: this.status,
			track: this.revealedTrack,
			preview: this.preview,
			durations: this.durations,
			maxGuesses: this.maxGuesses,
			roundId: this.roundId
		};
		writeJSON(saveKeyFor(date), save);
	}

	private finishStatsIfNeeded() {
		const date = todayKey();
		if (this.stats.lastCompletedDate === date) return;
		const won = this.status === 'won';
		this.stats = {
			played: this.stats.played + 1,
			won: this.stats.won + (won ? 1 : 0),
			streak: won ? this.stats.streak + 1 : 0,
			maxStreak: won ? Math.max(this.stats.maxStreak, this.stats.streak + 1) : this.stats.maxStreak,
			lastCompletedDate: date
		};
		writeJSON(statsKey(), this.stats);
	}

	async submitGuess(trackId?: number, skip = false) {
		if (this.status !== 'playing') return;
		const attemptNumber = this.guesses.length + 1;

		const res = await fetch('/api/daily/guess', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ roundId: this.roundId, trackId, skip, attemptNumber })
		});
		if (!res.ok) return;
		const data = (await res.json()) as GuessResponse;

		this.guesses = [...this.guesses, { outcome: data.outcome, label: data.guessLabel }];
		this.status = data.status;
		if (data.track) this.revealedTrack = data.track;

		this.persist();
		if (this.status !== 'playing') this.finishStatsIfNeeded();
	}

	skip() {
		return this.submitGuess(undefined, true);
	}
}
