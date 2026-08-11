import type { GuessEntry } from '$lib/types';

const EMOJI: Record<GuessEntry['outcome'], string> = {
	correct: '🟩',
	wrong: '🟥',
	skip: '⬛'
};

export function buildShareText(opts: {
	dayNumber: number;
	guesses: GuessEntry[];
	won: boolean;
	url?: string;
}): string {
	const { dayNumber, guesses, won } = opts;
	const grid = guesses.map((g) => EMOJI[g.outcome]).join('');
	const score = won ? `${guesses.length}/6` : 'X/6';
	const lines = [`Songless Daily #${dayNumber} ${score}`, grid];
	if (opts.url) lines.push(opts.url);
	return lines.join('\n');
}
