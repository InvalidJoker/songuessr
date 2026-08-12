<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageServerData } from './$types';

	let { data }: { data: PageServerData } = $props();

	const winPct = $derived(
		data.stats.dailyPlayed > 0 ? Math.round((data.stats.dailyWon / data.stats.dailyPlayed) * 100) : 0
	);
	const accuracy = $derived(
		data.stats.hitsPlayed > 0 ? Math.round((data.stats.hitsCorrect / data.stats.hitsPlayed) * 100) : 0
	);
</script>

<svelte:head>
	<title>Profile — Songuessr</title>
</svelte:head>

<div class="flex flex-col gap-8">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold">{data.user.name}</h1>
			<p class="text-sm text-neutral-500 dark:text-neutral-400">{data.user.email}</p>
		</div>
		<form method="post" action="?/signOut" use:enhance>
			<button
				type="submit"
				class="cursor-pointer rounded-xl border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-600 transition hover:bg-neutral-100 dark:border-white/10 dark:text-neutral-300 dark:hover:bg-white/5"
			>
				Sign out
			</button>
		</form>
	</div>

	<section class="flex flex-col gap-3">
		<h2 class="text-sm font-medium text-neutral-500 dark:text-neutral-400">Daily</h2>
		<div
			class="flex divide-x divide-neutral-200 rounded-xl border border-neutral-200 dark:divide-white/10 dark:border-white/10"
		>
			{#each [{ label: 'Played', value: data.stats.dailyPlayed }, { label: 'Win %', value: `${winPct}%` }, { label: 'Streak', value: data.stats.dailyStreak }, { label: 'Best', value: data.stats.dailyMaxStreak }] as item (item.label)}
				<div class="flex-1 px-3 py-2.5 text-center">
					<p class="text-lg font-semibold tabular-nums">{item.value}</p>
					<p class="text-[11px] uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
						{item.label}
					</p>
				</div>
			{/each}
		</div>
	</section>

	<section class="flex flex-col gap-3">
		<h2 class="text-sm font-medium text-neutral-500 dark:text-neutral-400">Hits</h2>
		<div
			class="flex divide-x divide-neutral-200 rounded-xl border border-neutral-200 dark:divide-white/10 dark:border-white/10"
		>
			{#each [{ label: 'Played', value: data.stats.hitsPlayed }, { label: 'Accuracy', value: `${accuracy}%` }, { label: 'Streak', value: data.stats.hitsStreak }, { label: 'Best', value: data.stats.hitsBestStreak }] as item (item.label)}
				<div class="flex-1 px-3 py-2.5 text-center">
					<p class="text-lg font-semibold tabular-nums">{item.value}</p>
					<p class="text-[11px] uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
						{item.label}
					</p>
				</div>
			{/each}
		</div>
	</section>

	<a
		href="/leaderboard"
		class="cursor-pointer text-center text-sm font-medium text-emerald-600 hover:underline dark:text-emerald-400"
	>
		View leaderboard →
	</a>
</div>
