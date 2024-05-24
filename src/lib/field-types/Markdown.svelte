<script>
	import { onMount, createEventDispatcher } from 'svelte'
	const dispatch = createEventDispatcher()
	import autosize from 'autosize'
	import { convert_markdown_to_html } from '../utils'

	export let field
	export let value

	// ensure value is correct shape
	if (typeof value === 'string') {
		value = {
			markdown: value,
			html: value
		}
	} else if (typeof value !== 'object' || !value?.hasOwnProperty('markdown')) {
		value = {
			markdown: '',
			html: ''
		}
	}

	let element

	onMount(() => autosize(element))
	// easily delete default content
	function selectAll({ target }) {
		// if (field.default === value.markdown) target.select() // TODO?: restore, using symbol content as default value
	}

	async function parseContent(markdown) {
		const html = await convert_markdown_to_html(markdown)
		dispatch('input', { value: { html, markdown } })
	}
</script>

<label for={field.id}>
	<span class="primo--field-label">{field.label}</span>
	<textarea
		rows="1"
		bind:this={element}
		id={field.id}
		on:focus={selectAll}
		on:keydown
		on:input={({ target }) => parseContent(target.value)}
		value={value.markdown}
	/>
</label>

<style lang="postcss">
	label {
		display: flex;
		flex-direction: column;
		margin-bottom: 0.5rem;
		font-weight: 500;

		span {
			margin-bottom: 0.5rem;
		}

		textarea {
			background: #1f1f1f; /* TODO: set to variable (this is nice inbetween color) */
			border: 1px solid var(--color-gray-8);
			color: var(--color-gray-2);
			font-weight: 400;
			border-radius: var(--input-border-radius);
			padding: 0.75rem;
			transition: 0.1s;
			font-size: 0.875rem;

			&:focus {
				border-color: var(--color-gray-7);
				outline: 0;
			}
		}
	}
</style>
