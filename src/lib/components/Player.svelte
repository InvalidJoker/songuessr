<script lang="ts">
	import { readJSON, writeJSON } from '$lib/state/storage';

	let {
		preview,
		durations,
		guessesUsed,
		finished = false,
		fullDuration = 30
	}: {
		preview: string;
		durations: number[];
		guessesUsed: number;
		finished?: boolean;
		fullDuration?: number;
	} = $props();

	let audio: HTMLAudioElement;
	let playing = $state(false);
	let currentTime = $state(0);
	let volume = $state(readJSON('songuessr:volume', 0.8));
	let muted = $state(false);

	$effect(() => {
		if (audio) audio.volume = muted ? 0 : volume;
	});

	const maxDuration = $derived(durations[durations.length - 1] ?? 16);
	const allowedDuration = $derived(
		finished ? fullDuration : (durations[Math.min(guessesUsed, durations.length - 1)] ?? maxDuration)
	);
	const timelineMax = $derived(finished ? fullDuration : maxDuration);

	function togglePlay() {
		if (!audio) return;
		if (playing) {
			audio.pause();
			return;
		}
		if (currentTime >= allowedDuration) {
			audio.currentTime = 0;
		}
		audio.play();
	}

	function handleTimeUpdate() {
		currentTime = audio.currentTime;
		if (!finished && currentTime >= allowedDuration) {
			audio.pause();
			audio.currentTime = allowedDuration;
			currentTime = allowedDuration;
		}
	}

	function handlePlay() {
		playing = true;
	}
	function handlePause() {
		playing = false;
	}

	function onVolumeInput(e: Event) {
		volume = Number((e.currentTarget as HTMLInputElement).value);
		muted = false;
		writeJSON('songuessr:volume', volume);
	}

	function toggleMute() {
		muted = !muted;
	}

	function seekFromClick(e: MouseEvent) {
		if (!audio) return;
		const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
		const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
		const target = ratio * timelineMax;
		if (target > allowedDuration) return;
		audio.currentTime = target;
		currentTime = target;
	}
</script>

<div class="w-full">
	<audio
		bind:this={audio}
		src={preview}
		ontimeupdate={handleTimeUpdate}
		onplay={handlePlay}
		onpause={handlePause}
		onended={handlePause}
		preload="auto"
	></audio>

	<div class="mb-2 flex items-center justify-between">
		<span class="text-sm tabular-nums text-neutral-400 dark:text-neutral-500">
			{allowedDuration}s
		</span>
		<div class="flex items-center gap-2">
			<button
				type="button"
				onclick={toggleMute}
				class="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700 dark:text-neutral-500 dark:hover:bg-white/5 dark:hover:text-neutral-200"
				aria-label={muted || volume === 0 ? 'Unmute' : 'Mute'}
			>
				{#if muted || volume === 0}
					<svg viewBox="0 0 24 24" class="h-4 w-4" fill="currentColor">
						<path d="M4 9v6h4l5 5V4L8 9H4z" />
						<path
							d="M18.7 12l2.6-2.6-1.4-1.4L17.3 10.6 14.7 8l-1.4 1.4L15.9 12l-2.6 2.6 1.4 1.4 2.6-2.6 2.6 2.6 1.4-1.4z"
						/>
					</svg>
				{:else}
					<svg viewBox="0 0 24 24" class="h-4 w-4" fill="currentColor">
						<path d="M4 9v6h4l5 5V4L8 9H4z" />
						<path d="M16.5 12a4.5 4.5 0 0 0-2.5-4.03v8.06A4.5 4.5 0 0 0 16.5 12z" />
						<path
							d="M14 3.23v2.06c3.39.86 6 4.03 6 7.71s-2.61 6.85-6 7.71v2.06c4.5-.9 8-4.94 8-9.77s-3.5-8.87-8-9.77z"
						/>
					</svg>
				{/if}
			</button>
			<input
				type="range"
				min="0"
				max="1"
				step="0.01"
				value={muted ? 0 : volume}
				oninput={onVolumeInput}
				class="h-1.5 w-16 cursor-pointer accent-emerald-400"
				aria-label="Volume"
			/>
		</div>
	</div>

	<div class="relative h-2 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-white/10">
		<div
			class="h-full rounded-full bg-neutral-200 dark:bg-white/20"
			style:width="{(allowedDuration / timelineMax) * 100}%"
		></div>
		<div
			class="absolute top-0 h-full rounded-full bg-emerald-400"
			style:width="{(currentTime / timelineMax) * 100}%"
		></div>
		{#each durations as d (d)}
			<div
				class="absolute top-0 h-full w-px bg-white dark:bg-neutral-950"
				style:left="{(d / timelineMax) * 100}%"
			></div>
		{/each}
		<button
			type="button"
			class="absolute inset-0 h-full w-full cursor-pointer"
			aria-label="Seek"
			onclick={seekFromClick}
		></button>
	</div>

	<div class="mt-6 flex justify-center">
		<button
			type="button"
			onclick={togglePlay}
			disabled={!preview}
			class="flex h-16 w-16 shrink-0 cursor-pointer items-center justify-center rounded-full bg-emerald-400 text-neutral-900 transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40"
			aria-label={playing ? 'Pause' : 'Play'}
		>
			{#if playing}
				<svg viewBox="0 0 24 24" class="h-7 w-7" fill="currentColor">
					<rect x="6" y="5" width="4" height="14" rx="1" />
					<rect x="14" y="5" width="4" height="14" rx="1" />
				</svg>
			{:else}
				<svg viewBox="0 0 24 24" class="h-7 w-7 translate-x-0.5" fill="currentColor">
					<path d="M8 5v14l11-7z" />
				</svg>
			{/if}
		</button>
	</div>
</div>
