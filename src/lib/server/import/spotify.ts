import { env } from '$env/dynamic/private';

export interface SourceTrack {
	title: string;
	artist: string;
	album?: string;
}

export interface ParsedSpotifyUrl {
	type: 'playlist' | 'artist';
	id: string;
}

const TOKEN_URL = 'https://accounts.spotify.com/api/token';
const API_BASE = 'https://api.spotify.com/v1';
const MAX_ARTIST_TRACKS = 150;
const MAX_PLAYLIST_TRACKS = 300;

let cachedToken: { value: string; expiresAt: number } | null = null;

export function isSpotifyConfigured(): boolean {
	return !!env.SPOTIFY_CLIENT_ID && !!env.SPOTIFY_CLIENT_SECRET;
}

async function getToken(): Promise<string> {
	if (cachedToken && cachedToken.expiresAt > Date.now() + 5000) return cachedToken.value;
	if (!isSpotifyConfigured()) {
		throw new Error('Spotify is not configured (missing SPOTIFY_CLIENT_ID/SPOTIFY_CLIENT_SECRET)');
	}

	const basic = Buffer.from(`${env.SPOTIFY_CLIENT_ID}:${env.SPOTIFY_CLIENT_SECRET}`).toString(
		'base64'
	);
	const res = await fetch(TOKEN_URL, {
		method: 'POST',
		headers: {
			Authorization: `Basic ${basic}`,
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: 'grant_type=client_credentials'
	});
	if (!res.ok) throw new Error(`Spotify auth failed: ${res.status}`);
	const json = (await res.json()) as { access_token: string; expires_in: number };
	cachedToken = { value: json.access_token, expiresAt: Date.now() + json.expires_in * 1000 };
	return cachedToken.value;
}

async function spotifyGet<T>(path: string): Promise<T> {
	const token = await getToken();
	const res = await fetch(path.startsWith('http') ? path : `${API_BASE}${path}`, {
		headers: { Authorization: `Bearer ${token}` }
	});
	if (!res.ok) throw new Error(`Spotify API error ${res.status} for ${path}`);
	return res.json() as Promise<T>;
}

export function parseSpotifyUrl(url: string): ParsedSpotifyUrl | null {
	const uri = url.trim().match(/^spotify:(playlist|artist):([a-zA-Z0-9]+)$/);
	if (uri) return { type: uri[1] as 'playlist' | 'artist', id: uri[2] };

	try {
		const u = new URL(url);
		if (!u.hostname.endsWith('open.spotify.com')) return null;
		const parts = u.pathname.split('/').filter(Boolean);
		const idx = parts.findIndex((p) => p === 'playlist' || p === 'artist');
		if (idx === -1 || !parts[idx + 1]) return null;
		return { type: parts[idx] as 'playlist' | 'artist', id: parts[idx + 1] };
	} catch {
		return null;
	}
}

interface SpotifyPage<T> {
	items: T[];
	next: string | null;
}

interface SpotifyPlaylistItem {
	track: {
		name: string;
		artists: { name: string }[];
		album: { name: string };
		is_local: boolean;
	} | null;
}

export async function fetchSpotifyPlaylist(
	id: string
): Promise<{ name: string; cover: string | null; tracks: SourceTrack[] }> {
	const meta = await spotifyGet<{ name: string; images: { url: string }[] }>(`/playlists/${id}?fields=name,images`);

	const tracks: SourceTrack[] = [];
	let url: string | null =
		`${API_BASE}/playlists/${id}/tracks?limit=100&fields=next,items(track(name,artists(name),album(name),is_local))`;

	while (url && tracks.length < MAX_PLAYLIST_TRACKS) {
		const page: SpotifyPage<SpotifyPlaylistItem> = await spotifyGet(url);
		for (const item of page.items) {
			const t = item.track;
			if (!t || t.is_local || !t.name || t.artists.length === 0) continue;
			tracks.push({ title: t.name, artist: t.artists[0].name, album: t.album?.name });
			if (tracks.length >= MAX_PLAYLIST_TRACKS) break;
		}
		url = page.next;
	}

	return { name: meta.name, cover: meta.images?.[0]?.url ?? null, tracks };
}

interface SpotifyAlbum {
	id: string;
	name: string;
}

interface SpotifyAlbumTrack {
	name: string;
	artists: { name: string }[];
}

export async function fetchSpotifyArtistCatalog(
	id: string
): Promise<{ name: string; cover: string | null; tracks: SourceTrack[] }> {
	const artist = await spotifyGet<{ name: string; images: { url: string }[] }>(`/artists/${id}`);

	const top = await spotifyGet<{ tracks: SpotifyAlbumTrack[] }>(
		`/artists/${id}/top-tracks?market=US`
	);

	const albums: SpotifyAlbum[] = [];
	let url: string | null = `${API_BASE}/artists/${id}/albums?include_groups=album,single&limit=50&market=US`;
	while (url) {
		const page: SpotifyPage<SpotifyAlbum> = await spotifyGet(url);
		albums.push(...page.items);
		url = page.next;
	}

	const seen = new Set<string>();
	const tracks: SourceTrack[] = [];

	const addTrack = (t: SpotifyAlbumTrack, album?: string) => {
		if (!t.artists.some((a) => a.name.toLowerCase() === artist.name.toLowerCase())) return;
		const key = `${t.name.toLowerCase()}::${t.artists[0]?.name.toLowerCase()}`;
		if (seen.has(key)) return;
		seen.add(key);
		tracks.push({ title: t.name, artist: t.artists[0]?.name ?? artist.name, album });
	};

	for (const t of top.tracks) addTrack(t);

	for (const album of albums) {
		if (tracks.length >= MAX_ARTIST_TRACKS) break;
		try {
			const albumTracks = await spotifyGet<SpotifyPage<SpotifyAlbumTrack>>(
				`/albums/${album.id}/tracks?limit=50`
			);
			for (const t of albumTracks.items) {
				if (tracks.length >= MAX_ARTIST_TRACKS) break;
				addTrack(t, album.name);
			}
		} catch {
			// skip albums that fail to load rather than aborting the whole import
		}
	}

	return { name: artist.name, cover: artist.images?.[0]?.url ?? null, tracks };
}
