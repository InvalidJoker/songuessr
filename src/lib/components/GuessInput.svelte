<script lang="ts">
	import type { SearchResult } from '$lib/types';

	let {
		disabled = false,
		onguess,
		onskip
	}: {
		disabled?: boolean;
		onguess: (trackId: number, label: string) => void;
		onskip: () => void;
	} = $props();

	let query = $state('');
	let results = $state<SearchResult[]>([]);
	let open = $state(false);
	let activeIndex = $state(-1);
	let debounceHandle: ReturnType<typeof setTimeout> | undefined;

	function onInput() {
		open = true;
		activeIndex = -1;
		clearTimeout(debounceHandle);
		const q = query;
		debounceHandle = setTimeout(async () => {
			if (q.trim().length < 2) {
				results = [];
				return;
			}
			const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
			if (!res.ok) return;
			results = (await res.json()) as SearchResult[];
		}, 250);
	}

	function pick(r: SearchResult) {
		onguess(r.id, `${r.title} — ${r.artist}`);
		query = '';
		results = [];
		open = false;
		activeIndex = -1;
	}

	function onKeydown(e: KeyboardEvent) {
		if (!open || results.length === 0) return;
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			activeIndex = (activeIndex + 1) % results.length;
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			activeIndex = (activeIndex - 1 + results.length) % results.length;
		} else if (e.key === 'Enter') {
			if (activeIndex >= 0) {
				e.preventDefault();
				pick(results[activeIndex]);
			}
		} else if (e.key === 'Escape') {
			open = false;
		}
	}
</script>

<div class="relative w-full">
	<div class="flex gap-2">
		<div class="relative flex-1">
			<input
				type="text"
				bind:value={query}
				oninput={onInput}
				onkeydown={onKeydown}
				onfocus={() => (open = true)}
				{disabled}
				placeholder="Guess the song title or artist…"
				class="w-full rounded-xl border border-neutral-200 bg-transparent px-4 py-3 text-neutral-900 placeholder-neutral-400 outline-none focus:border-emerald-400 disabled:opacity-40 dark:border-white/10 dark:text-neutral-100 dark:placeholder-neutral-500"
				autocomplete="off"
			/>
			{#if open && results.length > 0}
				<ul
					class="absolute z-10 mt-1 max-h-72 w-full overflow-auto rounded-xl border border-neutral-200 bg-white shadow-lg dark:border-white/10 dark:bg-neutral-900"
				>
					{#each results as r, i (r.id)}
						<li>
							<button
								type="button"
								onclick={() => pick(r)}
								class="flex w-full cursor-pointer items-center gap-3 px-3 py-2 text-left hover:bg-neutral-50 dark:hover:bg-white/5 {i ===
								activeIndex
									? 'bg-emerald-50 dark:bg-emerald-400/10'
									: ''}"
							>
								{#if r.cover}
									<img src={r.cover} alt="" class="h-9 w-9 shrink-0 rounded" />
								{/if}
								<span class="min-w-0">
									<span class="block truncate text-sm text-neutral-900 dark:text-neutral-100"
										>{r.title}</span
									>
									<span class="block truncate text-xs text-neutral-400 dark:text-neutral-500"
										>{r.artist}</span
									>
								</span>
							</button>
						</li>
					{/each}
				</ul>
			{/if}
		</div>
		<button
			type="button"
			onclick={onskip}
			{disabled}
			class="shrink-0 cursor-pointer rounded-xl border border-neutral-200 px-4 py-3 text-sm font-medium text-neutral-600 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:text-neutral-300 dark:hover:bg-white/5"
		>
			Skip
		</button>
	</div>
</div>
