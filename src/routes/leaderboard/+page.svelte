<script lang="ts">
	import type { PageServerData } from './$types';

	let { data }: { data: PageServerData } = $props();
</script>

<svelte:head>
	<title>Leaderboard — Songuessr</title>
</svelte:head>

<div class="flex flex-col gap-8">
	<div>
		<h1 class="text-2xl font-bold">Leaderboard</h1>
		<p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
			Top streaks across all players. Sign in to appear here.
		</p>
	</div>

	{#each [{ title: 'Hits — best streak', rows: data.hits }, { title: 'Daily — best streak', rows: data.daily }] as board (board.title)}
		<section class="flex flex-col gap-3">
			<h2 class="text-sm font-medium text-neutral-500 dark:text-neutral-400">{board.title}</h2>
			{#if board.rows.length === 0}
				<p class="text-sm text-neutral-400 dark:text-neutral-600">No results yet — be the first.</p>
			{:else}
				<ol class="flex flex-col gap-1.5">
					{#each board.rows as row, i (row.userId)}
						<li
							class="flex items-center gap-3 rounded-lg border border-neutral-200 px-3 py-2 text-sm dark:border-white/10"
						>
							<span class="w-5 shrink-0 text-neutral-400 dark:text-neutral-600">{i + 1}</span>
							<span class="flex-1 truncate">{row.name}</span>
							<span class="font-semibold tabular-nums">{row.value}</span>
						</li>
					{/each}
				</ol>
			{/if}
		</section>
	{/each}
</div>
