<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import NavBar from '$lib/components/NavBar.svelte';

	let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<div class="min-h-screen bg-neutral-950 text-white">
	<NavBar />
	<main class="mx-auto max-w-2xl px-4 py-8">
		{@render children()}
	</main>
</div>
