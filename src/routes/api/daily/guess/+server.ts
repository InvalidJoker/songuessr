import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { resolveDailyRound } from '$lib/server/rounds';
import { guessOutcome } from '$lib/server/matching';
import { MAX_GUESSES } from '$lib/game/constants';
import type { GuessRequest, GuessResponse } from '$lib/types';
import { recordDailyResult } from '$lib/server/db/stats';

export const POST: RequestHandler = async ({ request, locals }) => {
	const body = (await request.json()) as GuessRequest;
	const track = resolveDailyRound(body.roundId);
	if (!track) return json({ error: 'invalid round' }, { status: 400 });

	const outcome = guessOutcome(track, body.trackId, body.skip);

	const status =
		outcome === 'correct' ? 'won' : body.attemptNumber >= MAX_GUESSES ? 'lost' : 'playing';

	if (status !== 'playing' && locals.user) {
		await recordDailyResult(locals.user.id, status === 'won', body.roundId);
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
