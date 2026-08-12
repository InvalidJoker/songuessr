import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getPlaylist, markPlaylistImporting } from '$lib/server/db/playlist-store';
import { parseSpotifyUrl } from '$lib/server/import/spotify';
import { parseYouTubePlaylistUrl } from '$lib/server/import/youtube';
import { runImport } from '$lib/server/import/orchestrate';

export const POST: RequestHandler = async ({ params, locals }) => {
	if (!locals.user) return error(401, 'Sign in required');

	const p = await getPlaylist(params.id);
	if (!p) return error(404, 'Playlist not found');
	if (p.ownerId !== locals.user.id) return error(403, 'Only the owner can retry this import');
	if (p.sourceType === 'manual') return error(400, 'Manual playlists have nothing to import');
	if (p.importStatus !== 'failed') return error(400, 'This playlist is not in a failed state');
	if (!p.sourceUrl) return error(400, 'This playlist has no source link to retry');

	const spotify = parseSpotifyUrl(p.sourceUrl);
	const sourceId = spotify ? spotify.id : parseYouTubePlaylistUrl(p.sourceUrl);
	if (!sourceId) return error(400, "Couldn't re-parse the original link");

	await markPlaylistImporting(params.id);
	void runImport(params.id, p.sourceType, sourceId, p.sourceUrl);

	return json({ ok: true });
};
