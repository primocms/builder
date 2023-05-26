let listeners = [];

export function subscribe(fn) {
  listeners.push(fn);
}

export function unsubscribe(fn) {
  listeners = listeners.filter(listener => listener !== fn);
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
  // When data changes, notify all listeners
  await Promise.all(listeners.map(listener => listener(payload)));
}

let storage_listeners = [];

export function storage_subscribe(fn) {
  storage_listeners.push(fn);
}

export function storage_unsubscribe(fn) {
  storage_listeners = storage_listeners.filter(listener => listener !== fn);
}

export function storageChanged(payload) {
  // When data changes, notify all listeners
  storage_listeners.forEach(listener => listener(payload));
}