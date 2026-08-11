<script lang="ts">
	import type { GuessEntry } from '$lib/types';

	let { guesses, maxGuesses }: { guesses: GuessEntry[]; maxGuesses: number } = $props();

	const slots = $derived(Array.from({ length: maxGuesses }, (_, i) => guesses[i]));

	const icon: Record<GuessEntry['outcome'], string> = {
		correct: '✓',
		wrong: '✕',
		skip: '—'
	};
	const style: Record<GuessEntry['outcome'], string> = {
		correct: 'border-emerald-300 text-emerald-700 dark:border-emerald-400/40 dark:text-emerald-400',
		wrong: 'border-rose-300 text-rose-600 dark:border-rose-400/40 dark:text-rose-400',
		skip: 'border-neutral-200 text-neutral-400 dark:border-white/10 dark:text-neutral-600'
	};
</script>

<ol class="flex flex-col gap-2">
	{#each slots as g, i (i)}
		<li
			class="flex h-11 items-center gap-3 rounded-lg border px-3 text-sm {g
				? style[g.outcome]
				: 'border-neutral-200 dark:border-white/10'}"
		>
			{#if g}
				<span class="shrink-0 text-xs">{icon[g.outcome]}</span>
				<span class="truncate">{g.label}</span>
			{/if}
		</li>
	{/each}
</ol>
