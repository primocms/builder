<script>
  import Spinner from '../../ui/Spinner.svelte'

  export let label = ''
  export let loading = false
  export let variant = 'primary'

  export let element = 'button'
</script>

<svelte:element
  this={element}
  {...$$restProps}
  class="button {variant}"
  on:click
>
  {#if !loading}
    <slot>{label}</slot>
  {:else}
    <Spinner />
  {/if}
</svelte:element>

<style>
  .button {
    --Spinner-size: 1rem;

    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    padding: 0.5rem 0;
    border-radius: 0.25rem;
    font-weight: 400;
    font-size: 0.875rem;

    color: var(--primo-color-white);
    transition: background 0.1s, color 0.1s, box-shadow 0.1s;
    margin: var(--space-y, 0) var(--space-x, 0);
  }

    .button.primary {
      box-shadow: var(--primo-ring-primogreen-thin);
    }

    .button.primary:hover {
        box-shadow: var(--primo-ring-primogreen-thick);
      }

    .button.secondary {
      background: var(--color-gray-8);
    }

    .button.secondary:hover {
        box-shadow: var(--primo-ring-primogreen);
      }</style>
