import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { resolveHitsRound, endHitsRound } from '$lib/server/rounds';
import { guessOutcome } from '$lib/server/matching';
import { MAX_GUESSES } from '$lib/game/constants';
import type { GuessRequest, GuessResponse } from '$lib/types';

export const POST: RequestHandler = async ({ request }) => {
	const body = (await request.json()) as GuessRequest;
	const track = resolveHitsRound(body.roundId);
	if (!track) return json({ error: 'invalid or expired round' }, { status: 400 });

	const outcome = guessOutcome(track, body.trackId, body.skip);
	const status =
		outcome === 'correct' ? 'won' : body.attemptNumber >= MAX_GUESSES ? 'lost' : 'playing';

	if (status !== 'playing') endHitsRound(body.roundId);

	const response: GuessResponse = {
		outcome,
		guessesUsed: body.attemptNumber,
		maxGuesses: MAX_GUESSES,
		status,
		track: status !== 'playing' ? track : undefined
	};
	return json(response);
};
