import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createManualPlaylist } from '$lib/server/db/playlist-store';
import { fetchTrackById } from '$lib/server/deezer';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) return error(401, 'Sign in to create a playlist');

	const body = (await request.json()) as { name?: string; trackIds?: number[] };
	const name = body.name?.trim();
	const trackIds = body.trackIds ?? [];

	if (!name) return error(400, 'Give your playlist a name');
	if (trackIds.length === 0) return error(400, 'Add at least one song');
	if (trackIds.length > 200) return error(400, 'Playlists are capped at 200 songs');

	const tracks = (await Promise.all(trackIds.map((id) => fetchTrackById(id)))).filter(
		(t) => t !== null
	);
	if (tracks.length === 0) return error(400, "Couldn't load any of those songs");

	const id = await createManualPlaylist(locals.user.id, name, tracks);
	return json({ id });
};
