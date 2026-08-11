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
		correct: 'bg-emerald-500/20 border-emerald-400 text-emerald-300',
		wrong: 'bg-rose-500/10 border-rose-400/60 text-rose-300',
		skip: 'bg-white/5 border-white/15 text-white/40'
	};
</script>

<ol class="flex flex-col gap-2">
	{#each slots as g, i (i)}
		<li
			class="flex items-center gap-3 rounded-lg border px-3 py-2 text-sm {g
				? style[g.outcome]
				: 'border-white/10 bg-white/[0.03] text-white/30'}"
		>
			<span
				class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border {g
					? 'border-current'
					: 'border-white/15'} text-xs"
			>
				{g ? icon[g.outcome] : i + 1}
			</span>
			<span class="truncate">{g ? g.label : 'Not guessed yet'}</span>
		</li>
	{/each}
</ol>
