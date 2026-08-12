import { pgTable, integer, bigint, text, timestamp, boolean, serial, jsonb, primaryKey } from 'drizzle-orm/pg-core';
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

export type PlaylistSourceType = 'spotify_playlist' | 'spotify_artist' | 'youtube_playlist' | 'manual';
export type PlaylistImportStatus = 'pending' | 'importing' | 'ready' | 'failed';

export const playlist = pgTable('playlist', {
	id: text('id').primaryKey(),
	ownerId: text('owner_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	name: text('name').notNull(),
	description: text('description'),
	sourceType: text('source_type').$type<PlaylistSourceType>().notNull(),
	sourceUrl: text('source_url'),
	cover: text('cover'),
	trackCount: integer('track_count').notNull().default(0),
	unmatchedCount: integer('unmatched_count').notNull().default(0),
	importStatus: text('import_status').$type<PlaylistImportStatus>().notNull().default('pending'),
	importError: text('import_error'),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export const playlistTrack = pgTable('playlist_track', {
	id: serial('id').primaryKey(),
	playlistId: text('playlist_id')
		.notNull()
		.references(() => playlist.id, { onDelete: 'cascade' }),
	position: integer('position').notNull(),
	deezerTrackId: bigint('deezer_track_id', { mode: 'number' }).notNull(),
	title: text('title').notNull(),
	artist: text('artist').notNull(),
	album: text('album').notNull().default(''),
	cover: text('cover').notNull().default(''),
	coverBig: text('cover_big').notNull().default(''),
	duration: integer('duration').notNull().default(30),
	explicit: boolean('explicit').notNull().default(false)
});

export const playlistStats = pgTable(
	'playlist_stats',
	{
		playlistId: text('playlist_id')
			.notNull()
			.references(() => playlist.id, { onDelete: 'cascade' }),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		played: integer('played').notNull().default(0),
		correct: integer('correct').notNull().default(0),
		streak: integer('streak').notNull().default(0),
		bestStreak: integer('best_streak').notNull().default(0),
		updatedAt: timestamp('updated_at').notNull().defaultNow()
	},
	(table) => [primaryKey({ columns: [table.playlistId, table.userId] })]
);

export const challenge = pgTable('challenge', {
	id: text('id').primaryKey(),
	playlistId: text('playlist_id')
		.notNull()
		.references(() => playlist.id, { onDelete: 'cascade' }),
	creatorId: text('creator_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	trackIds: jsonb('track_ids').$type<number[]>().notNull(),
	createdAt: timestamp('created_at').notNull().defaultNow()
});

export interface ChallengeRoundResult {
	outcome: 'won' | 'lost';
	guesses: number;
}

export const challengeResult = pgTable(
	'challenge_result',
	{
		challengeId: text('challenge_id')
			.notNull()
			.references(() => challenge.id, { onDelete: 'cascade' }),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		rounds: jsonb('rounds').$type<ChallengeRoundResult[]>().notNull().default([]),
		correct: integer('correct').notNull().default(0),
		totalGuesses: integer('total_guesses').notNull().default(0),
		completedAt: timestamp('completed_at'),
		updatedAt: timestamp('updated_at').notNull().defaultNow()
	},
	(table) => [primaryKey({ columns: [table.challengeId, table.userId] })]
);

export * from './auth.schema';
