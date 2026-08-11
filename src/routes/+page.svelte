<script lang="ts">
	const modes = [
		{
			href: '/daily',
			title: 'Daily',
			tagline: 'One song, once a day — everyone gets the same one.',
			hover: 'hover:border-emerald-300 dark:hover:border-emerald-400/50'
		},
		{
			href: '/hits',
			title: 'Hits',
			tagline: 'Unlimited rounds. Keep your streak alive.',
			hover: 'hover:border-sky-300 dark:hover:border-sky-400/50'
		}
	];
</script>

<svelte:head>
	<title>Songless — guess the song</title>
</svelte:head>

<section class="flex flex-col items-center gap-3 py-10 text-center">
	<span
		class="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-400 text-3xl text-neutral-900"
	>
		♪
	</span>
	<h1 class="text-3xl font-bold tracking-tight">Songless</h1>
	<p class="max-w-sm text-neutral-500 dark:text-neutral-400">
		Listen to a short snippet and guess the song before you run out of tries. Each wrong guess
		unlocks a little more of the track.
	</p>
</section>

<section class="grid gap-3 sm:grid-cols-2">
	{#each modes as mode (mode.href)}
		<a
			href={mode.href}
			class="group cursor-pointer rounded-2xl border border-neutral-200 p-6 transition dark:border-white/10 {mode.hover}"
		>
			<h2 class="text-xl font-semibold">{mode.title}</h2>
			<p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{mode.tagline}</p>
			<span
				class="mt-4 inline-flex items-center gap-1 text-sm font-medium text-neutral-900 dark:text-neutral-100"
			>
				Play {mode.title}
				<svg viewBox="0 0 24 24" class="h-4 w-4 transition group-hover:translate-x-0.5" fill="currentColor">
					<path d="M9 5l7 7-7 7-1.4-1.4L13.2 12 7.6 6.4z" />
				</svg>
			</span>
		</a>
	{/each}
</section>

<section class="mt-10 text-sm text-neutral-500 dark:text-neutral-400">
	<p class="mb-2 font-medium text-neutral-700 dark:text-neutral-300">How it works</p>
	<ul class="list-disc space-y-1 pl-4">
		<li>Press play to hear 1 second of the song.</li>
		<li>Guess, or skip to unlock a longer snippet.</li>
		<li>You get 6 tries — snippets grow to 16 seconds.</li>
	</ul>
</section>
