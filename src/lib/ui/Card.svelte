<script>
	import { onDestroy } from 'svelte'
	import Icon from '@iconify/svelte'
	import { get, set } from 'idb-keyval'

	export let id = null
	export let title = null
	export let minimal = false

	/** @param {string | null} pill */
	export let icon = 'mdi:home'

	/** @param {string | null} pill */
	export let pill = null

	let hidden = false

	$: if (title)
		get(title).then((res) => {
			if (res !== undefined) {
				hidden = res
			}
		})

	onDestroy(() => {
		if (title) {
			set(title, hidden)
		}
	})
</script>

<!-- <div class="Card" {id} transition:slide|local={{ duration: 200 }}></div> -->
<div class="Card" {id} class:minimal>
	{#if title}
		<button
			class="header-button"
			on:click={() => {
				hidden = !hidden
			}}
		>
			<header>
				<div
					style="display: flex;
				align-items: center;
				gap: 0.5rem;"
				>
					{#if title}<span>{title}</span>{/if}
					{#if icon}<Icon {icon} />{/if}
					{#if pill}
						<span class="pill">{pill}</span>
					{/if}
				</div>
				{#if hidden}
					<Icon icon="ph:caret-down-bold" />
				{:else}
					<Icon icon="ph:caret-up-bold" />
				{/if}
			</header>
		</button>
	{/if}
	{#if !hidden}
		<!-- <div class="card-body" transition:slide|local={{ duration: 100 }}> -->
		<div class="card-body">
			<slot name="body" />
			<slot />
		</div>
	{/if}
	<slot name="footer" class="card-footer" />
</div>

<style lang="postcss">
	.Card {
		background: var(--color-gray-9);
		display: grid;
	}
	.Card.minimal .card-body {
		margin: 0 auto;
	}
	button {
		width: 100%;
		padding: 1rem;

		& + .card-body {
			border-top: var(--input-border);
			padding-top: 2rem;
		}
	}

	header {
		width: 100%;
		font-size: var(--label-font-size);
		font-weight: var(--label-font-weight);
		display: flex;
		justify-content: space-between;
		font-size: 0.875rem;
		font-weight: 500;

		.pill {
			background: #b6b6b6;
			border-radius: 100px;
			padding: 3px 7px;
			font-size: 12px;
			font-weight: 500;
			color: #121212;
			margin-left: 0.5rem;
		}
	}
	.card-body {
		border-top: 1px solid transparent;
		transition: 0.2s border-color;
		margin: 1.5rem;

		&:not(:only-child) {
			margin-top: 0;
		}
	}
	.card-footer {
		padding: 0 1rem 0.5rem 1rem;
		display: flex;
		justify-content: flex-end;
	}
</style>
