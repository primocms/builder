export namespace modalTypes {
    namespace DEPLOY {
        export { Deploy as component };
        export namespace header {
            let title: string;
            let icon: string;
        }
    }
    namespace COMPONENT_EDITOR {
        export { ComponentEditor as component };
        export namespace header_1 {
            let title_1: string;
            export { title_1 as title };
            let icon_1: string;
            export { icon_1 as icon };
        }
        export { header_1 as header };
    }
    namespace SYMBOL_EDITOR {
        export { SymbolEditor as component };
        export namespace header_2 {
            let title_2: string;
            export { title_2 as title };
            let icon_2: string;
            export { icon_2 as icon };
        }
        export { header_2 as header };
    }
    namespace PAGE_EDITOR {
        export { PageEditor as component };
        export namespace header_3 {
            let title_3: string;
            export { title_3 as title };
            let icon_3: string;
            export { icon_3 as icon };
        }
        export { header_3 as header };
    }
    namespace SITE_EDITOR {
        export { SiteEditor as component };
        export namespace header_4 {
            let title_4: string;
            export { title_4 as title };
            let icon_4: string;
            export { icon_4 as icon };
        }
        export { header_4 as header };
    }
    namespace SITE_PAGES {
        export { SitePages as component };
        export namespace header_5 {
            let title_5: string;
            export { title_5 as title };
            let icon_5: string;
            export { icon_5 as icon };
        }
        export { header_5 as header };
    }
    namespace DIALOG {
        export { Dialog as component };
    }
}
import { Deploy } from '../../views/modal';
import { ComponentEditor } from '../../views/modal';
import { SymbolEditor } from '../../views/modal';
import { PageEditor } from '../../views/modal';
import { SiteEditor } from '../../views/modal';
import { SitePages } from '../../views/modal';
import { Dialog } from '../../views/modal';
