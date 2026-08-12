import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getPlaylist, topPlaylistPlayers, deletePlaylist } from '$lib/server/db/playlist-store';

export const GET: RequestHandler = async ({ params }) => {
	const playlist = await getPlaylist(params.id);
	if (!playlist) return error(404, 'Playlist not found');

	const leaderboard = await topPlaylistPlayers(params.id, 10);
	return json({ playlist, leaderboard });
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
	if (!locals.user) return error(401, 'Sign in required');

	const p = await getPlaylist(params.id);
	if (!p) return error(404, 'Playlist not found');
	if (p.ownerId !== locals.user.id) return error(403, 'Only the owner can delete this playlist');

	await deletePlaylist(params.id);
	return json({ ok: true });
};
