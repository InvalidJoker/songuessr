<script lang="ts">
	import type { TrackMeta } from '$lib/types';

	let {
		track,
		won,
		guessCount,
		maxGuesses
	}: { track: TrackMeta; won: boolean; guessCount: number; maxGuesses: number } = $props();
</script>

<div
	class="flex items-center gap-4 rounded-2xl border p-4 {won
		? 'border-emerald-300 dark:border-emerald-400/30'
		: 'border-rose-300 dark:border-rose-400/30'}"
>
	{#if track.cover}
		<img src={track.cover} alt="" class="h-16 w-16 shrink-0 rounded-lg object-cover" />
	{/if}
	<div class="min-w-0 flex-1">
		<p
			class="text-xs font-medium uppercase tracking-wide {won
				? 'text-emerald-600 dark:text-emerald-400'
				: 'text-rose-500 dark:text-rose-400'}"
		>
			{won ? `Solved in ${guessCount}/${maxGuesses}` : 'Out of guesses'}
		</p>
		<p class="truncate text-lg font-semibold text-neutral-900 dark:text-neutral-100">
			{track.title}
		</p>
		<p class="truncate text-sm text-neutral-500 dark:text-neutral-400">{track.artist}</p>
	</div>
</div>
