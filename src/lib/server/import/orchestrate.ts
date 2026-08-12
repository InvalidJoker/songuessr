import { db } from '$lib/server/db';
import { playlist, playlistTrack } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { fetchSpotifyPlaylist, fetchSpotifyArtistCatalog, type SourceTrack } from './spotify';
import { fetchYouTubePlaylist } from './youtube';
import { matchToDeezer } from './match';
import type { PlaylistSourceType } from '$lib/server/db/schema';

const CONCURRENCY = 5;

async function matchAll(tracks: SourceTrack[]) {
	const matched: SourceTrack[] = [];
	const results: { source: SourceTrack; track: Awaited<ReturnType<typeof matchToDeezer>> }[] = [];

	for (let i = 0; i < tracks.length; i += CONCURRENCY) {
		const batch = tracks.slice(i, i + CONCURRENCY);
		const batchResults = await Promise.all(
			batch.map(async (source) => ({ source, track: await matchToDeezer(source) }))
		);
		results.push(...batchResults);
	}

	void matched;
	return results;
}

export async function runImport(
	playlistId: string,
	sourceType: PlaylistSourceType,
	sourceId: string,
	sourceUrl: string
) {
	try {
		let name: string;
		let cover: string | null;
		let tracks: SourceTrack[];

		if (sourceType === 'spotify_playlist') {
			({ name, cover, tracks } = await fetchSpotifyPlaylist(sourceId));
		} else if (sourceType === 'spotify_artist') {
			({ name, cover, tracks } = await fetchSpotifyArtistCatalog(sourceId));
		} else if (sourceType === 'youtube_playlist') {
			({ name, cover, tracks } = await fetchYouTubePlaylist(sourceId));
		} else {
			throw new Error(`Unsupported source type: ${sourceType}`);
		}

		if (tracks.length === 0) {
			throw new Error('No tracks found at that URL');
		}

		const results = await matchAll(tracks);
		const matched = results.filter((r) => r.track !== null);

		if (matched.length === 0) {
			throw new Error("Couldn't match any of these tracks to playable songs");
		}

		const rows = matched.map((r, i) => ({
			playlistId,
			position: i,
			deezerTrackId: r.track!.id,
			title: r.track!.title,
			artist: r.track!.artist,
			album: r.track!.album,
			cover: r.track!.cover,
			coverBig: r.track!.coverBig,
			duration: r.track!.duration,
			explicit: r.track!.explicit
		}));

		await db.insert(playlistTrack).values(rows);

		await db
			.update(playlist)
			.set({
				name: name || undefined,
				cover: cover ?? undefined,
				sourceUrl,
				trackCount: matched.length,
				unmatchedCount: tracks.length - matched.length,
				importStatus: 'ready',
				importError: null,
				updatedAt: new Date()
			})
			.where(eq(playlist.id, playlistId));
	} catch (err) {
		console.error(`Playlist import failed (${playlistId}):`, err);
		await db
			.update(playlist)
			.set({
				importStatus: 'failed',
				importError: err instanceof Error ? err.message : 'Import failed',
				updatedAt: new Date()
			})
			.where(eq(playlist.id, playlistId));
	}
}
