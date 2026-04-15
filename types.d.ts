type WatchEventType = "add" | "change" | "unlink";
type WatchEventFn = (fsPath: string, evetType: WatchEventType) => void;
