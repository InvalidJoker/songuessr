<script lang="ts">
	import { onMount } from 'svelte';
	import { DailyGame } from '$lib/state/daily.svelte';
	import Player from '$lib/components/Player.svelte';
	import GuessInput from '$lib/components/GuessInput.svelte';
	import GuessTimeline from '$lib/components/GuessTimeline.svelte';
	import RevealCard from '$lib/components/RevealCard.svelte';
	import ShareButton from '$lib/components/ShareButton.svelte';
	import StatsBar from '$lib/components/StatsBar.svelte';
	import { buildShareText } from '$lib/game/share';

	const game = new DailyGame();
	onMount(() => {
		game.init();
	});

	const shareText = $derived(
		buildShareText({
			dayNumber: game.dayNumber,
			guesses: game.guesses,
			won: game.status === 'won'
		})
	);

	const winPct = $derived(
		game.stats.played > 0 ? Math.round((game.stats.won / game.stats.played) * 100) : 0
	);
</script>

<svelte:head>
	<title>Daily — Songuessr</title>
</svelte:head>

<div class="flex flex-col gap-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-xl font-bold">Daily</h1>
			<p class="text-sm text-neutral-400 dark:text-neutral-500">
				{game.dayNumber ? `Song #${game.dayNumber}` : 'Loading today’s song…'}
			</p>
		</div>
	</div>

	{#if game.loading}
		<div class="flex h-40 items-center justify-center text-neutral-400 dark:text-neutral-500">
			Loading…
		</div>
	{:else if game.error}
		<div
			class="rounded-xl border border-rose-300 p-4 text-rose-600 dark:border-rose-400/30 dark:text-rose-400"
		>
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
			<div class="flex items-center justify-between">
				<ShareButton text={shareText} />
				<p class="text-sm text-neutral-400 dark:text-neutral-500">
					Come back tomorrow for a new song.
				</p>
			</div>
		{/if}
	{/if}

	<StatsBar
		items={[
			{ label: 'Played', value: game.stats.played },
			{ label: 'Win %', value: `${winPct}%` },
			{ label: 'Streak', value: game.stats.streak },
			{ label: 'Best', value: game.stats.maxStreak }
		]}
	/>
</div>
