<script>
	import Icon from '@iconify/svelte'

	export let primary_button
	export let buttons = []

	let is_open = false
</script>

<div class="DropdownButton" class:is_open>
	<div class="primary-button">
		<button class="child-button" on:click={primary_button.onclick}>
			<Icon icon={primary_button.icon} />
			<span>{primary_button.label}</span>
		</button>
		<button on:click={() => (is_open = !is_open)}>
			<div
				class="icon"
				style="transition: 0.1s"
				style:transform={is_open ? 'scaleY(-1)' : 'initial'}
			>
				<Icon icon="basil:caret-down-solid" height="25" />
			</div>
		</button>
	</div>
	<div class="dropdown-content">
		{#each buttons as { icon, label, onclick }}
			<button class="child-button" on:click={onclick}>
				<Icon {icon} />
				<span>{label}</span>
			</button>
		{/each}
	</div>
</div>

<style lang="postcss">
	.DropdownButton {
		position: relative;
		.primary-button {
		}
		&.is_open {
			.primary-button {
				.child-button {
					border-bottom-left-radius: 0;
				}
				button:nth-child(2) {
					border-bottom-right-radius: 0;
				}
			}
			.dropdown-content {
				opacity: 1;
			}
		}

		.primary-button {
			width: 100%;
			/* border: 1.5px solid #35d994; */
			margin-top: var(--PrimaryButton-mt, 0);
			margin-bottom: var(--PrimaryButton-mb, 0);
			margin-left: var(--PrimaryButton-ml, 0);
			margin-right: var(--PrimaryButton-mr, 0);

			transition: color 0.1s, background-color 0.1s;

			display: flex;
			justify-content: center;
			/* align-items: center; */
			text-align: center;
			font-weight: 500;

			button:nth-child(2) {
				padding-inline: 0.25rem;
				border: 1px solid var(--color-gray-7);
				border-top-right-radius: var(--PrimaryButton-round-tr, 0.25rem);
				border-bottom-right-radius: var(--PrimaryButton-round-br, 0.25rem);

				&:hover {
					/* box-shadow: var(--primo-ring-primogreen-thin); */
					color: var(--primo-color-brand);
				}
			}

			&:hover {
				/* box-shadow: var(--primo-ring-primogreen-thick); */
				/* background: var(
        --PrimaryButton-bg-hover,
        var(--primo-color-brand-dark)
      );
      color: var(--PrimaryButton-color-hover, var(--primo-color-white)); */
			}

			&[disabled] {
				color: #cecece;
				border: 1px solid #35d994;
				opacity: 0.2;
				cursor: not-allowed;
			}
		}

		.child-button:first-child {
			border: 1px solid var(--color-gray-7);
			display: flex;
			align-items: center;
			width: 100%;
			justify-content: center;
			gap: 0.25rem;
			padding: 0.5rem;
			border-top-left-radius: var(--PrimaryButton-round-tl, 0.25rem);
			border-bottom-left-radius: var(--PrimaryButton-round-bl, 0.25rem);

			&:hover {
				position: relative;
				z-index: 1;
				box-shadow: var(--primo-ring-primogreen-thin);
			}
		}

		.dropdown-content {
			position: absolute;
			top: 100%;
			width: 100%;
			background: var(--primo-color-black);
			opacity: 0;

			.child-button {
				display: flex;
				gap: 0.25rem;
				justify-content: center;
				align-items: center;
				border-top-left-radius: 0;
				border-bottom-right-radius: var(--PrimaryButton-round-bl, 0.25rem);
			}
		}
	}
</style>
