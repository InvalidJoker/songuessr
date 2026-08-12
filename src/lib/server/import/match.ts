import { searchTracks, fetchTrackById } from '$lib/server/deezer';
import { normalize } from '$lib/server/matching';
import type { SourceTrack } from './spotify';
import type { TrackMeta } from '$lib/types';

function titleArtistScore(query: SourceTrack, candidateTitle: string, candidateArtist: string): number {
	const qt = normalize(query.title);
	const qa = normalize(query.artist);
	const ct = normalize(candidateTitle);
	const ca = normalize(candidateArtist);

	let score = 0;
	if (qt === ct) score += 2;
	else if (qt && (ct.includes(qt) || qt.includes(ct))) score += 1;

	if (qa === ca) score += 2;
	else if (qa && (ca.includes(qa) || qa.includes(ca))) score += 1;

	return score;
}

/** Resolves a (title, artist) pair from an external source to a playable Deezer track. */
export async function matchToDeezer(source: SourceTrack): Promise<TrackMeta | null> {
	const results = await searchTracks(`${source.artist} ${source.title}`, 5);
	if (results.length === 0) return null;

	let best = results[0];
	let bestScore = -1;
	for (const r of results) {
		const score = titleArtistScore(source, r.title, r.artist);
		if (score > bestScore) {
			bestScore = score;
			best = r;
		}
	}

	if (bestScore < 2) return null;
	return fetchTrackById(best.id);
}
