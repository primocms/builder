/**
 * Hydrates the active site, page, section, and symbol stores for th editor
 * @param {import('..').Site_Data} data - Combined data object from the server
 */
export function hydrate_active_data(data: any): Promise<void>;
/** @returns {void} */
export function undo_change(): void;
/** @returns {void} */
export function redo_change(): void;
export function update_page_preview(page?: {
    id: any;
    name: any;
    url: any;
    code: any;
    content: any;
    fields: any;
}): Promise<void>;
export function update_section_content(section: any, updated_content: any): Promise<void>;
export function add_language(key: any): Promise<void>;
export function delete_language(key: any): Promise<void>;
export function set_language(loc: any): Promise<void>;
export namespace symbols {
    export function create(symbol: any, index?: number): Promise<void>;
    export function update(updated_symbol_id: any, updated_symbol_props: any): Promise<void>;
    export function _delete(symbol_to_delete: any): Promise<void>;
    export { _delete as delete };
    export function rearrange(rearranged_symbols: any): Promise<void>;
}
export namespace active_site {
    export function update_1(props: any): Promise<void>;
    export { update_1 as update };
}
export namespace active_page {
    export function add_block(symbol: any, position: any): Promise<void>;
    export function add_primo_block(symbol: any, position: any): Promise<void>;
    export function move_block(block_being_moved: any, to: any): Promise<void>;
    export function duplicate_block(block_id: any): Promise<void>;
    export function delete_block(block_id: any): Promise<void>;
    export function update_2(obj: any): Promise<void>;
    export { update_2 as update };
}
export namespace pages {
    export function create_1({ details, source }: {
        details: {
            id: string;
            name: string;
            url: string;
            parent: string;
        };
        source: string;
    }): Promise<void>;
    export { create_1 as create };
    export function _delete_1(page_id: any): Promise<void>;
    export { _delete_1 as delete };
    export function update_3(page_id: any, obj: any): Promise<void>;
    export { update_3 as update };
}
