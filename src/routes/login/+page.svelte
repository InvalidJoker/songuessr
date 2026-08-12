<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
	let mode = $state<'signIn' | 'signUp'>('signIn');
	let submitting = $state(false);
</script>

<svelte:head>
	<title>Sign in — Songuessr</title>
</svelte:head>

<div class="mx-auto flex max-w-sm flex-col gap-6 py-6">
	<div class="text-center">
		<h1 class="text-2xl font-bold">{mode === 'signIn' ? 'Welcome back' : 'Create an account'}</h1>
		<p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
			{mode === 'signIn'
				? 'Sign in to track your stats and climb the leaderboard.'
				: 'Save your streaks and appear on the leaderboard.'}
		</p>
	</div>

	<div class="flex rounded-lg border border-neutral-200 p-1 dark:border-white/10">
		<button
			type="button"
			onclick={() => (mode = 'signIn')}
			class="flex-1 cursor-pointer rounded-md py-1.5 text-sm font-medium transition {mode ===
			'signIn'
				? 'bg-emerald-400 text-neutral-900'
				: 'text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-white/5'}"
		>
			Sign in
		</button>
		<button
			type="button"
			onclick={() => (mode = 'signUp')}
			class="flex-1 cursor-pointer rounded-md py-1.5 text-sm font-medium transition {mode ===
			'signUp'
				? 'bg-emerald-400 text-neutral-900'
				: 'text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-white/5'}"
		>
			Sign up
		</button>
	</div>

	<form
		method="post"
		action={mode === 'signIn' ? '?/signIn' : '?/signUp'}
		use:enhance={() => {
			submitting = true;
			return async ({ update }) => {
				await update();
				submitting = false;
			};
		}}
		class="flex flex-col gap-3"
	>
		{#if mode === 'signUp'}
			<label class="flex flex-col gap-1 text-sm">
				Name
				<input
					name="name"
					required
					class="rounded-xl border border-neutral-200 bg-transparent px-4 py-2.5 outline-none focus:border-emerald-400 dark:border-white/10"
				/>
			</label>
		{/if}
		<label class="flex flex-col gap-1 text-sm">
			Email
			<input
				type="email"
				name="email"
				required
				class="rounded-xl border border-neutral-200 bg-transparent px-4 py-2.5 outline-none focus:border-emerald-400 dark:border-white/10"
			/>
		</label>
		<label class="flex flex-col gap-1 text-sm">
			Password
			<input
				type="password"
				name="password"
				required
				minlength="8"
				class="rounded-xl border border-neutral-200 bg-transparent px-4 py-2.5 outline-none focus:border-emerald-400 dark:border-white/10"
			/>
		</label>

		{#if form?.message}
			<p class="text-sm text-rose-500 dark:text-rose-400">{form.message}</p>
		{/if}

		<button
			type="submit"
			disabled={submitting}
			class="mt-2 cursor-pointer rounded-xl bg-emerald-400 px-5 py-3 text-sm font-semibold text-neutral-900 transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
		>
			{submitting ? 'Please wait…' : mode === 'signIn' ? 'Sign in' : 'Create account'}
		</button>
	</form>
</div>
