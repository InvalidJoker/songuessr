import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { startHitsRound } from '$lib/server/rounds';
import { fetchPreviewUrl } from '$lib/server/deezer';
import { SNIPPET_DURATIONS, MAX_GUESSES } from '$lib/game/constants';
import type { RoundStartResponse } from '$lib/types';

export const GET: RequestHandler = async ({ url }) => {
	const excludeParam = url.searchParams.get('exclude') ?? '';
	const excludeIds = excludeParam
		.split(',')
		.map((s) => Number(s))
		.filter((n) => Number.isFinite(n));

	const { roundId, track } = startHitsRound(excludeIds);
	const preview = await fetchPreviewUrl(track.id);

	const body: RoundStartResponse = {
		roundId,
		preview: preview ?? '',
		durations: [...SNIPPET_DURATIONS],
		maxGuesses: MAX_GUESSES
	};
	return json(body);
};
