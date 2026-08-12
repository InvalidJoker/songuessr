import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getChallenge, getAllChallengeResults } from '$lib/server/db/challenge-store';

export const GET: RequestHandler = async ({ params }) => {
	const ch = await getChallenge(params.id);
	if (!ch) return error(404, 'Challenge not found');

	const results = await getAllChallengeResults(params.id);

	return json({
		id: ch.id,
		playlistId: ch.playlistId,
		playlistName: ch.playlistName,
		playlistCover: ch.playlistCover,
		creatorName: ch.creatorName,
		roundCount: ch.trackIds.length,
		results
	});
};
