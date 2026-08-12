import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getChallenge, getChallengeResult } from '$lib/server/db/challenge-store';

export const load: PageServerLoad = async ({ params, locals }) => {
	if (!locals.user) return redirect(302, `/challenge/${params.id}`);

	const ch = await getChallenge(params.id);
	if (!ch) return error(404, 'Challenge not found');

	const existing = await getChallengeResult(params.id, locals.user.id);
	if (existing?.completedAt) return redirect(302, `/challenge/${params.id}`);

	return { challenge: ch };
};
