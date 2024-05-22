<script>
	import { createEventDispatcher } from 'svelte'
	import { v4 as uuidv4 } from 'uuid'
	import { fade } from 'svelte/transition'
	import UI from '../../../../ui'
	import page_types from '../../../../stores/data/page_types'
	import Icon from '@iconify/svelte'
	import { validate_url } from '../../../../utilities'
	import { Page } from '../../../../factories.js'

	/** @type {string | null} */
	export let parent = null

	const dispatch = createEventDispatcher()

	let new_page_name = ''
	let new_page_slug = ''
	let new_page_type = $page_types[0].id
	console.log({ new_page_type, $page_types })
	$: page_creation_disabled = !new_page_name || !new_page_slug

	let page_label_edited = false
	$: new_page_slug = page_label_edited ? validate_url(new_page_slug) : validate_url(new_page_name)

	$: new_page_details = Page({
		name: new_page_name,
		slug: new_page_slug,
		parent,
		page_type: $page_types.find((p) => p.id === new_page_type)
	})
</script>

<form
	on:submit|preventDefault={() => dispatch('create', new_page_details)}
	in:fade={{ duration: 100 }}
	class:has-page-types={$page_types.length > 0}
>
	<UI.TextInput
		autofocus={true}
		bind:value={new_page_name}
		id="page-label"
		label="Page Name"
		placeholder="About Us"
	/>
	<UI.TextInput
		bind:value={new_page_slug}
		id="page-url"
		label="Page URL"
		on:input={() => (page_label_edited = true)}
		placeholder="about-us"
	/>
	<div>
		<span class="primo--field-label">Page Type</span>
		<UI.Dropdown
			label={$page_types.find((pt) => pt.id === new_page_type).name}
			options={$page_types.map((p) => ({ value: p.id, icon: p.icon, label: p.name }))}
			on:input={({ detail }) => (new_page_type = detail)}
		/>
	</div>
	<button disabled={page_creation_disabled}>
		<Icon icon="akar-icons:check" />
	</button>
</form>

<style lang="postcss">
	form {
		padding: 0.25rem;
		display: grid;
		grid-template-columns: 1fr 1fr auto;
		gap: 0.5rem;
		padding: 0.825rem 1.125rem;
		align-items: flex-end;
		background: #1a1a1a;
		--TextInput-label-font-size: 0.75rem;

		&.has-page-types {
			grid-template-columns: 1fr 1fr 1fr auto;
		}

		button {
			border: 1px solid var(--primo-color-brand);
			border-radius: 0.25rem;
			padding: 9px 0.75rem;
			margin-top: 23px;

			&:disabled {
				opacity: 20%;
			}
		}
	}
</style>
