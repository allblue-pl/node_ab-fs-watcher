import Watcher from "./Watcher.js";
export class abFSWatcher_Class {
    get Watcher() {
        return Watcher;
    }
    constructor() {
    }
    watch(patterns, eventTypes, changeFn) {
        let watcher = new Watcher();
        watcher.on(eventTypes, changeFn);
        watcher.update(patterns);
        return watcher;
    }
}
const abFSWatcher = new abFSWatcher_Class();
export default abFSWatcher;
