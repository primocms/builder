import Primo from './Primo.svelte'
import { saved, onMobile, userRole } from './stores/app/misc'
import { site, content } from './stores/data/site'
import activePage from './stores/app/activePage'
import fieldTypes from './stores/app/fieldTypes'
import modal from './stores/app/modal'
import { locale, locked_blocks } from './stores/app/misc'
import { processCode } from './utils'
import { buildStaticPage } from './stores/helpers'
import { registerProcessors } from './component'
import * as factories from './factories'
import PrimoFieldTypes from './field-types/index'
import { validate_site_structure_v2 } from './converter'
import PrimoPage from './views/editor/Page.svelte'
import { database_subscribe, storage_subscribe, realtime_subscribe } from './database'
import { deploy, deploy_subscribe } from './deploy'
import UI from './ui'

import * as utils from './utils'
import * as components from './components/index'

const stores = {
	saved,
	onMobile,
	userRole
}

export { UI, factories }

export {
	database_subscribe,
	storage_subscribe,
	realtime_subscribe,
	deploy_subscribe,
	deploy,
	locale,
	locked_blocks,
	site,
	content,
	activePage,
	modal,
	utils,
	components,
	fieldTypes,
	PrimoFieldTypes,
	stores,
	registerProcessors,
	processCode,
	buildStaticPage,
	validate_site_structure_v2,
	PrimoPage
}
export default Primo
