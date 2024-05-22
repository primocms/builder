<script>
	import _ from 'lodash-es'
	import Icon from '@iconify/svelte'
	import { createEventDispatcher } from 'svelte'
	import TextInput from '../ui/TextInput.svelte'
	import Spinner from '../ui/Spinner.svelte'
	import site from '../stores/data/site.js'
	import { storageChanged } from '../database.js'

	const dispatch = createEventDispatcher()

	const default_value = {
		alt: '',
		url: ''
	}

	export let field
	export let value

	if (typeof value === 'string' || !value) {
		value = _.cloneDeep(default_value)
	}

	function dispatch_update({ url = value.url, alt = value.alt }) {
		dispatch('input', {
			value: {
				url,
				alt
			}
		})
	}

	// async function convert_image(url, new_type) {
	// 	const response = await fetch(url)
	// 	const blob = await response.blob()

	// 	const image = new Image()
	// 	image.crossOrigin = 'anonymous' // This is important for CORS if the image is from a different domain
	// 	image.src = URL.createObjectURL(blob)
	// 	image.onload = () => {
	// 		const canvas = document.createElement('canvas')
	// 		canvas.width = image.naturalWidth
	// 		canvas.height = image.naturalHeight
	// 		canvas.getContext('2d').drawImage(image, 0, 0)
	// 		canvas.toBlob((blob) => {
	// 			// Now we have a `blob` containing webp data

	// 			// Use the file rename trick to turn it back into a file
	// 			const myImage = new File([blob], `${blob.name}.${new_type}`, { type: blob.type })
	// 			upload_image(myImage)
	// 		}, `image/${new_type}`)
	// 	}
	// }

	async function upload_image(image) {
		loading = true

		await upload(image)

		async function upload(file) {
			const key = `${$site.id}/${file.lastModified + file.name}`
			const { url, size } = await storageChanged({
				bucket: 'images',
				action: 'upload',
				key,
				file: file,
				options: {}
			})

			if (url) {
				image_preview = url
				dispatch_update({ url })
				image_size = size
			}
			loading = false
		}
	}

	let image_size = null
	let image_preview = value.url || ''
	let loading = false

	let width
	$: collapsed = width < 200
</script>

<div class="ImageField" bind:clientWidth={width} class:collapsed>
	<span class="primo--field-label">{field.label}</span>
	<div class="image-info">
		<div class="image-preview">
			{#if loading}
				<div class="spinner-container">
					<Spinner />
				</div>
			{:else}
				{#if image_size}
					<span class="field-size">
						{image_size}KB
					</span>
				{/if}
				{#if value.url}
					<img src={image_preview} alt="Preview" />
				{/if}
				<label class="image-upload">
					<Icon icon="uil:image-upload" />
					{#if !value.url}
						<span>Upload</span>
					{/if}
					<input
						on:change={({ target }) => {
							const { files } = target
							if (files.length > 0) {
								const image = files[0]
								upload_image(image)
							}
						}}
						type="file"
						accept="image/*"
					/>
				</label>
			{/if}
		</div>
		<div class="inputs">
			<TextInput
				value={value.alt}
				label="Description"
				on:input={({ detail }) => dispatch_update({ alt: detail })}
			/>
			<TextInput
				value={value.url}
				label="URL"
				on:input={({ detail: value }) => {
					image_preview = value
					dispatch_update({ url: value })
				}}
			/>
			<!-- {#if field.options.type && field.options.type !== 'svg+xml'}
				{@const original_active = field.options.type === field.options.original_type}
				{@const webp_active = field.options.type === 'webp'}
				<div class="image-type-buttons">
					<button
						on:click={() => convert_image(value.url, field.options.original_type)}
						class:active={original_active}
						disabled={original_active}
					>
						{field.options.original_type?.toUpperCase()}
					</button>
					{#if field.options.original_type?.toUpperCase() !== 'WEBP'}
						<button
							on:click={() => convert_image(value.url, 'webp')}
							class:active={webp_active}
							disabled={webp_active}
						>
							WEBP
						</button>
					{/if}
				</div>
			{/if} -->
		</div>
	</div>
</div>
<slot />

<style lang="postcss">
	* {
		--TextInput-label-font-size: 0.75rem;
	}
	.ImageField {
		display: grid;

		&.collapsed .image-info {
			display: grid;
		}
	}
	.image-info {
		display: flex;
		gap: 0.75rem;
		overflow: hidden;
		align-items: flex-start;
		/* border: 1px solid var(--primo-color-brand); */
		/* padding: 0.5rem; */

		.spinner-container {
			background: var(--primo-color-brand);
			height: 100%;
			width: 100%;
			display: flex;
			align-items: center;
			justify-content: center;
			padding: 3rem;
		}
	}
	input {
		background: var(--color-gray-8);
	}
	.image-preview {
		border: 1px dashed #3e4041;
		border-radius: 4px;
		aspect-ratio: 1;
		height: 100%;
		/* width: 13rem; */
		position: relative;

		.image-upload {
			flex: 1 1 0%;
			padding: 1rem;
			cursor: pointer;
			position: relative;
			width: 100%;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			color: var(--color-gray-2);
			background: var(--color-gray-9);
			font-weight: 600;
			text-align: center;
			position: absolute;
			inset: 0;
			opacity: 0.5;
			transition: opacity, background;
			transition-duration: 0.1s;

			&:hover {
				opacity: 0.95;
				background: var(--primo-color-brand);
			}

			span {
				margin-top: 0.25rem;
			}

			input {
				visibility: hidden;
				border: 0;
				width: 0;
				position: absolute;
			}
		}

		.field-size {
			background: var(--color-gray-8);
			color: var(--color-gray-3);
			position: absolute;
			top: 0;
			left: 0;
			z-index: 1;
			padding: 0.25rem 0.5rem;
			font-size: var(--font-size-1);
			font-weight: 600;
			border-bottom-right-radius: 0.25rem;
		}

		img {
			position: absolute;
			inset: 0;
			object-fit: cover;
			height: 100%;
			width: 100%;
		}
	}

	.inputs {
		display: grid;
		row-gap: 6px;
		width: 100%;
		--TextInput-font-size: 0.75rem;
	}

	/* .image-type-buttons {
		margin-top: 3px;
		font-size: 0.75rem;
		display: flex;
		border-radius: var(--primo-border-radius);
		border: 1px solid var(--color-gray-8);
		justify-self: flex-start;

		button {
			padding: 2px 6px;

			&.active {
				cursor: unset;
				color: var(--primo-color-brand);
			}

			&:last-child {
				border-left: 1px solid var(--color-gray-8);
			}
		}
	} */
</style>
