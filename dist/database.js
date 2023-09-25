let database_listener = () => {}

export function database_subscribe(fn) {
  database_listener = fn
}

export function database_unsubscribe() {
  database_listener = null
}

/**
 * Runs when data changes.
 * @param {{
 *  table: string,
 *  action: string,
 *  [id]: string,
 *  [data]: object,
 * }} payload - The data that changed
 */
export async function dataChanged(payload) {
  return await database_listener(payload)
}

let storage_listener = () => {}

export function storage_subscribe(fn) {
  storage_listener = fn
}

export function storage_unsubscribe(fn) {
  storage_listener = null
}

/**
 * Runs when storing files
 * @param {{
*  bucket: string,
*  action: string,
*  key: string,
*  file: string,
*  options: object,
* }} payload - The data that changed
*/
export async function storageChanged(payload) {
  return await storage_listener(payload)
}


let realtime_listener = () => {}
export function realtime_subscribe(fn) {
  realtime_listener = fn
}
export async function realtimeChanged(payload) {
  return await realtime_listener(payload)
}