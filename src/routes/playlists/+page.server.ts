import type { PageServerLoad } from './$types';
import { listPlaylists } from '$lib/server/db/playlist-store';

export const load: PageServerLoad = async () => {
	const playlists = await listPlaylists();
	return { playlists };
};
