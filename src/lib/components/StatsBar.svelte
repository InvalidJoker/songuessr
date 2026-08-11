<script lang="ts">
	let { items }: { items: { label: string; value: string | number }[] } = $props();
</script>

<div
	class="flex divide-x divide-neutral-200 rounded-xl border border-neutral-200 dark:divide-white/10 dark:border-white/10"
>
	{#each items as item (item.label)}
		<div class="flex-1 px-3 py-2.5 text-center">
			<p class="text-lg font-semibold tabular-nums text-neutral-900 dark:text-neutral-100">
				{item.value}
			</p>
			<p class="text-[11px] uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
				{item.label}
			</p>
		</div>
	{/each}
</div>
