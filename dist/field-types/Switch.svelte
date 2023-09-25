<script>
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  export let field;

  function toggleSwitch() {
    field.value = !field.value;
    dispatch('input');
  }

</script>

<div class="label-container">
  <label for={field.key}>
    <span class="switch-label" for={field.key}>{field.label}</span>
    <div class="switch-container">
      <input type="checkbox" id={field.key} on:input={toggleSwitch} checked={field.value} />
      <span />
    </div>
  </label>
</div>

<style>
  .label-container {
    width: 100%;
  }

    .label-container label {
      display: inline-block;
    }

    .label-container label .switch-label {
        font-weight: 600;
        margin-right: 1rem;
      }

    .label-container label .switch-container {
        position: relative;
        display: inline-block;
        width: 3.5rem;
        vertical-align: middle;
        -webkit-user-select: none;
           -moz-user-select: none;
                user-select: none;
        transition: transform 0.1s;
      }

    .label-container label .switch-container input {
          color: var(--primo-color-brand);
          background: var(--primo-color-white);
          outline: 0;
          position: absolute;
          top: -4px;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 2rem;
          height: 2rem;
          border-radius: 100%;
          -webkit-appearance: none;
             -moz-appearance: none;
                  appearance: none;
          cursor: pointer;
          left: 0;
          transition: transform 0.1s;
        }

    .label-container label .switch-container input:after {
            content: '\d7';
          }

    .label-container label .switch-container input:checked {
            transform: translateX(24px);
          }

    .label-container label .switch-container input:checked:after {
              content: '\2713';
            }

    .label-container label .switch-container span {
          outline: 0;
          display: block;
          overflow: hidden;
          height: 1.5rem;
          border-radius: 1rem;
          background: var(--color-gray-7);
          cursor: pointer;
        }</style>
