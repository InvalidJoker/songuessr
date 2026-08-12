import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getPlaylist, removeTrackFromPlaylist } from '$lib/server/db/playlist-store';

export const DELETE: RequestHandler = async ({ params, locals }) => {
	if (!locals.user) return error(401, 'Sign in to edit this playlist');

	const p = await getPlaylist(params.id);
	if (!p) return error(404, 'Playlist not found');
	if (p.ownerId !== locals.user.id) return error(403, 'Only the owner can edit this playlist');
	if (p.sourceType !== 'manual') return error(400, 'Only manually-created playlists can be edited');

	const trackId = Number(params.trackId);
	if (!Number.isFinite(trackId)) return error(400, 'Invalid track id');

	await removeTrackFromPlaylist(params.id, trackId);
	return json({ ok: true });
};
