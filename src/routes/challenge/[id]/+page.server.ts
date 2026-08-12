import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getChallenge, getAllChallengeResults } from '$lib/server/db/challenge-store';

export const load: PageServerLoad = async ({ params }) => {
	const ch = await getChallenge(params.id);
	if (!ch) return error(404, 'Challenge not found');

	const results = await getAllChallengeResults(params.id);
	return { challenge: { ...ch, roundCount: ch.trackIds.length }, results };
};
