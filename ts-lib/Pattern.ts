import path from "node:path";

import anymatch from "anymatch";

export default class Watcher_Pattern {
    #fsPattern: string;
    #watchedPattern: string;

    get fsPattern(): string {
        return this.#fsPattern;
    }

    get watchedPattern(): string { 
        return this.#watchedPattern;
    }

    constructor(fsPattern: string) {
        fsPattern = fsPattern.replace(/\\/g, "/");

        this.#fsPattern = fsPattern;

        let fsPatternArray = fsPattern.split('/');
        let helperPatternArray = [ fsPatternArray[0] ];
        for (let i = 1; i < fsPatternArray.length - 1; i++) {
            if (fsPatternArray[i] === "*" || fsPatternArray[i] === "**")
                break;
            helperPatternArray.push(fsPatternArray[i]);
        }

        this.#watchedPattern = helperPatternArray.join('/');
    }

    matches(fsMatch: string): boolean {
        if (anymatch([ this.#fsPattern ], fsMatch))
            return true;

        return false;
    }
}
