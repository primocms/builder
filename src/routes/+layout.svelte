<script>
  import './reset.css'
  import { fieldTypes, registerProcessors } from '$lib/index.js'
  import {browser} from '$app/environment'

  if (browser) {
    import('../lib/compiler/processors.js').then(({ html, css }) => {
      registerProcessors({ html, css })
    })
  }
</script>

<slot />