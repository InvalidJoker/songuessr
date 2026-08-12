import type { GuessEntry, GuessResponse, RoundStartResponse, TrackMeta } from '$lib/types';

export class PlaylistGame {
	playlistId: string;
	roundId = $state('');
	preview = $state('');
	durations = $state<number[]>([1, 2, 4, 7, 11, 16]);
	maxGuesses = $state(6);
	guesses = $state<GuessEntry[]>([]);
	status = $state<'playing' | 'won' | 'lost'>('playing');
	revealedTrack = $state<TrackMeta | null>(null);
	loading = $state(true);
	error = $state('');

	private recentIds: number[] = [];

	constructor(playlistId: string) {
		this.playlistId = playlistId;
	}

	async nextRound() {
		this.loading = true;
		this.error = '';
		this.guesses = [];
		this.status = 'playing';
		this.revealedTrack = null;

		try {
			const exclude = this.recentIds.join(',');
			const res = await fetch(
				`/api/playlists/${this.playlistId}/round${exclude ? `?exclude=${exclude}` : ''}`
			);
			if (!res.ok) throw new Error((await res.json().catch(() => null))?.message ?? 'Failed to load a song');
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

		const res = await fetch(`/api/playlists/${this.playlistId}/guess`, {
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
			this.recentIds = [data.track.id, ...this.recentIds].slice(0, 30);
		}
	}

	skip() {
		return this.submitGuess(undefined, true);
	}
}
