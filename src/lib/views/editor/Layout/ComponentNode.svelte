<script context="module">
	let Editor, Extension
	import('@tiptap/core').then((module) => {
		Editor = module.Editor
		Extension = module.Extension
	})
</script>

<script>
	import { onDestroy } from 'svelte'
	import _ from 'lodash-es'
	import { fade } from 'svelte/transition'
	import Icon from '@iconify/svelte'
	import StarterKit from '@tiptap/starter-kit'
	import Highlight from '@tiptap/extension-highlight'
	import Link from '@tiptap/extension-link'
	import BubbleMenu from '@tiptap/extension-bubble-menu'
	import FloatingMenu from '@tiptap/extension-floating-menu'
	import { tick, createEventDispatcher } from 'svelte'
	import { browser } from '$app/environment'
	import { processCode, convert_html_to_markdown } from '$lib/utils'
	import { hovering_outside } from '$lib/utilities'
	import pages from '$lib/stores/data/pages'
	import symbols from '$lib/stores/data/symbols'
	import { locale } from '$lib/stores/app/misc'
	import { update_section_content } from '$lib/stores/actions'
	import MarkdownButton from './MarkdownButton.svelte'
	import modal from '$lib/stores/app/modal'
	import { get_content_with_static } from '$lib/stores/helpers'

	const dispatch = createEventDispatcher()

	export let block
	export let primo_symbol = null

	$: symbol = primo_symbol || $symbols.find((symbol) => symbol.id === block.symbol)

	let node

	$: component_data = get_content_with_static({
		component: block,
		symbol,
		loc: $locale
	})

	let html = ''
	let css = ''
	let js = ''
	$: node && compile_component_code(symbol.code)

	async function save_edited_value(key, value) {
		_.set(local_component_data, key, value)
		await update_section_content(block, {
			...block.content,
			[$locale]: local_component_data
		})
	}

	let floatingMenu, bubbleMenu

	let image_editor
	let image_editor_is_visible = false

	let link_editor
	let link_editor_is_visible = false

	let active_editor
	async function set_editable_markdown({ key, element }) {
		const html = element.innerHTML.trim()
		element.innerHTML = ''
		const editor = new Editor({
			content: html,
			element,
			extensions: [
				StarterKit,
				Link.configure({
					HTMLAttributes: {
						class: 'link'
					},
					openOnClick: false
				}),
				// TipTapImage.configure({}),
				Highlight.configure({ multicolor: false }),
				FloatingMenu.configure({
					element: floatingMenu
				}),
				BubbleMenu.configure({
					element: bubbleMenu
				}),
				Extension.create({
					onFocus() {
						active_editor = editor
						dispatch('lock')
					},
					async onBlur() {
						dispatch('unlock')
						const updated_html = editor.getHTML()
						save_edited_value(key, {
							html: updated_html,
							markdown: await convert_html_to_markdown(updated_html)
						})
					}
				})
			]
		})
	}

	let error = ''
	async function compile_component_code(raw_code) {
		// workaround for this function re-running anytime something changes on the page
		// (as opposed to when the code actually changes)
		if (html !== raw_code.html || css !== raw_code.css || js !== raw_code.js) {
			html = raw_code.html
			css = raw_code.css
			js = raw_code.js
			const res = await processCode({
				component: {
					...raw_code,
					data: component_data
				},
				buildStatic: false
			})
			if (res.error) {
				error = res.error
			} else if (res.js) {
				error = ''
				if (component) component.$destroy()
				const blob = new Blob([res.js], { type: 'text/javascript' })
				const url = URL.createObjectURL(blob)

				const { default: App } = await import(/* @vite-ignore */ url)
				component = new App({
					target: node,
					props: component_data
				})

				make_content_editable()
			}
		}
	}

	async function make_content_editable() {
		if (!node) return
		const valid_elements = Array.from(node.querySelectorAll('*')).filter((element) => {
			if (['STYLE', 'TITLE'].includes(element.tagName)) return false

			const [child_node] = Array.from(element.childNodes).filter((node) => {
				const has_text = node?.nodeName === '#text' && node.nodeValue.trim().length > 0
				return has_text
			})

			const html = element?.innerHTML?.trim() || ''

			if (html || child_node || element.tagName === 'IMG' || element.tagName === 'A') {
				return true
			}
		})

		// loop over component_data and match to elements
		const tagged_elements = new Set() // elements that have been matched to a component_data key
		for (const [key, value] of Object.entries(component_data)) {
			const type = get_value_type(value)

			if (['TEXT', 'LINK', 'IMAGE', 'MARKDOWN'].includes(type)) {
				search_elements_for_value({ key, value, type })
			} else if (type === 'REPEATER') {
				for (const [index, item] of Object.entries(value)) {
					for (const [subkey, subvalue] of Object.entries(item)) {
						search_elements_for_value({
							key: `${key}[${index}].${subkey}`,
							value: subvalue,
							type: get_value_type(subvalue)
						})
					}
				}
			} else if (type === 'GROUP') {
				Object.entries(value).forEach(([subkey, subvalue]) => {
					search_elements_for_value({
						key: `${key}.${subkey}`,
						value: subvalue,
						type: get_value_type(subvalue)
					})
				})
			}
		}

		function search_elements_for_value({ key, value, type }) {
			for (const element of valid_elements) {
				if (tagged_elements.has(element)) continue // element is already tagged, skip

				const matched = match_value_to_element({ key, value, type, element })
				if (matched) {
					tagged_elements.add(element)
					break
				}
			}
		}

		function match_value_to_element({ key, value, type, element }) {
			if (value === '' || !value) return false
			// First, match by explicitly set key
			const key_matches = element.dataset.key === key
			if (key_matches) {
				if (type === 'MARKDOWN') {
					set_editable_markdown({ element, key })
				} else if (type === 'IMAGE') {
					set_editable_image({ element, key })
				} else if (type === 'LINK') {
					set_editable_link({ element, key, url: value.url })
				} else {
					set_editable_text({ element, key })
				}
				return true
			}

			if (type === 'LINK' && typeof element.href === 'string') {
				const external_url_matches =
					value.url?.replace(/\/$/, '') === element.href?.replace(/\/$/, '')
				const internal_url_matches =
					window.location.origin + value.url?.replace(/\/$/, '') ===
					element.href?.replace(/\/$/, '')
				const link_matches =
					(external_url_matches || internal_url_matches) && value.label === element.innerText

				if (link_matches) {
					set_editable_link({ element, key, url: value.url })
					return true
				}
			} else if (type === 'IMAGE') {
				const image_matches = value.alt === element.alt && value.url === element.src
				if (image_matches) {
					set_editable_image({ element, key })
					return true
				}
			} else if (type === 'MARKDOWN') {
				const html = element.innerHTML?.trim()
				const html_matches = html === value.html
				if (html_matches) {
					set_editable_markdown({ element, key })
					return true
				}
			} else {
				const text = element.innerText?.trim()
				const text_matches = typeof value == 'string' && value.trim() === text

				// All other field types are text
				if (text_matches) {
					set_editable_text({ element, key })
					return true
				} else return false
			}
		}

		function get_value_type(value) {
			const is_link =
				typeof value === 'object' && Object.hasOwn(value, 'url') && Object.hasOwn(value, 'label')

			const is_image =
				typeof value === 'object' && Object.hasOwn(value, 'url') && Object.hasOwn(value, 'alt')

			const is_markdown =
				typeof value === 'object' &&
				Object.hasOwn(value, 'html') &&
				Object.hasOwn(value, 'markdown')

			const is_repeater = Array.isArray(value)
			const is_group = typeof value === 'object' && value !== null

			let type = 'TEXT'
			if (is_link) type = 'LINK'
			else if (is_image) type = 'IMAGE'
			else if (is_markdown) type = 'MARKDOWN'
			else if (is_repeater) type = 'REPEATER'
			else if (is_group) type = 'GROUP'

			return type
		}

		async function set_editable_image({ element, key = '' }) {
			let rect
			element.setAttribute(`data-key`, key)
			element.onmouseover = async (e) => {
				image_editor_is_visible = true
				await tick() // wait for image_editor to mount
				rect = element.getBoundingClientRect()
				image_editor.style.left = `${rect.left}px`
				image_editor.style.top = `${rect.top}px`
				image_editor.style.width = `${rect.width}px`
				image_editor.style.height = `${rect.height}px`
				image_editor.style.borderRadius = getComputedStyle(element).borderRadius
				image_editor.onmouseleave = (e) => {
					const is_outside =
						e.x >= Math.floor(rect.right) ||
						e.y >= Math.floor(rect.bottom) ||
						e.x <= Math.floor(rect.left) ||
						e.y <= Math.floor(rect.top)
					if (is_outside) {
						image_editor_is_visible = false
					}
				}
				image_editor.onclick = () => {
					modal.show('DIALOG', {
						component: 'IMAGE',
						onSubmit: ({ url, alt }) => {
							element.src = url
							save_edited_value(key, { url, alt })
							image_editor_is_visible = false
							modal.hide()
						},
						props: {
							value: {
								url: element.src,
								alt: element.alt
							}
						}
					})
				}
			}
		}

		async function set_editable_link({ element, key, url }) {
			element.style.outline = '0'
			element.setAttribute(`data-key`, key)
			element.contentEditable = true
			let updated_url = url
			let rect
			element.onkeydown = (e) => {
				if (e.code === 'Enter') {
					e.preventDefault()
					e.target.blur()
					link_editor_is_visible = false
					save_edited_value(key, {
						url: updated_url,
						label: element.innerText
					})
				}
			}
			// element.onblur = (e) => {
			// 	dispatch('unlock')
			// 	save_edited_value(key, {
			// 		url: updated_url,
			// 		label: element.innerText
			// 	})
			// }
			element.addEventListener('click', async () => {
				rect = element.getBoundingClientRect()

				link_editor_is_visible = true
				await tick()
				link_editor.style.left = `${rect.left}px`
				link_editor.style.top = `${rect.top + rect.height}px`

				const input = link_editor.querySelector('input')
				input.value = url

				const form = link_editor.querySelector('form')
				form.onsubmit = (e) => {
					e.preventDefault()
					element.href = input.value
					updated_url = input.value
					save_edited_value(key, {
						url: updated_url,
						label: element.innerText
					})
					set_editable_link({ element, key, url: updated_url })
					link_editor_is_visible = false
				}

				const button = link_editor.querySelector('button[data-link]')
				button.onclick = () => {
					window.open(element.href, '_blank')
				}
			})
		}

		async function set_editable_text({ element, key = '' }) {
			element.style.outline = '0'
			element.setAttribute(`data-key`, key)
			element.onkeydown = (e) => {
				if (e.code === 'Enter') {
					e.preventDefault()
					e.target.blur()
				}
			}
			element.onblur = (e) => {
				dispatch('unlock')
				save_edited_value(key, e.target.innerText)
			}
			element.onfocus = () => {
				dispatch('lock')
			}
			element.contentEditable = true
			// await tick()
		}
	}

	let local_component_data
	$: if (component_data) {
		local_component_data = _.cloneDeep(component_data)
	}
	$: hydrate_component(component_data)
	async function hydrate_component(data) {
		if (!component) return
		else if (error) {
			error = null
			compile_component_code(symbol.code)
			// } else if (!_.isEqual(data, local_component_data)) {
		} else {
			// TODO: re-render the component if `data` doesn't match its fields (e.g. when removing a component field to add to the page)
			component.$set(data)
			// sometimes data hydration doesn't work on some fields,
			// maybe workaround is to check the node for the correct value and set them manually
			// or check if values exist and if not just re-compile component
			setTimeout(make_content_editable, 200)
			local_component_data = _.cloneDeep(data)
		}
	}

	let component

	// Fade in component on mount
	let mutation_observer
	let resize_observer
	if (browser) {
		mutation_observer = new MutationObserver(() => {
			dispatch('mount')
			reroute_links()
		})

		resize_observer = new ResizeObserver((entries) => {
			dispatch('resize')
		})
	}

	onDestroy(() => {
		mutation_observer?.disconnect()
		resize_observer?.disconnect()
	})

	// Reroute links to correctly open externally and internally
	// TODO: fix
	async function reroute_links() {
		const { pathname, origin } = window.location
		const [site] = pathname.split('/').slice(1)
		const homeUrl = `${origin}/${site}`
		node.querySelectorAll('a').forEach((link) => {
			link.onclick = (e) => {
				e.preventDefault()
			}

			// link internally
			if (window.location.host === link.host) {
				// link navigates to site home
				if (link.pathname === '/') {
					link.setAttribute('href', homeUrl)
					return
				}

				const [linkedPageID] = link.pathname.split('/').slice(1)

				// Link to page
				const linkedPage = _.find($pages, ['id', linkedPageID])
				if (linkedPage) {
					link.setAttribute('href', `${homeUrl}/${linkedPageID}`)
				} else {
					// TODO: Create page
				}
			} else {
				openLinkInNewWindow(link)
			}

			function openLinkInNewWindow(link) {
				if (link.dataset.key) return // is editable
				link.addEventListener('click', () => {
					window.open(link.href, '_blank')
				})
			}
		})
	}

	$: if (node) {
		mutation_observer.observe(node, {
			childList: true
		})
		resize_observer.observe(node)
	}

	$: if (error) {
		dispatch('mount')
	}

	$: if (browser && node) {
		node.closest('#page').addEventListener('scroll', on_page_scroll)
		node.closest('body').addEventListener('mouseover', (e) => {
			if (hovering_outside(e, image_editor)) {
				image_editor_is_visible = false
			}
		})
	}

	function on_page_scroll() {
		image_editor_is_visible = false
		link_editor_is_visible = false
	}
