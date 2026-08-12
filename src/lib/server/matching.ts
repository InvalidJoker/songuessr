import type { GuessOutcome, TrackMeta } from '$lib/types';
import { fetchTrackById } from './deezer';

function normalize(s: string): string {
	return s
		.toLowerCase()
		.replace(/\(.*?\)|\[.*?]/g, '')
		.replace(/feat\.?.*$/i, '')
		.replace(/[^a-z0-9]+/g, ' ')
		.trim();
}

export async function isCorrectGuess(track: TrackMeta, guessedId?: number): Promise<boolean> {
	if (!guessedId) return false;
	if (guessedId === track.id) return true;

	// Deezer often lists the same song multiple times (singles, albums, reissues,
	// compilations) under separate track ids. Treat a matching title + artist as
	// correct too, so picking a different pressing of the right answer still counts.
	const guessed = await fetchTrackById(guessedId);
	if (!guessed) return false;
	return normalize(guessed.title) === normalize(track.title) && normalize(guessed.artist) === normalize(track.artist);
}

export async function guessOutcome(
	track: TrackMeta,
	guessedId?: number,
	skip = false
): Promise<GuessOutcome> {
	if (skip) return 'skip';
	return (await isCorrectGuess(track, guessedId)) ? 'correct' : 'wrong';
}

export { normalize };
