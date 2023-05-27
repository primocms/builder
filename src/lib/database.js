let listener = () => {}

export function subscribe(fn) {
  listener = fn
}

export function unsubscribe() {
  listener = null
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
  // When data changes, notify the listener
  return await listener(payload)
}

let storage_listener = () => {}

export function storage_subscribe(fn) {
  storage_listener = fn
}

export function storage_unsubscribe(fn) {
  storage_listener = null
}

export async function storageChanged(payload) {
  // When data changes, notify all listeners
  return await storage_listener(payload)
}


let realtime_listener = () => {}
export function realtime_subscribe(fn) {
  realtime_listener = fn
}
export async function realtimeChanged(payload) {
  return await realtime_listener(payload)
}