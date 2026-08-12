<script lang="ts">
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let url = $state('');
	let submitting = $state(false);
	let error = $state('');

	const sourceLabel: Record<string, string> = {
		spotify_playlist: 'Spotify playlist',
		spotify_artist: 'Spotify artist',
		youtube_playlist: 'YouTube playlist',
		manual: 'Custom'
	};

	async function createPlaylist(e: Event) {
		e.preventDefault();
		if (!url.trim()) return;
		submitting = true;
		error = '';
		try {
			const res = await fetch('/api/playlists', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ url })
			});
			const body = await res.json();
			if (!res.ok) throw new Error(body.message ?? 'Failed to import');
			await goto(`/playlists/${body.id}`);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Something went wrong';
		} finally {
			submitting = false;
		}
	}
</script>

<svelte:head>
	<title>Playlists — Songless</title>
</svelte:head>

<div class="flex flex-col gap-8">
	<div>
		<h1 class="text-2xl font-bold">Playlists</h1>
		<p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
			Import a Spotify playlist, a whole Spotify artist, or a YouTube playlist — then play it and
			compete with friends.
		</p>
	</div>

	{#if data.user}
		<form onsubmit={createPlaylist} class="flex flex-col gap-2 sm:flex-row">
			<input
				type="url"
				bind:value={url}
				placeholder="Paste a Spotify or YouTube playlist/artist link…"
				required
				class="flex-1 rounded-xl border border-neutral-200 bg-transparent px-4 py-2.5 outline-none focus:border-emerald-400 dark:border-white/10"
			/>
			<button
				type="submit"
				disabled={submitting}
				class="cursor-pointer rounded-xl bg-emerald-400 px-5 py-2.5 text-sm font-semibold text-neutral-900 transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
			>
				{submitting ? 'Importing…' : 'Import'}
			</button>
		</form>
		{#if error}
			<p class="-mt-4 text-sm text-rose-500 dark:text-rose-400">{error}</p>
		{/if}
	{:else}
		<p class="rounded-xl border border-neutral-200 p-4 text-sm text-neutral-500 dark:border-white/10 dark:text-neutral-400">
			<a href="/login" class="cursor-pointer font-medium text-emerald-600 hover:underline dark:text-emerald-400">Sign in</a>
			to import your own playlists.
		</p>
	{/if}

	<div class="grid gap-3 sm:grid-cols-2">
		{#each data.playlists as p (p.id)}
			<a
				href="/playlists/{p.id}"
				class="flex cursor-pointer items-center gap-3 rounded-2xl border border-neutral-200 p-4 transition hover:border-emerald-300 dark:border-white/10 dark:hover:border-emerald-400/50"
			>
				{#if p.cover}
					<img src={p.cover} alt="" class="h-14 w-14 shrink-0 rounded-lg object-cover" />
				{:else}
					<div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-lg dark:bg-white/5">
						♪
					</div>
				{/if}
				<div class="min-w-0 flex-1">
					<p class="truncate font-semibold">{p.name}</p>
					<p class="truncate text-xs text-neutral-400 dark:text-neutral-500">
						{sourceLabel[p.sourceType] ?? p.sourceType} · by {p.ownerName}
						{#if p.importStatus === 'ready'}
							· {p.trackCount} songs
						{:else if p.importStatus === 'importing' || p.importStatus === 'pending'}
							· importing…
						{:else if p.importStatus === 'failed'}
							· import failed
						{/if}
					</p>
				</div>
			</a>
		{:else}
			<p class="text-sm text-neutral-400 dark:text-neutral-600">No playlists yet — import the first one.</p>
		{/each}
	</div>
</div>
