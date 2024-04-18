<script>
	import { getContext } from 'svelte'
	import { fade } from 'svelte/transition'
	import { find as _find } from 'lodash-es'
	import { browser } from '$app/environment'
	import Icon from '@iconify/svelte'
	import { clickOutside } from '$lib/utilities'
	import ToolbarButton from './ToolbarButton.svelte'
	import { timeline } from '../../stores/data'
	import sections from '../../stores/data/sections'
	import { undo_change, redo_change } from '../../stores/actions'
	import { PrimoButton } from '../../components/buttons'
	import site from '../../stores/data/site'
	import { userRole } from '../../stores/app'
	import { id as page_id, name as page_name, page_type } from '../../stores/app/activePage'
	import modal from '../../stores/app/modal'
	import { click_to_copy } from '$lib/utilities'
	import { page } from '$app/stores'
	import Letter from '$lib/ui/Letter.svelte'
	// import { active_users } from '$lib/stores'

	export let buttons

	$: pageEmpty =
		$sections && $sections.length <= 1 && $sections.length > 0 && $sections[0]['type'] === 'options'

	let DEBUGGING
	if (browser) DEBUGGING = getContext('DEBUGGING')

	let showing_dropdown = false
</script>

<nav aria-label="toolbar" id="primo-toolbar" class="primo-reset">
	<div class="menu-container">
		<div class="left">
			<PrimoButton on:signOut />
			<div class="icon-button">
				<ToolbarButton
					label="Pages"
					icon="fluent:document-one-page-multiple-20-filled"
					on:click={() =>
						modal.show(
							'SITE_PAGES',
							{},
							{ hideLocaleSelector: true, maxWidth: '600px', showSwitch: false }
						)}
				/>
			</div>
			{#if $userRole === 'DEV'}
				<div class="button-group">
					<ToolbarButton
						label="Page"
						on:click={() =>
							modal.show('PAGE_EDITOR', {}, { showSwitch: true, disabledBgClose: true })}
					/>
					<ToolbarButton
						label="Site"
						on:click={() =>
							modal.show('SITE_EDITOR', {}, { showSwitch: true, disabledBgClose: true })}
					/>
				</div>
			{/if}
			<div
				class="dropdown"
				class:active={showing_dropdown}
				use:clickOutside
				on:click_outside={() => {
					showing_dropdown = false
				}}
			>
				<button class="down" on:click={() => (showing_dropdown = !showing_dropdown)}>
					<div class="icon">
						<Icon icon="charm:menu-kebab" />
					</div>
				</button>
				{#if showing_dropdown}
					<div class="list" in:fade={{ duration: 100 }}>
						{#each buttons as button}
							<button
								on:click={() => {
									showing_dropdown = false
									button.onclick()
								}}
							>
								<Icon icon={button.icon} />
								<span>{button.label}</span>
							</button>
						{/each}
					</div>
				{/if}
			</div>
		</div>
		<div class="site-name">
			<span class="site">{$site.name} /</span>
			{#if DEBUGGING}
				<span class="page">
					{$page_name}
					<button use:click_to_copy>({$page_id})</button>
				</span>
			{:else if $page_type}
				<span class="page">{$page_name}</span>
				<a
					class="page-type-badge"
					style="background-color: {$page_type?.color};"
					href="/{$site.id}/page-type--{$page_type?.id}"
				>
					<Icon icon={$page_type.icon} />
				</a>
			{:else if $page.data.page_type}
				<span class="page-type" style:background={$page.data.page_type.color}>
					<Icon icon={$page.data.page_type.icon} />
					<span>{$page_name}</span>
				</span>
			{:else}
				<span class="page">{$page_name}</span>
			{/if}
		</div>
		<div class="right">
			<!-- {#if $active_users.length > 1}
				<div class="active-editors" style="display: flex; gap: 0.25rem">
					{#each $active_users.filter((u) => u.email !== $page.data.user.email) as user}
						<div class="editor" transition:fade={{ duration: 200 }}>
							<Letter letter={user.email.slice(0, 1)} />
						</div>
					{/each}
				</div>
			{/if} -->
			{#if !$timeline.first}
				<ToolbarButton id="undo" title="Undo" icon="material-symbols:undo" on:click={undo_change} />
			{/if}
			{#if !$timeline.last}
				<ToolbarButton id="redo" title="Redo" icon="material-symbols:redo" on:click={redo_change} />
			{/if}
			<slot />
			<!-- <LocaleSelector /> -->
			<ToolbarButton
				type="primo"
				label="Publish"
				active={false}
				on:click={() => modal.show('DEPLOY', {}, { maxWidth: '800px', hideLocaleSelector: true })}
				disabled={pageEmpty}
			/>
		</div>
	</div>
</nav>

<style lang="postcss">
	#primo-toolbar {
		position: fixed;
		left: 0;
		right: 0;
		top: 0;
		z-index: 99999999;
		border-bottom: 1px solid var(--color-gray-8);
	}

	.left {
		/* width: 100%; */
		display: flex;
		justify-content: flex-start;
		gap: 0.5rem;
	}

	.dropdown {
		display: flex;
		position: relative;

		&.active {
			button.down {
				border-bottom-right-radius: 0;
				border-bottom-left-radius: 0;
			}
		}

		button.down {
			display: flex;
			color: white;
			border: 1px solid var(--color-gray-8);
			border-radius: 0.25rem;
			padding-inline: 12px;
			align-items: center;
			justify-content: center;
			transition: 0.1s;

			&:hover {
				background: var(--color-gray-8);
			}

			.icon {
				transition: 0.1s;
			}
		}

		.list {
			display: grid;
			position: absolute;
			background: rgb(17, 17, 17);
			top: 100%;
			border: 1px solid var(--color-gray-8);
			box-shadow: 0px 4px 30px rgba(0, 0, 0, 0.2);

			button {
				padding: 0.25rem 0.5rem;
				color: white;
				display: flex;
				align-items: center;
				gap: 0.25rem;
				transition: 0.1s;

				&:hover {
					background: var(--color-gray-8);
				}
			}
		}
	}

	.left .button-group {
		display: flex;
		flex-direction: row;
	}

	.site-name {
		font-size: 14px;
		display: flex;
		align-items: center;
		gap: 0.25rem;
		.site {
			color: #b6b6b6;
		}
		.page {
			color: white;
		}
		.page-type {
			display: flex;
			align-items: center;
			gap: 0.25rem;
			color: white;
			border-radius: 1rem;
			padding: 2px 6px;
			font-size: 0.875rem;
			margin-left: 3px;
		}
		.page-type-badge {
			padding: 5px;
			border-radius: 1rem;
			aspect-ratio: 1;
			font-size: 0.75rem;
			display: flex;
			justify-content: center;
			align-items: center;
			color: white;
			margin-left: 3px;
		}

		@media (max-width: 670px) {
			display: none;
		}
	}

	.menu-container {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin: 0 auto;
		padding: 0.5rem 1rem;
		/* overflow: auto; */
	}

	.menu-container:after {
		background: #121212;
		content: '';
		z-index: -1;
		height: 100%;
		width: 100%;
		position: absolute;
		top: 0;
		left: 0;
		backdrop-filter: blur(10px);
	}

	.right {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.button-group {
		display: flex;
		flex-direction: row;
		justify-content: flex-end;
	}
</style>
