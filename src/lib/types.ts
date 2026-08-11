export interface TrackMeta {
	id: number;
	title: string;
	artist: string;
	album: string;
	cover: string;
	coverBig: string;
	duration: number;
	explicit: boolean;
}

export interface SearchResult {
	id: number;
	title: string;
	artist: string;
	cover: string;
}

export type GuessOutcome = 'correct' | 'wrong' | 'skip';

export interface GuessEntry {
	outcome: GuessOutcome;
	label: string;
}

export type GameStatus = 'playing' | 'won' | 'lost';

export interface RoundStartResponse {
	roundId: string;
	preview: string;
	durations: number[];
	maxGuesses: number;
	dayNumber?: number;
}

export interface GuessRequest {
	roundId: string;
	trackId?: number;
	skip?: boolean;
	/** 1-indexed attempt number this guess represents (including itself). */
	attemptNumber: number;
}

export interface GuessResponse {
	outcome: GuessOutcome;
	guessLabel: string;
	guessesUsed: number;
	maxGuesses: number;
	status: GameStatus;
	track?: TrackMeta;
}
