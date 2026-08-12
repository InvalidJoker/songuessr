import type { GuessEntry, GuessResponse, RoundStartResponse, TrackMeta } from '$lib/types';

export class ChallengeGame {
	challengeId: string;
	roundCount: number;
	roundIndex = $state(0);

	roundId = $state('');
	preview = $state('');
	durations = $state<number[]>([1, 2, 4, 7, 11, 16]);
	maxGuesses = $state(6);
	guesses = $state<GuessEntry[]>([]);
	status = $state<'playing' | 'won' | 'lost'>('playing');
	revealedTrack = $state<TrackMeta | null>(null);
	loading = $state(true);
	error = $state('');
	finished = $state(false);

	constructor(challengeId: string, roundCount: number) {
		this.challengeId = challengeId;
		this.roundCount = roundCount;
	}

	async loadRound(index: number) {
		this.loading = true;
		this.error = '';
		this.guesses = [];
		this.status = 'playing';
		this.revealedTrack = null;

		try {
			const res = await fetch(`/api/challenge/${this.challengeId}/round?index=${index}`);
			if (!res.ok) throw new Error((await res.json().catch(() => null))?.message ?? 'Failed to load this round');
			const data = (await res.json()) as RoundStartResponse;
			this.roundId = data.roundId;
			this.preview = data.preview;
			this.durations = data.durations;
			this.maxGuesses = data.maxGuesses;
			this.roundIndex = index;
		} catch (err) {
			this.error = err instanceof Error ? err.message : 'Something went wrong';
		} finally {
			this.loading = false;
		}
	}

	start() {
		return this.loadRound(0);
	}

	async submitGuess(trackId?: number, skip = false, label?: string) {
		if (this.status !== 'playing') return;
		const attemptNumber = this.guesses.length + 1;

		const res = await fetch(`/api/challenge/${this.challengeId}/guess`, {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ roundId: this.roundId, trackId, skip, attemptNumber })
		});
		if (!res.ok) return;
		const data = (await res.json()) as GuessResponse;

		this.guesses = [...this.guesses, { outcome: data.outcome, label: skip ? 'Skipped' : (label ?? 'Unknown track') }];
		this.status = data.status;
		if (data.track) this.revealedTrack = data.track;
	}

	skip() {
		return this.submitGuess(undefined, true);
	}

	async nextRoundOrFinish() {
		if (this.roundIndex + 1 >= this.roundCount) {
			this.finished = true;
			return;
		}
		await this.loadRound(this.roundIndex + 1);
	}
}
