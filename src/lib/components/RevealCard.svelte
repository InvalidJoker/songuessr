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
	class="flex items-center gap-4 rounded-2xl border {won
		? 'border-emerald-400/40 bg-emerald-500/10'
		: 'border-rose-400/30 bg-rose-500/10'} p-4"
>
	{#if track.cover}
		<img src={track.cover} alt="" class="h-16 w-16 shrink-0 rounded-lg object-cover" />
	{/if}
	<div class="min-w-0 flex-1">
		<p class="text-xs font-medium uppercase tracking-wide {won ? 'text-emerald-300' : 'text-rose-300'}">
			{won ? `Solved in ${guessCount}/${maxGuesses}` : 'Out of guesses'}
		</p>
		<p class="truncate text-lg font-semibold text-white">{track.title}</p>
		<p class="truncate text-sm text-white/60">{track.artist}</p>
	</div>
</div>
