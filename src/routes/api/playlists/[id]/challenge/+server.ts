import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createChallenge } from '$lib/server/db/challenge-store';

export const POST: RequestHandler = async ({ params, locals }) => {
	if (!locals.user) return error(401, 'Sign in to create a challenge');

	const result = await createChallenge(params.id, locals.user.id);
	if (!result) return error(400, "This playlist doesn't have enough songs yet");

	return json({ id: result.id });
};
