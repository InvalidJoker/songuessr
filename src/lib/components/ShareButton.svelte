<script lang="ts">
	let { text }: { text: string } = $props();
	let copied = $state(false);

	async function share() {
		if (navigator.share) {
			try {
				await navigator.share({ text });
				return;
			} catch {
				// user cancelled or share failed — fall back to clipboard
			}
		}
		await navigator.clipboard.writeText(text);
		copied = true;
		setTimeout(() => (copied = false), 1800);
	}
</script>

<button
	type="button"
	onclick={share}
	class="rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-emerald-400"
>
	{copied ? 'Copied!' : 'Share result'}
</button>
