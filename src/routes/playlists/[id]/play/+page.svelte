<script lang="ts">
	import { onMount } from 'svelte';
	import { PlaylistGame } from '$lib/state/playlist-game.svelte';
	import Player from '$lib/components/Player.svelte';
	import GuessInput from '$lib/components/GuessInput.svelte';
	import GuessTimeline from '$lib/components/GuessTimeline.svelte';
	import RevealCard from '$lib/components/RevealCard.svelte';
	import type { PageServerData } from './$types';

	let { data }: { data: PageServerData } = $props();

	const game = new PlaylistGame(data.playlist.id);
	onMount(() => {
		game.nextRound();
	});
</script>

<svelte:head>
	<title>{data.playlist.name} — Songuessr</title>
</svelte:head>

<div class="flex flex-col gap-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-xl font-bold">{data.playlist.name}</h1>
			<p class="text-sm text-neutral-400 dark:text-neutral-500">Unlimited rounds from this playlist.</p>
		</div>
		<a
			href="/playlists/{data.playlist.id}"
			class="cursor-pointer text-sm font-medium text-emerald-600 hover:underline dark:text-emerald-400"
		>
			Leaderboard
		</a>
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
				onclick={() => game.nextRound()}
				class="cursor-pointer rounded-xl bg-sky-400 px-5 py-3 text-sm font-semibold text-neutral-900 transition hover:bg-sky-500"
			>
				Next song →
			</button>
		{/if}
	{/if}
</div>
