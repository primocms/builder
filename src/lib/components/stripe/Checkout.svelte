<script>
	import axios from 'axios'
	import Icon from '@iconify/svelte'
	import { onMount, createEventDispatcher } from 'svelte'
	import { slide } from 'svelte/transition'
	import { loadStripe } from '@stripe/stripe-js'
	import { PUBLIC_STRIPE_KEY } from '$env/static/public'
	import { EmbeddedCheckout } from 'svelte-stripe'
	import { page } from '$app/stores'

	const dispatch = createEventDispatcher()

	let clientSecret

	axios
		.post('/api/stripe/create-payment-intent', {
			price_id: 'price_1OQNv8AELMGfXjn7H72oAZo2',
			uid: $page.data.user.id,
			site_id: $page.data.site.id
		})
		.then(({ data }) => {
			clientSecret = data?.clientSecret
			console.log({ data, clientSecret })
		})

	let stripe = null

	onMount(async () => {
		stripe = await loadStripe(PUBLIC_STRIPE_KEY)
	})

	// TODO: redirect to the same page & open deploy modal
</script>

{#if clientSecret}
	<EmbeddedCheckout {stripe} {clientSecret} />
{:else}
	<div
		style="display: flex;justify-content: center;
  height: 100%;
  align-items: center;"
	>
		<Icon icon="eos-icons:three-dots-loading" width="50px" height="50px" />
	</div>
{/if}
