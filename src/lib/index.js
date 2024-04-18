import Primo from './Primo.svelte'
import { saved, onMobile, userRole } from './stores/app/misc'
import { site, content } from './stores/data/site'
import activePage from './stores/app/activePage'
import fieldTypes from './stores/app/fieldTypes'
import modal from './stores/app/modal'
import { locale, locked_blocks } from './stores/app/misc'
import { processCode, processCSS } from './utils'
import { buildStaticPage } from './stores/helpers'
import { registerProcessors } from './component'
import * as factories from './factories'
import PrimoFieldTypes from './field-types/index'
import { validate_site_structure_v2 } from './converter'
import PrimoPage from './views/editor/Page.svelte'
import { database_subscribe, storage_subscribe, realtime_subscribe } from './database'
import { deploy, deploy_subscribe } from './deploy'
import UI from './ui'
import * as code_generators from './code_generators.js'
import * as constants from './constants.js'
import RepeaterField from './field-types/RepeaterField.svelte'

import * as utils from './utils'
import * as Components from './components/index'

// temporarily export for use in primo.press, use ui element later
export const Temporary = {
	RepeaterField
}

const stores = {
	locale,
	//
	saved,
	onMobile,
	userRole
}

export { UI, factories, code_generators, constants, Components }

export {
	database_subscribe,
	storage_subscribe,
	realtime_subscribe,
	deploy_subscribe,
	deploy,
	locked_blocks,
	site,
	content,
	activePage,
	modal,
	utils,
	fieldTypes,
	PrimoFieldTypes,
	stores,
	registerProcessors,
	processCode,
	processCSS,
	buildStaticPage,
	validate_site_structure_v2,
	PrimoPage
}
export default Primo
