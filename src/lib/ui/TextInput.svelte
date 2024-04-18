<script>
	import Icon from '@iconify/svelte'
	import { createEventDispatcher } from 'svelte'
	const dispatch = createEventDispatcher()

	/** @type {string | null} */
	export let id = null

	/** @type {string | null} */
	export let label = null

	/** @type {string} */
	export let prefix = ''
	export let prefix_icon = ''
	export let value
	export let placeholder = ''
	export let variants = ''
	export let type = 'text'
	export let autofocus = false
	export let selection = ''

	export let options = []

	/** @type {{ label: string, onclick?: function, type?: string, disabled?: boolean } | null} */
	export let button = null

	// Note: Svelte seems to have some issues with two-way binding, so if this is acting up it's probably that
</script>

<!-- svelte-ignore a11y-label-has-associated-control -->
<label class="TextInput {variants}" {id}>
	{#if label}<span class="label">{label}</span>{/if}
	<div style="display: flex;width: 100%;gap: 0.5rem;">
		{#if options.length > 0}
			<select class="options" on:change={(e) => dispatch('select', { value: e?.target?.value })} bind:value={selection}>
				{#each options as option}
					<option value={option.value}>
						{option.label}
					</option>
				{/each}
			</select>
		{/if}
		<div class="input-container">
			{#if prefix}
				<span class="prefix">{prefix}</span>
			{:else if prefix_icon}
				<Icon icon={prefix_icon} />
			{/if}
			<input
				{value}
				{type}
				{placeholder}
				{autofocus}
				on:input={({ target }) => {
					value = target.value
					dispatch('input', value)
				}}
			/>
			{#if button}
				<button on:click={button.onclick} type={button.type} disabled={button.disabled}>{button.label}</button>
			{/if}
		</div>
	</div>
</label>

<style lang="postcss">
	.TextInput {
		display: flex;
		width: 100%;
		flex-wrap: wrap;
		/* gap: 0.5rem; */
	}
	.options {
		display: flex;
		border-radius: 0.25rem;
		background: var(--color-gray-8);
		padding-inline: 0.5rem;

		option {
			font-size: 0.75rem;
			display: flex;
			align-items: center;
			gap: 0.25rem;
			padding: 1px 10px;

			&:not(:last-child) {
				border-right: 1px solid var(--color-gray-7);
			}
		}
	}
	label {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		color: var(--color-gray-2);
		margin-top: var(--TextInput-mt, 0);
		margin-bottom: var(--TextInput-mb, 0);
		margin-right: var(--TextInput-mr, 0);
		margin-left: var(--TextInput-ml, 0);
		width: 100%;

		span.label {
			font-size: var(--TextInput-label-font-size, 0.75rem);
			margin-bottom: 0.25rem;
			color: #9d9d9d;
			font-weight: 400;
		}
	}

	.input-container {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		width: 100%;
		background: #1f1f1f; /* TODO: set to variable (this is nice inbetween color) */
		border: 1px solid var(--color-gray-8);
		color: var(--color-gray-2);
		font-weight: 400;
		border-radius: var(--input-border-radius);
		padding: 6px 8px;
		flex: 1;
		transition: 0.1s;

		&:has(input:focus) {
			border-color: var(--color-gray-7);
		}

		span.prefix {
			display: flex;
			align-items: center;
			margin-right: 1rem;
		}

		input {
			font-size: 0.875rem;
			flex: 1;
			background: transparent;
			width: 100%;

			&:focus {
				outline: 0;
			}

			&::placeholder {
				color: var(--color-gray-7);
			}
		}

		button {
			font-size: 0.75rem;
			background: var(--color-gray-9);
			padding: 3px 8px;
			border-radius: var(--primo-border-radius);
			transition: 0.1s;

			&[disabled] {
				opacity: 0.5;
				cursor: initial;
			}
		}
	}
</style>
