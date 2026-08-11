<script lang="ts">
	const modes = [
		{
			href: '/daily',
			title: 'Daily',
			tagline: 'One song, once a day — everyone gets the same one.',
			accent: 'from-emerald-500/20 to-emerald-500/0',
			ring: 'group-hover:border-emerald-400/60'
		},
		{
			href: '/hits',
			title: 'Hits',
			tagline: 'Unlimited rounds. Keep your streak alive.',
			accent: 'from-sky-500/20 to-sky-500/0',
			ring: 'group-hover:border-sky-400/60'
		}
	];
</script>

<svelte:head>
	<title>Songless — guess the song</title>
</svelte:head>

<section class="flex flex-col items-center gap-3 py-10 text-center">
	<span
		class="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500 text-3xl text-black"
	>
		♪
	</span>
	<h1 class="text-3xl font-bold tracking-tight">Songless</h1>
	<p class="max-w-sm text-white/60">
		Listen to a short snippet and guess the song before you run out of tries. Each wrong guess
		unlocks a little more of the track.
	</p>
</section>

<section class="grid gap-4 sm:grid-cols-2">
	{#each modes as mode (mode.href)}
		<a
			href={mode.href}
			class="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition {mode.ring}"
		>
			<div class="absolute inset-0 bg-gradient-to-br {mode.accent}"></div>
			<div class="relative">
				<h2 class="text-xl font-semibold">{mode.title}</h2>
				<p class="mt-1 text-sm text-white/60">{mode.tagline}</p>
				<span
					class="mt-4 inline-flex items-center gap-1 text-sm font-medium text-white/80 group-hover:text-white"
				>
					Play {mode.title}
					<svg viewBox="0 0 24 24" class="h-4 w-4" fill="currentColor">
						<path d="M9 5l7 7-7 7-1.4-1.4L13.2 12 7.6 6.4z" />
					</svg>
				</span>
			</div>
		</a>
	{/each}
</section>

<section class="mt-10 rounded-xl border border-white/10 bg-white/[0.02] p-5 text-sm text-white/50">
	<p class="mb-2 font-medium text-white/70">How it works</p>
	<ul class="list-disc space-y-1 pl-4">
		<li>Press play to hear 1 second of the song.</li>
		<li>Guess, or skip to unlock a longer snippet.</li>
		<li>You get 6 tries — snippets grow to 16 seconds.</li>
	</ul>
</section>
