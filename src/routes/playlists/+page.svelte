<script lang="ts">
	import { goto } from '$app/navigation';
	import TrackPicker from '$lib/components/TrackPicker.svelte';
	import type { SearchResult } from '$lib/types';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let mode = $state<'import' | 'manual'>('import');

	// Import-by-link state
	let url = $state('');
	let importSubmitting = $state(false);
	let importError = $state('');

	// Manual-creation state
	let manualName = $state('');
	let manualTracks = $state<SearchResult[]>([]);
	let manualSubmitting = $state(false);
	let manualError = $state('');

	const sourceLabel: Record<string, string> = {
		spotify_playlist: 'Spotify playlist',
		spotify_artist: 'Spotify artist',
		youtube_playlist: 'YouTube playlist',
		manual: 'Custom'
	};

	async function createFromUrl(e: Event) {
		e.preventDefault();
		if (!url.trim()) return;
		importSubmitting = true;
		importError = '';
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
			importError = err instanceof Error ? err.message : 'Something went wrong';
		} finally {
			importSubmitting = false;
		}
	}

	function addManualTrack(track: SearchResult) {
		if (manualTracks.some((t) => t.id === track.id)) return;
		manualTracks = [...manualTracks, track];
	}

	function removeManualTrack(id: number) {
		manualTracks = manualTracks.filter((t) => t.id !== id);
	}

	async function createManual(e: Event) {
		e.preventDefault();
		if (!manualName.trim() || manualTracks.length === 0) return;
		manualSubmitting = true;
		manualError = '';
		try {
			const res = await fetch('/api/playlists/manual', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ name: manualName, trackIds: manualTracks.map((t) => t.id) })
			});
			const body = await res.json();
			if (!res.ok) throw new Error(body.message ?? 'Failed to create playlist');
			await goto(`/playlists/${body.id}`);
		} catch (err) {
			manualError = err instanceof Error ? err.message : 'Something went wrong';
		} finally {
			manualSubmitting = false;
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
			Import a Spotify playlist, a whole Spotify artist, or a YouTube playlist — or build one
			manually — then play it and compete with friends.
		</p>
	</div>

	{#if data.user}
		<div class="flex flex-col gap-4">
			<div class="flex rounded-lg border border-neutral-200 p-1 dark:border-white/10">
				<button
					type="button"
					onclick={() => (mode = 'import')}
					class="flex-1 cursor-pointer rounded-md py-1.5 text-sm font-medium transition {mode ===
					'import'
						? 'bg-emerald-400 text-neutral-900'
						: 'text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-white/5'}"
				>
					Import from link
				</button>
				<button
					type="button"
					onclick={() => (mode = 'manual')}
					class="flex-1 cursor-pointer rounded-md py-1.5 text-sm font-medium transition {mode ===
					'manual'
						? 'bg-emerald-400 text-neutral-900'
						: 'text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-white/5'}"
				>
					Create manually
				</button>
			</div>

			{#if mode === 'import'}
				<form onsubmit={createFromUrl} class="flex flex-col gap-2 sm:flex-row">
					<input
						type="url"
						bind:value={url}
						placeholder="Paste a Spotify or YouTube playlist/artist link…"
						required
						class="flex-1 rounded-xl border border-neutral-200 bg-transparent px-4 py-2.5 outline-none focus:border-emerald-400 dark:border-white/10"
					/>
					<button
						type="submit"
						disabled={importSubmitting}
						class="cursor-pointer rounded-xl bg-emerald-400 px-5 py-2.5 text-sm font-semibold text-neutral-900 transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
					>
						{importSubmitting ? 'Importing…' : 'Import'}
					</button>
				</form>
				{#if importError}
					<p class="text-sm text-rose-500 dark:text-rose-400">{importError}</p>
				{/if}
			{:else}
				<form onsubmit={createManual} class="flex flex-col gap-3">
					<input
						bind:value={manualName}
						placeholder="Playlist name…"
						required
						class="rounded-xl border border-neutral-200 bg-transparent px-4 py-2.5 outline-none focus:border-emerald-400 dark:border-white/10"
					/>
					<TrackPicker onpick={addManualTrack} />

					{#if manualTracks.length > 0}
						<ul class="flex flex-col gap-1.5">
							{#each manualTracks as t (t.id)}
								<li class="flex items-center gap-3 rounded-lg border border-neutral-200 px-3 py-2 text-sm dark:border-white/10">
									{#if t.cover}
										<img src={t.cover} alt="" class="h-8 w-8 shrink-0 rounded" />
									{/if}
									<span class="min-w-0 flex-1 truncate">{t.title} — {t.artist}</span>
									<button
										type="button"
										onclick={() => removeManualTrack(t.id)}
										aria-label="Remove"
										class="cursor-pointer text-neutral-400 hover:text-rose-500"
									>
										✕
									</button>
								</li>
							{/each}
						</ul>
					{/if}

					<button
						type="submit"
						disabled={manualSubmitting || manualTracks.length === 0}
						class="cursor-pointer self-start rounded-xl bg-emerald-400 px-5 py-2.5 text-sm font-semibold text-neutral-900 transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
					>
						{manualSubmitting ? 'Creating…' : `Create playlist (${manualTracks.length} songs)`}
					</button>
					{#if manualError}
						<p class="text-sm text-rose-500 dark:text-rose-400">{manualError}</p>
					{/if}
				</form>
			{/if}
		</div>
	{:else}
		<p class="rounded-xl border border-neutral-200 p-4 text-sm text-neutral-500 dark:border-white/10 dark:text-neutral-400">
			<a href="/login" class="cursor-pointer font-medium text-emerald-600 hover:underline dark:text-emerald-400">Sign in</a>
			to create your own playlists.
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
			<p class="text-sm text-neutral-400 dark:text-neutral-600">No playlists yet — import or create the first one.</p>
		{/each}
	</div>
</div>
