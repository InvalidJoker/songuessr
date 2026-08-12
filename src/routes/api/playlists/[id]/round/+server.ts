import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { startPlaylistRound } from '$lib/server/rounds';
import { fetchPreviewUrl } from '$lib/server/deezer';
import { SNIPPET_DURATIONS, MAX_GUESSES } from '$lib/game/constants';
import type { RoundStartResponse } from '$lib/types';

export const GET: RequestHandler = async ({ params, url }) => {
	const excludeParam = url.searchParams.get('exclude') ?? '';
	const excludeIds = excludeParam
		.split(',')
		.map((s) => Number(s))
		.filter((n) => Number.isFinite(n));

	const round = await startPlaylistRound(params.id, excludeIds);
	if (!round) return error(404, 'This playlist has no playable songs yet');

	const preview = await fetchPreviewUrl(round.track.id);

	const body: RoundStartResponse = {
		roundId: round.roundId,
		preview: preview ?? '',
		durations: [...SNIPPET_DURATIONS],
		maxGuesses: MAX_GUESSES
	};
	return json(body);
};
