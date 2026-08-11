import type { SearchResult, TrackMeta } from '$lib/types';

const API_BASE = 'https://api.deezer.com';

interface DeezerTrack {
	id: number;
	title: string;
	title_short?: string;
	preview: string;
	duration: number;
	explicit_lyrics?: boolean;
	artist: { name: string };
	album: { title: string; cover_medium: string; cover_big: string };
}

export async function fetchTrackById(id: number): Promise<TrackMeta | null> {
	const res = await fetch(`${API_BASE}/track/${id}`);
	if (!res.ok) return null;
	const t = (await res.json()) as DeezerTrack & { error?: unknown };
	if (t.error || !t.preview) return null;
	return toTrackMeta(t);
}

export async function searchTracks(query: string, limit = 8): Promise<SearchResult[]> {
	if (!query.trim()) return [];
	const url = `${API_BASE}/search/track?q=${encodeURIComponent(query)}&limit=${limit}`;
	const res = await fetch(url);
	if (!res.ok) return [];
	const json = (await res.json()) as { data: DeezerTrack[] };
	return (json.data ?? []).map((t) => ({
		id: t.id,
		title: t.title_short || t.title,
		artist: t.artist.name,
		cover: t.album?.cover_medium ?? ''
	}));
}

function toTrackMeta(t: DeezerTrack): TrackMeta {
	return {
		id: t.id,
		title: t.title_short || t.title,
		artist: t.artist.name,
		album: t.album?.title ?? '',
		cover: t.album?.cover_medium ?? '',
		coverBig: t.album?.cover_big ?? '',
		duration: t.duration ?? 30,
		explicit: !!t.explicit_lyrics
	};
}

export interface PreviewInfo {
	preview: string;
}

export async function fetchPreviewUrl(id: number): Promise<string | null> {
	const res = await fetch(`${API_BASE}/track/${id}`);
	if (!res.ok) return null;
	const t = (await res.json()) as { preview?: string; error?: unknown };
	if (t.error || !t.preview) return null;
	return t.preview;
}
