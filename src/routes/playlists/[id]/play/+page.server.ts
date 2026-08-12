import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getPlaylist } from '$lib/server/db/playlist-store';

export const load: PageServerLoad = async ({ params }) => {
	const playlist = await getPlaylist(params.id);
	if (!playlist) return error(404, 'Playlist not found');
	if (playlist.importStatus !== 'ready') return error(400, 'This playlist is not ready to play yet');
	return { playlist };
};
