import { writable, get, derived } from 'svelte/store'
import { Page_Type } from '../../factories'

export default writable(Page_Type())
