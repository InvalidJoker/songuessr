
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

  const lines = [
    `🎵 Songuessr Daily #${dayNumber}`,
    `${won ? '🎉' : '😵'} ${score}`,
    '',
    grid,
    '',
    `Can you beat my score? Play Songuessr Daily!`,
    opts.url ?? 'https://songuessr.com'
  ];

  return lines.join('\n');
}
