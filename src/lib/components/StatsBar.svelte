<script lang="ts">
	let { items }: { items: { label: string; value: string | number }[] } = $props();
</script>

<div class="flex divide-x divide-white/10 rounded-xl border border-white/10 bg-white/[0.03]">
	{#each items as item (item.label)}
		<div class="flex-1 px-3 py-2.5 text-center">
			<p class="text-lg font-semibold text-white tabular-nums">{item.value}</p>
			<p class="text-[11px] uppercase tracking-wide text-white/40">{item.label}</p>
		</div>
	{/each}
</div>
