<script>
	import { onMount, createEventDispatcher } from 'svelte'
	const dispatch = createEventDispatcher()
	import autosize from 'autosize'
	import { convert_markdown_to_html } from '$lib/utils'

	export let field

	// ensure value is correct shape
	if (typeof field.value === 'string') {
		field.value = {
			markdown: field.value,
			html: field.value
		}
	} else if (typeof field.value !== 'object' || !field.value?.hasOwnProperty('markdown')) {
		field.value = {
			markdown: '',
			html: ''
		}
	}

	$: value = field.value.markdown
	$: parseContent(value)

	let element

	onMount(() => {
		autosize(element)
	})
	// easily delete default content
	function selectAll({ target }) {
		if (field.default === field.value.markdown) target.select()
	}

	async function parseContent(markdown) {
		field.value.html = await convert_markdown_to_html(markdown)
		field.value.markdown = markdown
		dispatch('input')
	}

	function handleSave({ metaKey, key }) {
		if (metaKey && key === 's') {
			dispatch('save')
		}
	}
</script>

<label for={field.id}>
	<span>{field.label}</span>
	<textarea
		rows="1"
		bind:this={element}
		id={field.id}
		on:focus={selectAll}
		on:keydown={handleSave}
		on:input={({ target }) => parseContent(target.value)}
		{value}
	/>
</label>

<style lang="postcss">
	label {
		display: flex;
		flex-direction: column;
		margin-bottom: 0.5rem;
		font-weight: 500;

		span {
			margin-bottom: 1rem;
			font-size: var(--label-font-size);
			font-weight: var(--label-font-weight);
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
