import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getChallenge } from '$lib/server/db/challenge-store';
import { fetchPreviewUrl } from '$lib/server/deezer';
import { SNIPPET_DURATIONS, MAX_GUESSES } from '$lib/game/constants';
import type { RoundStartResponse } from '$lib/types';

export const GET: RequestHandler = async ({ params, url }) => {
	const index = Number(url.searchParams.get('index') ?? '0');
	const ch = await getChallenge(params.id);
	if (!ch) return error(404, 'Challenge not found');

	const trackId = ch.trackIds[index];
	if (trackId === undefined) return error(400, 'Invalid round index');

	const preview = await fetchPreviewUrl(trackId);

	const body: RoundStartResponse = {
		roundId: `${params.id}:${index}`,
		preview: preview ?? '',
		durations: [...SNIPPET_DURATIONS],
		maxGuesses: MAX_GUESSES
	};
	return json(body);
};
