import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getPlaylist, topPlaylistPlayers } from '$lib/server/db/playlist-store';

export const load: PageServerLoad = async ({ params }) => {
	const playlist = await getPlaylist(params.id);
	if (!playlist) return error(404, 'Playlist not found');

	const leaderboard = await topPlaylistPlayers(params.id, 10);
	return { playlist, leaderboard };
};
