import type { GuessOutcome, TrackMeta } from '$lib/types';

function normalize(s: string): string {
	return s
		.toLowerCase()
		.replace(/\(.*?\)|\[.*?]/g, '')
		.replace(/feat\.?.*$/i, '')
		.replace(/[^a-z0-9]+/g, ' ')
		.trim();
}

export function isCorrectGuess(track: TrackMeta, guessedId?: number): boolean {
	if (!guessedId) return false;
	if (guessedId === track.id) return true;
	return false;
}

export function guessOutcome(track: TrackMeta, guessedId?: number, skip = false): GuessOutcome {
	if (skip) return 'skip';
	return isCorrectGuess(track, guessedId) ? 'correct' : 'wrong';
}

export { normalize };
