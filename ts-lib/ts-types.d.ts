export type WatchEventType = "add" | "change" | "unlink";
export type WatchEventFn = (fsPath: string, evetType: WatchEventType) => void;
