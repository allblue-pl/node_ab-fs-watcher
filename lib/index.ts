import Watcher from "./Watcher.ts";

class abWatcher_Class {
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
const abWatcher = new abWatcher_Class();
export default abWatcher;
