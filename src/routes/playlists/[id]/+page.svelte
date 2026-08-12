<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import TrackPicker from '$lib/components/TrackPicker.svelte';
	import type { SearchResult } from '$lib/types';
	import type { PageServerData } from './$types';

	let { data }: { data: PageServerData } = $props();

	let creatingChallenge = $state(false);
	let addingTrack = $state(false);
	let pollHandle: ReturnType<typeof setInterval> | undefined;

	$effect(() => {
		if (data.playlist.importStatus === 'importing' || data.playlist.importStatus === 'pending') {
			pollHandle = setInterval(() => invalidateAll(), 2500);
			return () => clearInterval(pollHandle);
		}
	});

	async function challengeAFriend() {
		creatingChallenge = true;
		try {
			const res = await fetch(`/api/playlists/${data.playlist.id}/challenge`, { method: 'POST' });
			const body = await res.json();
			if (!res.ok) throw new Error(body.message ?? 'Failed to create challenge');
			await goto(`/challenge/${body.id}`);
		} catch {
			creatingChallenge = false;
		}
	}

	async function addTrack(track: SearchResult) {
		addingTrack = true;
		try {
			await fetch(`/api/playlists/${data.playlist.id}/tracks`, {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ trackId: track.id })
			});
			await invalidateAll();
		} finally {
			addingTrack = false;
		}
	}

	async function removeTrack(trackId: number) {
		await fetch(`/api/playlists/${data.playlist.id}/tracks/${trackId}`, { method: 'DELETE' });
		await invalidateAll();
	}
</script>

<svelte:head>
	<title>{data.playlist.name} — Songless</title>
</svelte:head>

<div class="flex flex-col gap-8">
	<div class="flex items-center gap-4">
		{#if data.playlist.cover}
			<img src={data.playlist.cover} alt="" class="h-20 w-20 shrink-0 rounded-xl object-cover" />
		{:else}
			<div class="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-2xl dark:bg-white/5">
				♪
			</div>
		{/if}
		<div class="min-w-0">
			<h1 class="truncate text-2xl font-bold">{data.playlist.name}</h1>
			<p class="text-sm text-neutral-500 dark:text-neutral-400">
				{#if data.playlist.importStatus === 'ready'}
					{data.playlist.trackCount} songs
					{#if data.playlist.unmatchedCount > 0}
						· {data.playlist.unmatchedCount} couldn't be matched
					{/if}
				{:else if data.playlist.importStatus === 'failed'}
					Import failed{data.playlist.importError ? `: ${data.playlist.importError}` : ''}
				{:else}
					Importing…
				{/if}
			</p>
		</div>
	</div>

	{#if data.playlist.importStatus === 'ready'}
		<div class="flex gap-3">
			<a
				href="/playlists/{data.playlist.id}/play"
				class="cursor-pointer rounded-xl bg-emerald-400 px-5 py-3 text-sm font-semibold text-neutral-900 transition hover:bg-emerald-500"
			>
				Play
			</a>
			<button
				type="button"
				onclick={challengeAFriend}
				disabled={creatingChallenge}
				class="cursor-pointer rounded-xl border border-neutral-200 px-5 py-3 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:text-neutral-200 dark:hover:bg-white/5"
			>
				{creatingChallenge ? 'Creating…' : 'Challenge a friend'}
			</button>
		</div>

		{#if data.isOwner && data.tracks}
			<section class="flex flex-col gap-3">
				<h2 class="text-sm font-medium text-neutral-500 dark:text-neutral-400">Manage songs</h2>
				<TrackPicker onpick={addTrack} disabled={addingTrack} />
				<ul class="flex flex-col gap-1.5">
					{#each data.tracks as t (t.id)}
						<li class="flex items-center gap-3 rounded-lg border border-neutral-200 px-3 py-2 text-sm dark:border-white/10">
							{#if t.cover}
								<img src={t.cover} alt="" class="h-8 w-8 shrink-0 rounded" />
							{/if}
							<span class="min-w-0 flex-1 truncate">{t.title} — {t.artist}</span>
							<button
								type="button"
								onclick={() => removeTrack(t.id)}
								aria-label="Remove"
								class="cursor-pointer text-neutral-400 hover:text-rose-500"
							>
								✕
							</button>
						</li>
					{/each}
				</ul>
			</section>
		{/if}

		<section class="flex flex-col gap-3">
			<h2 class="text-sm font-medium text-neutral-500 dark:text-neutral-400">Leaderboard — best streak</h2>
			{#if data.leaderboard.length === 0}
				<p class="text-sm text-neutral-400 dark:text-neutral-600">No results yet — be the first to play.</p>
			{:else}
				<ol class="flex flex-col gap-1.5">
					{#each data.leaderboard as row, i (row.userId)}
						<li class="flex items-center gap-3 rounded-lg border border-neutral-200 px-3 py-2 text-sm dark:border-white/10">
							<span class="w-5 shrink-0 text-neutral-400 dark:text-neutral-600">{i + 1}</span>
							<span class="flex-1 truncate">{row.name}</span>
							<span class="font-semibold tabular-nums">{row.value}</span>
						</li>
					{/each}
				</ol>
			{/if}
		</section>
	{:else if data.playlist.importStatus === 'failed'}
		<p class="text-sm text-neutral-400 dark:text-neutral-600">
			Try importing again with a different link.
		</p>
	{:else}
		<p class="text-sm text-neutral-400 dark:text-neutral-600">
			This can take a minute for bigger playlists or artists — this page updates automatically.
		</p>
	{/if}
</div>
