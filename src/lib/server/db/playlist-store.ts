import { randomUUID } from 'node:crypto';
import { and, asc, desc, eq, notInArray, sql } from 'drizzle-orm';
import { db } from './index';
import { playlist, playlistTrack, playlistStats, user, type PlaylistSourceType } from './schema';
import type { TrackMeta } from '$lib/types';

export async function createPlaylist(
	ownerId: string,
	name: string,
	sourceType: PlaylistSourceType,
	sourceUrl: string
) {
	const id = randomUUID();
	await db.insert(playlist).values({
		id,
		ownerId,
		name,
		sourceType,
		sourceUrl,
		importStatus: 'importing'
	});
	return id;
}

export async function createManualPlaylist(ownerId: string, name: string, tracks: TrackMeta[]) {
	const id = randomUUID();
	await db.insert(playlist).values({
		id,
		ownerId,
		name,
		sourceType: 'manual',
		cover: tracks[0]?.cover ?? null,
		trackCount: tracks.length,
		importStatus: 'ready'
	});

	await db.insert(playlistTrack).values(
		tracks.map((t, i) => ({
			playlistId: id,
			position: i,
			deezerTrackId: t.id,
			title: t.title,
			artist: t.artist,
			album: t.album,
			cover: t.cover,
			coverBig: t.coverBig,
			duration: t.duration,
			explicit: t.explicit
		}))
	);

	return id;
}

export async function getPlaylistTracks(playlistId: string) {
	return db
		.select()
		.from(playlistTrack)
		.where(eq(playlistTrack.playlistId, playlistId))
		.orderBy(asc(playlistTrack.position));
}

export async function addTrackToPlaylist(playlistId: string, track: TrackMeta) {
	const [{ count }] = await db
		.select({ count: sql<number>`count(*)::int` })
		.from(playlistTrack)
		.where(eq(playlistTrack.playlistId, playlistId));

	const [existing] = await db
		.select({ id: playlistTrack.id })
		.from(playlistTrack)
		.where(and(eq(playlistTrack.playlistId, playlistId), eq(playlistTrack.deezerTrackId, track.id)));
	if (existing) return;

	await db.insert(playlistTrack).values({
		playlistId,
		position: count,
		deezerTrackId: track.id,
		title: track.title,
		artist: track.artist,
		album: track.album,
		cover: track.cover,
		coverBig: track.coverBig,
		duration: track.duration,
		explicit: track.explicit
	});

	await db
		.update(playlist)
		.set({ trackCount: count + 1, cover: sql`COALESCE(${playlist.cover}, ${track.cover})`, updatedAt: new Date() })
		.where(eq(playlist.id, playlistId));
}

export async function removeTrackFromPlaylist(playlistId: string, playlistTrackId: number) {
	await db
		.delete(playlistTrack)
		.where(and(eq(playlistTrack.id, playlistTrackId), eq(playlistTrack.playlistId, playlistId)));

	const [{ count }] = await db
		.select({ count: sql<number>`count(*)::int` })
		.from(playlistTrack)
		.where(eq(playlistTrack.playlistId, playlistId));

	await db
		.update(playlist)
		.set({ trackCount: count, updatedAt: new Date() })
		.where(eq(playlist.id, playlistId));
}

export async function getPlaylist(id: string) {
	const [row] = await db.select().from(playlist).where(eq(playlist.id, id));
	return row ?? null;
}

export async function listPlaylists(limit = 50) {
	return db
		.select({
			id: playlist.id,
			name: playlist.name,
			cover: playlist.cover,
			sourceType: playlist.sourceType,
			trackCount: playlist.trackCount,
			importStatus: playlist.importStatus,
			createdAt: playlist.createdAt,
			ownerName: user.name
		})
		.from(playlist)
		.innerJoin(user, eq(user.id, playlist.ownerId))
		.orderBy(desc(playlist.createdAt))
		.limit(limit);
}

export async function randomPlaylistTrack(playlistId: string, excludeIds: number[] = []) {
	const conditions = [eq(playlistTrack.playlistId, playlistId)];
	if (excludeIds.length > 0) conditions.push(notInArray(playlistTrack.deezerTrackId, excludeIds));

	const [row] = await db
		.select()
		.from(playlistTrack)
		.where(and(...conditions))
		.orderBy(sql`random()`)
		.limit(1);

	if (!row) return null;
	return {
		id: row.deezerTrackId,
		title: row.title,
		artist: row.artist,
		album: row.album,
		cover: row.cover,
		coverBig: row.coverBig,
		duration: row.duration,
		explicit: row.explicit
	};
}

export async function playlistTrackIds(playlistId: string): Promise<number[]> {
	const rows = await db
		.select({ id: playlistTrack.deezerTrackId })
		.from(playlistTrack)
		.where(eq(playlistTrack.playlistId, playlistId));
	return rows.map((r) => r.id);
}

interface PlaylistStatsRow {
	played: number;
	correct: number;
	streak: number;
	bestStreak: number;
}

async function getOrDefaultPlaylistStats(
	playlistId: string,
	userId: string
): Promise<PlaylistStatsRow> {
	const [row] = await db
		.select()
		.from(playlistStats)
		.where(and(eq(playlistStats.playlistId, playlistId), eq(playlistStats.userId, userId)));
	if (row) return row;
	return { played: 0, correct: 0, streak: 0, bestStreak: 0 };
}

export async function recordPlaylistResult(playlistId: string, userId: string, won: boolean) {
	const current = await getOrDefaultPlaylistStats(playlistId, userId);
	const streak = won ? current.streak + 1 : 0;
	const patch = {
		played: current.played + 1,
		correct: current.correct + (won ? 1 : 0),
		streak,
		bestStreak: Math.max(current.bestStreak, streak),
		updatedAt: new Date()
	};

	await db
		.insert(playlistStats)
		.values({ playlistId, userId, ...patch })
		.onConflictDoUpdate({
			target: [playlistStats.playlistId, playlistStats.userId],
			set: patch
		});
}

export async function topPlaylistPlayers(playlistId: string, limit = 10) {
	return db
		.select({ userId: playlistStats.userId, name: user.name, value: playlistStats.bestStreak })
		.from(playlistStats)
		.innerJoin(user, eq(user.id, playlistStats.userId))
		.where(eq(playlistStats.playlistId, playlistId))
		.orderBy(desc(playlistStats.bestStreak))
		.limit(limit);
}
