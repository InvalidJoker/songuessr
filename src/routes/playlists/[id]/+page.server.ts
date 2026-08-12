import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getPlaylist, topPlaylistPlayers, getPlaylistTracks } from '$lib/server/db/playlist-store';

export const load: PageServerLoad = async ({ params, locals }) => {
	const playlist = await getPlaylist(params.id);
	if (!playlist) return error(404, 'Playlist not found');

	const leaderboard = await topPlaylistPlayers(params.id, 10);

	const isOwner = locals.user?.id === playlist.ownerId;
	const tracks =
		isOwner && playlist.sourceType === 'manual' ? await getPlaylistTracks(params.id) : null;

	return { playlist, leaderboard, tracks, isOwner };
};
