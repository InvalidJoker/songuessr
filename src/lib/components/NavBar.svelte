<script lang="ts">
	import { page } from '$app/state';
	import type { User } from 'better-auth';

	let { user = null }: { user?: User | null } = $props();

	const links = [
		{ href: '/daily', label: 'Daily' },
		{ href: '/hits', label: 'Hits' },
		{ href: '/playlists', label: 'Playlists' },
		{ href: '/leaderboard', label: 'Leaderboard' }
	];
</script>

<header class="border-b border-neutral-200 dark:border-white/10">
	<div class="mx-auto flex max-w-2xl items-center justify-between gap-4 px-4 py-4">
		<a
			href="/"
			class="flex shrink-0 cursor-pointer items-center gap-2 text-lg font-bold tracking-tight text-neutral-900 dark:text-neutral-100"
		>
			<span
				class="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-400 text-neutral-900"
			>
				♪
			</span>
			<span class="hidden sm:inline">Songless</span>
		</a>
		<div class="flex min-w-0 items-center gap-2">
			<nav class="flex gap-1 rounded-lg border border-neutral-200 p-1 dark:border-white/10">
				{#each links as link (link.href)}
					<a
						href={link.href}
						class="cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium transition {page.url.pathname.startsWith(
							link.href
						)
							? 'bg-emerald-400 text-neutral-900'
							: 'text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-white/5'}"
					>
						{link.label}
					</a>
				{/each}
			</nav>
			<a
				href={user ? '/profile' : '/login'}
				class="cursor-pointer rounded-lg border border-neutral-200 px-3 py-1.5 text-sm font-medium text-neutral-600 transition hover:bg-neutral-100 dark:border-white/10 dark:text-neutral-300 dark:hover:bg-white/5"
			>
				{user ? user.name : 'Sign in'}
			</a>
		</div>
	</div>
</header>
