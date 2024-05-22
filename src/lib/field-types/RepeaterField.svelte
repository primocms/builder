<script context="module">
	import { writable } from 'svelte/store'
	export const pluralize = writable(null)
	import('../libraries/pluralize').then((mod) => pluralize.set(mod.default))
</script>

<script>
	import { find as _find, chain as _chain, cloneDeep as _cloneDeep } from 'lodash-es'
	import Icon from '@iconify/svelte'
	import { createEventDispatcher, onDestroy, tick } from 'svelte'

	import * as idb from 'idb-keyval'
	const dispatch = createEventDispatcher()

	import { createUniqueID } from '../utilities'
	import { fieldTypes } from '../stores/app'

	export let id
	export let field
	export let fields
	export let content
	export let level = 0
	export let show_label = false
	export let hidden_keys = []

	$: subfields = fields.filter((f) => f.parent === field.id)
	$: repeater_container = build_repeater_container(content)
	$: console.log({ repeater_container })

	// $: $locale, getRepeaterFieldValues().then((val) => (repeater_container = val))
	// $: setTemplateKeys(repeater_container) // to reflect content change when updating locale

	function build_repeater_container(content) {
		const child_content_rows = content.filter((r) => r.parent === id)
		return child_content_rows.map((child) => ({
			subfields,
			...child
		}))
	}

	let repeater_item_just_created = null // to autofocus on creation
	async function add_item() {
		const n_sibling_entries = repeater_container.length
		repeater_item_just_created = n_sibling_entries
		console.log({ repeater_item_just_created })
		await tick()
		dispatch('add', { parent: id, index: repeater_container.length, subfields })
		visibleRepeaters[`${field.key}-${repeater_container.length}`] = true
		console.log('done')
		// repeater_item_just_created = false
	}

	function move_item(item, direction) {
		dispatch('move', { item, direction })
	}

	// used for tracking locale change I think, delete after configuring locale switching
	function setTemplateKeys(val) {
		repeater_container = val.map((f) => {
			f._key = f._key || createUniqueID()
			return f
		})
	}

	function getFieldComponent(subfield) {
		const field = _find($fieldTypes, ['id', subfield.type])
		return field ? field.component : null
	}

	$: singular_label = $pluralize && $pluralize?.singular(field.label)

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
			if (first_subfield.type === 'link') return matching_content_row?.value?.label
			else if (first_subfield.type === 'markdown') return matching_content_row?.value?.markdown
			else return matching_content_row?.value
		} else {
			return singular_label
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
		<p class="primo--field-label">{field.label}</p>
	{/if}
	<div class="fields">
		{#each repeater_container as repeater_item, index}
			{@const subfieldID = `${field.key}-${index}`}
			{@const item_image = get_image(repeater_item, field)}
			{@const item_icon = get_icon(repeater_item, field)}
			{@const item_title = get_title(repeater_item, field)}
			<div class="repeater-item" id="repeater-{field.key}-{index}">
				<div class="item-options">
					<button
						class="title"
						on:click={() => (visibleRepeaters[subfieldID] = !visibleRepeaters[subfieldID])}
					>
						{#if item_image}
							<img
								src={item_image}
								alt={item_title || `Preview for item ${index} in ${field.label}`}
							/>
						{:else if item_icon}
							<div style="font-size:1.5rem;">{@html item_icon}</div>
						{:else}
							<span
								style="white-space: nowrap;text-overflow: ellipsis;overflow: hidden;min-height: 19px;"
							>
								{item_title}
							</span>
						{/if}
						<Icon icon={visibleRepeaters[subfieldID] ? 'ph:caret-up-bold' : 'ph:caret-down-bold'} />
					</button>
					<div class="primo-buttons">
						{#if index !== 0}
							<button
								title="Move {singular_label} up"
								on:click={() => move_item(repeater_item, 'up')}
							>
								<Icon icon="mdi:arrow-up" />
							</button>
						{/if}
						{#if index !== repeater_container.length - 1}
							<button
								title="Move {singular_label} down"
								on:click={() => move_item(repeater_item, 'down')}
							>
								<Icon icon="mdi:arrow-down" />
							</button>
						{/if}
						<button
							title="Delete {singular_label} item"
							on:click={() => dispatch('remove', repeater_item)}
						>
							<Icon icon="ion:trash" />
						</button>
					</div>
				</div>
				{#if visibleRepeaters[subfieldID]}
					<div class="field-values">
						{#each repeater_item.subfields as subfield, subfield_index (repeater_item._key + subfield.key)}
							{#if !hidden_keys.includes(subfield.key)}
								{@const matching_content_row = content.find(
									(r) => r.field === subfield.id && r.parent === repeater_item.id
								)}
								<div class="repeater-item-field" id="repeater-{field.key}-{index}-{subfield.key}">
									<svelte:component
										this={getFieldComponent(subfield)}
										id={matching_content_row.id}
										value={matching_content_row.value}
										field={subfield}
										{fields}
										{content}
										level={level + 1}
										show_label={true}
										autofocus={index === repeater_item_just_created && subfield_index === 0}
										on:save
										on:add
										on:remove
										on:move
										on:input={({ detail }) => {
											if (detail.id) {
												dispatch('input', detail)
											} else {
												dispatch('input', { id: matching_content_row.id, data: detail })
											}
										}}
									/>
								</div>
							{/if}
						{/each}
					</div>
				{/if}
			</div>
		{/each}
		<button class="field-button" on:click={add_item}>
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

	.primo--field-label {
		/* font-size: var(--title-font-size, 1rem);
		font-weight: var(--title-font-weight, 600); */
		padding-bottom: 0.75rem;
		/* letter-spacing: 1px; */
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
		gap: 1rem;
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
				/* padding-bottom: 0.75rem; */
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
		width: 100%;
		background: #1f1f1f;
		color: var(--button-color);
		transition: background 0.1s, color 0.1s;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		font-size: var(--font-size-2);
		padding: 0.5rem;
		border-radius: 4px;
		font-weight: 400;
		border: 1px solid transparent;
		transition: 0.1s;

		&:hover {
			/* background: var(--button-hover-color); */
			background: #292929;
		}

		/* &[disabled] {
      background: var(--color-gray-5);
      cursor: not-allowed;
    } */
	}
</style>
