import { eq, desc } from 'drizzle-orm';
import { db } from './index';
import { userStats, user } from './schema';

export type UserStatsRow = typeof userStats.$inferSelect;

const DEFAULT_STATS: Omit<UserStatsRow, 'userId' | 'updatedAt'> = {
	dailyPlayed: 0,
	dailyWon: 0,
	dailyStreak: 0,
	dailyMaxStreak: 0,
	dailyLastCompleted: null,
	hitsPlayed: 0,
	hitsCorrect: 0,
	hitsStreak: 0,
	hitsBestStreak: 0
};

async function getOrDefault(userId: string): Promise<UserStatsRow> {
	const [row] = await db.select().from(userStats).where(eq(userStats.userId, userId));
	if (row) return row;
	return { userId, updatedAt: new Date(), ...DEFAULT_STATS };
}

export async function getUserStats(userId: string): Promise<UserStatsRow> {
	return getOrDefault(userId);
}

export async function recordDailyResult(userId: string, won: boolean, dateKey: string) {
	const current = await getOrDefault(userId);
	if (current.dailyLastCompleted === dateKey) return current;

	const streak = won ? current.dailyStreak + 1 : 0;
	const patch = {
		dailyPlayed: current.dailyPlayed + 1,
		dailyWon: current.dailyWon + (won ? 1 : 0),
		dailyStreak: streak,
		dailyMaxStreak: Math.max(current.dailyMaxStreak, streak),
		dailyLastCompleted: dateKey,
		updatedAt: new Date()
	};

	await db
		.insert(userStats)
		.values({ userId, ...patch })
		.onConflictDoUpdate({ target: userStats.userId, set: patch });

	return { ...current, ...patch };
}

export async function recordHitsResult(userId: string, won: boolean) {
	const current = await getOrDefault(userId);

	const streak = won ? current.hitsStreak + 1 : 0;
	const patch = {
		hitsPlayed: current.hitsPlayed + 1,
		hitsCorrect: current.hitsCorrect + (won ? 1 : 0),
		hitsStreak: streak,
		hitsBestStreak: Math.max(current.hitsBestStreak, streak),
		updatedAt: new Date()
	};

	await db
		.insert(userStats)
		.values({ userId, ...patch })
		.onConflictDoUpdate({ target: userStats.userId, set: patch });

	return { ...current, ...patch };
}

export interface LeaderboardEntry {
	userId: string;
	name: string;
	value: number;
}

export async function topByHitsStreak(limit = 10): Promise<LeaderboardEntry[]> {
	const rows = await db
		.select({ userId: userStats.userId, name: user.name, value: userStats.hitsBestStreak })
		.from(userStats)
		.innerJoin(user, eq(user.id, userStats.userId))
		.orderBy(desc(userStats.hitsBestStreak))
		.limit(limit);
	return rows;
}

export async function topByDailyStreak(limit = 10): Promise<LeaderboardEntry[]> {
	const rows = await db
		.select({ userId: userStats.userId, name: user.name, value: userStats.dailyMaxStreak })
		.from(userStats)
		.innerJoin(user, eq(user.id, userStats.userId))
		.orderBy(desc(userStats.dailyMaxStreak))
		.limit(limit);
	return rows;
}
