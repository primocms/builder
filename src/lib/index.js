import Primo from "./Primo.svelte";

import {saved,onMobile,userRole} from './stores/app/misc'
import {site, content} from './stores/data/site'
import activePage from './stores/app/activePage'
import fieldTypes from './stores/app/fieldTypes'
import modal from './stores/app/modal'
import {locale, locked_blocks} from './stores/app/misc'
import {buildStaticPage} from './stores/helpers'
import {registerProcessors} from './component'
import { Page, Site } from './const'
import PrimoFieldTypes from './field-types'
import {validate_site_structure_v2} from './converter'
import PrimoPage from './views/editor/Page.svelte'
import {database_subscribe, storage_subscribe, realtime_subscribe} from './database'
import {deploy_subscribe} from './deploy'

import * as utils from './utils'
import * as components from './components'

const stores = {
  saved,
  onMobile,
  userRole
}

export {
  database_subscribe,
  storage_subscribe,
  realtime_subscribe,
  deploy_subscribe,
  locale,
  locked_blocks,
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