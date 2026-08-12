import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createPlaylist, listPlaylists } from '$lib/server/db/playlist-store';
import { parseSpotifyUrl, isSpotifyConfigured } from '$lib/server/import/spotify';
import { parseYouTubePlaylistUrl, isYouTubeConfigured } from '$lib/server/import/youtube';
import { runImport } from '$lib/server/import/orchestrate';
import type { PlaylistSourceType } from '$lib/server/db/schema';

export const GET: RequestHandler = async () => {
	const playlists = await listPlaylists();
	return json(playlists);
};

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) return error(401, 'Sign in to create a playlist');

	const body = (await request.json()) as { url?: string };
	const url = body.url?.trim();
	if (!url) return error(400, 'A playlist or artist URL is required');

	const spotify = parseSpotifyUrl(url);
	let sourceType: PlaylistSourceType;
	let sourceId: string;

	if (spotify) {
		if (!isSpotifyConfigured()) return error(400, 'Spotify import is not configured on this server yet');
		sourceType = spotify.type === 'artist' ? 'spotify_artist' : 'spotify_playlist';
		sourceId = spotify.id;
	} else {
		const ytId = parseYouTubePlaylistUrl(url);
		if (ytId) {
			if (!isYouTubeConfigured()) return error(400, 'YouTube import is not configured on this server yet');
			sourceType = 'youtube_playlist';
			sourceId = ytId;
		} else {
			return error(400, 'Paste a Spotify playlist/artist link or a YouTube playlist link');
		}
	}

	const id = await createPlaylist(locals.user.id, 'Importing…', sourceType, url);
	void runImport(id, sourceType, sourceId, url);

	return json({ id });
};
