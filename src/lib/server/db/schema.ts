import { pgTable, integer, text, timestamp } from 'drizzle-orm/pg-core';
import { user } from './auth.schema';

export const userStats = pgTable('user_stats', {
	userId: text('user_id')
		.primaryKey()
		.references(() => user.id, { onDelete: 'cascade' }),

	dailyPlayed: integer('daily_played').notNull().default(0),
	dailyWon: integer('daily_won').notNull().default(0),
	dailyStreak: integer('daily_streak').notNull().default(0),
	dailyMaxStreak: integer('daily_max_streak').notNull().default(0),
	dailyLastCompleted: text('daily_last_completed'),

	hitsPlayed: integer('hits_played').notNull().default(0),
	hitsCorrect: integer('hits_correct').notNull().default(0),
	hitsStreak: integer('hits_streak').notNull().default(0),
	hitsBestStreak: integer('hits_best_streak').notNull().default(0),

	updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export * from './auth.schema';
