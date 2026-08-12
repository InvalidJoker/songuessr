import { env } from '$env/dynamic/private';
import type { SourceTrack } from './spotify';
import { ImportUserError } from './errors';

const API_BASE = 'https://www.googleapis.com/youtube/v3';
const MAX_PLAYLIST_TRACKS = 300;

export function isYouTubeConfigured(): boolean {
	return !!env.YOUTUBE_API_KEY;
}

export function parseYouTubePlaylistUrl(url: string): string | null {
	try {
		const u = new URL(url);
		if (!/(^|\.)(youtube\.com|youtu\.be|music\.youtube\.com)$/.test(u.hostname)) return null;
		const list = u.searchParams.get('list');
		return list ?? null;
	} catch {
		return null;
	}
}

// Strips common noise from video titles: "(Official Video)", "[Lyrics]", "ft. X", etc.
function cleanTitle(raw: string): string {
	return raw
		.replace(/\((?:official|lyrics?|audio|video|mv|hd|4k)[^)]*\)/gi, '')
		.replace(/\[(?:official|lyrics?|audio|video|mv|hd|4k)[^\]]*\]/gi, '')
		.replace(/\s*(?:ft\.?|feat\.?)\s.+$/i, '')
		.trim();
}

// Best-effort "Artist - Title" split; falls back to using the channel name as the artist.
function parseVideoTitle(title: string, channelTitle: string): SourceTrack {
	const cleaned = cleanTitle(title);
	const dash = cleaned.split(/\s[-–—]\s/);
	if (dash.length >= 2) {
		return { title: dash.slice(1).join(' - ').trim(), artist: dash[0].trim() };
	}
	return { title: cleaned, artist: channelTitle.replace(/\s*-\s*Topic$/i, '').trim() };
}

interface PlaylistItemsPage {
	nextPageToken?: string;
	items: {
		snippet: {
			title: string;
			videoOwnerChannelTitle?: string;
			channelTitle: string;
			resourceId: { videoId: string };
		};
	}[];
}

export async function fetchYouTubePlaylist(
	id: string
): Promise<{ name: string; cover: string | null; tracks: SourceTrack[] }> {
	if (!isYouTubeConfigured()) {
		throw new ImportUserError('YouTube import is not configured on this server yet');
	}

	const playlistRes = await fetch(
		`${API_BASE}/playlists?part=snippet&id=${id}&key=${env.YOUTUBE_API_KEY}`
	);
	if (!playlistRes.ok) throw new Error(`YouTube API error ${playlistRes.status}`);
	const playlistJson = (await playlistRes.json()) as {
		items: { snippet: { title: string; thumbnails?: { high?: { url: string } } } }[];
	};
	const meta = playlistJson.items[0];
	if (!meta) throw new ImportUserError('Playlist not found or is private');

	const tracks: SourceTrack[] = [];
	let pageToken = '';
	do {
		const res = await fetch(
			`${API_BASE}/playlistItems?part=snippet&maxResults=50&playlistId=${id}&pageToken=${pageToken}&key=${env.YOUTUBE_API_KEY}`
		);
		if (!res.ok) throw new Error(`YouTube API error ${res.status}`);
		const page = (await res.json()) as PlaylistItemsPage;
		for (const item of page.items) {
			const s = item.snippet;
			if (!s.resourceId?.videoId || s.title === 'Deleted video' || s.title === 'Private video') {
				continue;
			}
			const parsed = parseVideoTitle(s.title, s.videoOwnerChannelTitle ?? s.channelTitle);
			if (!parsed.title || !parsed.artist) continue;
			tracks.push(parsed);
			if (tracks.length >= MAX_PLAYLIST_TRACKS) break;
		}
		pageToken = page.nextPageToken ?? '';
	} while (pageToken && tracks.length < MAX_PLAYLIST_TRACKS);

	return { name: meta.snippet.title, cover: meta.snippet.thumbnails?.high?.url ?? null, tracks };
}
