<script context="module">
	import { writable } from 'svelte/store'
	const pluralize = writable(null)
	import('../libraries/pluralize').then((mod) => pluralize.set(mod.default))
</script>

<script>
	import { find as _find, chain as _chain, cloneDeep as _cloneDeep } from 'lodash-es'
	import Icon from '@iconify/svelte'
	import { createEventDispatcher, onDestroy, tick } from 'svelte'

	import * as idb from 'idb-keyval'
	const dispatch = createEventDispatcher()

	import { getEmptyValue } from '../utils'
	import { createUniqueID } from '../utilities'
	import { fieldTypes } from '../stores/app'

	export let id
	export let field
	export let subfields
	export let fields
	export let content
	export let level = 0
	export let show_label = false
	export let hidden_keys = []

	console.log({ field, subfields, content })

	function add_repeater_item() {
		dispatch('add')
		const subfield = createSubfield()
		visibleRepeaters[`${field.key}-${repeater_container.length}`] = true
		repeater_container = [...repeater_container, subfield]
		onInput()
	}

	function removeRepeaterItem(itemIndex) {
		dispatch('remove')
		repeater_container = repeater_container.filter((_, i) => i !== itemIndex)
		onInput()
	}

	function moveRepeaterItem(indexOfItem, direction) {
		const item = repeater_container[indexOfItem]
		const withoutItem = repeater_container.filter((_, i) => i !== indexOfItem)
		if (direction === 'up') {
			repeater_container = [
				...withoutItem.slice(0, indexOfItem - 1),
				item,
				...withoutItem.slice(indexOfItem - 1)
			]
		} else if (direction === 'down') {
			repeater_container = [
				...withoutItem.slice(0, indexOfItem + 1),
				item,
				...withoutItem.slice(indexOfItem + 1)
			]
		} else {
			console.error('Direction must be up or down')
		}
		onInput()
	}

	function createSubfield() {
		return field.fields.map((subfield) => ({
			...subfield,
			id: createUniqueID(),
			value: getEmptyValue(subfield)
		}))
	}

	let repeater_container = []
	getRepeaterFieldValues()

	// $: $locale, getRepeaterFieldValues().then((val) => (repeater_container = val))
	$: setTemplateKeys(repeater_container)

	async function getRepeaterFieldValues() {
		const child_content_rows = content.filter((r) => r.parent === id)
		console.log({ child_content_rows })
		repeater_container = child_content_rows.map((child) => ({
			subfields,
			...child
		}))
		console.log({ repeater_container })
	}

	function setTemplateKeys(val) {
		repeater_container = val.map((f) => {
			f._key = f._key || createUniqueID()
			return f
		})
	}

	function onInput() {
		// field.value = repeater_container.map((items, i) =>
		// 	_chain(items).keyBy('key').mapValues('value').value()
		// )
		// dispatch('input', field)
	}

	function getFieldComponent(subfield) {
		const field = _find($fieldTypes, ['id', subfield.type])
		return field ? field.component : null
	}

	$: singularLabel = $pluralize && $pluralize?.singular(field.label)

	function get_image(repeater_item) {
		const [first_subfield] = repeater_item.subfields
		if (first_subfield && first_subfield.type === 'image') {
			const matching_content_row = content.find(
				(r) => r.field === first_subfield.id && r.parent === repeater_item.id
			)
			return matching_content_row?.value?.url
		} else return null
	}

	function get_icon(repeater_item) {
		const [first_subfield] = repeater_item.subfields
		if (first_subfield && first_subfield.type === 'icon') {
			const matching_content_row = content.find(
				(r) => r.field === first_subfield.id && r.parent === repeater_item.id
			)
			return matching_content_row?.value
		} else return null
	}

	function get_title(repeater_item) {
		const first_subfield = repeater_item.subfields.find((subfield) =>
			['text', 'markdown', 'link', 'number'].includes(subfield.type)
		)
		if (first_subfield) {
			// let { value } = repeater_item.subfields[0]
			const matching_content_row = content.find(
				(r) => r.field === first_subfield.id && r.parent === repeater_item.id
			)
			console.log({ matching_content_row })
			if (first_subfield.type === 'link') return matching_content_row?.value?.label
			else if (first_subfield.type === 'markdown') return matching_content_row?.value?.markdown
			else return matching_content_row?.value
		} else {
			return singularLabel
		}
	}

	let visibleRepeaters = {}

	idb.get(field.id).then((res) => {
		if (res) {
			visibleRepeaters = res
		}
	})

	onDestroy(() => {
		// save visible repeaters
		idb.set(field.id, _cloneDeep(visibleRepeaters))
	})
</script>

