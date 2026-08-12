import { randomUUID } from 'node:crypto';
import { eq, and, sql } from 'drizzle-orm';
import { db } from './index';
import { challenge, challengeResult, playlist, playlistTrack, user } from './schema';
import type { ChallengeRoundResult } from './schema';

export const CHALLENGE_ROUND_COUNT = 5;

export async function createChallenge(playlistId: string, creatorId: string) {
	const rows = await db
		.select({ id: playlistTrack.deezerTrackId })
		.from(playlistTrack)
		.where(eq(playlistTrack.playlistId, playlistId))
		.orderBy(sql`random()`)
		.limit(CHALLENGE_ROUND_COUNT);

	if (rows.length === 0) return null;

	const trackIds = rows.map((r) => r.id);
	const id = randomUUID();
	await db.insert(challenge).values({ id, playlistId, creatorId, trackIds });
	return { id, trackIds };
}

export async function getChallenge(id: string) {
	const [row] = await db
		.select({
			id: challenge.id,
			playlistId: challenge.playlistId,
			playlistName: playlist.name,
			playlistCover: playlist.cover,
			creatorId: challenge.creatorId,
			creatorName: user.name,
			trackIds: challenge.trackIds,
			createdAt: challenge.createdAt
		})
		.from(challenge)
		.innerJoin(playlist, eq(playlist.id, challenge.playlistId))
		.innerJoin(user, eq(user.id, challenge.creatorId))
		.where(eq(challenge.id, id));
	return row ?? null;
}

export async function getChallengeResult(challengeId: string, userId: string) {
	const [row] = await db
		.select()
		.from(challengeResult)
		.where(and(eq(challengeResult.challengeId, challengeId), eq(challengeResult.userId, userId)));
	return row ?? null;
}

export async function getAllChallengeResults(challengeId: string) {
	return db
		.select({
			userId: challengeResult.userId,
			name: user.name,
			correct: challengeResult.correct,
			totalGuesses: challengeResult.totalGuesses,
			completedAt: challengeResult.completedAt,
			rounds: challengeResult.rounds
		})
		.from(challengeResult)
		.innerJoin(user, eq(user.id, challengeResult.userId))
		.where(eq(challengeResult.challengeId, challengeId));
}

export async function recordChallengeRound(
	challengeId: string,
	userId: string,
	roundIndex: number,
	outcome: 'won' | 'lost',
	guesses: number,
	totalRounds: number
) {
	const existing = await getChallengeResult(challengeId, userId);
	const rounds: (ChallengeRoundResult | null)[] = existing
		? [...existing.rounds]
		: new Array(totalRounds).fill(null);
	rounds[roundIndex] = { outcome, guesses };

	const filled = rounds.filter((r): r is ChallengeRoundResult => r !== null);
	const correct = filled.filter((r) => r.outcome === 'won').length;
	const totalGuesses = filled.reduce((sum, r) => sum + r.guesses, 0);
	const completedAt = filled.length === totalRounds ? new Date() : (existing?.completedAt ?? null);

	await db
		.insert(challengeResult)
		.values({
			challengeId,
			userId,
			rounds: rounds as ChallengeRoundResult[],
			correct,
			totalGuesses,
			completedAt,
			updatedAt: new Date()
		})
		.onConflictDoUpdate({
			target: [challengeResult.challengeId, challengeResult.userId],
			set: { rounds: rounds as ChallengeRoundResult[], correct, totalGuesses, completedAt, updatedAt: new Date() }
		});

	return { rounds, correct, totalGuesses, completedAt };
}
