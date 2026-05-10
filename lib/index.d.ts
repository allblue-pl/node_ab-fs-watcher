import type { WatchEventFn, WatchEventType } from "./ts-types.ts";
import Watcher from "./Watcher.ts";
export declare class abFSWatcher_Class {
    get Watcher(): typeof Watcher;
    constructor();
    watch(patterns: Array<string>, eventTypes: Array<WatchEventType>, changeFn: WatchEventFn): Watcher;
}
declare const abFSWatcher: abFSWatcher_Class;
export default abFSWatcher;
//# sourceMappingURL=index.d.ts.map