<div class="RepeaterField repeater-level-{level}">
	{#if show_label}
		<p class="label">{field.label}</p>
	{/if}
	<div class="fields">
		{#each repeater_container as repeater_item, i (repeater_item._key)}
			{@const subfieldID = `${field.key}-${i}`}
			{@const item_image = get_image(repeater_item, field)}
			{@const item_icon = get_icon(repeater_item, field)}
			{@const item_title = get_title(repeater_item, field)}
			<div class="repeater-item" id="repeater-{field.key}-{i}">
				<div class="item-options">
					<button
						class="title"
						on:click={() => (visibleRepeaters[subfieldID] = !visibleRepeaters[subfieldID])}
					>
						{#if item_image}
							<img src={item_image} alt={item_title || `Preview for item ${i} in ${field.label}`} />
						{:else if item_icon}
							<div style="font-size:1.5rem;">{@html item_icon}</div>
						{:else}
							<span style="white-space: nowrap;text-overflow: ellipsis;overflow: hidden;">
								{item_title}
							</span>
						{/if}
						<Icon icon={visibleRepeaters[subfieldID] ? 'ph:caret-up-bold' : 'ph:caret-down-bold'} />
					</button>
					<div class="primo-buttons">
						{#if i !== 0}
							<button title="Move {singularLabel} up" on:click={() => moveRepeaterItem(i, 'up')}>
								<Icon icon="mdi:arrow-up" />
							</button>
						{/if}
						{#if i !== repeater_container.length - 1}
							<button
								title="Move {singularLabel} down"
								on:click={() => moveRepeaterItem(i, 'down')}
							>
								<Icon icon="mdi:arrow-down" />
							</button>
						{/if}
						<button title="Delete {singularLabel} item" on:click={() => removeRepeaterItem(i)}>
							<Icon icon="ion:trash" />
						</button>
					</div>
				</div>
				{#if visibleRepeaters[subfieldID]}
					<div class="field-values">
						{#each repeater_item.subfields as subfield (repeater_item._key + subfield.key)}
							{#if !hidden_keys.includes(subfield.key)}
								{@const matching_content_row = content.find(
									(r) => r.field === subfield.id && r.parent === repeater_item.id
								)}
								<div class="repeater-item-field" id="repeater-{field.key}-{i}-{subfield.key}">
									{#if subfield.type === 'repeater'}
										<svelte:self
											field={subfield}
											id={matching_content_row.id}
											{content}
											{fields}
											subfields={fields.filter((f) => f.parent === subfield.id)}
											on:input={onInput}
											level={level + 1}
											visible={true}
											show_label={true}
										/>
									{:else}
										<svelte:component
											this={getFieldComponent(subfield)}
											field={subfield}
											value={matching_content_row.value}
											level={level + 1}
											on:input={onInput}
										/>
									{/if}
								</div>
							{/if}
						{/each}
					</div>
				{/if}
			</div>
		{/each}
		<button class="field-button" on:click={add_repeater_item}>
			<Icon icon="akar-icons:plus" />
			<span>Add {$pluralize ? $pluralize.singular(field.label) : field.label}</span>
		</button>
	</div>
</div>

<style lang="postcss">
	.RepeaterField {
		width: 100%;
	}
	.fields {
		display: grid;
		gap: 1.5rem;
	}

	.label {
		font-size: var(--title-font-size, 1rem);
		font-weight: var(--title-font-weight, 600);
		padding-bottom: 1rem;
		letter-spacing: 1px;
	}

	.repeater-level-0 {
		--field-border-color: #252627;
	}

	.repeater-level-1 {
		--field-border-color: #3e4041;
	}

	.repeater-level-2 {
		--field-border-color: #58595b;
	}

	.repeater-level-3 {
		--field-border-color: #888;
	}

	.repeater-level-4 {
		--field-border-color: #aaa;
	}

	.repeater-level-5 {
		--field-border-color: #ccc;
	}

	.repeater-level-5 {
		--field-border-color: #eee;
	}

	.repeater-item {
		flex: 1;
		padding-left: 1.5rem;
		border-left: 0.5rem solid var(--field-border-color, #252627);
		display: grid;
		gap: 1.5rem;
		position: relative;
		border-radius: 1px;
		min-width: 10rem;

		--label-font-size: 0.875rem;
		--label-font-weight: 400;

		&:last-of-type {
			margin-bottom: 0;
		}

		.item-options {
			transition: 0.1s padding, 0.1s border-color;
			font-size: var(--title-font-size);
			font-weight: var(--title-font-weight);
			border-bottom: 1px solid transparent;
			display: flex;
			gap: 1rem;
			justify-content: space-between;
			align-items: center;
			color: var(--color-gray-2);

			.primo-buttons {
				white-space: nowrap;
			}

			&:not(:only-child) {
				border-bottom: var(--input-border);
				padding-bottom: 0.75rem;
			}

			button.title {
				padding: 0.5rem 0;
				display: grid;
				grid-template-columns: auto 1fr;
				gap: 1rem;
				align-items: center;
				text-align: left;

				img {
					width: 3rem;
					border-radius: 2px;
					aspect-ratio: 1;
					object-fit: cover;
				}
			}

			.primo-buttons button {
				&:focus {
					/* outline: 0; */
				}
				&:hover {
					color: var(--primo-color-brand);
				}
				&:last-child {
					margin-left: 0.5rem;
					color: var(--color-gray-5);

					&:hover {
						color: var(--primo-color-brand);
					}
				}
			}
		}

		.field-values {
			display: grid;
			gap: 0.5rem;
		}
	}
	.repeater-item-field {
		margin-bottom: 0.5rem;
	}
	.repeater-item-field:not(:first-child) {
		padding-top: 0;
	}
	button.field-button {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		width: 100%;
		background: var(--primo-button-background);
		color: var(--button-color);
		padding: 0.5rem 0;
		border-radius: 1px;
		transition: background 0.1s, color 0.1s;

		font-size: 0.875rem;
		padding: 0.75rem;
		border-radius: 4px;
		font-weight: 700;

		&:hover {
			background: var(--button-hover-color);
		}

		/* &[disabled] {
      background: var(--color-gray-5);
      cursor: not-allowed;
    } */
	}
</style>
