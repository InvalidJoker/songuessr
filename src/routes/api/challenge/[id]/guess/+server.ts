import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getChallenge, recordChallengeRound } from '$lib/server/db/challenge-store';
import { fetchTrackById } from '$lib/server/deezer';
import { isCorrectGuess } from '$lib/server/matching';
import { MAX_GUESSES } from '$lib/game/constants';
import type { GuessRequest, GuessResponse } from '$lib/types';

export const POST: RequestHandler = async ({ request, params, locals }) => {
	if (!locals.user) return error(401, 'Sign in to play a challenge');

	const body = (await request.json()) as GuessRequest;
	const [challengeId, indexStr] = body.roundId.split(':');
	const index = Number(indexStr);
	if (challengeId !== params.id || !Number.isFinite(index)) {
		return error(400, 'Invalid round');
	}

	const ch = await getChallenge(params.id);
	if (!ch) return error(404, 'Challenge not found');
	const trackId = ch.trackIds[index];
	if (trackId === undefined) return error(400, 'Invalid round index');

	const track = await fetchTrackById(trackId);
	if (!track) return error(500, 'Could not load this round');

	const correct = !body.skip && (await isCorrectGuess(track, body.trackId));
	const outcome = body.skip ? 'skip' : correct ? 'correct' : 'wrong';
	const status =
		outcome === 'correct' ? 'won' : body.attemptNumber >= MAX_GUESSES ? 'lost' : 'playing';

	if (status !== 'playing') {
		await recordChallengeRound(
			params.id,
			locals.user.id,
			index,
			status,
			body.attemptNumber,
			ch.trackIds.length
		);
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
