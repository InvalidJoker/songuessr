<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const me = $derived(data.results.find((r) => r.userId === data.user?.id));
	const others = $derived(data.results.filter((r) => r.userId !== data.user?.id));

	function scoreLabel(r: { correct: number; totalGuesses: number }) {
		return `${r.correct}/${data.challenge.roundCount} correct · ${r.totalGuesses} guesses`;
	}
</script>

<svelte:head>
	<title>Challenge — {data.challenge.playlistName} — Songuessr</title>
</svelte:head>

<div class="mx-auto flex max-w-sm flex-col gap-6 py-6 text-center">
	{#if data.challenge.playlistCover}
		<img
			src={data.challenge.playlistCover}
			alt=""
			class="mx-auto h-20 w-20 rounded-xl object-cover"
		/>
	{/if}
	<div>
		<h1 class="text-2xl font-bold">{data.challenge.creatorName}'s challenge</h1>
		<p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
			{data.challenge.roundCount} songs from <strong>{data.challenge.playlistName}</strong>
		</p>
	</div>

	{#if !data.user}
		<p class="text-sm text-neutral-500 dark:text-neutral-400">
			<a href="/login" class="cursor-pointer font-medium text-emerald-600 hover:underline dark:text-emerald-400">Sign in</a>
			to play this challenge.
		</p>
	{:else if me?.completedAt}
		<div class="rounded-xl border border-emerald-300 p-4 dark:border-emerald-400/30">
			<p class="text-sm font-medium text-emerald-600 dark:text-emerald-400">You're done!</p>
			<p class="mt-1 text-lg font-semibold">{scoreLabel(me)}</p>
		</div>
	{:else}
		<a
			href="/challenge/{data.challenge.id}/play"
			class="cursor-pointer rounded-xl bg-emerald-400 px-5 py-3 text-sm font-semibold text-neutral-900 transition hover:bg-emerald-500"
		>
			Play challenge
		</a>
	{/if}

	{#if others.length > 0}
		<section class="flex flex-col gap-2 text-left">
			<h2 class="text-sm font-medium text-neutral-500 dark:text-neutral-400">Results</h2>
			{#each others as r (r.userId)}
				<div class="rounded-lg border border-neutral-200 px-3 py-2 text-sm dark:border-white/10">
					<span class="font-medium">{r.name}</span>
					{#if r.completedAt}
						<span class="text-neutral-500 dark:text-neutral-400"> — {scoreLabel(r)}</span>
					{:else}
						<span class="text-neutral-400 dark:text-neutral-600"> — still playing…</span>
					{/if}
				</div>
			{/each}
		</section>
	{/if}
</div>
