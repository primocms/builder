<script>
	import { loadingSite } from '../../stores/app/misc'
	import Spinner from '../../components/misc/Spinner.svelte'
	import PrimoLogo from '../svg/PrimoLogo.svelte'
</script>

<a class="primo-button" aria-label="See all sites" href="/" data-sveltekit-reload>
	{#if $loadingSite}
		<Spinner />
	{:else}
		<PrimoLogo />
	{/if}
</a>

<style>
	.primo-button {
		aspect-ratio: 1;
		padding: 0.5rem;
		border-radius: var(--primo-border-radius);
		display: block;
		height: 100%;
		background: var(--primo-color-codeblack);
		transition: background 0.1s, box-shadow 0.1s;
		width: 2.5rem;
		background-size: 2rem;
		background-repeat: no-repeat;
		background-position: center;
		outline: 0;
		display: flex;
		justify-content: center;
		align-items: center;
	}

		.primo-button:hover {
			box-shadow: var(--primo-ring-primogreen);
		}

		.primo-button:focus {
			box-shadow: var(--primo-ring-primogreen-thin);
		}

		.primo-button:active {
			background: var(--color-gray-8);
		}</style>
