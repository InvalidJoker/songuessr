<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { ChallengeGame } from '$lib/state/challenge-game.svelte';
	import Player from '$lib/components/Player.svelte';
	import GuessInput from '$lib/components/GuessInput.svelte';
	import GuessTimeline from '$lib/components/GuessTimeline.svelte';
	import RevealCard from '$lib/components/RevealCard.svelte';
	import type { PageServerData } from './$types';

	let { data }: { data: PageServerData } = $props();

	const game = new ChallengeGame(data.challenge.id, data.challenge.trackIds.length);
	onMount(() => {
		game.start();
	});

	$effect(() => {
		if (game.finished) goto(`/challenge/${data.challenge.id}`);
	});
</script>

<svelte:head>
	<title>Challenge — Songuessr</title>
</svelte:head>

<div class="flex flex-col gap-6">
	<div class="flex items-center justify-between">
		<h1 class="text-xl font-bold">{data.challenge.playlistName}</h1>
		<p class="text-sm text-neutral-400 dark:text-neutral-500">
			Song {game.roundIndex + 1} / {game.roundCount}
		</p>
	</div>

	{#if game.loading}
		<div class="flex h-40 items-center justify-center text-neutral-400 dark:text-neutral-500">Loading…</div>
	{:else if game.error}
		<div class="rounded-xl border border-rose-300 p-4 text-rose-600 dark:border-rose-400/30 dark:text-rose-400">
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
				onclick={() => game.nextRoundOrFinish()}
				class="cursor-pointer rounded-xl bg-sky-400 px-5 py-3 text-sm font-semibold text-neutral-900 transition hover:bg-sky-500"
			>
				{game.roundIndex + 1 >= game.roundCount ? 'See results →' : 'Next song →'}
			</button>
		{/if}
	{/if}
</div>