</script>

{#if image_editor_is_visible}
	<button in:fade={{ duration: 100 }} class="primo-reset image-editor" bind:this={image_editor}>
		<Icon icon="uil:image-upload" />
	</button>
{/if}

{#if link_editor_is_visible}
	<div in:fade={{ duration: 100 }} class="primo-reset link-editor" bind:this={link_editor}>
		<button on:click={() => (link_editor_is_visible = false)}>
			<Icon icon="ic:round-close" />
		</button>
		<button class="icon" data-link>
			<Icon icon="heroicons-solid:external-link" />
		</button>
		<form>
			<input type="text" />
		</form>
	</div>
{/if}

<div class="node" bind:this={node} />
{#if error}
	<pre>
    {@html error}
  </pre>
{/if}

<div class="menu floating-menu primo-reset" bind:this={floatingMenu}>
	{#if active_editor}
		<MarkdownButton
			icon="heading"
			on:click={() => active_editor.chain().focus().toggleHeading({ level: 1 }).run()}
		/>
		<MarkdownButton
			icon="code"
			on:click={() => active_editor.chain().focus().toggleCodeBlock().run()}
		/>
		<MarkdownButton
			icon="quote-left"
			on:click={() => active_editor.chain().focus().toggleBlockquote().run()}
		/>
		<MarkdownButton
			icon="list-ul"
			on:click={() => active_editor.chain().focus().toggleBulletList().run()}
		/>
		<MarkdownButton
			icon="list-ol"
			on:click={() => active_editor.chain().focus().toggleOrderedList().run()}
		/>
		<!-- <MarkdownButton
			icon="image"
			on:click={() =>
				modal.show('DIALOG', {
					component: 'IMAGE',
					onSubmit: ({ url, alt }) => {
						active_editor.chain().focus().setImage({ src: url, alt }).run();
						modal.hide();
					}
				})}
		/> -->
	{/if}
</div>
<div class="menu bubble-menu primo-reset" bind:this={bubbleMenu}>
	{#if active_editor}
		<MarkdownButton
			icon="link"
			on:click={() =>
				modal.show('DIALOG', {
					component: 'LINK',
					onSubmit: (val) => {
						active_editor.chain().focus().setLink({ href: val }).run()
						modal.hide()
					}
				})}
		/>
		<MarkdownButton
			icon="bold"
			on:click={() => active_editor.chain().focus().toggleBold().run()}
			active={active_editor.isActive('bold')}
		/>
		<MarkdownButton
			icon="italic"
			on:click={() => active_editor.chain().focus().toggleItalic().run()}
			active={active_editor.isActive('italic')}
		/>
		<MarkdownButton
			icon="highlighter"
			on:click={() => active_editor.chain().focus().toggleHighlight().run()}
			active={active_editor.isActive('highlight')}
		/>
	{/if}
</div>

<style lang="postcss">
	:global(.ProseMirror) {
		outline: 0 !important;
	}
	.node {
		width: 100%;
	}
	pre {
		margin: 0;
		padding: 1rem;
		background: var(--primo-color-black);
		color: var(--color-gray-3);
		border: 1px solid var(--color-gray-6);
	}
	.menu {
		font-size: var(--font-size-1);
		display: flex;
		border-radius: var(--input-border-radius);
		margin-left: 0.5rem;
		transition: opacity 0.1s;
		z-index: 999999 !important;
		box-shadow: 0 0 #0000, 0 0 #0000, 0 1px 2px 0 rgba(0, 0, 0, 0.05);
	}
	.bubble-menu {
		overflow: hidden;
		background-color: var(--color-gray-9);
		color: var(--primo-color-white);
		/* border-bottom-width: 2px; */
		border-color: var(--primo-color-brand);
	}
	.floating-menu {
		overflow: hidden;
		transform: translateY(-0.5rem);
		color: var(--color-gray-8);
		background-color: var(--primo-color-white);
	}
	.image-editor {
		position: fixed;
		font-size: 14px;
		background: rgba(0, 0, 0, 0.8);
		color: white;
		border-bottom-right-radius: 4px;
		z-index: 99;
		transform-origin: top left;
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: 2rem;
		overflow: hidden;

		:global(svg) {
			height: clamp(0.5rem, 50%, 4rem);
			width: auto;
		}
	}

	.link-editor {
		position: fixed;
		font-size: 14px;
		background: rgba(0, 0, 0, 0.9);
		color: white;
		z-index: 999;
		display: flex;

		button {
			background: var(--color-gray-7);
			display: flex;
			align-items: center;
			padding: 0 5px;
			border-right: 1px solid var(--color-gray-6);
		}

		input {
			padding: 2px 5px;
			background: var(--color-gray-8);
			color: var(--color-gray-1);
			outline: 0;
		}
	}
</style>
