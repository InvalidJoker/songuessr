<script lang="ts">
	import { page } from '$app/state';

	const links = [
		{ href: '/daily', label: 'Daily' },
		{ href: '/hits', label: 'Hits' }
	];
</script>

<header class="border-b border-white/10">
	<div class="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
		<a href="/" class="flex items-center gap-2 text-lg font-bold tracking-tight text-white">
			<span
				class="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 text-black"
			>
				♪
			</span>
			Songless
		</a>
		<nav class="flex gap-1 rounded-lg border border-white/10 bg-white/5 p-1">
			{#each links as link (link.href)}
				<a
					href={link.href}
					class="rounded-md px-3 py-1.5 text-sm font-medium transition {page.url.pathname.startsWith(
						link.href
					)
						? 'bg-emerald-500 text-black'
						: 'text-white/70 hover:bg-white/10'}"
				>
					{link.label}
				</a>
			{/each}
		</nav>
	</div>
</header>
