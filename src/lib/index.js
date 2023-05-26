import Primo from "./Primo.svelte";

import {saved,onMobile,userRole} from './stores/app/misc'
import {site, content} from './stores/data/site'
import activePage from './stores/app/activePage'
import fieldTypes from './stores/app/fieldTypes'
import modal from './stores/app/modal'
import {locale} from './stores/app/misc'
import {buildStaticPage} from './stores/helpers'
import {registerProcessors} from './component'
import { Page, Site } from './const'
import PrimoFieldTypes from './field-types'
import {validate_site_structure_v2} from './converter'
import PrimoPage from './views/editor/Page.svelte'
import {subscribe, storage_subscribe} from './database'

import * as utils from './utils'
import * as components from './components'

const stores = {
  saved,
  onMobile,
  userRole
}

export {
  subscribe,
  storage_subscribe,
  locale,
  site,
  content,
  activePage,
  modal,
  utils,
  components,
  Page,
  Site,
  fieldTypes,
  PrimoFieldTypes,
  stores,
  registerProcessors,
  buildStaticPage,
  validate_site_structure_v2,
  PrimoPage
}
export default Primo