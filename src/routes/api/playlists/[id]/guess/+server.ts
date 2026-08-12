import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { resolvePlaylistRound, endPlaylistRound } from '$lib/server/rounds';
import { guessOutcome } from '$lib/server/matching';
import { MAX_GUESSES } from '$lib/game/constants';
import type { GuessRequest, GuessResponse } from '$lib/types';
import { recordPlaylistResult } from '$lib/server/db/playlist-store';

export const POST: RequestHandler = async ({ request, params, locals }) => {
	const body = (await request.json()) as GuessRequest;
	const track = resolvePlaylistRound(body.roundId, params.id);
	if (!track) return error(400, 'Invalid or expired round');

	const outcome = await guessOutcome(track, body.trackId, body.skip);
	const status =
		outcome === 'correct' ? 'won' : body.attemptNumber >= MAX_GUESSES ? 'lost' : 'playing';

	if (status !== 'playing') {
		endPlaylistRound(body.roundId);
		if (locals.user) await recordPlaylistResult(params.id, locals.user.id, status === 'won');
	}

	const response: GuessResponse = {
		outcome,
		guessesUsed: body.attemptNumber,
		maxGuesses: MAX_GUESSES,
		status,
		track: status !== 'playing' ? track : undefined
	};
	return json(response);
};
