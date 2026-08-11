// Builds src/lib/data/pool.json — a curated list of track metadata (id, title,
// artist, cover, duration) sourced from Deezer's public chart API.
//
// We only ever store metadata + Deezer track IDs here. Audio preview URLs are
// short-lived (they expire) and are always fetched fresh at play time from
// Deezer, never cached to disk.
//
// Usage: node scripts/build-pool.mjs

import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_PATH = path.join(__dirname, '../src/lib/data/pool.json');

// Deezer genre ids we pull "hits" charts from, for a broad, recognizable pool.
const GENRES = [
	{ id: 132, name: 'Pop' },
	{ id: 116, name: 'Rap/Hip-Hop' },
	{ id: 152, name: 'Rock' },
	{ id: 113, name: 'Dance' },
	{ id: 165, name: 'R&B' },
	{ id: 85, name: 'Alternative' },
	{ id: 106, name: 'Electro' },
	{ id: 84, name: 'Country' },
	{ id: 197, name: 'Latin' },
	{ id: 144, name: 'Reggae' },
	{ id: 169, name: 'Soul & Funk' },
	{ id: 464, name: 'Heavy Metal' },
	{ id: 129, name: 'Jazz' },
	{ id: 466, name: 'Folk' }
];

async function fetchChart(genreId) {
	const url = `https://api.deezer.com/chart/${genreId}/tracks?limit=100`;
	const res = await fetch(url);
	if (!res.ok) throw new Error(`chart ${genreId} failed: ${res.status}`);
	const json = await res.json();
	return json.data ?? [];
}

// Deterministic PRNG (mulberry32) so the shuffled "daily order" is reproducible.
function mulberry32(seed) {
	let a = seed;
	return function () {
		a |= 0;
		a = (a + 0x6d2b79f5) | 0;
		let t = Math.imul(a ^ (a >>> 15), 1 | a);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

function seededShuffle(arr, seed) {
	const rand = mulberry32(seed);
	const a = arr.slice();
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(rand() * (i + 1));
		[a[i], a[j]] = [a[j], a[i]];
	}
	return a;
}

async function main() {
	const byId = new Map();

	for (const genre of GENRES) {
		try {
			const tracks = await fetchChart(genre.id);
			for (const t of tracks) {
				if (!t.id || !t.preview || !t.title || !t.artist?.name) continue;
				if (byId.has(t.id)) continue;
				byId.set(t.id, {
					id: t.id,
					title: t.title_short || t.title,
					artist: t.artist.name,
					album: t.album?.title ?? '',
					cover: t.album?.cover_medium ?? t.artist.picture_medium ?? '',
					coverBig: t.album?.cover_big ?? t.artist.picture_big ?? '',
					duration: t.duration ?? 30,
					explicit: !!t.explicit_lyrics
				});
			}
			console.log(`${genre.name}: +${tracks.length} (pool now ${byId.size})`);
		} catch (err) {
			console.error(`Skipping genre ${genre.name}:`, err.message);
		}
	}

	const tracks = Array.from(byId.values());
	// Fixed seed -> stable daily rotation across rebuilds unless the pool changes.
	const dailyOrder = seededShuffle(
		tracks.map((_, i) => i),
		20240101
	);

	const pool = {
		generatedAt: new Date().toISOString(),
		count: tracks.length,
		tracks,
		dailyOrder
	};

	await writeFile(OUT_PATH, JSON.stringify(pool));
	console.log(`\nWrote ${tracks.length} tracks to ${OUT_PATH}`);
}

main();
