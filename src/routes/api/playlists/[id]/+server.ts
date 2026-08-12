import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getPlaylist, topPlaylistPlayers } from '$lib/server/db/playlist-store';

export const GET: RequestHandler = async ({ params }) => {
	const playlist = await getPlaylist(params.id);
	if (!playlist) return error(404, 'Playlist not found');

	const leaderboard = await topPlaylistPlayers(params.id, 10);
	return json({ playlist, leaderboard });
};
