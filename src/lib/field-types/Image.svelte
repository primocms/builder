<script>
	import Icon from '@iconify/svelte'
	import { createEventDispatcher } from 'svelte'
	import TextInput from '$lib/ui/TextInput.svelte'
	import Spinner from '$lib/ui/Spinner.svelte'
	import site from '$lib/stores/data/site'
	import { storageChanged } from '$lib/database'

	const dispatch = createEventDispatcher()

	const defaultValue = {
		alt: '',
		url: '',
		src: '',
		size: null
	}

	export let field = {
		value: defaultValue
	}

	if (typeof field.value === 'string' || !field.value) {
		field.value = defaultValue
	}

	function setValue({ url, size }) {
		field.value = {
			...field.value,
			url: url,
			src: url,
			size
		}
	}

	async function uploadImage({ target }) {
		loading = true
		const { files } = target
		if (files.length > 0) {
			const image = files[0]

			// const compressed = await imageCompression(image, {
			// 	maxSizeMB: 0.5
			// })
			let size = new Blob([image]).size

			const key = `${$site.id}/${image.lastModified + image.name}`
			const url = await storageChanged({
				bucket: 'images',
				action: 'upload',
				key,
				file: image
			})

			if (url) {
				imagePreview = url

				setValue({
					url,
					size: Math.round(size / 1000)
				})

				loading = false
				dispatch('input', field)
			} else {
				loading = false
			}
		}
	}

	let imagePreview = field.value.url || ''
	let loading = false
</script>

<div class="image-field">
	<span class="field-label">{field.label}</span>
	<div class="image-info">
		{#if loading}
			<div class="spinner-container">
				<Spinner />
			</div>
		{:else}
			<div class="image-preview">
				{#if field.value.size}
					<span class="field-size">
						{field.value.size}KB
					</span>
				{/if}
				{#if field.value.url}
					<img src={imagePreview} alt="Preview" />
				{/if}
				<label class="image-upload">
					<Icon icon="uil:image-upload" />
					{#if !field.value.url}
						<span>Upload</span>
					{/if}
					<input on:change={uploadImage} type="file" accept="image/*" />
				</label>
			</div>
		{/if}
		<div class="inputs">
			<TextInput bind:value={field.value.alt} on:input label="Description" />
			<TextInput
				value={field.value.url}
				label="URL"
				on:input={({ detail: value }) => {
					imagePreview = value
					setValue({
						url: value,
						size: null
					})
					dispatch('input', field)
				}}
			/>
		</div>
	</div>
</div>
<slot />

<style lang="postcss">
	* {
		--TextInput-label-font-size: 0.75rem;
	}
	.image-field {
		display: grid;
		gap: 1rem;
	}
	.field-label {
		font-weight: 600;
		display: inline-block;
		font-weight: 500;
		font-size: var(--label-font-size, 1rem);
	}
	.image-info {
		display: grid;
		grid-template-columns: 9rem 4fr;
		overflow: hidden;
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
		aspect-ratio: 1 / 1;
		/* width: 100%; */
		height: 100%;
		/* padding-top: 50%; */
		position: relative;
		/* margin-bottom: 0.25rem; */

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

			svg {
				max-width: 4rem;
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
			object-fit: contain;
			height: 100%;
			width: 100%;
		}
	}

	.inputs {
		display: grid;
		gap: 1rem;
		width: 100%;
		padding: 0 1.3125rem;
	}
</style>
