import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { dailyRoundForToday } from '$lib/server/rounds';
import { fetchPreviewUrl } from '$lib/server/deezer';
import { SNIPPET_DURATIONS, MAX_GUESSES } from '$lib/game/constants';
import type { RoundStartResponse } from '$lib/types';

export const GET: RequestHandler = async () => {
	const { roundId, track, dayNumber } = dailyRoundForToday();
	const preview = await fetchPreviewUrl(track.id);

	const body: RoundStartResponse = {
		roundId,
		preview: preview ?? '',
		durations: [...SNIPPET_DURATIONS],
		maxGuesses: MAX_GUESSES,
		dayNumber
	};
	return json(body);
};
