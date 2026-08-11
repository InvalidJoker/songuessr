<script lang="ts">
	import { onMount } from 'svelte';
	import { HitsGame } from '$lib/state/hits.svelte';
	import Player from '$lib/components/Player.svelte';
	import GuessInput from '$lib/components/GuessInput.svelte';
	import GuessTimeline from '$lib/components/GuessTimeline.svelte';
	import RevealCard from '$lib/components/RevealCard.svelte';
	import StatsBar from '$lib/components/StatsBar.svelte';

	const game = new HitsGame();
	onMount(() => {
		game.nextRound();
	});

	const accuracy = $derived(
		game.stats.played > 0 ? Math.round((game.stats.correct / game.stats.played) * 100) : 0
	);
</script>

<svelte:head>
	<title>Hits — Songless</title>
</svelte:head>

<div class="flex flex-col gap-6">
	<div>
		<h1 class="text-xl font-bold">Hits</h1>
		<p class="text-sm text-white/50">Unlimited rounds — keep the streak going.</p>
	</div>

	{#if game.loading}
		<div class="flex h-40 items-center justify-center text-white/40">Loading…</div>
	{:else if game.error}
		<div class="rounded-xl border border-rose-400/30 bg-rose-500/10 p-4 text-rose-200">
			{game.error}
		</div>
	{:else}
		<Player
			preview={game.preview}
			durations={game.durations}
			guessesUsed={game.guesses.length}
			finished={game.status !== 'playing'}
			fullDuration={30}
		/>

		{#if game.status === 'playing'}
			<GuessInput
				onguess={(id, label) => game.submitGuess(id, false, label)}
				onskip={() => game.skip()}
			/>
		{/if}

		<GuessTimeline guesses={game.guesses} maxGuesses={game.maxGuesses} />

		{#if game.status !== 'playing' && game.revealedTrack}
			<RevealCard
				track={game.revealedTrack}
				won={game.status === 'won'}
				guessCount={game.guesses.length}
				maxGuesses={game.maxGuesses}
			/>
			<button
				type="button"
				onclick={() => game.nextRound()}
				class="rounded-xl bg-sky-500 px-5 py-3 text-sm font-semibold text-black transition hover:bg-sky-400"
			>
				Next song →
			</button>
		{/if}
	{/if}

	<StatsBar
		items={[
			{ label: 'Played', value: game.stats.played },
			{ label: 'Accuracy', value: `${accuracy}%` },
			{ label: 'Streak', value: game.stats.streak },
			{ label: 'Best', value: game.stats.bestStreak }
		]}
	/>
</div>
