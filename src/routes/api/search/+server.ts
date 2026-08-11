import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { searchTracks } from '$lib/server/deezer';

export const GET: RequestHandler = async ({ url }) => {
	const q = url.searchParams.get('q') ?? '';
	if (q.trim().length < 2) return json([]);
	const results = await searchTracks(q, 8);
	return json(results);
};
