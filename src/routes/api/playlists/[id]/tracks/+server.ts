import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getPlaylist, addTrackToPlaylist } from '$lib/server/db/playlist-store';
import { fetchTrackById } from '$lib/server/deezer';

export const POST: RequestHandler = async ({ request, params, locals }) => {
	if (!locals.user) return error(401, 'Sign in to edit this playlist');

	const p = await getPlaylist(params.id);
	if (!p) return error(404, 'Playlist not found');
	if (p.ownerId !== locals.user.id) return error(403, 'Only the owner can edit this playlist');
	if (p.sourceType !== 'manual') return error(400, 'Only manually-created playlists can be edited');
	if (p.trackCount >= 200) return error(400, 'Playlists are capped at 200 songs');

	const body = (await request.json()) as { trackId?: number };
	if (!body.trackId) return error(400, 'trackId is required');

	const track = await fetchTrackById(body.trackId);
	if (!track) return error(400, "Couldn't load that song");

	await addTrackToPlaylist(params.id, track);
	return json({ ok: true });
};
