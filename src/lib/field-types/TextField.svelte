<script>
	import autosize from 'autosize'
	import { onMount } from 'svelte'
	import { createEventDispatcher } from 'svelte'
	import TextInput from '../ui/TextInput.svelte'

	const dispatch = createEventDispatcher()

	export let field
	export let value
	export let disabled = false
	export let title = null

	function selectAll({ target }) {
		if (field.default === field.value) target.select()
	}

	function handleSave(e) {
		const { metaKey, key } = e
		if (metaKey && key === 's') {
			e.preventDefault()
			dispatch('save')
		}
	}

	let element
	onMount(() => {
		autosize(element)
	})
</script>

<TextInput
	{...field}
	{value}
	{disabled}
	{title}
	grow={true}
	on:focus={selectAll}
	on:keydown={handleSave}
	on:input={({ detail }) => {
		dispatch('input', { value: detail })
	}}
/>

<style lang="postcss">
	label {
		display: flex;
		flex-direction: column;

		div {
			margin-bottom: 0.5rem;
			font-size: var(--label-font-size, 1rem);
			font-weight: var(--label-font-weight, 700);
		}

		.pill {
			background: #b6b6b6;
			border-radius: 100px;
			padding: 3px 7px;
			font-size: 12px;
			font-weight: 500;
			color: #121212;
			margin-left: 0.5rem;
		}

		textarea {
			background: #1f1f1f; /* TODO: set to variable (this is nice inbetween color) */
			border: 1px solid var(--color-gray-8);
			border-radius: var(--primo-border-radius);
			color: var(--color-gray-2);
			font-weight: 400;
			font-size: 0.875rem;
			outline: 0 !important;
			transition: 0.1s border;
			padding: 0.75rem;

			&:focus {
				border-color: #646668;
			}
		}
	}
</style>
