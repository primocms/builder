<script>
	import { createEventDispatcher, getContext } from 'svelte'
	import _ from 'lodash-es'
	import axios from 'axios'
	import Icon from '@iconify/svelte'
	import Toggle from 'svelte-toggle'
	import modal from '../../stores/app/modal'
	import { userRole } from '../../stores/app/misc'
	import MenuPopup from '../../ui/Dropdown.svelte'
	import { get_symbol_usage_info } from '../../stores/helpers'
	import { locale } from '../../stores/app/misc'
	import { click_to_copy } from '../../utilities'
	import { transform_content } from '../../transform_data.js'
	import { browser } from '$app/environment'
	import IFrame from '../../components/IFrame.svelte'
	const dispatch = createEventDispatcher()

	export let symbol
	export let controls_enabled = true
	export let header_hidden = false
	export let show_toggle = false
	export let toggled = false
	export let head = ''
	export let append = ''

	function edit_symbol(symbol) {
		modal.show(
			'SYMBOL_EDITOR',
			{
				symbol,
				header: {
					title: `Edit ${symbol.title || 'Block'}`,
					icon: 'fas fa-check',
					button: {
						label: `Save Block`,
						icon: 'fas fa-check',
						onclick: () => {
							modal.hide()
						}
					}
				},
				tab: 'code'
			},
			{
				showSwitch: true,
				disabledBgClose: true
			}
		)
	}

	let name_el

	// move cursor to end of name
	$: if (name_el) {
		const range = document.createRange()
		const sel = window.getSelection()
		range.setStart(name_el, 1)
		range.collapse(true)

		sel?.removeAllRanges()
		sel?.addRange(range)
	}

	let renaming = false
	async function toggle_name_input() {
		renaming = !renaming
		// workaround for inability to see cursor when div empty
		if (symbol.name === '') {
			symbol.name = 'Block'
		}
	}

	let height = 0

	let componentCode
	let cachedSymbol = {}
	let component_error
	$: browser && compile_component_code(symbol, $locale)
	async function compile_component_code(symbol, language) {
		if (
			_.isEqual(cachedSymbol.code, symbol.code) &&
			_.isEqual(cachedSymbol.content, symbol.content)
		) {
			return
		}
		const res = await axios
			.post(`/api/render`, {
				id: symbol.id,
				code: {
					html: `<svelte:head>${head}</svelte:head>` + symbol.code.html,
					css: symbol.code.css,
					js: symbol.code.js
				},
				content: transform_content(symbol),
				dev_mode: false
			})
			.catch((e) => console.error(e))
		if (res?.data?.error) {
			console.log({ res })
			component_error = res.data.error
		} else if (res?.data) {
			const updated_componentCode = res.data
			if (!_.isEqual(componentCode, updated_componentCode)) {
				componentCode = updated_componentCode
				cachedSymbol = _.cloneDeep({ code: symbol.code, content: symbol.content })
			}

			component_error = null
		}
	}

	let active_symbol_label = ''
	async function get_label() {
		active_symbol_label = await get_symbol_usage_info(symbol.id)
	}
</script>

<div class="sidebar-symbol">
	<header style:opacity={header_hidden ? 0 : 1}>
		{#if renaming}
			<!-- svelte-ignore a11y-autofocus -->
			<!-- svelte-ignore a11y-no-static-element-interactions -->
			<div
				bind:this={name_el}
				contenteditable
				autofocus
				class="name"
				on:blur={toggle_name_input}
				on:keydown={(e) => {
					if (e.code === 'Enter') {
						e.preventDefault()
						e.target.blur()
						dispatch('rename', e.target.textContent)
						renaming = false
					}
				}}
			>
				{symbol.name}
			</div>
		{:else}
			<div class="name">
				<h3>{symbol.name}</h3>
				{#if controls_enabled}
					<!-- TODO: add popover w/ symbol info -->
					<!-- svelte-ignore a11y-no-static-element-interactions -->
					<div
						class="info"
						title={active_symbol_label}
						on:mouseover={get_label}
						on:focus={get_label}
					>
						<Icon icon="mdi:info" />
					</div>
				{/if}
			</div>
		{/if}
		{#if controls_enabled}
			<div class="symbol-options">
				{#if show_toggle}
					<Toggle
						label="Toggle Symbol for Page Type"
						hideLabel={true}
						{toggled}
						small={true}
						on:toggle
					/>
				{/if}
				<MenuPopup
					icon="carbon:overflow-menu-vertical"
					options={[
						...(getContext('DEBUGGING')
							? [
									{
										label: `${symbol.id.slice(0, 5)}...`,
										icon: 'ph:copy-duotone',
										on_click: (e) => click_to_copy(e.target, symbol.id)
									}
							  ]
							: []),
						{
							label: 'Edit Symbol',
							icon: 'material-symbols:code',
							on_click: () => edit_symbol(symbol)
						},
						...($userRole === 'DEV'
							? [
									{
										label: 'Duplicate',
										icon: 'bxs:duplicate',
										on_click: () => dispatch('duplicate')
									}
							  ]
							: []),
						{
							label: 'Rename',
							icon: 'ic:baseline-edit',
							on_click: toggle_name_input
						},
						{
							label: 'Download',
							icon: 'ic:baseline-download',
							on_click: () => dispatch('download')
						},
						{
							label: 'Delete',
							icon: 'ic:outline-delete',
							on_click: () => dispatch('delete')
						}
					]}
				/>
			</div>
		{/if}
	</header>
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div class="symbol" on:mousedown on:mouseup>
		{#if component_error}
			<div class="error">
				<Icon icon="bxs:error" />
			</div>
		{:else}
			{#key componentCode}
				<IFrame bind:height {append} {componentCode} />
			{/key}
		{/if}
	</div>
</div>

<style lang="postcss">
	.sidebar-symbol {
		--IconButton-opacity: 0;

		&:hover:not(.dragging) {
			--IconButton-opacity: 1;
		}

		header {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding-bottom: 0.5rem;
			color: #e7e7e7;
			transition: opacity 0.2s;

			.name {
				overflow: hidden;
				display: flex;
				align-items: center;
				gap: 0.25rem;
				font-size: 13px;
				line-height: 16px;

				h3 {
					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;
				}
			}

			.symbol-options {
				display: flex;
				align-items: center;
				color: #e7e7e7;
				gap: 3px;

				:global(svg) {
					height: 1rem;
					width: 1rem;
				}
			}
		}
		.symbol {
			width: 100%;
			border-radius: 0.25rem;
			overflow: hidden;
			position: relative;
			cursor: grab;
			min-height: 2rem;
			transition: box-shadow 0.2s;
			background: var(--color-gray-8);
		}
	}
	.error {
		display: flex;
		justify-content: center;
		height: 100%;
		position: absolute;
		inset: 0;
		align-items: center;
		background: #ff0000;
	}
	[contenteditable] {
		outline: 0 !important;
	}
</style>
