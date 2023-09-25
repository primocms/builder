export function database_subscribe(fn: any): void;
export function database_unsubscribe(): void;
/**
 * Runs when data changes.
 * @param {{
 *  table: string,
 *  action: string,
 *  [id]: string,
 *  [data]: object,
 * }} payload - The data that changed
 */
export function dataChanged(payload: {
    table: string;
    action: string;
    [id]: string;
    [data]: object;
}): Promise<void>;
export function storage_subscribe(fn: any): void;
export function storage_unsubscribe(fn: any): void;
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
export function storageChanged(payload: {
    bucket: string;
    action: string;
    key: string;
    file: string;
    options: object;
}): Promise<void>;
export function realtime_subscribe(fn: any): void;
export function realtimeChanged(payload: any): Promise<void>;
