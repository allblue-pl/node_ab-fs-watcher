import type { WatchEventType } from "./ts-types.ts";
export default class Watcher {
    #private;
    constructor();
    clear(): void;
    finish(): void;
    getFSPaths(): Array<string>;
    getFSPatterns(): Array<string>;
    on(eventTypes: Array<WatchEventType>, fn: (fsPath: string, eventType: WatchEventType) => void): Watcher;
    update(patterns: Array<string>): void;
}
//# sourceMappingURL=Watcher.d.ts.map