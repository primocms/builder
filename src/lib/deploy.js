let listener = () => {}

export function deploy_subscribe(fn) {
  listener = fn
}

export function deploy_unsubscribe() {
  listener = null
}

/**
 * Runs when deploying the site
 * @param {{
 *  [files]: obj,
 *  owner_id: string,
 * }} payload - The data that changed
 */
export async function deploy(payload) {
  // When data changes, notify the listener
  return await listener(payload)
}