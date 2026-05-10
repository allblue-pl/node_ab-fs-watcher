import type { WatchEventFn, WatchEventType } from "./ts-types.ts";
import Watcher from "./Watcher.ts";

export class abFSWatcher_Class {
    get Watcher() {
        return Watcher;
    }

    constructor() {
        
    }

    watch(patterns: Array<string>, eventTypes: Array<WatchEventType>, 
            changeFn: WatchEventFn) {
        let watcher = new Watcher();

        watcher.on(eventTypes, changeFn);
        watcher.update(patterns);

        return watcher;
    }
}
const abFSWatcher = new abFSWatcher_Class();
export default abFSWatcher;
